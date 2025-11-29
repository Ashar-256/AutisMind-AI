import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gamepad2, Clock, ArrowRight } from 'lucide-react';
import VideoCapture from '@/components/VideoCapture';
import AudioCapture from '@/components/AudioCapture';

export default function TaskB() {
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(90); // 90 seconds
  const [currentStep, setCurrentStep] = useState(0);
  const [taskComplete, setTaskComplete] = useState(false);
  const navigate = useNavigate();

  const instructions = [
    "Present a favorite toy or interesting object to your child",
    "Observe how they interact with and explore the object",
    "Note their focus duration and engagement patterns",
    "Watch for repetitive behaviors or unusual play patterns"
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRecording(false);
            setTaskComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording, timeRemaining]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setCurrentStep(1);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setTaskComplete(true);
  };

  const handleNextTask = () => {
    navigate('/task-c');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <Gamepad2 className="h-10 w-10 text-green-600 mx-auto" />
          <h1 className="text-3xl font-bold text-white">Task 2: Toy Interaction</h1>
          <p className="text-gray-300">Observing play patterns and object engagement behaviors</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Assessment Progress</span>
            <span>Task 2 of 3</span>
          </div>
          <Progress value={66} className="h-2" />
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ${currentStep > index ? 'bg-green-900 text-green-100' : 'bg-blue-900 text-blue-100'
                    }`}>
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-300">{instruction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recording Interface */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Video */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Video Recording</h3>
            <VideoCapture
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              showControls={!taskComplete}
            />
          </div>

          {/* Audio & Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Audio Monitoring</h3>
            <AudioCapture isRecording={isRecording} />

            {/* Timer */}
            {isRecording && (
              <Card className="bg-green-900/20 border-green-800">
                <CardContent className="text-center py-6">
                  <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-green-100">
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-sm text-green-300">Recording in progress</p>
                </CardContent>
              </Card>
            )}

            {/* Controls */}
            <div className="space-y-4">
              {!isRecording && !taskComplete && (
                <Button
                  onClick={handleStartRecording}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <Button
                  onClick={handleStopRecording}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  Stop Recording
                </Button>
              )}

              {taskComplete && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Task 2 completed successfully! The system has analyzed play patterns
                      and object interaction behaviors.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleNextTask}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    Continue to Task 3
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Observation Points */}
        <Card className="bg-blue-900/20 border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-100">What We're Observing:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-200">
              <div>
                <h4 className="font-semibold mb-2">Engagement Patterns</h4>
                <ul className="space-y-1">
                  <li>• Focus duration</li>
                  <li>• Interest level</li>
                  <li>• Attention shifts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Play Behaviors</h4>
                <ul className="space-y-1">
                  <li>• Exploration methods</li>
                  <li>• Repetitive actions</li>
                  <li>• Creative use</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Social Aspects</h4>
                <ul className="space-y-1">
                  <li>• Sharing attempts</li>
                  <li>• Eye contact</li>
                  <li>• Communication</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-amber-900/20 border-amber-800">
          <CardContent className="py-4">
            <h4 className="font-semibold text-amber-100 mb-2">Tips for Best Results:</h4>
            <ul className="text-sm text-amber-200 space-y-1">
              <li>• Use toys your child is familiar with and enjoys</li>
              <li>• Allow natural, unguided play</li>
              <li>• Avoid interrupting or directing their play</li>
              <li>• Keep the environment calm and distraction-free</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}