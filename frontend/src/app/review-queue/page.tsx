"use client";

import { useEffect, useState } from 'react';
import { User, Phone, MapPin, Calendar, BookOpen, AlertTriangle, SplitSquareVertical, Merge } from 'lucide-react';
import Link from 'next/link';
import MetricTooltip from '@/components/MetricTooltip';

interface CandidateRecord {
    id: string | number;
    name: string | null;
    phone: string | null;
    dob: string | null;
    district: string | null;
    course: string | null;
}

interface ReviewItem {
    queue_id: number;
    confidence_score: number;
    match_evidence: any;
    status: string;
    staging_record: CandidateRecord;
    master_record: CandidateRecord;
}

export default function ReviewQueuePage() {
    const [queue, setQueue] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const [seedLoading, setSeedLoading] = useState(false);

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/v1/identity/review-queue');
            if (res.ok) {
                const data = await res.json();
                setQueue(data);
                
                // Dispatch a custom event so Navbar can update its badge immediately
                window.dispatchEvent(new Event('reviewQueueUpdated'));
            }
        } catch (e) {
            console.error("Failed to fetch queue", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (queue_id: number, action: 'merge' | 'split') => {
        setActionLoading(queue_id);
        try {
            const res = await fetch('http://localhost:8000/api/v1/identity/resolve-manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queue_id, action })
            });
            if (res.ok) {
                setQueue(q => q.filter(item => item.queue_id !== queue_id));
                // Update navbar badge after resolving an item
                window.dispatchEvent(new Event('reviewQueueUpdated'));
            }
        } catch (e) {
            console.error("Failed to resolve", e);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSeed = async () => {
        setSeedLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/v1/identity/seed-review-samples', {
                method: 'POST'
            });
            if (res.ok) {
                await fetchQueue();
            }
        } catch (e) {
            console.error("Failed to seed samples", e);
        } finally {
            setSeedLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 border-b pb-4 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Human-in-the-Loop Resolution</h1>
                        <p className="text-gray-500 mt-2">Manually review candidate identity matches with confidence scores between 60% and 84%.</p>
                    </div>
                    {queue.length > 0 && (
                        <button 
                            onClick={handleSeed}
                            disabled={seedLoading}
                            className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-600 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                            {seedLoading ? 'Loading...' : 'Reset / Reload Demo Cases'}
                        </button>
                    )}
                </header>

                {loading ? (
                    <div className="text-center p-12 text-gray-500">Loading review queue...</div>
                ) : queue.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl shadow border border-gray-200">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-gray-800">All caught up!</h3>
                        <p className="text-gray-500 mt-2 mb-6">No ambiguous identity merges pending. Click below to inject synthetic test records for live judge demonstration.</p>
                        <button 
                            onClick={handleSeed}
                            disabled={seedLoading}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {seedLoading ? 'Processing...' : '⚡ Load Sample Ambiguous Cases (SIH Demo)'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {queue.map(item => (
                            <div key={item.queue_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-amber-50 p-4 border-b border-amber-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-amber-800">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span className="font-semibold">Review Required</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Overall Confidence:</span>
                                            <span className={`px-2 py-1 rounded-full text-sm font-bold ${
                                                item.confidence_score >= 0.8 ? 'bg-green-100 text-green-700' : 
                                                item.confidence_score >= 0.6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {(item.confidence_score * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                                    {/* Left Column: Staging */}
                                    <div className="p-6">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
                                            <SplitSquareVertical className="w-4 h-4" /> Incoming Staging Record
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Name</p>
                                                    <p className="font-medium text-gray-900">{item.staging_record.name || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Phone</p>
                                                    <p className="font-medium text-gray-900">{item.staging_record.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Date of Birth</p>
                                                    <p className="font-medium text-gray-900">{item.staging_record.dob || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500">District</p>
                                                    <p className="font-medium text-gray-900">{item.staging_record.district || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Course</p>
                                                    <p className="font-medium text-gray-900">{item.staging_record.course || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Master Match */}
                                    <div className="p-6 bg-gray-50">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-6 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Top Master Match <span className="text-xs text-gray-400 lowercase ml-1">(<MetricTooltip term="Candidate UUID">UUID</MetricTooltip>: {item.master_record.id.toString().substring(0,8)}...)</span>
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <User className="w-5 h-5 text-indigo-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Name</p>
                                                    <p className="font-medium text-gray-900">{item.master_record.name || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Phone className="w-5 h-5 text-indigo-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Phone</p>
                                                    <p className="font-medium text-gray-900">{item.master_record.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Calendar className="w-5 h-5 text-indigo-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Date of Birth</p>
                                                    <p className="font-medium text-gray-900">{item.master_record.dob || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-indigo-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500">District</p>
                                                    <p className="font-medium text-gray-900">{item.master_record.district || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <BookOpen className="w-5 h-5 text-indigo-400 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Course</p>
                                                    <p className="font-medium text-gray-900">{item.master_record.course || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Match Evidence Badges */}
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Match Evidence</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {item.match_evidence?.name_sim && (
                                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md border border-blue-200">
                                                        Name Sim: {(item.match_evidence.name_sim * 100).toFixed(0)}%
                                                    </span>
                                                )}
                                                {item.match_evidence?.district_match && (
                                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-md border border-green-200">
                                                        Exact District
                                                    </span>
                                                )}
                                                {item.match_evidence?.dob_match === 'exact' && (
                                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-md border border-green-200">
                                                        Exact DOB
                                                    </span>
                                                )}
                                                {item.match_evidence?.dob_match === 'close' && (
                                                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md border border-yellow-200">
                                                        DOB Within 30d
                                                    </span>
                                                )}
                                                {item.match_evidence?.course_sim && (
                                                    <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md border border-indigo-200">
                                                        Course Match
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
                                    <button 
                                        disabled={actionLoading === item.queue_id}
                                        onClick={() => handleAction(item.queue_id, 'split')}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <SplitSquareVertical className="w-4 h-4" /> 
                                        {actionLoading === item.queue_id ? 'Processing...' : 'Create Separate Candidate'}
                                    </button>
                                    <button 
                                        disabled={actionLoading === item.queue_id}
                                        onClick={() => handleAction(item.queue_id, 'merge')}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Merge className="w-4 h-4" /> 
                                        {actionLoading === item.queue_id ? 'Processing...' : 'Confirm Merge'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
