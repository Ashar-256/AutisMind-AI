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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">EarlyDetect AI</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-Powered Early Autism Risk Assessment for Toddlers
          </p>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-blue-200">
            <CardHeader className="text-center">
              <Camera className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Video Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Observes gaze patterns, facial expressions, and behavioral responses during structured tasks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="text-center">
              <Mic className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Audio Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Analyzes vocalization patterns, response timing, and communication attempts.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="text-center">
              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Detailed Report</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Provides comprehensive analysis with recommendations for further evaluation if needed.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Process */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Assessment Process (15-20 minutes)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold">1</div>
                <div>
                  <h4 className="font-semibold">Name Response</h4>
                  <p className="text-sm text-gray-600">Child's response to name calling and attention-seeking</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold">2</div>
                <div>
                  <h4 className="font-semibold">Toy Interaction</h4>
                  <p className="text-sm text-gray-600">Observing play patterns and object engagement</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold">3</div>
                <div>
                  <h4 className="font-semibold">Free Play</h4>
                  <p className="text-sm text-gray-600">Natural behavior observation during unstructured time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Consent */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-800">
              <Shield className="h-5 w-5" />
              <span>Privacy & Consent</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Important:</strong> This tool is for screening purposes only and is not a diagnostic instrument.
                Always consult with healthcare professionals for proper evaluation and diagnosis.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                • All video and audio data is processed locally in your browser
              </p>
              <p className="text-sm text-gray-700">
                • No personal data is stored on external servers without explicit consent
              </p>
              <p className="text-sm text-gray-700">
                • You can stop the assessment at any time
              </p>
              <p className="text-sm text-gray-700">
                • Results are provided for informational purposes only
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="consent"
                checked={consentGiven}
                onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
              />
              <label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I understand this is a screening tool, not a diagnostic test, and I consent to the video/audio recording for assessment purposes.
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center pb-8">
          <Button
            size="lg"
            className="px-8 py-3 text-lg"
            onClick={handleStartScreening}
            disabled={!consentGiven}
          >
            Start Screening Assessment
          </Button>
          {!consentGiven && (
            <p className="text-sm text-gray-500 mt-2">
              Please provide consent to begin the assessment
            </p>
          )}
        </div>
      </div>
    </div>
  );
}