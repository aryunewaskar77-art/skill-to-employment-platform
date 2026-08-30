"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import MetricTooltip from './MetricTooltip';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { 
    Search, ArrowRight, HeartPulse, Code, Zap, Wrench, Package, Briefcase, 
    TrendingUp, MapPin, Users, Award, ShieldCheck, ChevronRight
} from 'lucide-react';

const mockSkillsData = [
    { name: 'Python Developer', sector: 'IT/Tech', nsqf: 5, supply: 450, demand: 2400, salary: '₹35,000/mo', retention: '92%', hotspots: 'Pune, Mumbai', icon: Code },
    { name: 'Electrician', sector: 'Core Engineering', nsqf: 4, supply: 800, demand: 2200, salary: '₹18,000/mo', retention: '82%', hotspots: 'Pune, Thane', icon: Zap },
    { name: 'General Duty Assistant', sector: 'Healthcare', nsqf: 4, supply: 400, demand: 1500, salary: '₹14,000/mo', retention: '88%', hotspots: 'Mumbai, Pune, Thane', icon: HeartPulse },
    { name: 'Data Entry Operator', sector: 'IT/Tech', nsqf: 3, supply: 2500, demand: 1500, salary: '₹12,000/mo', retention: '55%', hotspots: 'Aurangabad, Nagpur', icon: Briefcase },
    { name: 'Customer Care Executive', sector: 'Services & Retail', nsqf: 4, supply: 1200, demand: 1800, salary: '₹15,000/mo', retention: '65%', hotspots: 'Pune, Mumbai, Nashik', icon: Briefcase },
    { name: 'Retail Sales Associate', sector: 'Services & Retail', nsqf: 3, supply: 2200, demand: 1900, salary: '₹14,500/mo', retention: '58%', hotspots: 'Mumbai, Pune, Nagpur', icon: Briefcase },
    { name: 'Logistics Associate', sector: 'Services & Retail', nsqf: 3, supply: 1100, demand: 1400, salary: '₹15,500/mo', retention: '62%', hotspots: 'Thane, Raigad', icon: Package },
    { name: 'Field Technician', sector: 'Core Engineering', nsqf: 4, supply: 600, demand: 1100, salary: '₹16,500/mo', retention: '70%', hotspots: 'Nashik, Nagpur', icon: Wrench },
    { name: 'Plumber', sector: 'Core Engineering', nsqf: 3, supply: 500, demand: 900, salary: '₹17,000/mo', retention: '78%', hotspots: 'Pune, Mumbai Sub', icon: Wrench },
];

const sectorColors: Record<string, string> = {
    'IT/Tech': '#0ea5e9', // sky-500
    'Core Engineering': '#f59e0b', // amber-500
    'Healthcare': '#ec4899', // pink-500
    'Services & Retail': '#8b5cf6', // violet-500
};

const sectorData = [
    { name: 'IT/Tech', value: 3900 },
    { name: 'Core Engineering', value: 3100 },
    { name: 'Services & Retail', value: 3300 },
    { name: 'Healthcare', value: 1500 },
];

const filters = ['All', 'IT/Tech', 'Core Engineering', 'Services & Retail', 'Healthcare'];

export default function SkillsDirectoryTab() {
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredSkills = mockSkillsData.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = activeFilter === 'All' || skill.sector === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="animate-in fade-in duration-300">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Total Std. Roles</span>
                        <Award className="w-4 h-4 text-teal-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">142</div>
                        <div className="text-xs font-medium text-slate-500 mt-1"><MetricTooltip term="NSQF Level">NSQF</MetricTooltip> / <MetricTooltip term="NCO-2015">NCO-2015</MetricTooltip> Mapped</div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Highest Deficit Role</span>
                        <TrendingUp className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-slate-800 leading-tight">Python Developer</div>
                        <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded inline-flex mt-1">5.3x Demand Gap</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Avg 6M Retention</span>
                        <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">68.4%</div>
                        <div className="text-xs font-medium text-green-600 mt-1">+2.1% from last quarter</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Top Placement Sector</span>
                        <ShieldCheck className="w-4 h-4 text-pink-500" />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-slate-800 leading-tight">Healthcare</div>
                        <div className="text-xs font-medium text-slate-500 mt-1">84% immediate placement</div>
                    </div>
                </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Bar Chart */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">State-wide Skill Demand vs. Certified Supply</h3>
                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockSkillsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={100} dx={-5} dy={5} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} verticalAlign="bottom" />
                                <Bar dataKey="demand" name="Demand (Vacancies)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="supply" name="Supply (Certified)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">Competency Sector Distribution</h3>
                    <div className="h-[280px] w-full relative mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sectorData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {sectorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={sectorColors[entry.name]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#334155', fontWeight: 600, fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                            <span className="text-2xl font-black text-slate-800">11.8k</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Total Pipeline</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Filter Bar */}
            <div className="sticky top-[4rem] z-20 bg-gray-50/95 backdrop-blur-sm py-4 mb-4 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search standard roles or NCO codes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-sm"
                    />
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {filters.map(filter => (
                        <button 
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                activeFilter === filter 
                                    ? 'bg-slate-800 text-white shadow-md' 
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Interactive Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                {filteredSkills.map(skill => {
                    const Icon = skill.icon;
                    const isDeficit = skill.demand > skill.supply;
                    const fillPercentage = Math.min((skill.supply / skill.demand) * 100, 100);
                    
                    return (
                        <Link 
                            href={`/dashboard/skill/${encodeURIComponent(skill.name)}`}
                            key={skill.name}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col hover:border-teal-300 relative"
                        >
                            {/* Accent Top Border */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 group-hover:border-teal-100 transition-colors">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 leading-tight group-hover:text-teal-700 transition-colors">{skill.name}</h3>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{skill.sector}</span>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] uppercase font-black rounded border border-indigo-100">
                                        NSQF {skill.nsqf}
                                    </span>
                                </div>

                                {/* Supply vs Demand Telemetry */}
                                <div className="mb-5">
                                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                                        <span className="text-slate-500">Supply / Demand</span>
                                        <span className={isDeficit ? 'text-red-600' : 'text-green-600'}>
                                            {skill.supply.toLocaleString()} / {skill.demand.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${isDeficit ? 'bg-red-400' : 'bg-green-400'}`}
                                            style={{ width: `${fillPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Avg Salary</div>
                                        <div className="font-semibold text-sm text-slate-700">{skill.salary}</div>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">1Y Retention</div>
                                        <div className="font-semibold text-sm text-slate-700">{skill.retention}</div>
                                    </div>
                                </div>

                                {/* Hotspots */}
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-auto">
                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate" title={skill.hotspots}>Hotspots: {skill.hotspots}</span>
                                </div>
                            </div>
                            
                            {/* Action Footer */}
                            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between group-hover:bg-teal-50 transition-colors">
                                <span className="text-xs font-bold text-slate-500 group-hover:text-teal-700 transition-colors">View Outcome Deep Dive</span>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    )
                })}
            </div>
            
            {filteredSkills.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <div className="text-slate-400 mb-2">No skills match the current filters.</div>
                    <button 
                        onClick={() => { setSearch(''); setActiveFilter('All'); }}
                        className="text-teal-600 font-medium text-sm hover:underline"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}
