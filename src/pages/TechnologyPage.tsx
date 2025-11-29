import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cpu, Brain, Network } from 'lucide-react';

export default function TechnologyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen p-8 md:p-12 text-white relative z-10">
            <Button
                variant="ghost"
                className="mb-8 text-gray-400 hover:text-white hover:bg-white/10"
                onClick={() => navigate('/')}
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>

            <div className="max-w-4xl mx-auto space-y-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lime-400">
                        <Cpu className="w-6 h-6" />
                        <span className="font-medium">Our Technology</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Powered by <br />
                        Advanced AI
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                        AutisMind AI utilizes state-of-the-art computer vision and machine learning models to analyze behavioral patterns with high precision.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Brain className="w-8 h-8 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Computer Vision</h3>
                        <p className="text-gray-400">Real-time face tracking and gaze analysis using lightweight, privacy-focused models running directly in your browser.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Network className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Neural Networks</h3>
                        <p className="text-gray-400">Deep learning algorithms trained on diverse datasets to recognize subtle behavioral markers associated with autism spectrum disorder.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
