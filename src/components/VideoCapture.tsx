import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Play, Square } from 'lucide-react';

interface VideoCaptureProps {
  onReady?: () => void;
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  showControls?: boolean;
}

export default function VideoCapture({
  onReady,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  showControls = false
}: VideoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreamActive(true);
        setError(null);

        // Call onReady after a short delay to ensure video is playing
        setTimeout(() => {
          onReady?.();
        }, 1000);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreamActive(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      onStopRecording?.();
    } else {
      onStartRecording?.();
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-black">
        {error ? (
          <div className="aspect-video flex items-center justify-center bg-gray-800">
            <div className="text-center space-y-4">
              <CameraOff className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-gray-300">{error}</p>
              <Button onClick={startCamera} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
            />

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording</span>
              </div>
            )}

            {/* Camera Status */}
            <div className="absolute top-4 left-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isStreamActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                }`}>
                <Camera className="h-4 w-4" />
                <span className="text-sm">
                  {isStreamActive ? 'Camera Active' : 'Camera Inactive'}
                </span>
              </div>
            </div>

            {/* Controls */}
            {showControls && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={toggleRecording}
                  className={`rounded-full w-16 h-16 ${isRecording
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {isRecording ? (
                    <Square className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}