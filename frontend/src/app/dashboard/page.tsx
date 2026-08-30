"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PolicyRecommendations from '@/components/PolicyRecommendations';
import SkillsDirectoryTab from '@/components/SkillsDirectoryTab';
import StateOverviewTab from '@/components/StateOverviewTab';
import SkillMiniNav from '@/components/SkillMiniNav';
import PropensitySimulator from '@/components/PropensitySimulator';
import { Calendar, Users, Briefcase, TrendingUp, TrendingDown, ArrowRight, Activity, Search, ShieldCheck, PlayCircle } from 'lucide-react';
import MetricTooltip from '@/components/MetricTooltip';

const API_BASE = 'http://localhost:8000';

function DashboardContent() {
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

  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && ['overview', 'timeline', 'skills'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16">
      {activeTab === 'skills' && (
        <div className="px-4 pt-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <SkillMiniNav />
        </div>
      )}
      
      <div className="max-w-6xl mx-auto p-8">
        <div className="mt-4">
          {/* View: Skills Directory */}
          {activeTab === 'skills' && (
            <SkillsDirectoryTab />
          )}

          {/* View 1: State Overview */}
          {activeTab === 'overview' && (
            <StateOverviewTab />
          )}

          {/* View 2: Candidate Timeline View */}
          {activeTab === 'timeline' && (
            <section className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Candidate Journey Timeline</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-100">
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
                            return (
                              <span>
                                Certified — <MetricTooltip term="NSQF Level">NSQF Level</MetricTooltip> <strong className="text-gray-800">{p.nsqf_level}</strong>, 
                                Occupation Code <MetricTooltip term="NCO-2015">(NCO-2015)</MetricTooltip> <strong className="text-gray-800">{p.occupation_code}</strong>
                              </span>
                            );
                          case 'placed':
                            return <span>Placed at <strong className="text-gray-800">{p.employer}</strong> as <strong className="text-gray-800">{p.job_role}</strong></span>;
                          case 'verified_employed':
                            return <span>Verified employed at <strong className="text-gray-800">{p.employer}</strong> as <strong className="text-gray-800">{p.job_role}</strong>, wage band <strong className="text-gray-800">{p.wage_band}</strong></span>;
                          case 'retained_3m':
                            return <span>Retained &mdash; 3 months at <strong className="text-gray-800">{p.employer}</strong></span>;
                          case 'retained_6m':
                            return <span>Retained &mdash; 6 months at <strong className="text-gray-800">{p.employer}</strong></span>;
                          case 'retained_12m':
                            return <span>Retained &mdash; 12 months at <strong className="text-gray-800">{p.employer}</strong></span>;
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
              <div className="lg:col-span-1">
                <PropensitySimulator 
                  initialDistrict={timeline?.candidate?.district} 
                  initialCourse={timeline?.candidate?.course} 
                />
              </div>
            </div>
            </section>
          )}


          
          <PolicyRecommendations />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
