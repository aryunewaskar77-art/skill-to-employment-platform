"use client";

import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import MetricTooltip from './MetricTooltip';

interface PropensityProps {
    initialDistrict?: string;
    initialCourse?: string;
}

export default function PropensitySimulator({ initialDistrict, initialCourse }: PropensityProps) {
    const [attendance, setAttendance] = useState(85);
    const [assessment, setAssessment] = useState(70);
    const [nsqf, setNsqf] = useState(4);
    
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPrediction();
        }, 500);
        return () => clearTimeout(timer);
    }, [attendance, assessment, nsqf]);

    const fetchPrediction = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/v1/predict/employment-propensity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attendance_rate: attendance,
                    assessment_score: assessment,
                    nsqf_level: nsqf,
                    district_demand_score: 0.75, // Mocked for simulator
                    prior_education_level: '12th Grade',
                    course_category: initialCourse || 'General'
                })
            });
            if (res.ok) {
                const data = await res.json();
                setResult(data);
            }
        } catch (e) {
            console.error("Prediction failed", e);
        } finally {
            setLoading(false);
        }
    };

    // Calculate SVG Gauge properties
    const score = result?.propensity_score || 0;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score * circumference);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                <Activity className="w-5 h-5 text-indigo-500" />
                AI Propensity Simulator
            </h3>
            <p className="text-xs text-slate-500 mb-6">Real-time ML estimation of 12-month retention</p>

            <div className="flex justify-center mb-6 relative">
                <svg width="160" height="160" className="transform -rotate-90">
                    <circle 
                        cx="80" cy="80" r={radius} 
                        stroke="#e2e8f0" strokeWidth="12" fill="none" 
                    />
                    <circle 
                        cx="80" cy="80" r={radius} 
                        stroke={score >= 0.7 ? '#10b981' : score >= 0.4 ? '#f59e0b' : '#ef4444'} 
                        strokeWidth="12" fill="none" 
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800">
                        {loading ? '...' : `${(score * 100).toFixed(1)}%`}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Probability
                    </span>
                </div>
            </div>

            <div className="space-y-5 mb-6">
                <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                        <span>Attendance Rate</span>
                        <span>{attendance}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="100" 
                        value={attendance} onChange={(e) => setAttendance(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                        <span>Assessment Score</span>
                        <span>{assessment}</span>
                    </div>
                    <input 
                        type="range" min="0" max="100" 
                        value={assessment} onChange={(e) => setAssessment(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                        <MetricTooltip term="NSQF Level">
                            <span>NSQF Level</span>
                        </MetricTooltip>
                        <span>Level {nsqf}</span>
                    </div>
                    <input 
                        type="range" min="1" max="10" 
                        value={nsqf} onChange={(e) => setNsqf(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
            </div>

            {result?.key_factors && (
                <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Key Factors</h4>
                    <div className="space-y-2">
                        {result.key_factors.map((factor: any, i: number) => (
                            <div key={i} className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                                factor.effect === 'positive' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                            }`}>
                                <span className="flex items-center gap-1.5">
                                    {factor.effect === 'positive' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                    {factor.feature}
                                </span>
                                <span>{factor.effect === 'positive' ? '+' : ''}{factor.contribution}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
