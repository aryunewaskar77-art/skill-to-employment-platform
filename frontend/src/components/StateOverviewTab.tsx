"use client";

import React, { useState } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
    Users, BookOpen, Award, Briefcase, ShieldCheck, HeartHandshake, 
    Download, Filter, TrendingUp, AlertTriangle, CheckCircle, MapPin
} from 'lucide-react';

const funnelData = [
    { stage: 'Enrolled', count: 504, dropoff: 'Start' },
    { stage: 'Trained', count: 504, dropoff: '0%' },
    { stage: 'Certified', count: 419, dropoff: '-17%' },
    { stage: 'Placed', count: 214, dropoff: '-49%' },
    { stage: 'Verified', count: 105, dropoff: '-51%' },
    { stage: 'Retained (6m)', count: 84, dropoff: '-20%' },
];

const verificationData = [
    { name: 'Statutory EPFO/ESIC', value: 45, color: '#10b981' }, // emerald-500
    { name: 'Employer Upload', value: 30, color: '#0ea5e9' }, // sky-500
    { name: 'Self-Reported', value: 15, color: '#f59e0b' }, // amber-500
    { name: 'Pending Verification', value: 10, color: '#94a3b8' }, // slate-400
];

const schemeData = [
    { name: 'PMKUVA', placement: 65, retention: 55 },
    { name: 'CTS (ITIs)', placement: 58, retention: 50 },
    { name: 'PMKVY 4.0', placement: 45, retention: 35 },
    { name: 'CMYWTS', placement: 72, retention: 68 },
];

const sectorData = [
    { name: 'IT/Software', value: 35 },
    { name: 'Manufacturing', value: 25 },
    { name: 'Healthcare', value: 20 },
    { name: 'Logistics', value: 12 },
    { name: 'Retail', value: 8 },
];

export default function StateOverviewTab() {
    const [activeFilter, setActiveFilter] = useState('All Maharashtra');

    return (
        <div className="animate-in fade-in duration-300">
            {/* Top Action & Filter Bar */}
            <div className="bg-white/80 backdrop-blur-md sticky top-[4rem] z-20 py-3 mb-6 flex flex-col md:flex-row items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-3 w-full md:w-auto mb-3 md:mb-0">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select 
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
                    >
                        <option>All Maharashtra</option>
                        <option>Division: Pune</option>
                        <option>Division: Konkan</option>
                        <option>Division: Marathwada</option>
                        <option>Division: Vidarbha</option>
                    </select>
                    <span className="text-slate-300">|</span>
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">FY 2025-26</span>
                </div>

            </div>

            {/* Executive Metric Cards (6 Cols) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex items-center justify-between mb-3 text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Enrolled</span>
                        <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-black text-slate-800 mb-1">504</div>
                    <div className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-max">Target: 600</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex items-center justify-between mb-3 text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Trained</span>
                        <BookOpen className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-800 mb-1">504</div>
                    <div className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded w-max border border-blue-100">100% Completion</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex items-center justify-between mb-3 text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Certified</span>
                        <Award className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-800 mb-1">419</div>
                    <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded w-max border border-amber-100">83.1% Pass Rate</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex items-center justify-between mb-3 text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Placed</span>
                        <Briefcase className="w-4 h-4 text-teal-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-800 mb-1">214</div>
                    <div className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded w-max border border-teal-100">51.1% Placement</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex items-center justify-between mb-3 text-slate-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider truncate mr-1" title="Verified Employed">Verified Emp.</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-800 mb-1">105</div>
                    <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-max border border-emerald-100">49.1% EPFO Match</div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-xl shadow-md border border-indigo-500 flex flex-col text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-3 text-indigo-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider">6M Retained</span>
                        <HeartHandshake className="w-4 h-4 text-indigo-200" />
                    </div>
                    <div className="text-2xl font-black mb-1">84</div>
                    <div className="text-[10px] font-semibold text-white bg-indigo-500/50 px-1.5 py-0.5 rounded w-max border border-indigo-400">80.0% Retention Rate</div>
                </div>
            </div>

            {/* Central Visual Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Left: Funnel Chart */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-teal-500" />
                        Candidate Lifecycle Conversion & Drop-off Funnel
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={funnelData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="stage" tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                    formatter={(value: any, name: any, props: any) => [
                                        <span key="1" className="font-bold">{value} Candidates <span className="text-red-500 ml-2">({props.payload.dropoff} drop)</span></span>, 
                                        ''
                                    ]}
                                />
                                <Area type="monotone" dataKey="count" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Verification Donut */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Multi-Source Employment Verification Breakdown
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Provenance of placement evidence supporting statutory claims.</p>
                    <div className="h-56 w-full relative flex items-center">
                        <div className="w-1/2 h-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={verificationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={75}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {verificationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#334155', fontWeight: 600, fontSize: '12px' }}
                                        formatter={(val: number) => [`${val}%`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 flex flex-col gap-3 pl-4 border-l border-slate-100">
                            {verificationData.map(v => (
                                <div key={v.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: v.color }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-slate-700">{v.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">{v.value}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lower Policy Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Card A: Scheme Leaderboard */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Scheme Outcome Leaderboard</h3>
                    <div className="flex flex-col gap-4">
                        {schemeData.map(scheme => (
                            <div key={scheme.name}>
                                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                                    <span>{scheme.name}</span>
                                    <span className="text-[10px] font-bold text-slate-500">P: {scheme.placement}% | R: {scheme.retention}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 flex">
                                    <div className="bg-teal-400 h-1.5 rounded-l-full" style={{ width: `${scheme.placement}%` }} title="Placement Rate"></div>
                                    <div className="bg-indigo-500 h-1.5 rounded-r-full" style={{ width: `${scheme.retention}%` }} title="Retention Rate"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-teal-400 rounded-sm"></div> Placement</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-sm"></div> 6M Retention</div>
                    </div>
                </div>

                {/* Card B: Top Sectors */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Top Employment Sectors</h3>
                    <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sectorData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} width={80} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                                    formatter={(val: number) => [`${val}% of placements`, '']}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16}>
                                    {sectorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#a78bfa'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Card C: District Priority */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" /> District Priority Highlights
                    </h3>
                    <div className="flex-1 flex flex-col gap-4">
                        <div>
                            <h4 className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider mb-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> High Performing
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs bg-emerald-50 px-2 py-1.5 rounded text-emerald-800 font-medium"><span>1. Pune</span> <span>78% Placed</span></div>
                                <div className="flex justify-between text-xs bg-emerald-50 px-2 py-1.5 rounded text-emerald-800 font-medium"><span>2. Mumbai Sub</span> <span>74% Placed</span></div>
                                <div className="flex justify-between text-xs bg-emerald-50 px-2 py-1.5 rounded text-emerald-800 font-medium"><span>3. Thane</span> <span>71% Placed</span></div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold uppercase text-red-600 tracking-wider mb-2 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Critical Gap (Intervention)
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs bg-red-50 px-2 py-1.5 rounded text-red-800 font-medium border border-red-100"><span>1. Gadchiroli</span> <span>18% Placed</span></div>
                                <div className="flex justify-between text-xs bg-red-50 px-2 py-1.5 rounded text-red-800 font-medium border border-red-100"><span>2. Washim</span> <span>22% Placed</span></div>
                                <div className="flex justify-between text-xs bg-red-50 px-2 py-1.5 rounded text-red-800 font-medium border border-red-100"><span>3. Nandurbar</span> <span>25% Placed</span></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
