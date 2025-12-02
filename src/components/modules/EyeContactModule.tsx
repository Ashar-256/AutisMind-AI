import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Video, Wifi } from 'lucide-react';
import { API_URL } from '@/config';

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
        const wsUrl = API_URL.replace(/^http/, 'ws') + '/ws/analyze';
        const ws = new WebSocket(wsUrl);

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

                        // Mirror the canvas drawing to match the mirrored video
                        ctx.translate(canvas.width, 0);
                        ctx.scale(-1, 1);
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        const base64 = canvas.toDataURL('image/jpeg', 0.7);

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
        <div className="w-full px-4 mx-auto">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="w-6 h-6 text-blue-400" />
                        Visual Preference (Python Powered)
                        {isConnected ? (
                            <span className="text-xs bg-green-900 text-green-100 px-2 py-1 rounded flex items-center gap-1">
                                <Wifi className="w-3 h-3" /> Connected
                            </span>
                        ) : (
                            <span className="text-xs bg-red-900 text-red-100 px-2 py-1 rounded flex items-center gap-1">
                                <Wifi className="w-3 h-3" /> Disconnected
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="relative h-full bg-gray-900/80 backdrop-blur-sm rounded-lg overflow-hidden">
                        {/* Full Width Layout */}
                        <div className="flex-1 h-full flex justify-between">
                            {/* Left Side: Social/Human Interaction Video */}
                            <div className="flex-1 w-full flex items-center justify-center bg-blue-900/20 p-4">
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-full flex-1 bg-gray-800 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                        <video
                                            className="w-full h-full object-cover rounded-lg"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                        >
                                            <source src={`${import.meta.env.BASE_URL}videos/social-interaction-real.mp4`} type="video/mp4" />
                                            {/* Fallback content */}
                                            <div className="text-center space-y-2">
                                                <div className="text-4xl">👨‍👩‍👧‍👦</div>
                                                <div className="text-3xl">🤝</div>
                                                <div className="text-3xl">😊</div>
                                            </div>
                                        </video>
                                    </div>
                                    <p className="text-sm text-gray-300 font-medium text-center">Social Interaction</p>
                                </div>
                            </div>

                            {/* Center: Camera Preview */}
                            <div className="flex-1 w-full flex items-center justify-center  bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4">
                                <div className="h-full bg-black rounded-lg overflow-hidden shadow-lg border-2 border-gray-700 relative">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                    <canvas ref={canvasRef} className="hidden" />

                                    {!stream && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                            <Video className="w-8 h-8 mb-2" />
                                            <p className="text-sm">Camera loading...</p>
                                        </div>
                                    )}

                                    {isRecording && feedback && (
                                        <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-sm p-2 rounded">
                                            <div className="flex justify-between">
                                                <span>Face: {feedback.face_detected ? "✓" : "✗"}</span>
                                                <span className="capitalize">{feedback.current_side}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timer Display */}
                                    {isRecording && (
                                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full animate-pulse text-sm font-bold shadow-lg">
                                            {timeLeft}s
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Geometric Shapes Video */}
                            <div className="flex-1 w-full flex items-center justify-center bg-purple-900/20 p-4">
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-full flex-1 bg-gray-800 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                        <video
                                            className="w-full h-full object-cover rounded-lg"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                        >
                                            <source src={`${import.meta.env.BASE_URL}videos/geometric-shapes-real.mp4`} type="video/mp4" />
                                            <div className="text-center space-y-2">
                                                <div className="flex gap-2 justify-center text-4xl">
                                                    <span>⬛</span>
                                                    <span>🔵</span>
                                                </div>
                                                <div className="flex gap-2 justify-center text-4xl">
                                                    <span>🔺</span>
                                                    <span>⬜</span>
                                                </div>
                                            </div>
                                        </video>
                                    </div>
                                    <p className="text-sm text-gray-300 font-medium text-center">Geometric Shapes</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-300">
                            <strong>Instructions:</strong>
                            Keep the child's head straight towards the screen for accurate results.
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
        </div>
    );
};
