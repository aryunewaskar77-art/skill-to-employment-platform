import React from 'react';
import { Compass, TrendingUp, Sparkles, Award, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';

interface CandidateCareerPathProps {
    candidateName?: string;
    course?: string;
}

export default function CandidateCareerPath({ candidateName = "Candidate", course = "CNC Machinist" }: CandidateCareerPathProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6 overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-700">
                    <Compass className="w-5 h-5" />
                    <h3 className="font-bold text-gray-900">Career Passport &amp; Progression Engine</h3>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Engine Active</span>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Verified Credentials Badge */}
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Verified Credentials</h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
                            <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-indigo-900">DigiLocker Verified</p>
                                <p className="text-xs text-indigo-700 mt-1 font-mono">Hash: e8a9...b4c2 (IndiaStack)</p>
                            </div>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-4 flex items-start gap-3">
                            <Award className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-purple-900">NSQF Level 4 | {course}</p>
                                <p className="text-xs text-purple-700 mt-1">NCO-2015: 7223.0101</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Career Milestones Track */}
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Projected Career Milestones</h4>
                    <div className="relative">
                        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2 rounded-full hidden sm:block"></div>
                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                            
                            <div className="flex-1 bg-white border-2 border-emerald-500 rounded-lg p-4 shadow-sm relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Current
                                </div>
                                <p className="text-sm font-bold text-gray-900 text-center">Junior {course}</p>
                                <p className="text-xs text-emerald-600 font-semibold text-center mt-1">₹18,000 / mo</p>
                            </div>

                            <div className="hidden sm:flex items-center justify-center text-gray-400">
                                <ArrowRight className="w-5 h-5" />
                            </div>

                            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative opacity-90">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    12-Month Target
                                </div>
                                <p className="text-sm font-bold text-gray-900 text-center">Senior Tooling Specialist</p>
                                <p className="text-xs text-blue-600 font-semibold text-center mt-1">₹28,000 / mo</p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Recommended Next-Skill Course Path */}
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" /> AI Upskilling Recommendations
                    </h4>
                    
                    <div className="space-y-3">
                        <div className="border border-indigo-100 bg-indigo-50/50 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-indigo-300">
                            <div>
                                <h5 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    Robotic Welding Automation
                                    <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full">NSQF 5</span>
                                </h5>
                                <p className="text-xs text-indigo-700/80 mt-1.5 line-clamp-2">High regional demand in automotive hubs (Pune/Aurangabad). Bridges gap to advanced manufacturing.</p>
                                <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +42% Wage Growth Potential
                                </p>
                            </div>
                            <button className="shrink-0 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">
                                Enroll in Advance Module
                            </button>
                        </div>

                        <div className="border border-gray-200 bg-white rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-gray-300">
                            <div>
                                <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-gray-500" />
                                    Quality Assurance &amp; Metrology
                                    <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full">NSQF 5</span>
                                </h5>
                                <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">Ideal for precision roles. Consistent shortage of QA inspectors in MSME sector.</p>
                                <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +30% Wage Growth Potential
                                </p>
                            </div>
                            <button className="shrink-0 w-full md:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">
                                View Subsidized Path
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
