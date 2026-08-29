"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = 'http://localhost:8000';

export default function LandingPage() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/dashboard/state-summary`)
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error("Error fetching summary:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="bg-gradient-to-b from-teal-50 via-white to-white border-b py-24 px-8 text-center relative overflow-hidden">
          {/* Subtle decorative background blur */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl opacity-30 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute top-12 -right-24 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-xs font-bold tracking-wider mb-8 uppercase">
              Team OMNITRIX · Smart India Hackathon 2026 · PS 26135
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
              Skill-to-Employment <br /> Intelligence Platform
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              We don't just track how many people were trained — we track what happened to them, why it happened, and what the government should change next.
            </p>
            <Link href="/dashboard" className="inline-block px-8 py-4 bg-teal-600 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-teal-700 hover:shadow-xl transition transform hover:-translate-y-0.5">
              Enter Dashboard
            </Link>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
              <Link href="/dashboard?tab=overview" className="p-6 bg-white border border-teal-100 rounded-xl shadow-sm hover:shadow-md hover:border-teal-300 transition group flex flex-col items-start h-full">
                <div className="flex items-center gap-3 mb-3 text-teal-800 font-bold text-lg">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                  State Overview
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Real-time aggregation of statewide skilling metrics tracking enrollment, certification, and verified employment rates.
                </p>
                <div className="mt-auto inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 font-semibold text-sm rounded-lg group-hover:bg-teal-100 transition">
                  View Dashboard <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
              <Link href="/dashboard?tab=timeline" className="p-6 bg-white border border-teal-100 rounded-xl shadow-sm hover:shadow-md hover:border-teal-300 transition group flex flex-col items-start h-full">
                <div className="flex items-center gap-3 mb-3 text-teal-800 font-bold text-lg">
                  <span className="text-2xl group-hover:scale-110 transition-transform">⏳</span>
                  Candidate Timeline
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Search individual candidate journeys across disjointed databases to track true longitudinal employment outcomes.
                </p>
                <div className="mt-auto inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 font-semibold text-sm rounded-lg group-hover:bg-teal-100 transition">
                  View Timeline <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
              <Link href="/dashboard?tab=skillgap" className="p-6 bg-white border border-teal-100 rounded-xl shadow-sm hover:shadow-md hover:border-teal-300 transition group flex flex-col items-start h-full">
                <div className="flex items-center gap-3 mb-3 text-teal-800 font-bold text-lg">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
                  Skill Gap Analysis
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  District-level mapping of certified candidate supply against verified industry demand to identify critical labor shortages.
                </p>
                <div className="mt-auto inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 font-semibold text-sm rounded-lg group-hover:bg-teal-100 transition">
                  View Analysis <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Problem Framing Section */}
        <section className="py-20 px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-10">The Paradigm Shift</h2>
            <div className="flex flex-col items-center justify-center gap-6 max-w-3xl mx-auto">
              <div className="text-lg text-gray-400 font-medium p-6 border border-gray-200 rounded-xl bg-gray-100 w-full">
                <span className="block text-sm uppercase tracking-wider mb-3 text-gray-500 font-semibold">Current Scope</span>
                enrolled &rarr; trained &rarr; certified
              </div>
              <div className="text-gray-500 font-black text-xl">VS</div>
              <div className="text-xl text-teal-700 font-bold p-6 border-2 border-teal-200 rounded-xl bg-teal-50 shadow-sm w-full">
                <span className="block text-sm uppercase tracking-wider mb-3 text-teal-600 font-semibold">Our Platform</span>
                trained &rarr; employed &rarr; retained &rarr; earning &rarr; progressing
              </div>
            </div>
          </div>
        </section>

        {/* 3. Live Stats Strip (Premium Standout) */}
        <section className="py-20 px-8 relative overflow-hidden bg-slate-900 text-white">
          {/* Glowing orb background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-teal-500 opacity-20 blur-[120px] mix-blend-screen"></div>
            <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500 opacity-20 blur-[100px] mix-blend-screen"></div>
          </div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 border border-teal-500/20 bg-white/5 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
            <h2 className="text-sm uppercase tracking-widest font-bold text-teal-400 mb-10 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live Platform Metrics
            </h2>
            
            {summary ? (
              <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24">
                <div className="flex-1">
                  <div className="text-6xl font-black mb-3 text-white drop-shadow-lg">{summary.enrolled || 0}</div>
                  <div className="text-teal-200 font-medium tracking-wider uppercase text-sm">Candidates Enrolled</div>
                </div>
                <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-teal-500/50 to-transparent"></div>
                <div className="flex-1">
                  <div className="text-6xl font-black mb-3 text-white drop-shadow-lg">{summary.certified || 0}</div>
                  <div className="text-teal-200 font-medium tracking-wider uppercase text-sm">Candidates Certified</div>
                </div>
                <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-teal-500/50 to-transparent"></div>
                <div className="flex-1">
                  <div className="text-6xl font-black mb-3 text-emerald-400 drop-shadow-lg">{summary.verified_employed || 0}</div>
                  <div className="text-emerald-100 font-bold tracking-wider uppercase text-sm">Verified Employed</div>
                </div>
              </div>
            ) : (
              <div className="text-teal-200 animate-pulse text-lg py-8">Connecting to live data stream...</div>
            )}
          </div>
        </section>

        {/* 4. Four Core Engines */}
        <section className="py-20 px-8 bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Core Platform Engines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Unified Data Layer", desc: "Automated identity resolution linking disjointed skill databases." },
                { title: "Candidate Outcome Engine", desc: "Longitudinal tracking of every candidate's journey from training to sustained employment." },
                { title: "Skill Intelligence Engine", desc: "Real-time mapping of certified supply against industry demand by district." },
                { title: "Decision Intelligence", desc: "ML-driven propensity models and actionable policy recommendations." }
              ].map((engine, idx) => (
                <div key={idx} className="p-8 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center mb-6 font-bold text-xl shadow-inner">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{engine.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{engine.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-gray-500">&copy; 2026 Team OMNITRIX. Built for Smart India Hackathon (PS 26135).</p>
        </div>
      </footer>
    </div>
  );
}
