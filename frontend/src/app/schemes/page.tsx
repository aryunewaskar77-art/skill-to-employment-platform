"use client";

import React, { useState, useEffect } from 'react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
    Briefcase, Award, TrendingUp, AlertCircle, Building2, Lightbulb, 
    CheckCircle, Wallet, ShieldAlert, Banknote, ShieldCheck, BookOpen
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function SchemesPage() {
    const [schemes, setSchemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSchemes() {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/v1/schemes/performance`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setSchemes(data.data);
            } catch (error) {
                console.error("Error fetching schemes data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSchemes();
    }, []);

    // Transform data for Chart 1: Longitudinal Retention Decay
    const retentionData = [
        { milestone: '30 Days' },
        { milestone: '90 Days' },
        { milestone: '180 Days' },
        { milestone: '365 Days' }
    ];
    
    schemes.forEach(scheme => {
        const id = scheme.scheme_id;
        retentionData[0][id as keyof typeof retentionData[0]] = scheme.retention_30d_pct;
        retentionData[1][id as keyof typeof retentionData[1]] = scheme.retention_90d_pct;
        retentionData[2][id as keyof typeof retentionData[2]] = scheme.retention_180d_pct;
        retentionData[3][id as keyof typeof retentionData[3]] = scheme.retention_365d_pct;
    });

    const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b'];

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Scheme & Yojna Performance Hub</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Real-time Policy ROI and Outcome Analytics</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
                
                {/* Executive Scorecards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {loading ? (
                        <div className="col-span-1 lg:col-span-2 py-12 text-center text-slate-400">Loading scheme metrics...</div>
                    ) : (
                        schemes.map((scheme, idx) => {
                            let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                            let Icon = Building2;
                            if (scheme.policy_health_status === "HIGH_ROI") {
                                badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                                Icon = CheckCircle;
                            } else if (scheme.policy_health_status === "NEEDS_CURRICULUM_AUDIT") {
                                badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                                Icon = AlertCircle;
                            } else if (scheme.policy_health_status === "MODERATE") {
                                badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                                Icon = ShieldCheck;
                            }

                            return (
                                <div key={scheme.scheme_id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                    <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                                                {scheme.scheme_name.includes("Central") ? "Central Sponsorship" : "State Sponsorship"}
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{scheme.scheme_name}</h3>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded flex items-center gap-1.5 text-[10px] font-bold border ${badgeColor}`}>
                                            <Icon className="w-3.5 h-3.5" />
                                            {scheme.policy_health_status.replace(/_/g, ' ')}
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 flex-1 grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-slate-500 mb-1">Budget (Utilized / Sanc.)</div>
                                            <div className="font-bold text-slate-800">
                                                ₹{scheme.budget_utilized_cr}Cr <span className="text-slate-400 font-medium text-sm">/ {scheme.budget_sanctioned_cr}Cr</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div 
                                                    className="bg-indigo-500 h-full rounded-full" 
                                                    style={{ width: `${(scheme.budget_utilized_cr / scheme.budget_sanctioned_cr) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="text-xs text-slate-500 mb-1">1Y Retention Cost Unit</div>
                                            <div className="font-bold text-slate-800">
                                                ₹{scheme.cost_per_retained_candidate_inr.toLocaleString()}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">Per retained candidate</div>
                                        </div>

                                        <div className="col-span-2 grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-slate-50">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Award className="w-3 h-3" /> Cert Rate</div>
                                                <div className="font-bold text-slate-700 mt-1">{scheme.enroll_to_cert_pct}%</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Placed</div>
                                                <div className="font-bold text-slate-700 mt-1">{scheme.cert_to_place_pct}%</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 365D Retain</div>
                                                <div className="font-bold text-emerald-600 mt-1">{scheme.retention_365d_pct}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Deep Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Chart 1: Retention Decay */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                            Longitudinal Retention Decay Curve
                        </h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={retentionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="milestone" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} verticalAlign="bottom" />
                                    {schemes.map((s, idx) => (
                                        <Line 
                                            key={s.scheme_id} 
                                            type="monotone" 
                                            dataKey={s.scheme_id} 
                                            name={s.scheme_name.split(' - ')[0] || s.scheme_name} 
                                            stroke={colors[idx % colors.length]} 
                                            strokeWidth={3} 
                                            dot={{ r: 4, fill: colors[idx % colors.length], strokeWidth: 2, stroke: '#fff' }} 
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 2: Wage Progression */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-emerald-500" />
                            Wage Progression & Unit Economics
                        </h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={schemes} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="scheme_name" 
                                        tick={{ fontSize: 10, fill: '#64748b' }} 
                                        tickFormatter={(v) => v.split(' - ')[0] || v}
                                        interval={0} 
                                        angle={-35} 
                                        textAnchor="end" 
                                        height={60} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        dx={-5}
                                    />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} verticalAlign="top" />
                                    <Bar dataKey="avg_starting_salary_inr" name="Starting Salary" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="avg_12m_salary_inr" name="12-Month Salary" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Curriculum vs. Market Alignment Auditor */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                Curriculum vs. Market Alignment Index
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Real-time mapping of top skilling trades against regional industrial demand</p>
                        </div>
                        <button className="shrink-0 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <AlertCircle className="w-4 h-4" />
                            Trigger Curriculum Modernization Order
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-5 py-3">Skilling Trade / Course</th>
                                    <th className="px-5 py-3">Course-to-Demand Match</th>
                                    <th className="px-5 py-3">Cost per Retained Outcome</th>
                                    <th className="px-5 py-3 text-right">Syllabus Relevance Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4">Solar PV Installation</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[100px]">
                                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                                            </div>
                                            <span className="text-emerald-600 font-bold">92%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">₹14,500</td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-bold px-2 py-1 rounded">
                                            <CheckCircle className="w-3 h-3" /> Curriculum Up to Date
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4">CNC Machining &amp; Programming</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[100px]">
                                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                                            </div>
                                            <span className="text-emerald-600 font-bold">88%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">₹18,200</td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-bold px-2 py-1 rounded">
                                            <CheckCircle className="w-3 h-3" /> Curriculum Up to Date
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4">Healthcare General Duty Assistant</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[100px]">
                                                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                                            </div>
                                            <span className="text-amber-600 font-bold">75%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">₹22,100</td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-bold px-2 py-1 rounded">
                                            <CheckCircle className="w-3 h-3" /> Curriculum Up to Date
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors bg-red-50/20">
                                    <td className="px-5 py-4">Data Entry &amp; BPO Operations</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[100px]">
                                                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '34%' }}></div>
                                            </div>
                                            <span className="text-red-600 font-bold">34%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-red-600 font-bold">₹42,800</td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[10px] uppercase font-bold px-2 py-1 rounded">
                                            <ShieldAlert className="w-3 h-3" /> Obsolete Curriculum — Audit Required
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors bg-red-50/20">
                                    <td className="px-5 py-4">Traditional Retail Sales</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[100px]">
                                                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '28%' }}></div>
                                            </div>
                                            <span className="text-red-600 font-bold">28%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-red-600 font-bold">₹45,200</td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[10px] uppercase font-bold px-2 py-1 rounded">
                                            <ShieldAlert className="w-3 h-3" /> Obsolete Curriculum — Audit Required
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Policy Recommendation Brief */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 text-white flex flex-col md:flex-row gap-6 items-center">
                    <div className="bg-white/10 p-4 rounded-full">
                        <Lightbulb className="w-8 h-8 text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2">Automated Policy Intelligence Brief</h3>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">
                            Based on real-time telemetry, <strong>DVET ITIs (CTS)</strong> and <strong>CMYWTS</strong> are producing the highest 365-day retention rates and strongest wage growth trajectories. Conversely, PMKVY 4.0 exhibits a critical drop-off (-40.5% attrition by month 6).
                        </p>
                        <ul className="text-sm space-y-2 text-emerald-200">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> <strong>Recommendation:</strong> Reallocate 15% state-matching budget from underperforming short-term PMKVY tracks to CTS 2-year technical trades.</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> <strong>Action Item:</strong> Initiate emergency curriculum audit for PMKVY 4.0 logistics and retail batches in Nashik division.</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
