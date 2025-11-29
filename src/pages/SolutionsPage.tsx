import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, CheckCircle, BarChart } from 'lucide-react';

export default function SolutionsPage() {
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
                        <Lightbulb className="w-6 h-6" />
                        <span className="font-medium">Our Solutions</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Comprehensive <br />
                        Assessment
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                        A suite of interactive modules designed to evaluate key developmental markers in a natural, play-based environment.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-1">Visual Preference Analysis</h3>
                            <p className="text-gray-400">Measures attention patterns between social and geometric stimuli.</p>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4">
                        <div className="bg-purple-500/20 p-3 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-1">Response to Name</h3>
                            <p className="text-gray-400">Evaluates auditory response and head-turning latency.</p>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-4">
                        <div className="bg-green-500/20 p-3 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-1">Vocalization Tracking</h3>
                            <p className="text-gray-400">Analyzes speech patterns, babbling, and communicative intent.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
