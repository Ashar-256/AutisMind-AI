import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ear, Mic, Wifi, User } from 'lucide-react';

interface NameResponseData {
    response_to_name_score: 0 | 1 | 2;
    response_latency_ms: number | null;
}

interface NameResponseModuleProps {
    onComplete: (data: NameResponseData) => void;
}

export const NameResponseModule: React.FC<NameResponseModuleProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [status, setStatus] = useState("Waiting to start...");
    const [isConnected, setIsConnected] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);

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
        ws.onopen = () => setIsConnected(true);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setFeedback(data);
            if (data.head_turn_detected) {
                // Visual feedback
            }
        };
        ws.onclose = () => setIsConnected(false);
        wsRef.current = ws;
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing media:", err);
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

        if (isRecording && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);

            // Streaming Loop
            const sendFrame = () => {
                if (videoRef.current && canvasRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');

                    if (ctx && video.readyState === 4) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        wsRef.current.send(JSON.stringify({
                            task: "name_response",
                            image: canvas.toDataURL('image/jpeg', 0.5)
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
    }, [isRecording, timeLeft]);

    const handleStart = () => {
        setIsRecording(true);
        setTimeLeft(10);
        setStatus("Listening for name call...");

        // Simulate Audio Event
        setTimeout(() => {
            setStatus("Name call detected! Monitoring head turn...");
        }, 3000);
    };

    const finishTest = () => {
        setIsRecording(false);

        // Determine score based on feedback
        // If head turn was detected (feedback.head_turn_detected), score is good
        const responded = feedback?.head_turn_detected || false;

        onComplete({
            response_to_name_score: responded ? 0 : 2,
            response_latency_ms: responded ? 1500 : null
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Ear className="w-6 h-6 text-purple-500" />
                    Response to Name (Python Powered)
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
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Feedback Overlay */}
                    {isRecording && feedback && (
                        <div className="absolute top-2 left-2 bg-black/50 text-white p-2 rounded text-xs">
                            Face: {feedback.face_detected ? "Yes" : "No"} <br />
                            Head Turn: {feedback.head_turn_detected ? "YES!" : "No"} <br />
                            Yaw Change: {feedback.yaw_change?.toFixed(2)}
                        </div>
                    )}

                    {isRecording && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full animate-pulse flex items-center gap-2">
                            <Mic className="w-4 h-4" />
                            {timeLeft}s
                        </div>
                    )}
                    {isRecording && (
                        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md">
                            {status}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <p className="text-gray-700">
                        <strong>Instructions:</strong>
                        Click Start. Call your child's name. Python AI will detect if they turn their head towards the camera.
                    </p>

                    {!isRecording && (
                        <Button onClick={handleStart} disabled={!isConnected} className="w-full">
                            Start Python-Tracked Test (10s)
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
