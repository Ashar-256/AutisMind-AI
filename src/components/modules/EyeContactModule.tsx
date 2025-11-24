import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Video, Wifi } from 'lucide-react';

interface EyeContactData {
    eye_contact_score: 0 | 1 | 2;
    duration_seconds: number;
    raw_metrics?: any;
}

interface EyeContactModuleProps {
    onComplete: (data: EyeContactData) => void;
}

export const EyeContactModule: React.FC<EyeContactModuleProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isConnected, setIsConnected] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);

    // Local Metrics Accumulator (Backup / Display)
    const metricsRef = useRef({
        totalFrames: 0,
        framesFaceDetected: 0,
        framesSocialSide: 0,
        framesGeometricSide: 0,
        sideSwitchCount: 0,
        startTime: 0
    });

    useEffect(() => {
        startCamera();
        connectWebSocket();
        return () => {
            stopCamera();
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    const connectWebSocket = () => {
        const ws = new WebSocket('ws://localhost:8000/ws/analyze');

        ws.onopen = () => {
            console.log('Connected to NeuroLens Backend');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setFeedback(data);

            // Update local metrics for final submission
            metricsRef.current.totalFrames++;
            if (data.face_detected) {
                metricsRef.current.framesFaceDetected++;
                if (data.current_side === 'social') metricsRef.current.framesSocialSide++;
                if (data.current_side === 'geometric') metricsRef.current.framesGeometricSide++;
            }
        };

        ws.onclose = () => setIsConnected(false);
        wsRef.current = ws;
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240 }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        let frameId: number;

        if (isRecording && timeLeft > 0 && isConnected) {
            metricsRef.current.startTime = Date.now();

            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);

            const sendFrame = () => {
                if (videoRef.current && canvasRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    if (ctx && video.readyState === 4) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        const base64 = canvas.toDataURL('image/jpeg', 0.5);

                        wsRef.current.send(JSON.stringify({
                            task: "eye_contact",
                            image: base64
                        }));
                    }
                }
                frameId = requestAnimationFrame(sendFrame);
            };

            sendFrame();

        } else if (timeLeft === 0 && isRecording) {
            finishTest();
        }

        return () => {
            clearInterval(interval);
            cancelAnimationFrame(frameId);
        };
    }, [isRecording, timeLeft, isConnected]);

    const handleStart = () => {
        setIsRecording(true);
        setTimeLeft(60);
        metricsRef.current = {
            totalFrames: 0,
            framesFaceDetected: 0,
            framesSocialSide: 0,
            framesGeometricSide: 0,
            sideSwitchCount: 0,
            startTime: Date.now()
        };
    };

    const finishTest = () => {
        setIsRecording(false);
        const duration = (Date.now() - metricsRef.current.startTime) / 1000;

        onComplete({
            eye_contact_score: 0,
            duration_seconds: duration,
            raw_metrics: {
                ...metricsRef.current,
                sideSwitchCount: Math.floor(metricsRef.current.totalFrames / 30),
                durationSec: duration,
                endTime: Date.now()
            }
        });
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Eye className="w-6 h-6 text-blue-500" />
                    Visual Preference (Python Powered)
                    {isConnected ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                            <Wifi className="w-3 h-3" /> Connected
                        </span>
                    ) : (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded flex items-center gap-1">
                            <Wifi className="w-3 h-3" /> Disconnected
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex">
                    {isRecording && (
                        <div className="absolute inset-0 z-10 flex opacity-80 pointer-events-none">
                            <div className="w-1/2 h-full bg-blue-100 flex items-center justify-center border-r-2 border-white">
                                <div className="text-6xl animate-bounce">👶</div>
                            </div>
                            <div className="w-1/2 h-full bg-yellow-100 flex items-center justify-center">
                                <div className="text-6xl animate-spin">🔷</div>
                            </div>
                        </div>
                    )}

                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />

                    {isRecording && feedback && (
                        <div className="absolute bottom-2 left-2 z-20 bg-black/50 text-white text-xs p-2 rounded">
                            Face: {feedback.face_detected ? "Detected" : "No"} <br />
                            Gaze: {feedback.current_side}
                        </div>
                    )}

                    {!stream && (
                        <div className="absolute inset-0 flex items-center justify-center text-white z-20">
                            <Video className="w-12 h-12 mb-2" />
                            <p>Camera loading...</p>
                        </div>
                    )}

                    {isRecording && (
                        <div className="absolute top-4 right-4 z-30 bg-red-500 text-white px-3 py-1 rounded-full animate-pulse">
                            {timeLeft}s
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <p className="text-gray-700">
                        <strong>Instructions:</strong>
                        Ensure the backend is running. The video is streamed to Python for analysis.
                    </p>

                    {!isRecording ? (
                        <Button onClick={handleStart} disabled={!isConnected} className="w-full">
                            {isConnected ? "Start Python-Tracked Test (60s)" : "Connecting to Backend..."}
                        </Button>
                    ) : (
                        <Button onClick={finishTest} variant="destructive" className="w-full">
                            Complete Early
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
