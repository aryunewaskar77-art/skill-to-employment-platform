"use client";
import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';

interface PropensityData {
    propensity_score: number;
    risk_category: 'HIGH' | 'MEDIUM' | 'LOW';
    key_factors: {
        feature: string;
        contribution: number;
        effect: 'positive' | 'negative';
    }[];
}

interface SimulatorProps {
    initialDistrict?: string;
    initialCourse?: string;
}

export default function PropensitySimulator({ initialDistrict, initialCourse }: SimulatorProps) {
    const [attendance, setAttendance] = useState<number>(85);
    const [assessment, setAssessment] = useState<number>(75);
    const [nsqf, setNsqf] = useState<number>(3);
    const [education, setEducation] = useState<string>('12th Pass');
    
    const [data, setData] = useState<PropensityData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchPrediction();
        }, 500); // 500ms debounce
        return () => clearTimeout(handler);
    }, [attendance, assessment, nsqf, education, initialDistrict, initialCourse]);

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
                    district_demand_score: 0.6, // Using static mock for demo
                    prior_education_level: education,
                    course_category: initialCourse || 'IT'
                })
            });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error("Failed to fetch prediction", err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (risk: string) => {
        if (risk === 'LOW') return 'text-green-700 bg-green-100 border-green-200';
        if (risk === 'MEDIUM') return 'text-yellow-700 bg-yellow-100 border-yellow-200';
        return 'text-red-700 bg-red-100 border-red-200';
    };

    const getGaugeColor = (score: number) => {
        if (score >= 0.7) return '#22c55e'; // Green
        if (score >= 0.4) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full relative">
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                <AlertCircle className="w-3 h-3" />
                Synthetic Model Demo (SIH Prototype)
            </div>

            <div className="p-6 border-b border-gray-100 bg-gray-50/50 pt-10">
                <h3 className="text-xl font-bold text-gray-800 mb-1">AI Career & Employment Forecast</h3>
                <p className="text-xs text-gray-500">Live What-If Simulator</p>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                {/* Gauge Section */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center justify-center w-32 h-32 relative">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                            {data && (
                                <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="40" 
                                    stroke={getGaugeColor(data.propensity_score)} 
                                    strokeWidth="8" 
                                    fill="none" 
                                    strokeDasharray={`${data.propensity_score * 251.2} 251.2`} 
                                    className="transition-all duration-1000 ease-out"
                                />
                            )}
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-gray-800">
                                {data ? (data.propensity_score * 100).toFixed(0) : 0}%
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex-1 ml-6">
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-2">Unemployment Risk</p>
                        {data ? (
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskColor(data.risk_category)}`}>
                                {data.risk_category} RISK
                            </span>
                        ) : (
                            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
                        )}
                    </div>
                </div>

                {/* Key Factors */}
                <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider border-b pb-2">Key Drivers</h4>
                    <div className="space-y-2">
                        {data?.key_factors.map((factor, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-600 truncate mr-2" title={factor.feature}>{factor.feature}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ${factor.effect === 'positive' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {factor.effect === 'positive' ? '+' : ''}{factor.contribution > 0 && factor.effect === 'negative' ? '-' : ''}{factor.contribution}
                                </span>
                            </div>
                        ))}
                        {!data && (
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div>
                                <div className="h-4 bg-gray-100 rounded w-4/6 animate-pulse"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sliders */}
                <div className="mt-auto pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Policy / Candidate Trajectory</h4>
                    
                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                <span>Attendance Rate</span>
                                <span>{attendance}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={attendance} 
                                onChange={(e) => setAttendance(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                <span>Assessment Score</span>
                                <span>{assessment}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={assessment} 
                                onChange={(e) => setAssessment(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                <span>NSQF Level</span>
                                <span>Level {nsqf}</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" max="10" 
                                value={nsqf} 
                                onChange={(e) => setNsqf(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                <span>Prior Education</span>
                            </div>
                            <select 
                                value={education}
                                onChange={(e) => setEducation(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                            >
                                <option>Below 10th</option>
                                <option>10th Pass</option>
                                <option>12th Pass</option>
                                <option>ITI</option>
                                <option>Diploma</option>
                                <option>Graduate</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
