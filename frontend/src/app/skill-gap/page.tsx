"use client";
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Search, Filter, AlertTriangle, CheckCircle, TrendingUp, ChevronRight, Activity, Map as MapIcon, List } from 'lucide-react';
import PolicyRecommendations from '@/components/PolicyRecommendations';
import SkillMiniNav from '@/components/SkillMiniNav';

const MapComponent = dynamic(() => import('./MapComponent').then((mod) => mod.default), {
    ssr: false,
    loading: () => <div className="h-[700px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Command Center Map...</div>
});

interface DistrictSkillGap {
    district_name: string;
    division: string;
    lat: number;
    lng: number;
    supply_count: number;
    demand_count: number;
    gap_score: number;
    mismatch_ratio: number;
    severity_level: string;
    top_missing_skills: { skill: string; deficit: number; nco_code: string }[];
    policy_action_hint: string;
}

export default function SkillGapPage() {
    const [data, setData] = useState<DistrictSkillGap[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [search, setSearch] = useState('');
    const [division, setDivision] = useState('All Divisions');
    const [severity, setSeverity] = useState('All Severity');
    const [viewMode, setViewMode] = useState<'split' | 'map' | 'directory'>('split');
    
    // Interaction State
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

    const directoryRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (division !== 'All Divisions') params.append('division', division);
            if (severity !== 'All Severity') params.append('severity', severity);
            if (search) params.append('search', search);

            const res = await fetch(`http://localhost:8000/api/v1/analytics/district-skill-gaps?${params.toString()}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) {
            console.error('Error fetching skill gaps', e);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, division, severity]);

    // Handle Map click
    const handleMapDistrictClick = (districtName: string) => {
        setSelectedDistrict(districtName);
    };

    // Aggregates for Bottom Summary
    const totalEvaluated = data.length;
    const acuteCount = data.filter(d => d.severity_level === 'HIGH').length;
    const balancedCount = data.filter(d => d.severity_level === 'BALANCED').length;
    
    // Find top state-wide deficit
    const stateDeficits: Record<string, number> = {};
    data.forEach(d => {
        d.top_missing_skills.forEach(skill => {
            stateDeficits[skill.skill] = (stateDeficits[skill.skill] || 0) + skill.deficit;
        });
    });
    const topStateDeficit = Object.entries(stateDeficits).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    const selectedData = data.find(d => d.district_name === selectedDistrict);

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 font-sans pb-16">
            <div className="px-4 pt-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <SkillMiniNav />
                
                {/* Filter Bar (Moved below mini nav) */}
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200 mb-4 inline-flex">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search district or skill..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none w-64 shadow-sm"
                        />
                    </div>
                    
                    <select 
                        value={division} 
                        onChange={(e) => setDivision(e.target.value)}
                        className="py-2 px-3 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none shadow-sm"
                    >
                        <option>All Divisions</option>
                        <option>Konkan</option>
                        <option>Pune</option>
                        <option>Nashik</option>
                        <option>Marathwada</option>
                        <option>Vidarbha</option>
                    </select>
                    
                    <select 
                        value={severity} 
                        onChange={(e) => setSeverity(e.target.value)}
                        className="py-2 px-3 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 outline-none shadow-sm"
                    >
                        <option>All Severity</option>
                        <option>High Deficit</option>
                        <option>Moderate Gap</option>
                        <option>Balanced</option>
                    </select>
                </div>
            </div>

            {/* Stacked View Content */}
            <main className="flex-1 flex flex-col p-4 gap-6 overflow-y-auto">
                
                {/* MAP & SELECTION ROW */}
                <div className="flex flex-col lg:flex-row gap-4 w-full lg:h-[450px] shrink-0">
                    <div className="relative bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex-1 h-[400px] lg:h-full">
                        {/* Map Legend overlay */}
                        <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg border border-slate-200 text-xs font-semibold flex flex-col gap-2">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Balanced / Surplus</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Moderate Gap</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Acute Shortage</div>
                        </div>

                        <MapComponent 
                            districtsData={data} 
                            selectedDistrictId={selectedDistrict}
                            hoveredDistrictId={hoveredDistrict}
                            onDistrictClick={handleMapDistrictClick}
                            onDistrictHover={setHoveredDistrict}
                        />
                    </div>

                    {/* Selected District Sidebar */}
                    <div className="w-full lg:w-[400px] bg-white rounded-xl shadow-md border border-slate-200 overflow-y-auto p-5 shrink-0 flex flex-col">
                        {selectedData ? (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-slate-800">{selectedData.district_name}</h3>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider rounded-full border border-slate-200">{selectedData.division}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium">
                                            {selectedData.severity_level === 'HIGH' && <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> High Deficit</span>}
                                            {selectedData.severity_level === 'MODERATE' && <span className="text-yellow-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Moderate Gap</span>}
                                            {selectedData.severity_level === 'BALANCED' && <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Balanced</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Gap Score</div>
                                        <div className={`text-2xl font-black ${selectedData.severity_level === 'HIGH' ? 'text-red-600' : selectedData.severity_level === 'MODERATE' ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {selectedData.gap_score}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-center items-center">
                                        <span className="text-xs font-semibold text-slate-500 uppercase">Supply</span>
                                        <span className="text-xl font-bold text-slate-800">{selectedData.supply_count}</span>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-center items-center">
                                        <span className="text-xs font-semibold text-slate-500 uppercase">Demand</span>
                                        <span className="text-xl font-bold text-slate-800">{selectedData.demand_count}</span>
                                    </div>
                                </div>

                                <div className="mb-4 flex-1">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Top Missing Roles</h4>
                                    {selectedData.top_missing_skills.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedData.top_missing_skills.map((skill, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-md bg-white border border-slate-100 shadow-sm">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <span className="bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0">{skill.nco_code}</span>
                                                        <span className="font-medium text-slate-700 truncate">{skill.skill}</span>
                                                    </div>
                                                    <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs shrink-0">-{skill.deficit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-green-700 bg-green-50 p-2 rounded-md border border-green-100 text-center">
                                            Supply fully meets demand.
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-100 mt-auto">
                                    <div className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                                        <TrendingUp className="w-4 h-4" />
                                        Action: {selectedData.policy_action_hint}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                                <MapIcon className="w-12 h-12 mb-3 text-slate-200" />
                                <p>Click on any district on the map to view its detailed analysis here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* DIRECTORY ROW */}
                    <div ref={directoryRef} className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
                        {loading && data.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">Loading telemetry data...</div>
                        ) : data.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                                No districts match the current filters.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.map((district) => (
                                    <div 
                                        key={district.district_name}
                                        id={`district-card-${district.district_name}`}
                                        onClick={() => setSelectedDistrict(district.district_name)}
                                        onMouseEnter={() => setHoveredDistrict(district.district_name)}
                                        onMouseLeave={() => setHoveredDistrict(null)}
                                        className={`bg-white p-5 rounded-xl border transition-all cursor-pointer ${
                                            selectedDistrict === district.district_name 
                                                ? 'border-teal-500 shadow-md ring-1 ring-teal-500' 
                                                : hoveredDistrict === district.district_name
                                                    ? 'border-slate-300 shadow-md'
                                                    : 'border-slate-200 shadow-sm hover:border-slate-300'
                                        }`}
                                    >
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-slate-800">{district.district_name}</h3>
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider rounded-full border border-slate-200">{district.division}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm font-medium">
                                                    {district.severity_level === 'HIGH' && <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> High Deficit</span>}
                                                    {district.severity_level === 'MODERATE' && <span className="text-yellow-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Moderate Gap</span>}
                                                    {district.severity_level === 'BALANCED' && <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Balanced</span>}
                                                    <span className="text-slate-300">|</span>
                                                    <span className="text-slate-600">Mismatch: <span className="text-slate-900">{district.mismatch_ratio}x</span></span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Gap Score</div>
                                                <div className={`text-2xl font-black ${district.severity_level === 'HIGH' ? 'text-red-600' : district.severity_level === 'MODERATE' ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {district.gap_score}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metrics Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                                                <span className="text-xs font-semibold text-slate-500 uppercase">Supply</span>
                                                <span className="text-lg font-bold text-slate-800">{district.supply_count}</span>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                                                <span className="text-xs font-semibold text-slate-500 uppercase">Demand</span>
                                                <span className="text-lg font-bold text-slate-800">{district.demand_count}</span>
                                            </div>
                                        </div>

                                        {/* Top Shortages */}
                                        <div className="mb-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Top Missing Roles</h4>
                                            {district.top_missing_skills.length > 0 ? (
                                                <div className="space-y-2">
                                                    {district.top_missing_skills.map((skill, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-md bg-white border border-slate-100 shadow-sm">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <span className="bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0">{skill.nco_code}</span>
                                                                <span className="font-medium text-slate-700 truncate">{skill.skill}</span>
                                                            </div>
                                                            <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs shrink-0">-{skill.deficit}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-green-700 bg-green-50 p-2 rounded-md border border-green-100">
                                                    Supply fully meets or exceeds all current vacancy demands.
                                                </div>
                                            )}
                                        </div>

                                        {/* Action CTA */}
                                        <div className="pt-3 border-t border-slate-100">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                                                <TrendingUp className="w-3.5 h-3.5" />
                                                Action: {district.policy_action_hint}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Policy Recommendations Inline */}
                        {data.length > 0 && (
                           <div className="mt-8">
                               <PolicyRecommendations />
                           </div>
                        )}
                    </div>
            </main>

            {/* Bottom Macro Summary Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white border-t border-slate-800 z-50 h-14 flex items-center justify-between px-6 shadow-2xl">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Districts Evaluated</span>
                        <span className="text-lg font-black text-teal-400">{totalEvaluated}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-slate-300 text-sm font-medium">Acute Clusters: <strong className="text-white">{acuteCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                        <span className="text-slate-300 text-sm font-medium">Balanced: <strong className="text-white">{balancedCount}</strong></span>
                    </div>
                </div>
                
                <div className="hidden md:flex items-center gap-3">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">State-Wide Priority Sector</span>
                    <div className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-md text-sm font-bold text-amber-400 flex items-center gap-2">
                        {topStateDeficit} <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: #94a3b8;
                }
            `}</style>
        </div>
    );
}
