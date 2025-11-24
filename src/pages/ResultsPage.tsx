import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const ResultsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const results = location.state;

    if (!results) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p>No results found.</p>
                <Button onClick={() => navigate('/')}>Go Home</Button>
            </div>
        );
    }

    const { risk_score, risk_band, flags, domain_scores, ai_interpretation } = results;

    const chartData = [
        { name: 'Social', score: domain_scores.social },
        { name: 'Response', score: domain_scores.response },
        { name: 'Vocal', score: domain_scores.vocal },
        { name: 'Gestures', score: domain_scores.gestures },
        { name: 'Repetitive', score: domain_scores.repetitive },
    ];

    const getBandColor = (band: string) => {
        switch (band) {
            case 'Low': return 'text-green-600';
            case 'Moderate': return 'text-yellow-600';
            case 'High': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getBandBg = (band: string) => {
        switch (band) {
            case 'Low': return 'bg-green-100 border-green-200';
            case 'Moderate': return 'bg-yellow-100 border-yellow-200';
            case 'High': return 'bg-red-100 border-red-200';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Screening Results</h1>
                    <p className="text-gray-500">Based on the 5-module assessment</p>
                </div>

                {/* Risk Score Card */}
                <Card className={`border-2 ${getBandBg(risk_band)}`}>
                    <CardContent className="flex flex-col items-center p-8 space-y-4">
                        <div className="text-lg font-medium text-gray-600">Autism Risk Assessment</div>
                        <div className={`text-5xl font-bold ${getBandColor(risk_band)}`}>
                            {risk_band} Risk
                        </div>
                        <div className="text-2xl font-semibold text-gray-700">
                            Score: {risk_score}/100
                        </div>
                        <p className="text-center text-gray-600 max-w-lg">
                            {risk_band === 'Low' && "Your child is showing typical development patterns in the areas screened."}
                            {risk_band === 'Moderate' && "Some atypical behaviors were observed. Monitoring and follow-up is recommended."}
                            {risk_band === 'High' && "Several atypical behaviors were observed. A professional evaluation is strongly recommended."}
                        </p>
                    </CardContent>
                </Card>

                {/* AI Interpretation Card */}
                {ai_interpretation && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <Brain className="w-6 h-6" />
                                NeuroLens AI Interpretation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-blue-900 italic leading-relaxed">
                                "{ai_interpretation}"
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Domain Scores Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Domain Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <Tooltip />
                                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.score > 50 ? '#ef4444' : entry.score > 25 ? '#eab308' : '#22c55e'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Flags & Observations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Key Observations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {flags.length === 0 ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span>No significant concerns flagged.</span>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {flags.map((flag: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-700">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <span>{flag}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg flex gap-3">
                                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                                <p className="text-sm text-blue-700">
                                    This is a screening tool, not a diagnosis. Please consult with a pediatrician for a comprehensive evaluation.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center pt-8">
                    <Button size="lg" onClick={() => navigate('/')}>Start New Screening</Button>
                </div>

            </div>
        </div>
    );
};
