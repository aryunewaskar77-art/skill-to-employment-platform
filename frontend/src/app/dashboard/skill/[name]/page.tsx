"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = 'http://localhost:8000';

export default function SkillDetail() {
  const params = useParams();
  const skillName = decodeURIComponent(params.name as string);
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/dashboard/skill-stats/${encodeURIComponent(skillName)}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching skill stats:", err);
        setLoading(false);
      });
  }, [skillName]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
      Loading skill insights...
    </div>
  );

  if (!stats) return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Skill not found</h1>
      <Link href="/dashboard?tab=skillgap" className="text-teal-600 hover:underline">
        &larr; Back to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard?tab=skillgap" className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium mb-6">
          &larr; Back to Skill Gap Analysis
        </Link>
        
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Skill Insights: <span className="text-teal-700">{skillName}</span></h1>
        <p className="text-gray-500 mb-8">Longitudinal tracking and geographical distribution for this specific course.</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Registered', val: stats.pipeline.enrolled },
            { label: 'Trained', val: stats.pipeline.trained },
            { label: 'Certified', val: stats.pipeline.certified },
            { label: 'Placed', val: stats.pipeline.placed },
            { label: 'Verified Emp.', val: stats.pipeline.verified_employed },
            { label: 'Open Jobs', val: stats.job_demand, highlight: true }
          ].map((kpi, idx) => (
            <div key={idx} className={`p-4 rounded-xl shadow-sm border ${kpi.highlight ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-100'} flex flex-col items-center text-center`}>
              <span className={`text-xs uppercase tracking-wide font-bold mb-2 ${kpi.highlight ? 'text-teal-700' : 'text-gray-500'}`}>{kpi.label}</span>
              <span className={`text-3xl font-black ${kpi.highlight ? 'text-teal-800' : 'text-teal-600'}`}>{kpi.val || 0}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Funnel Chart */}
          <div className="bg-white p-6 rounded-xl border border-teal-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Pipeline Drop-off</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Enrolled', count: stats.pipeline.enrolled },
                    { name: 'Trained', count: stats.pipeline.trained },
                    { name: 'Certified', count: stats.pipeline.certified },
                    { name: 'Placed', count: stats.pipeline.placed },
                    { name: 'Employed', count: stats.pipeline.verified_employed }
                  ]}
                  margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12, fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                  <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Geo Distribution */}
          <div className="bg-white p-6 rounded-xl border border-teal-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Geographical Distribution (Top Districts)</h3>
            <div className="h-72 w-full">
              {stats.districts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.districts}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <YAxis dataKey="district" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12, fontWeight: 500}} dx={-10} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                    <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic">No geographical data available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
