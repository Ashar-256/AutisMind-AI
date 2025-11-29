import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Camera, Mic, Shield, Clock, FileText } from 'lucide-react';

export default function Index() {
  const [consentGiven, setConsentGiven] = useState(false);
  const navigate = useNavigate();

  const handleStartScreening = () => {
    if (consentGiven) {
      navigate('/screening');
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">AutisMind AI</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            AI-Powered Early Autism Risk Assessment for Toddlers
          </p>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-blue-400 bg-black/70 backdrop-blur-md">
            <CardHeader className="text-center">
              <Camera className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <CardTitle className="text-lg text-white">Video Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Observes gaze patterns, facial expressions, and behavioral responses during structured tasks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-green-400 bg-black/70 backdrop-blur-md">
            <CardHeader className="text-center">
              <Mic className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-lg text-white">Audio Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Analyzes vocalization patterns, response timing, and communication attempts.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-purple-400 bg-black/70 backdrop-blur-md">
            <CardHeader className="text-center">
              <FileText className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <CardTitle className="text-lg text-white">Detailed Report</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Provides comprehensive analysis with recommendations for further evaluation if needed.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Process */}
        <Card className="bg-black/70 backdrop-blur-md border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Clock className="h-5 w-5 text-blue-400" />
              <span>Assessment Process (15-20 minutes)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">1</div>
                <div>
                  <h4 className="font-semibold text-white">Name Response</h4>
                  <p className="text-sm text-gray-300">Child's response to name calling and attention-seeking</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">2</div>
                <div>
                  <h4 className="font-semibold text-white">Toy Interaction</h4>
                  <p className="text-sm text-gray-300">Observing play patterns and object engagement</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">3</div>
                <div>
                  <h4 className="font-semibold text-white">Free Play</h4>
                  <p className="text-sm text-gray-300">Natural behavior observation during unstructured time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Consent */}
        <Card className="border-amber-400 bg-black/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-300">
              <Shield className="h-5 w-5" />
              <span>Privacy & Consent</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-amber-900/70 border-amber-400">
              <AlertDescription className="text-amber-200">
                <strong>Important:</strong> This tool is for screening purposes only and is not a diagnostic instrument.
                Always consult with healthcare professionals for proper evaluation and diagnosis.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                • All video and audio data is processed locally in your browser
              </p>
              <p className="text-sm text-gray-300">
                • No personal data is stored on external servers without explicit consent
              </p>
              <p className="text-sm text-gray-300">
                • You can stop the assessment at any time
              </p>
              <p className="text-sm text-gray-300">
                • Results are provided for informational purposes only
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="consent"
                checked={consentGiven}
                onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
              />
              <label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white">
                I understand this is a screening tool, not a diagnostic test, and I consent to the video/audio recording for assessment purposes.
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center pb-8">
          <Button
            size="lg"
            className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
            onClick={handleStartScreening}
            disabled={!consentGiven}
          >
            Start Screening Assessment
          </Button>
          {!consentGiven && (
            <p className="text-sm text-gray-400 mt-2">
              Please provide consent to begin the assessment
            </p>
          )}
        </div>
      </div>
    </div>
  );
}