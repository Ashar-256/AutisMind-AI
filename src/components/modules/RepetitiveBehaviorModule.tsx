import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Wifi } from 'lucide-react';
import { API_URL } from '@/config';

interface RepetitiveData {
    repetitive_behavior_score: 0 | 1 | 2;
    movement_score: number;
}

interface RepetitiveBehaviorModuleProps {
    onComplete: (data: RepetitiveData) => void;
}

export const RepetitiveBehaviorModule: React.FC<RepetitiveBehaviorModuleProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);
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
        const wsUrl = API_URL.replace(/^http/, 'ws') + '/ws/analyze';
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => setIsConnected(true);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setFeedback(data);
        };
        ws.onclose = () => setIsConnected(false);
        wsRef.current = ws;
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
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

        if (isRecording && timeLeft > 0) {
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

                        // Mirror the canvas drawing
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        wsRef.current.send(JSON.stringify({
                            task: "repetitive",
                            image: canvas.toDataURL('image/jpeg', 0.7)
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
        setTimeLeft(20);
    };

    const finishTest = () => {
        setIsRecording(false);
        // Analyze movement score
        const movement = feedback?.movement_score || 0;
        // Threshold for "excessive" repetitive movement (mock)
        const isRepetitive = movement > 5.0;

        onComplete({
            repetitive_behavior_score: isRepetitive ? 2 : 0,
            movement_score: movement
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-red-500" />
                    Repetitive Behaviors (Python Powered)
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
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {isRecording && feedback && (
                        <div className="absolute top-2 left-2 bg-black/50 text-white p-2 rounded text-xs">
                            Pose Detected: {feedback.pose_detected ? "YES" : "No"} <br />
                            Movement Score: {feedback.movement_score?.toFixed(2)}
                        </div>
                    )}

                    {isRecording && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full animate-pulse">
                            {timeLeft}s
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <p className="text-gray-700">
                        <strong>Instructions:</strong>
                        Observe the child during free play. The AI tracks body movement patterns to detect repetitive rocking or flapping.
                    </p>

                    {!isRecording && (
                        <Button onClick={handleStart} disabled={!isConnected} className="w-full">
                            Start Python-Tracked Test (20s)
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
