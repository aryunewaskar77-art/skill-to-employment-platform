"use client";

import React, { useState, useEffect } from 'react';
import { 
    AlertTriangle, CheckCircle2, TrendingUp, IndianRupee, Lightbulb, 
    Filter, FileText, Download, Building2, MapPin, AlertCircle, Printer, Copy, X
} from 'lucide-react';

interface PolicyRecommendation {
    id: string;
    district: string;
    division: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    target_sector: string;
    trigger_metric: string;
    title: string;
    actionable_insight: string;
    estimated_budget_impact_inr: number;
}

interface PolicySummary {
    high_priority: number;
    medium_priority: number;
    low_priority: number;
}

export default function PolicyInterventionsPage() {
    const [recommendations, setRecommendations] = useState<PolicyRecommendation[]>([]);
    const [summary, setSummary] = useState<PolicySummary | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [divisionFilter, setDivisionFilter] = useState('ALL');

    // Modal State
    const [activeModalRec, setActiveModalRec] = useState<PolicyRecommendation | null>(null);
    const [generatedGOs, setGeneratedGOs] = useState<Set<string>>(new Set());
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/policy/recommendations');
                if (res.ok) {
                    const data = await res.json();
                    setRecommendations(data.recommendations || []);
                    setSummary(data.summary || null);
                }
            } catch (err) {
                console.error("Failed to fetch policy recommendations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    const formatCurrency = (amount: number) => {
        const isNegative = amount < 0;
        const absAmount = Math.abs(amount);
        let formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(absAmount);
        if (absAmount >= 100000) {
            formatted = `₹${(absAmount / 100000).toFixed(1)} Lakhs`;
        }
        if (absAmount >= 10000000) {
            formatted = `₹${(absAmount / 10000000).toFixed(2)} Cr`;
        }
        return isNegative ? `${formatted}` : `${formatted}`;
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'CAPACITY_EXPANSION': 
                return <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-200"><TrendingUp className="w-3 h-3"/> CAPACITY EXPANSION</span>;
            case 'CURRICULUM_AUDIT': 
                return <span className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200"><AlertTriangle className="w-3 h-3"/> CURRICULUM AUDIT</span>;
            case 'BUDGET_REALLOCATION': 
                return <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200"><IndianRupee className="w-3 h-3"/> BUDGET REALLOCATION</span>;
            case 'MIGRATION_SUPPORT': 
                return <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-200"><MapPin className="w-3 h-3"/> MIGRATION SUPPORT</span>;
            default: 
                return <span className="flex items-center gap-1 bg-gray-50 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-gray-200"><Lightbulb className="w-3 h-3"/> INTERVENTION</span>;
        }
    };

    const handleCopy = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const handleGenerateGO = (rec: PolicyRecommendation) => {
        setActiveModalRec(rec);
        // Add to generated set immediately to reflect in UI behind modal
        setGeneratedGOs(prev => new Set(prev).add(rec.id));
    };

    // Filter logic
    const filteredRecs = recommendations.filter(rec => {
        if (priorityFilter !== 'ALL' && rec.priority !== priorityFilter) return false;
        if (divisionFilter !== 'ALL' && rec.division !== divisionFilter) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-center">
                <div className="animate-pulse text-slate-500 font-bold flex items-center gap-2">
                    <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    Generating Policy Interventions...
                </div>
            </div>
        );
    }

    // Modal Template strings
    const goDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const goRefNumber = activeModalRec ? `GO-MH-${new Date().getFullYear()}/SEEID-${activeModalRec.id.slice(-4).toUpperCase()}` : '';

    return (
        <div className="min-h-screen bg-slate-50 pb-12 relative">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <FileText className="w-7 h-7 text-indigo-600" />
                                Policy Interventions & Recommendations
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">Rule-based intelligence engine generating actionable directives for district collectors</p>
                        </div>
                        
                        {/* Summary Badges */}
                        {summary && (
                            <div className="flex gap-3">
                                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                    <div>
                                        <div className="text-xl font-black text-rose-700 leading-none">{summary.high_priority}</div>
                                        <div className="text-[10px] font-bold text-rose-600 uppercase mt-1">High Priority</div>
                                    </div>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                    <div>
                                        <div className="text-xl font-black text-amber-700 leading-none">{summary.medium_priority}</div>
                                        <div className="text-[10px] font-bold text-amber-600 uppercase mt-1">Medium Priority</div>
                                    </div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <div className="text-xl font-black text-blue-700 leading-none">{summary.low_priority}</div>
                                        <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Strategic Corridors</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 print:hidden">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="text-sm font-bold text-slate-600 flex items-center gap-1"><Filter className="w-4 h-4"/> Filters:</span>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 flex text-sm">
                        <button onClick={() => setPriorityFilter('ALL')} className={`px-4 py-1.5 rounded-md font-medium transition-colors ${priorityFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>All Priorities</button>
                        <button onClick={() => setPriorityFilter('HIGH')} className={`px-4 py-1.5 rounded-md font-medium transition-colors ${priorityFilter === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'text-slate-600 hover:bg-slate-100'}`}>High Priority Only</button>
                    </div>

                    <select 
                        value={divisionFilter}
                        onChange={(e) => setDivisionFilter(e.target.value)}
                        className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="ALL">All Divisions</option>
                        <option value="Pune">Pune</option>
                        <option value="Konkan">Konkan</option>
                        <option value="Nashik">Nashik</option>
                        <option value="Marathwada">Marathwada</option>
                        <option value="Amravati">Amravati</option>
                        <option value="Nagpur">Nagpur</option>
                    </select>
                </div>

                {/* Grid */}
                <div className="space-y-4">
                    {filteredRecs.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-800">No Interventions Found</h3>
                            <p className="text-slate-500">No policy recommendations match your current filters.</p>
                        </div>
                    ) : (
                        filteredRecs.map((rec) => {
                            const isApproved = generatedGOs.has(rec.id);
                            return (
                            <div key={rec.id} className={`bg-white rounded-xl border ${isApproved ? 'border-emerald-300' : 'border-slate-200'} shadow-sm overflow-hidden flex flex-col md:flex-row transition-shadow hover:shadow-md`}>
                                {/* Left Status Bar */}
                                <div className={`w-full md:w-2 ${
                                    isApproved ? 'bg-emerald-500' :
                                    rec.priority === 'HIGH' ? 'bg-rose-500' : 
                                    rec.priority === 'MEDIUM' ? 'bg-amber-400' : 'bg-blue-400'
                                }`}></div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider ${
                                                    rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 
                                                    rec.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {rec.priority} PRIORITY
                                                </span>
                                                {getCategoryBadge(rec.category)}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800">{rec.title}</h3>
                                        </div>
                                        
                                        {/* Target Metadata */}
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-2 border border-slate-100 text-xs">
                                            <div className="px-3 border-r border-slate-200">
                                                <div className="text-slate-400 font-bold uppercase text-[9px]">Location</div>
                                                <div className="font-semibold text-slate-700 flex items-center gap-1"><MapPin className="w-3 h-3"/> {rec.district}</div>
                                            </div>
                                            <div className="px-3 border-r border-slate-200">
                                                <div className="text-slate-400 font-bold uppercase text-[9px]">Target Sector</div>
                                                <div className="font-semibold text-slate-700 flex items-center gap-1"><Building2 className="w-3 h-3"/> {rec.target_sector}</div>
                                            </div>
                                            <div className="px-3">
                                                <div className="text-slate-400 font-bold uppercase text-[9px]">Trigger</div>
                                                <div className="font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{rec.trigger_metric}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actionable Insight Blockquote */}
                                    <blockquote className="bg-slate-50 border-l-4 border-indigo-400 p-4 rounded-r-lg mb-6 text-slate-700 font-medium italic">
                                        "{rec.actionable_insight}"
                                    </blockquote>

                                    {/* Footer / Actions */}
                                    <div className="mt-auto flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 gap-4">
                                        <div className="flex items-center gap-2">
                                            <IndianRupee className={`w-5 h-5 ${rec.estimated_budget_impact_inr < 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                                            <span className={`font-bold ${rec.estimated_budget_impact_inr < 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                Estimated Budget: {rec.estimated_budget_impact_inr < 0 ? 'Savings: ' : 'Impact: '} {formatCurrency(rec.estimated_budget_impact_inr)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            {isApproved ? (
                                                <button 
                                                    onClick={() => setActiveModalRec(rec)}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                                                    <CheckCircle2 className="w-4 h-4" /> GO Generated / Approved
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleGenerateGO(rec)}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                                                    <FileText className="w-4 h-4" /> Accept & Generate GO
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* High-Fidelity Modal Dialog */}
            {activeModalRec && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm print:bg-white print:p-0 print:block">
                    {/* Modal Container */}
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden print:shadow-none print:w-full print:max-w-none print:h-auto">
                        
                        {/* Modal Header Controls (Hidden on Print) */}
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                Government Order (GO) Draft & Executive Approval
                            </h2>
                            <button onClick={() => setActiveModalRec(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Document Body (Printable Area) */}
                        <div className="p-8 md:p-12 overflow-y-auto print:overflow-visible text-slate-800 font-serif leading-relaxed">
                            {/* Document Header */}
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-sans text-slate-500">SEAL</span>
                                </div>
                                <h1 className="text-xl font-bold uppercase tracking-wide">Government of Maharashtra</h1>
                                <h2 className="text-lg font-semibold mt-1">Skill Development, Employment & Innovation Department</h2>
                                <p className="text-sm mt-4 text-slate-600 font-sans">
                                    <strong>Order Reference No:</strong> {goRefNumber} <br />
                                    <strong>Date:</strong> {goDate}
                                </p>
                            </div>

                            <hr className="border-slate-800 mb-8" />

                            {/* Document Sections */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold underline mb-2">SUBJECT:</h3>
                                    <p className="pl-4 uppercase font-semibold">
                                        Administrative Sanction & Seat Reallocation for {activeModalRec.target_sector} in {activeModalRec.district} District.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold underline mb-2">PREAMBLE:</h3>
                                    <p className="pl-4 text-justify">
                                        Based on data telemetry and automated outcome gap analysis generated from the State Skill-to-Employment Intelligence Platform (Platform Ref: SIH26-26135), an immediate policy intervention has been flagged under priority status: <strong>{activeModalRec.priority}</strong>. The platform identified the following critical trigger metric: <em>{activeModalRec.trigger_metric}</em>.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold underline mb-2">OPERATIVE DIRECTIVE:</h3>
                                    <p className="pl-4 font-bold text-justify bg-slate-50 p-4 border-l-4 border-slate-800">
                                        "{activeModalRec.actionable_insight}"
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold underline mb-2">FINANCIAL SANCTION:</h3>
                                    <p className="pl-4">
                                        The estimated budgetary impact for this directive is calculated at <strong>{activeModalRec.estimated_budget_impact_inr < 0 ? 'Savings of ' : ''}{formatCurrency(activeModalRec.estimated_budget_impact_inr)}</strong>, allocated from the State Skilling Modernization Fund.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold underline mb-2">TARGET IMPLEMENTING AGENCY:</h3>
                                    <p className="pl-4">
                                        Directorate of Vocational Education & Training (DVET) and Maharashtra State Skill Development Society (MSSDS).
                                    </p>
                                </div>
                            </div>

                            {/* Signatory Stamp */}
                            <div className="mt-16 flex justify-end">
                                <div className="text-center">
                                    <div className="border-b border-slate-800 w-48 mb-2"></div>
                                    <p className="font-bold">Principal Secretary</p>
                                    <p className="text-sm">Skill Development, Employment &<br/>Innovation Department (SEEID)<br/>Government of Maharashtra</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Controls (Hidden on Print) */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={() => window.print()}
                                    className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                                    <Printer className="w-4 h-4" /> Print / PDF
                                </button>
                                <button 
                                    onClick={() => handleCopy(`Government Order Ref: ${goRefNumber}\nDate: ${goDate}\n\nSUBJECT: Administrative Sanction for ${activeModalRec.target_sector} in ${activeModalRec.district} District.\n\nDIRECTIVE:\n"${activeModalRec.actionable_insight}"`)}
                                    className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                                    <Copy className="w-4 h-4" /> Copy Text
                                </button>
                            </div>
                            
                            <button 
                                onClick={() => setActiveModalRec(null)}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors w-full sm:w-auto">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-5 z-50 print:hidden">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-sm">Formal GO text copied to clipboard!</span>
                </div>
            )}
        </div>
    );
}
