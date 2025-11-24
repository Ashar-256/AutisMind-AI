import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";
import { EyeContactModule } from '@/components/modules/EyeContactModule';
import { NameResponseModule } from '@/components/modules/NameResponseModule';
import { VocalizationModule } from '@/components/modules/VocalizationModule';
import { GesturesModule } from '@/components/modules/GesturesModule';
import { RepetitiveBehaviorModule } from '@/components/modules/RepetitiveBehaviorModule';
import { ScreeningResult } from '@/types/screening';

export const ScreeningFlow: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [results, setResults] = useState<Partial<ScreeningResult> & { raw_metrics?: any }>({
        age_months: 24
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSteps = 5;
    const progress = (step / totalSteps) * 100;

    const handleModuleComplete = (data: any) => {
        const newResults = { ...results, ...data };
        // If module provided raw_metrics (like EyeContact), merge them carefully
        if (data.raw_metrics) {
            newResults.raw_metrics = { ...results.raw_metrics, ...data.raw_metrics };
        }
        setResults(newResults);

        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            finishScreening(newResults);
        }
    };

    const finishScreening = async (finalData: any) => {
        setIsSubmitting(true);
        console.log("Submitting Screening Data:", finalData);

        try {
            // Prepare payload for NeuroLens Backend
            // We primarily use the raw_metrics from EyeContactModule for the "NeuroLens" logic
            // But we also want to include the other module scores in the final report.
            // The backend currently expects specific raw_metrics structure.

            let backendPayload = {};
            if (finalData.raw_metrics) {
                backendPayload = finalData.raw_metrics;
            } else {
                // Fallback if no raw metrics (e.g. skipped eye contact or manual only)
                // Construct dummy metrics to avoid backend error if needed, or handle gracefully
                backendPayload = {
                    totalFrames: 0,
                    framesFaceDetected: 0,
                    framesSocialSide: 0,
                    framesGeometricSide: 0,
                    sideSwitchCount: 0,
                    startTime: 0,
                    endTime: 0,
                    durationSec: 0
                };
            }

            // Call Python Backend
            const response = await fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(backendPayload),
            });

            const analysisResult = await response.json();
            console.log("Backend Analysis:", analysisResult);

            // Merge Backend Analysis with Frontend Scores (from other modules)
            // We'll map the backend "scores" to our risk model or just display them.
            // For now, let's keep the existing risk model but augment it with backend interpretation.

            // Recalculate Risk Score incorporating Backend Data if valid
            let riskScore = 0;
            let flags = [];

            // ... (Existing manual scoring logic for other modules) ...
            const nameScore = (finalData.response_to_name_score || 0) * 50;
            const vocalScore = (finalData.vocalization_score || 0) * 50;
            const gestureScore = (finalData.gesture_joint_attention_score || 0) * 50;
            const repetitiveScore = (finalData.repetitive_behavior_score || 0) * 50;

            // Use Backend Engagement Score for "Social" component if available
            let socialScore = 0;
            if (analysisResult.scores && analysisResult.scores.engagementScore !== undefined) {
                // Map engagement (0-1) to risk. High engagement = Low Risk.
                // Risk = (1 - engagement) * 100
                socialScore = (1 - analysisResult.scores.engagementScore) * 100;

                if (analysisResult.classifications.engagementClass === "low engagement") {
                    flags.push("Low engagement detected by AI");
                }
                if (analysisResult.classifications.dominantFocus === "geometric") {
                    flags.push("Strong preference for geometric patterns detected");
                }
            } else {
                // Fallback
                socialScore = (finalData.eye_contact_score || 0) * 50;
            }

            const totalRisk = (
                (socialScore * 0.30) +
                (nameScore * 0.20) +
                (vocalScore * 0.20) +
                (repetitiveScore * 0.20) +
                (gestureScore * 0.10)
            );

            const riskBand = totalRisk < 30 ? "Low" : totalRisk < 60 ? "Moderate" : "High";

            // Add manual flags
            if (finalData.response_to_name_score === 2) flags.push("No response to name");
            if (finalData.vocalization_score === 2) flags.push("Limited vocalization");
            if (finalData.repetitive_behavior_score === 2) flags.push("Repetitive behaviors observed");
            if (finalData.gesture_joint_attention_score === 2) flags.push("Lack of gestures/joint attention");

            const resultPayload = {
                risk_score: Math.round(totalRisk),
                risk_band: riskBand,
                flags: flags,
                domain_scores: {
                    social: socialScore,
                    response: nameScore,
                    vocal: vocalScore,
                    repetitive: repetitiveScore,
                    gestures: gestureScore
                },
                ai_interpretation: analysisResult.interpretation // Pass the text summary
            };

            navigate('/results', { state: resultPayload });

        } catch (error) {
            console.error("Backend Error:", error);
            // Fallback to local calculation if backend fails
            navigate('/results', {
                state: {
                    risk_score: 0,
                    risk_band: "Error",
                    flags: ["Backend connection failed"],
                    domain_scores: { social: 0, response: 0, vocal: 0, repetitive: 0, gestures: 0 }
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                        <span>Step {step} of {totalSteps}</span>
                        <span>{Math.round(progress)}% Completed</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="min-h-[500px]">
                    {step === 1 && <EyeContactModule onComplete={handleModuleComplete} />}
                    {step === 2 && <NameResponseModule onComplete={handleModuleComplete} />}
                    {step === 3 && <VocalizationModule onComplete={handleModuleComplete} />}
                    {step === 4 && <GesturesModule onComplete={handleModuleComplete} />}
                    {step === 5 && <RepetitiveBehaviorModule onComplete={handleModuleComplete} />}

                    {isSubmitting && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg text-center">
                                <div className="animate-spin text-4xl mb-4">🔄</div>
                                <p>Analyzing behavioral patterns...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
