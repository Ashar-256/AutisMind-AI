from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from logic_engine import logic_engine
from tracking_engine import TrackingEngine
from audio_analyzer import audio_analyzer
import json
import time

app = FastAPI(title="NeuroLens Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tracking_engine = TrackingEngine()

class MetricsPayload(BaseModel):
    # Flexible payload to accept various module metrics
    totalFrames: int = 0
    framesFaceDetected: int = 0
    framesSocialSide: int = 0
    framesGeometricSide: int = 0
    sideSwitchCount: int = 0
    startTime: float = 0
    endTime: float = 0
    durationSec: float = 0
    # Add other fields as needed
    response_latency: float = 0
    gestures_detected: int = 0
    repetitive_movements: int = 0

@app.post("/api/analyze")
async def analyze_metrics(payload: dict): # Accept dict to be flexible
    try:
        # For now, just pass through to logic engine or return simple analysis
        # The logic engine currently only handles Eye Contact metrics fully.
        # We can expand it later.
        result = logic_engine.analyze(payload)
        return result
    except Exception as e:
        # If logic engine fails on new fields, return generic success for now
        return {"status": "received", "data": payload}

@app.websocket("/ws/analyze")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Session State
    session = {
        "task": "unknown",
        "metrics": {
            "totalFrames": 0,
            "framesFaceDetected": 0,
            "framesSocialSide": 0,
            "framesGeometricSide": 0,
            "sideSwitchCount": 0,
            "lastSide": "none",
            "initialYaw": None,
            "maxYawChange": 0.0,
            "handsDetectedFrames": 0,
            "bodyMovementSum": 0.0,
            "lastBodyX": None,
            # Enhanced pose tracking metrics
            "landmarkMovements": {},
            "repetitivePatterns": {
                "hand_flapping": False,
                "rocking": False,
                "arm_swaying": False
            },
            "totalRepetitiveMovements": 0
        }
    }
    
    try:
        while True:
            # Expect JSON: { "task": "...", "image": "base64..." }
            raw_data = await websocket.receive_text()
            try:
                message = json.loads(raw_data)
                task = message.get("task", "eye_contact")
                image_data = message.get("image", "")
            except:
                # Fallback for legacy raw string (if any)
                task = "eye_contact"
                image_data = raw_data

            session["task"] = task
            
            # Process Frame
            analysis = tracking_engine.process_frame(image_data, task)
            
            response = {"status": "processed"}
            
            if analysis:
                session["metrics"]["totalFrames"] += 1
                
                # --- Task Specific Logic ---
                
                # 1. Eye Contact
                if task == "eye_contact":
                    response["face_detected"] = analysis["face_detected"]
                    if analysis["face_detected"]:
                        session["metrics"]["framesFaceDetected"] += 1
                        # Side Logic
                        current_side = "none"
                        if analysis["face_x"] < 0.5:
                            session["metrics"]["framesSocialSide"] += 1
                            current_side = "social"
                        else:
                            session["metrics"]["framesGeometricSide"] += 1
                            current_side = "geometric"
                        
                        if session["metrics"]["lastSide"] != "none" and current_side != session["metrics"]["lastSide"]:
                            session["metrics"]["sideSwitchCount"] += 1
                        session["metrics"]["lastSide"] = current_side
                        
                        response["current_side"] = current_side
                        response["gaze_x"] = analysis["gaze_x"]

                # 2. Name Response
                elif task == "name_response":
                    response["face_detected"] = analysis["face_detected"]
                    if analysis["face_detected"]:
                        yaw = analysis["head_yaw"]
                        if session["metrics"]["initialYaw"] is None:
                            session["metrics"]["initialYaw"] = yaw
                        
                        # Calculate change from initial
                        change = abs(yaw - session["metrics"]["initialYaw"])
                        if change > session["metrics"]["maxYawChange"]:
                            session["metrics"]["maxYawChange"] = change
                        
                        response["head_turn_detected"] = change > 0.05 # Threshold
                        response["yaw_change"] = change

                # 3. Gestures
                elif task == "gestures":
                    response["hands_detected"] = analysis["hands_detected"]
                    if analysis["hands_detected"]:
                        session["metrics"]["handsDetectedFrames"] += 1

                # 4. Repetitive
                elif task == "repetitive":
                    response["pose_detected"] = analysis["pose_detected"]
                    if analysis["pose_detected"]:
                        body_x = analysis["body_x"]
                        if session["metrics"]["lastBodyX"] is not None:
                            movement = abs(body_x - session["metrics"]["lastBodyX"])
                            session["metrics"]["bodyMovementSum"] += movement
                        session["metrics"]["lastBodyX"] = body_x
                        
                        # Enhanced pose tracking data
                        if "landmarks" in analysis:
                            response["landmarks"] = analysis["landmarks"]
                        
                        if "movement_counters" in analysis:
                            session["metrics"]["landmarkMovements"] = analysis["movement_counters"]
                            response["movement_counters"] = analysis["movement_counters"]
                        
                        if "repetitive_patterns" in analysis:
                            patterns = analysis["repetitive_patterns"]
                            session["metrics"]["repetitivePatterns"] = {
                                "hand_flapping": patterns.get("hand_flapping", False),
                                "rocking": patterns.get("rocking", False),
                                "arm_swaying": patterns.get("arm_swaying", False)
                            }
                            session["metrics"]["totalRepetitiveMovements"] = patterns.get("total_movements", 0)
                            
                            response["repetitive_patterns"] = patterns
                            response["hand_flapping_detected"] = analysis.get("hand_flapping_detected", False)
                            response["rocking_detected"] = analysis.get("rocking_detected", False)
                            response["arm_swaying_detected"] = analysis.get("arm_swaying_detected", False)
                        
                        response["movement_score"] = session["metrics"]["bodyMovementSum"]
                        response["total_movements"] = session["metrics"]["totalRepetitiveMovements"]

            await websocket.send_json(response)
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket Error: {e}")

@app.websocket("/ws/audio")
async def websocket_audio_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint specifically for audio analysis (vocalization module)
    """
    await websocket.accept()
    
    # Session metrics for vocalization
    session_metrics = {
        "totalChunks": 0,
        "speechChunks": 0,
        "silenceChunks": 0,
        "totalRMS": 0.0,
        "maxRMS": 0.0,
        "startTime": time.time()
    }
    
    try:
        while True:
            # Receive audio chunk (base64 encoded PCM)
            data = await websocket.receive_text()
            
            # Analyze audio
            analysis = audio_analyzer.analyze_audio_chunk(data)
            
            if analysis:
                session_metrics["totalChunks"] += 1
                session_metrics["totalRMS"] += analysis["rms"]
                
                if analysis["rms"] > session_metrics["maxRMS"]:
                    session_metrics["maxRMS"] = analysis["rms"]
                
                if analysis["is_speech"]:
                    session_metrics["speechChunks"] += 1
                elif analysis["is_silence"]:
                    session_metrics["silenceChunks"] += 1
                
                # Calculate vocalization percentage
                vocal_percentage = 0
                if session_metrics["totalChunks"] > 0:
                    vocal_percentage = (session_metrics["speechChunks"] / session_metrics["totalChunks"]) * 100
                
                # Send real-time feedback
                await websocket.send_json({
                    "rms": analysis["rms"],
                    "is_speech": analysis["is_speech"],
                    "volume_level": analysis["volume_level"],
                    "vocal_percentage": vocal_percentage,
                    "speech_chunks": session_metrics["speechChunks"],
                    "total_chunks": session_metrics["totalChunks"]
                })
                
    except WebSocketDisconnect:
        print("Audio client disconnected")
    except Exception as e:
        print(f"Audio WebSocket Error: {e}")
