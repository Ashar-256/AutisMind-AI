from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import time
import random
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="NeuroLens Backend - Fallback Mode")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "NeuroLens Backend is running in simple mode"}

@app.post("/api/analyze")
async def analyze_metrics(payload: dict):
    """Simple analysis without computer vision"""
    try:
        # Return mock analysis for testing
        return {
            "metrics": payload,
            "scores": {
                "engagementScore": 0.75,
                "socialPreference": 0.6,
                "geometricPreference": 0.4,
                "attentionShifts": 3
            },
            "classifications": {
                "dominantFocus": "social",
                "engagementClass": "moderate engagement",
                "attentionFlexibility": "moderate flexibility"
            },
            "interpretation": "Mock analysis - backend is running but computer vision is disabled."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.websocket("/ws/analyze")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("WebSocket connection attempt")
    await websocket.accept()
    logger.info("WebSocket connection accepted")
    
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received WebSocket data: {data[:100]}...")
            
            # Parse the message to get task type
            try:
                message = json.loads(data)
                task = message.get("task", "eye_contact")
            except:
                task = "eye_contact"
            
            # Mock response based on task type
            response = {"status": "processed"}
            
            if task == "eye_contact":
                response.update({
                    "face_detected": True,
                    "current_side": random.choice(["social", "geometric"]),
                    "gaze_x": random.uniform(0.3, 0.7)
                })
            elif task == "name_response":
                response.update({
                    "face_detected": True,
                    "head_turn_detected": random.choice([True, False]),
                    "yaw_change": random.uniform(0.02, 0.1)
                })
            elif task == "gestures":
                response.update({
                    "hands_detected": random.choice([True, False])
                })
            elif task == "repetitive":
                response.update({
                    "pose_detected": True,
                    "movement_score": random.uniform(0, 10),
                    "hand_flapping_detected": random.choice([True, False]),
                    "rocking_detected": random.choice([True, False]),
                    "total_movements": random.randint(0, 5)
                })
            
            response["message"] = f"Fallback mode - {task} analysis simulated"
            logger.info(f"Sending WebSocket response: {response}")
            
            await websocket.send_json(response)
            
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")

@app.websocket("/ws/audio")
async def websocket_audio_endpoint(websocket: WebSocket):
    logger.info("Audio WebSocket connection attempt")
    await websocket.accept()
    logger.info("Audio WebSocket connection accepted")
    
    try:
        while True:
            data = await websocket.receive_text()
            logger.info("Received audio data")
            
            # Mock audio analysis
            response = {
                "rms": random.uniform(1000, 3000),
                "is_speech": random.choice([True, False]),
                "volume_level": random.choice(["quiet", "moderate", "loud"]),
                "vocal_percentage": random.uniform(40, 80),
                "speech_chunks": random.randint(5, 15),
                "total_chunks": random.randint(10, 20)
            }
            
            await websocket.send_json(response)
            
    except WebSocketDisconnect:
        logger.info("Audio WebSocket client disconnected")
    except Exception as e:
        logger.error(f"Audio WebSocket Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)