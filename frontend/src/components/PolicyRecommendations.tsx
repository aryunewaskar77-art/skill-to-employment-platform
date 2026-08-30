"use client";
import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, AlertCircle, Lightbulb } from 'lucide-react';

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

interface PolicyResponse {
    generated_at: string;
    total_interventions: number;
    summary: {
        high_priority: number;
        medium_priority: number;
        low_priority: number;
    };
    recommendations: PolicyRecommendation[];
}

export default function PolicyRecommendations() {
    const [recs, setRecs] = useState<PolicyRecommendation[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/policy/recommendations');
                if (res.ok) {
                    const data = await res.json();
                    setRecs(data.recommendations || []);
                    setSummary(data.summary);
                }
            } catch (err) {
                console.error("Failed to fetch recommendations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecs();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-teal-100 shadow-sm animate-pulse mt-8">
                <div className="h-6 w-64 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 w-full bg-gray-50 rounded"></div>
            </div>
        );
    }

    if (recs.length === 0) {
        return null;
    }

    const getIcon = (category: string) => {
        switch (category) {
            case 'CAPACITY_EXPANSION': return <TrendingUp className="w-5 h-5 text-indigo-600" />;
            case 'CURRICULUM_AUDIT': return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'BUDGET_REALLOCATION': return <AlertCircle className="w-5 h-5 text-amber-600" />;
            default: return <Lightbulb className="w-5 h-5 text-gray-600" />;
        }
    };

    const formatCurrency = (amount: number) => {
        const isNegative = amount < 0;
        const absAmount = Math.abs(amount);
        let formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(absAmount);
        if (absAmount >= 100000) {
            formatted = `₹${(absAmount / 100000).toFixed(1)} Lakhs`;
        }
        return isNegative ? `-${formatted}` : `+${formatted}`;
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-md mt-8">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Lightbulb className="w-6 h-6 text-indigo-700" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Automated Policy Interventions</h3>
                        <p className="text-sm text-gray-500">Actionable intelligence generated from live macro-data</p>
                    </div>
                </div>
                {summary && (
                    <div className="flex gap-2">
                        <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded font-bold border border-red-100">{summary.high_priority} High Priority</span>
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded font-bold border border-yellow-100">{summary.medium_priority} Medium Priority</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recs.map((rec) => (
                    <div key={rec.id} className="p-4 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 hover:shadow-sm transition-all flex gap-4 items-start shadow-sm">
                        <div className="mt-1">
                            {getIcon(rec.category)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    rec.priority === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' : 
                                    rec.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                    'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                    {rec.priority} Priority
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{rec.district} • {rec.target_sector}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">
                                {rec.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                {rec.actionable_insight}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                                <p className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                    Trigger: {rec.trigger_metric}
                                </p>
                                <p className={`text-xs font-bold ${rec.estimated_budget_impact_inr < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                                    {rec.estimated_budget_impact_inr < 0 ? 'Savings: ' : 'Impact: '}
                                    {formatCurrency(rec.estimated_budget_impact_inr)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
