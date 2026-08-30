"use client";

import React, { useState, useEffect } from 'react';
import { 
    ComposedChart, Bar, BarChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { 
    Users, Briefcase, TrendingUp, AlertCircle, Building2, Search, Filter, 
    ChevronDown, ChevronUp, Download, ShieldCheck, MapPin
} from 'lucide-react';
import MigrationCorridor from '@/components/MigrationCorridor';

const API_BASE = 'http://localhost:8000';

export default function DataObservatoryPage() {
    const [districts, setDistricts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [divisionFilter, setDivisionFilter] = useState('All');
    const [sortBy, setSortBy] = useState('gap_score');
    const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

    const handleExportCSV = () => {
        if (districts.length === 0) return;
        const headers = ["District", "Division", "Sanctioned Seats", "Utilized %", "Unemployment %", "Placed Count", "12M Retention %", "Top Deficit Sector", "Risk Level"];
        const rows = filteredDistricts.map(d => [
            d.district_name,
            d.division,
            d.skilling_capacity.total_sanctioned_seats,
            d.skilling_capacity.seat_utilization_rate_pct,
            d.demographics.plfs_unemployment_rate_pct,
            d.outcomes.placed_count,
            d.outcomes.retention_rate_12m_pct,
            d.top_deficit_sectors[0]?.sector || 'N/A',
            d.gap_score > 300 || d.outcomes.retention_rate_12m_pct < 55 ? "HIGH RISK" : "STABLE"
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "maharashtra_districts_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Fetch data from Python backend
    useEffect(() => {
        async function fetchMacroData() {
            setLoading(true);
            try {
                let url = `${API_BASE}/api/v1/analytics/macro-district-observatory?sort_by=${sortBy}`;
                if (divisionFilter !== 'All') {
                    url += `&division=${encodeURIComponent(divisionFilter)}`;
                }
                const res = await fetch(url);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setDistricts(data.districts);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMacroData();
    }, [divisionFilter, sortBy]);

    // Client-side filtering for search
    const filteredDistricts = districts.filter(d => 
        d.district_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Compute State-wide KPIs based on current filtered dataset
    const kpiTotalTracked = filteredDistricts.reduce((sum, d) => sum + d.demographics.total_population_approx, 0);
    const kpiAvgRetention = filteredDistricts.length > 0 
        ? filteredDistricts.reduce((sum, d) => sum + d.outcomes.retention_rate_12m_pct, 0) / filteredDistricts.length 
        : 0;
    const kpiAvgUnemployment = filteredDistricts.length > 0 
        ? filteredDistricts.reduce((sum, d) => sum + d.demographics.plfs_unemployment_rate_pct, 0) / filteredDistricts.length 
        : 0;
    const kpiAvgEmployerIndex = filteredDistricts.length > 0 
        ? filteredDistricts.reduce((sum, d) => sum + d.industrial_profile.active_employer_hiring_index, 0) / filteredDistricts.length 
        : 0;
    const kpiTotalCapacity = filteredDistricts.reduce((sum, d) => sum + d.skilling_capacity.total_sanctioned_seats, 0);

    // Aggregations for Charts
    // 1. Division-wise Capacity vs Retained
    const divisionAggr: Record<string, any> = {};
    filteredDistricts.forEach(d => {
        if (!divisionAggr[d.division]) {
            divisionAggr[d.division] = { name: d.division, capacity: 0, retained: 0 };
        }
        divisionAggr[d.division].capacity += d.skilling_capacity.total_sanctioned_seats;
        divisionAggr[d.division].retained += d.outcomes.retained_12m_count;
    });
    const divisionChartData = Object.values(divisionAggr);

    // 2. Ranked Bar: Top High-Shortage Industrial Clusters
    const rankedBarData = [...filteredDistricts]
        .sort((a, b) => b.gap_score - a.gap_score)
        .slice(0, 8)
        .map(d => ({
            name: d.district_name,
            displayName: `${d.district_name} (${d.division.split(' ')[0]})`,
            density: d.industrial_profile.msme_unit_density,
            gapScore: d.gap_score,
            topRole: d.top_deficit_sectors[0]?.sector || 'N/A',
            midcCount: d.industrial_profile.major_midc_zones.length,
            midcZones: d.industrial_profile.major_midc_zones.join(', ')
        }));

    const toggleRow = (name: string) => {
        setExpandedDistrict(expandedDistrict === name ? null : name);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">State Data Observatory</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Live Macro Analytics Engine & Policy Monitoring</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full border border-teal-100">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        LIVE SYNC: {new Date().toISOString().split('T')[0]}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
                
                {/* Top Telemetry KPI Ribbon */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <Users className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Total Tracked Pop</span>
                        </div>
                        <div className="text-2xl font-black text-slate-800">{(kpiTotalTracked / 1000000).toFixed(1)}M</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Avg 12M Retention</span>
                        </div>
                        <div className="text-2xl font-black text-emerald-600">{kpiAvgRetention.toFixed(1)}%</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Avg PLFS Unemp.</span>
                        </div>
                        <div className="text-2xl font-black text-red-600">{kpiAvgUnemployment.toFixed(1)}%</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <Building2 className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Employer Index</span>
                        </div>
                        <div className="text-2xl font-black text-slate-800">{kpiAvgEmployerIndex.toFixed(0)}</div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <Briefcase className="w-4 h-4 text-teal-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">State ITI Capacity</span>
                        </div>
                        <div className="text-2xl font-black text-slate-800">{kpiTotalCapacity.toLocaleString()}</div>
                    </div>
                </div>

                {/* Central Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Left Chart */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-teal-500" />
                            Division-wise Capacity vs. Retained Employment
                        </h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={divisionChartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCapacity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                                    <Bar dataKey="capacity" name="Sanctioned Capacity" fill="url(#colorCapacity)" radius={[6, 6, 0, 0]} barSize={28} />
                                    <Line type="monotone" dataKey="retained" name="12M Retained" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Chart */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-rose-500" />
                                Top High-Shortage Industrial Clusters
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 ml-6">Districts with high industrial demand vs. critical training supply deficits</p>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={rankedBarData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                                    <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis 
                                        type="category" 
                                        dataKey="displayName" 
                                        tick={{ fontSize: 10, fill: '#475569', fontWeight: 500 }} 
                                        width={100} 
                                        axisLine={false} 
                                        tickLine={false} 
                                    />
                                    <RechartsTooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        content={({ payload }) => {
                                            if (payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs min-w-[180px]">
                                                        <div className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">
                                                            {data.displayName}
                                                        </div>
                                                        <div className="text-slate-500 mb-1 flex justify-between">Industry Demand:<span className="font-semibold text-slate-700">{data.density}</span></div>
                                                        <div className="text-slate-500 mb-2 flex justify-between">Shortage Gap:<span className="font-semibold text-rose-500">{data.gapScore}</span></div>
                                                        <div className="bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                                                            <div className="text-[9px] uppercase text-slate-400 font-bold mb-1">Top Deficit Role</div>
                                                            <div className="text-slate-700 font-medium">{data.topRole}</div>
                                                            <div className="text-[9px] uppercase text-slate-400 font-bold mt-2 mb-1">Major MIDC Zones ({data.midcCount})</div>
                                                            <div className="text-slate-600 line-clamp-1">{data.midcZones}</div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />
                                    <Bar dataKey="density" name="Active Industry Demand" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
                                    <Bar dataKey="gapScore" name="Skill Shortage Gap" fill="#fb7185" radius={[0, 4, 4, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Spatial Labour Mobility & Industrial Migration Corridor */}
                <MigrationCorridor districtsData={districts} />

                {/* 36-District Master Data Matrix */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-800">Master District Dataset</h2>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-64">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search district..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                />
                            </div>
                            
                            <select 
                                value={divisionFilter}
                                onChange={(e) => setDivisionFilter(e.target.value)}
                                className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none"
                            >
                                <option value="All">All Divisions</option>
                                <option value="Konkan">Konkan</option>
                                <option value="Pune">Pune</option>
                                <option value="Nashik">Nashik</option>
                                <option value="Marathwada">Marathwada</option>
                                <option value="Amravati">Amravati</option>
                                <option value="Nagpur">Nagpur</option>
                            </select>

                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none"
                            >
                                <option value="gap_score">Sort by Shortage Gap</option>
                                <option value="retention">Sort by Retention (Low-High)</option>
                                <option value="capacity">Sort by Capacity (High-Low)</option>
                            </select>

                            <button onClick={handleExportCSV} className="hidden lg:flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">District</th>
                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">Division</th>
                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">ITI Capacity</th>
                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">Unemp %</th>
                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">Placed</th>
                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">12M Retained</th>
                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">Top Deficit Sector</th>
                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[10px]">Action Badge</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="px-5 py-8 text-center text-slate-400">Loading dataset...</td>
                                    </tr>
                                ) : filteredDistricts.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-5 py-8 text-center text-slate-400">No districts match the filters.</td>
                                    </tr>
                                ) : (
                                    filteredDistricts.map((d) => {
                                        const isExpanded = expandedDistrict === d.district_name;
                                        const isHighRisk = d.gap_score > 300 || d.outcomes.retention_rate_12m_pct < 55;

                                        return (
                                            <React.Fragment key={d.district_name}>
                                                <tr 
                                                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-teal-50/30' : ''}`}
                                                    onClick={() => toggleRow(d.district_name)}
                                                >
                                                    <td className="px-5 py-4 font-bold text-slate-800">{d.district_name}</td>
                                                    <td className="px-5 py-4 text-slate-600">{d.division}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-slate-700">{d.skilling_capacity.total_sanctioned_seats.toLocaleString()}</div>
                                                        <div className="text-[10px] text-slate-400">{d.skilling_capacity.seat_utilization_rate_pct}% Utilized</div>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">{d.demographics.plfs_unemployment_rate_pct}%</td>
                                                    <td className="px-5 py-4 text-slate-700 font-semibold">{d.outcomes.placed_count.toLocaleString()}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-slate-700">{d.outcomes.retention_rate_12m_pct}%</div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex px-2 py-1 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 truncate max-w-[120px]">
                                                            {d.top_deficit_sectors[0]?.sector || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {isHighRisk ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded bg-red-50 text-red-600 border border-red-100">
                                                                <AlertCircle className="w-3 h-3" /> INTERVENE
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                                <CheckCircle className="w-3 h-3" /> STABLE
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-400">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </td>
                                                </tr>
                                                
                                                {/* Expanded Drawer Details */}
                                                {isExpanded && (
                                                    <tr className="bg-slate-50 border-b border-slate-200">
                                                        <td colSpan={9} className="px-5 py-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Extended Demographics</h4>
                                                                    <div className="space-y-1 text-xs text-slate-600">
                                                                        <div className="flex justify-between border-b border-slate-200 pb-1">
                                                                            <span>Female LFPR</span>
                                                                            <span className="font-semibold">{d.demographics.female_participation_pct}%</span>
                                                                        </div>
                                                                        <div className="flex justify-between border-b border-slate-200 pb-1">
                                                                            <span>Urban/Rural Ratio</span>
                                                                            <span className="font-semibold">{d.demographics.rural_urban_ratio}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Major MIDC Zones</h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {d.industrial_profile.major_midc_zones.map((zone: string, idx: number) => (
                                                                            <span key={idx} className="bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">
                                                                                {zone}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Migration Trend</h4>
                                                                    <div className="text-xs text-slate-600">
                                                                        <div className="mb-1">Net Rate: <span className={`font-bold ${d.migration_trend.net_migration_rate < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{d.migration_trend.net_migration_rate}%</span></div>
                                                                        {d.migration_trend.top_destination_districts.length > 0 && (
                                                                            <div className="text-slate-400">Outflow primarily to: <span className="text-slate-600">{d.migration_trend.top_destination_districts.join(', ')}</span></div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Helper icon
function CheckCircle(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
    )
}
