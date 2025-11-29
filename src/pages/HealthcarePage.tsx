import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Activity, Shield } from 'lucide-react';

export default function HealthcarePage() {
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
                        <Heart className="w-6 h-6" />
                        <span className="font-medium">Healthcare Integration</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Clinical <br />
                        Excellence
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                        Designed to support healthcare professionals and parents with reliable, data-driven insights for early intervention.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Activity className="w-8 h-8 text-red-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Early Detection</h3>
                        <p className="text-gray-400">Identifying potential risk factors as early as 18 months to enable timely support strategies.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Shield className="w-8 h-8 text-green-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                        <p className="text-gray-400">HIPAA-compliant data handling ensures that sensitive child data remains secure and private.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Heart className="w-8 h-8 text-pink-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Family Centered</h3>
                        <p className="text-gray-400">Tools and reports designed to be easily understood by parents and caregivers.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
