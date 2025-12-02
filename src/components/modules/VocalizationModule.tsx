import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, MessageCircle, Wifi } from 'lucide-react';
import { API_URL } from '@/config';

interface VocalizationData {
    vocalization_score: 0 | 1 | 2;
    vocalization_activity_index: number;
}

interface VocalizationModuleProps {
    onComplete: (data: VocalizationData) => void;
}

export const VocalizationModule: React.FC<VocalizationModuleProps> = ({ onComplete }) => {
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);
    const [progress, setProgress] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);

    useEffect(() => {
        connectWebSocket();
        return () => {
            stopRecording();
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    const connectWebSocket = () => {
        const wsUrl = API_URL.replace(/^http/, 'ws') + '/ws/audio';
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => setIsConnected(true);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setFeedback(data);
        };
        ws.onclose = () => setIsConnected(false);
        wsRef.current = ws;
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    const newTime = prev - 1;
                    setProgress(((20 - newTime) / 20) * 100);
                    return newTime;
                });
            }, 1000);
        } else if (timeLeft === 0 && isRecording) {
            finishRecording();
        }
        return () => clearInterval(interval);
    }, [isRecording, timeLeft]);

    const handleStart = async () => {
        try {
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Create audio context
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);

                // Convert Float32Array to Int16Array
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Convert to base64
                const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));

                // Send to backend
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(base64);
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsRecording(true);
            setTimeLeft(20);
            setProgress(0);
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };

    const stopRecording = () => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const finishRecording = () => {
        setIsRecording(false);
        stopRecording();

        // Calculate score based on vocalization percentage
        const vocalPercentage = feedback?.vocal_percentage || 0;
        let score: 0 | 1 | 2 = 0;
        let activityIndex = vocalPercentage / 100;

        if (vocalPercentage < 20) {
            score = 2; // Very little vocalization
        } else if (vocalPercentage < 50) {
            score = 1; // Some vocalization
        } else {
            score = 0; // Lots of vocalization
        }

        onComplete({
            vocalization_score: score,
            vocalization_activity_index: activityIndex
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-green-500" />
                    Vocalization & Babbling (Python Powered)
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
                <div className="h-48 bg-gray-900 rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-gray-800">
                    {isRecording ? (
                        <div className="flex flex-col items-center gap-4 w-full px-4 z-10">
                            {/* Speech Status Badge */}
                            <div className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${feedback?.is_speech ? "bg-green-500 text-white" : "bg-gray-700 text-gray-400"
                                }`}>
                                {feedback?.is_speech ? "🗣️ SPEECH DETECTED" : "Silence"}
                            </div>
                            {/* Volume Bars */}
                            <div className="flex items-end gap-1 h-24">
                                {[...Array(20)].map((_, i) => {
                                    // Create a wave effect
                                    const volume = (feedback?.rms || 0);
                                    // Scale: RMS 0-3000 -> 0-100% height
                                    const baseHeight = (volume / 3000) * 100;
                                    const randomFactor = Math.random() * 0.3 + 0.85; // Flicker
                                    const height = Math.min(Math.max(baseHeight * randomFactor, 4), 100);

                                    return (
                                        <div
                                            key={i}
                                            className={`w-2 rounded-t-sm transition-all duration-75 ${feedback?.is_speech ? "bg-green-400" : "bg-gray-600"
                                                }`}
                                            style={{
                                                height: `${height}%`,
                                                opacity: feedback?.is_speech ? 1 : 0.5
                                            }}
                                        />
                                    );
                                })}
                            </div>

                            {feedback && (
                                <div className="text-gray-400 text-xs text-center">
                                    <div>Volume Level: {feedback.volume_level}</div>
                                    <div>Total Speech: {feedback.vocal_percentage?.toFixed(1)}%</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Mic className="w-12 h-12" />
                            <span>Ready to Record</span>
                        </div>
                    )}
                </div>

                {isRecording && <Progress value={progress} className="w-full" />}

                <div className="space-y-4">
                    <p className="text-gray-700">
                        <strong>Instructions:</strong> We will record for 20 seconds.
                        Talk to your child, play with them, and encourage them to make sounds or babble.
                        The AI will automatically detect vocalizations.
                    </p>

                    {!isRecording && timeLeft === 20 && (
                        <Button onClick={handleStart} disabled={!isConnected} className="w-full">
                            {isConnected ? "Start AI-Tracked Recording (20s)" : "Connecting..."}
                        </Button>
                    )}

                    {isRecording && (
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-700">{timeLeft}s</div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card >
    );
};
