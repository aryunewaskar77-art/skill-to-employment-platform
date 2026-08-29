"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = 'http://localhost:8000';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [candidateId, setCandidateId] = useState('');
  const [timeline, setTimeline] = useState<any>(null);
  const [timelineError, setTimelineError] = useState('');
  
  const [district, setDistrict] = useState('Mumbai City'); // Default
  const [skillGap, setSkillGap] = useState<any>(null);

  const districts = [
    "Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg",
    "Pune", "Satara", "Sangli", "Solapur", "Kolhapur",
    "Nashik", "Dhule", "Jalgaon", "Ahmednagar", "Nandurbar",
    "Aurangabad", "Jalna", "Beed", "Osmanabad", "Nanded", "Latur", "Parbhani", "Hingoli",
    "Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli",
    "Amravati", "Akola", "Washim", "Buldhana", "Yavatmal"
  ];

  useEffect(() => {
    fetch(`${API_BASE}/dashboard/state-summary`)
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error("Error fetching summary:", err));
  }, []);

  useEffect(() => {
    if (district) {
      fetch(`${API_BASE}/skill-gap/${district}`)
        .then(res => res.json())
        .then(data => setSkillGap(data))
        .catch(err => console.error("Error fetching skill gap:", err));
    }
  }, [district]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');

  useEffect(() => {
    const fetchCandidates = (q: string) => {
      setIsSearching(true);
      fetch(`${API_BASE}/candidates/search?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data);
          setIsSearching(false);
        })
        .catch(err => {
          console.error("Search error:", err);
          setIsSearching(false);
        });
    };

    if (!searchQuery.trim()) {
      fetchCandidates('');
      return;
    }
    
    const timeoutId = setTimeout(() => {
      fetchCandidates(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchTimeline = (id: string) => {
    setTimelineError('');
    setTimeline(null);
    if (!id) return;

    fetch(`${API_BASE}/candidates/${id}/timeline`)
      .then(res => {
        if (!res.ok) throw new Error("Candidate not found");
        return res.json();
      })
      .then(data => setTimeline(data))
      .catch(err => setTimelineError(err.message));
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    if (activeTab === 'skills' && skillsList.length === 0) {
      setLoadingSkills(true);
      fetch(`${API_BASE}/dashboard/skills-list`)
        .then(res => res.json())
        .then(data => {
          setSkillsList(data);
          setLoadingSkills(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingSkills(false);
        });
    }
  }, [activeTab, skillsList.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['overview', 'timeline', 'skillgap', 'skills'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b pb-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Skill-to-Employment Intelligence Platform</h1>
            <a href="/" className="text-sm font-medium text-teal-600 hover:underline px-3 py-1 bg-teal-50 rounded">
              &larr; Back to Home
            </a>
          </div>
          
          <nav className="flex space-x-2 flex-wrap gap-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2 rounded-t-lg font-medium transition ${activeTab === 'overview' ? 'bg-white text-teal-600 border-t border-l border-r border-gray-200 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              State Overview
            </button>
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`px-5 py-2 rounded-t-lg font-medium transition ${activeTab === 'timeline' ? 'bg-white text-teal-600 border-t border-l border-r border-gray-200 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Candidate Timeline
            </button>
            <button 
              onClick={() => setActiveTab('skillgap')}
              className={`px-5 py-2 rounded-t-lg font-medium transition ${activeTab === 'skillgap' ? 'bg-white text-teal-600 border-t border-l border-r border-gray-200 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Skill Gap Analysis
            </button>
            <button 
              onClick={() => setActiveTab('skills')}
              className={`px-5 py-2 rounded-t-lg font-medium transition ${activeTab === 'skills' ? 'bg-white text-teal-600 border-t border-l border-r border-gray-200 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Skills Directory
            </button>
          </nav>
        </header>

        <div className="mt-4">
          {/* View: Skills Directory */}
          {activeTab === 'skills' && (
            <section className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-semibold mb-6 text-gray-700">Skills Directory</h2>
              {loadingSkills ? (
                <div className="text-gray-500">Loading skills...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {skillsList.map((skill, idx) => (
                    <Link 
                      key={idx} 
                      href={`/dashboard/skill/${encodeURIComponent(skill)}`}
                      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-teal-300 hover:text-teal-700 transition flex items-center justify-between group"
                    >
                      <span className="font-medium text-gray-800 group-hover:text-teal-700">{skill}</span>
                      <span className="text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* View 1: State Overview */}
          {activeTab === 'overview' && (
            <section className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">State Overview</h2>
              {summary ? (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {['enrolled', 'trained', 'certified', 'placed', 'verified_employed'].map((k) => (
                      <div key={k} className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col items-center">
                        <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">{k.replace('_', ' ')}</span>
                        <span className="text-4xl font-bold text-teal-600 mt-2">{summary[k] || 0}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-teal-100 shadow-sm mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Candidate Pipeline Drop-off</h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Enrolled', count: summary.enrolled },
                            { name: 'Trained', count: summary.trained },
                            { name: 'Certified', count: summary.certified },
                            { name: 'Placed', count: summary.placed },
                            { name: 'Verified Employed', count: summary.verified_employed }
                          ]}
                          margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#4b5563', fontSize: 13, fontWeight: 500}} 
                            dy={10} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#9ca3af'}} 
                          />
                          <Tooltip 
                            cursor={{fill: '#f3f4f6'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                          />
                          <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} barSize={60} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading summary...</p>
              )}
            </section>
          )}

          {/* View 2: Candidate Timeline View */}
          {activeTab === 'timeline' && (
            <section className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Candidate Journey Timeline</h2>
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <div className="relative mb-8">
                  <form 
                    className="flex gap-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      fetchTimeline(selectedCandidateId || searchQuery);
                      setSearchResults([]);
                    }}
                  >
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        placeholder="Search candidate by name..." 
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSelectedCandidateId(''); // Reset exact ID if typing
                          if (e.target.value === '') {
                            setTimeline(null); // Show the default list again
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                      {isSearching && <span className="absolute right-4 top-3 text-sm text-gray-400">Searching...</span>}
                      
                      {searchResults.length > 0 && !timeline && (
                        <div className="mt-4 border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                          <ul className="divide-y divide-gray-100">
                            {searchResults.map(c => (
                              <li 
                                key={c.id} 
                                onClick={() => {
                                  setSearchQuery(c.name);
                                  setSelectedCandidateId(c.id);
                                  fetchTimeline(c.id);
                                }}
                                className="p-4 hover:bg-teal-50 cursor-pointer transition flex justify-between items-center"
                              >
                                <div>
                                  <div className="font-semibold text-gray-800">{c.name}</div>
                                  <div className="text-sm text-gray-500">{c.district}</div>
                                </div>
                                <div className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded border">
                                  {c.phone}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button type="submit" className="px-6 py-2 bg-teal-600 text-white font-medium rounded shadow hover:bg-teal-700 transition h-[46px]">
                      Search
                    </button>
                  </form>
                </div>

                {timelineError && <p className="text-red-500">{timelineError}</p>}

                {timeline && (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800">{timeline.candidate?.name}</h3>
                      <p className="text-gray-500">{timeline.candidate?.district} • {timeline.candidate?.phone}</p>
                    </div>
                    
                    {timeline.timeline?.slice().sort((a: any, b: any) => {
                      const rankMap: Record<string, number> = {
                        enrolled: 1, trained: 2, certified: 3, placed: 4, verified_employed: 5, retained_3m: 6, retained_6m: 7, retained_12m: 8
                      };
                      const rankA = rankMap[a.event_type] || 99;
                      const rankB = rankMap[b.event_type] || 99;
                      if (rankA !== rankB) return rankA - rankB;
                      const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
                      const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
                      return dateA - dateB;
                    }).map((event: any, idx: number) => {
                      const renderPayload = () => {
                        const p = event.raw_payload || {};
                        switch(event.event_type) {
                          case 'enrolled':
                            return <span>Enrolled in <strong className="text-gray-800">{p.course}</strong> (Batch {p.batch_id?.replace('BATCH_', '')})</span>;
                          case 'trained':
                            return <span>Completed training — <strong className="text-gray-800">{p.attendance_pct}%</strong> attendance, <strong className="text-gray-800">{p.assessment_score}</strong> assessment score</span>;
                          case 'certified':
                            return <span>Certified — NSQF Level <strong className="text-gray-800">{p.nsqf_level}</strong>, Occupation Code <strong className="text-gray-800">{p.occupation_code}</strong></span>;
                          case 'placed':
                            return <span>Placed at <strong className="text-gray-800">{p.employer}</strong> as <strong className="text-gray-800">{p.job_role}</strong></span>;
                          case 'verified_employed':
                            return <span>Verified employed at <strong className="text-gray-800">{p.employer}</strong> as <strong className="text-gray-800">{p.job_role}</strong>, wage band <strong className="text-gray-800">{p.wage_band}</strong></span>;
                          case 'retained_3m':
                            return <span>Retained for 3 months at <strong className="text-gray-800">{p.employer}</strong></span>;
                          case 'retained_6m':
                            return <span>Retained for 6 months at <strong className="text-gray-800">{p.employer}</strong></span>;
                          case 'retained_12m':
                            return <span>Retained for 12 months at <strong className="text-gray-800">{p.employer}</strong></span>;
                          default:
                            return <span className="text-gray-500 italic">No additional details recorded.</span>;
                        }
                      };

                      return (
                        <div key={idx} className="relative flex items-center justify-start group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-teal-100 text-teal-600 shadow shrink-0 z-10">
                            <span className="text-xs font-bold">{idx + 1}</span>
                          </div>
                          
                          <div className="w-[calc(100%-4rem)] ml-6 p-4 rounded-lg bg-gray-50 border border-gray-200 shadow">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-gray-800 capitalize">{event.event_type.replace('_', ' ')}</span>
                              <span className="text-xs font-medium text-gray-500">{event.event_date || 'N/A'}</span>
                            </div>
                            
                            {event.status && event.status !== 'unknown' && (
                              <div className="border-b pb-3 mb-3">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize border ${
                                  event.status.toLowerCase().includes('verified') ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-teal-50 text-teal-700 border-teal-200'
                                }`}>
                                  {event.status.replace('_', ' ')}
                                </span>
                              </div>
                            )}

                            <div className="text-sm text-gray-700">
                              {renderPayload()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* View 3: Skill-gap View */}
          {activeTab === 'skillgap' && (
            <section className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">District Skill Gap Analysis</h2>
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select District</label>
                  <select 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full md:w-64 p-2 border border-gray-300 rounded shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  >
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {skillGap ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-red-600 mb-3 border-b pb-2">Top Shortages (Demand &gt; Supply)</h3>
                      {skillGap.top_shortages?.length > 0 ? (
                        <ul className="space-y-3">
                          {skillGap.top_shortages.map((s: any) => (
                            <li key={s.occupation_code} className="transition-transform hover:-translate-y-0.5">
                              <Link href={`/dashboard/skill/${encodeURIComponent(s.description)}`} className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-100 hover:shadow-md hover:border-red-300 block w-full">
                                <div>
                                  <span className="font-medium text-gray-900">{s.description}</span>
                                  <span className="text-xs text-gray-500 ml-2">({s.occupation_code})</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-red-700">Shortage: {Math.abs(s.gap)}</div>
                                  <div className="text-xs text-gray-500">S: {s.supply} | D: {s.demand}</div>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">No significant shortages found.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-green-600 mb-3 border-b pb-2">Top Surpluses (Supply &gt; Demand)</h3>
                      {skillGap.top_surpluses?.length > 0 ? (
                        <ul className="space-y-3">
                          {skillGap.top_surpluses.map((s: any) => (
                            <li key={s.occupation_code} className="transition-transform hover:-translate-y-0.5">
                              <Link href={`/dashboard/skill/${encodeURIComponent(s.description)}`} className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-100 hover:shadow-md hover:border-green-300 block w-full">
                                <div>
                                  <span className="font-medium text-gray-900">{s.description}</span>
                                  <span className="text-xs text-gray-500 ml-2">({s.occupation_code})</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-700">Surplus: {Math.abs(s.gap)}</div>
                                  <div className="text-xs text-gray-500">S: {s.supply} | D: {s.demand}</div>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">No significant surpluses found.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Loading skill gap data...</p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
