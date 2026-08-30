"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, TrendingUp, Users, ShieldCheck, Map, ArrowRight } from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function LandingPage() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/dashboard/state-summary`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error("Error fetching summary:", err));
  }, []);

  const engines = [
    {
      number: "01",
      title: "Unified Data Layer",
      shortTitle: "UNIFY",
      desc: "Brings training, certification, employment and other records together.",
      input: "Multiple databases",
      output: "One candidate view",
    },
    {
      number: "02",
      title: "Candidate Outcome Engine",
      shortTitle: "TRACK",
      desc: "Follows what happens to each candidate after training.",
      input: "Training records",
      output: "Employment journey",
    },
    {
      number: "03",
      title: "Skill Intelligence Engine",
      shortTitle: "MATCH",
      desc: "Compares the skills workers have with the skills employers need.",
      input: "Worker skills",
      output: "Demand & gaps",
    },
    {
      number: "04",
      title: "Decision Intelligence",
      shortTitle: "ACT",
      desc: "Turns the findings into clear signals for better decisions.",
      input: "Insights & gaps",
      output: "Actionable decisions",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <main className="flex-1">

        {/* =========================================================
            1. HERO SECTION
        ========================================================== */}
        <section
          className="
            relative
            overflow-hidden
            border-b
            border-teal-100
            py-24
            px-8
            text-center
            bg-gradient-to-b
            from-teal-100/70
            via-teal-50/40
            to-white
          "
        >
          {/* Defined teal ambient gradient - left */}
          <div
            className="
              absolute
              -top-40
              -left-40
              w-[620px]
              h-[620px]
              rounded-full
              bg-teal-200/50
              blur-[110px]
              pointer-events-none
              z-0
            "
          />

          {/* Defined emerald ambient gradient - right */}
          <div
            className="
              absolute
              -top-32
              -right-40
              w-[620px]
              h-[620px]
              rounded-full
              bg-emerald-200/45
              blur-[110px]
              pointer-events-none
              z-0
            "
          />

          {/* Center glow */}
          <div
            className="
              absolute
              top-20
              left-1/2
              -translate-x-1/2
              w-[700px]
              h-[420px]
              rounded-full
              bg-teal-100/35
              blur-[100px]
              pointer-events-none
              z-0
            "
          />

          {/* Maharashtra map */}
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              pointer-events-none
              z-0
            "
            aria-hidden="true"
          >
            <img
              src="/maharashtra_map.svg"
              alt=""
              className="
                w-[560px]
                md:w-[720px]
                lg:w-[820px]
                -translate-y-10
                opacity-[0.10]
                object-contain
              "
            />
          </div>

          {/* Hero content */}
          <div className="max-w-4xl mx-auto relative z-10">

            {/* Badge */}
            <div
              className="
                inline-block
                px-5
                py-2
                bg-teal-100/90
                text-teal-700
                rounded-full
                text-xs
                font-bold
                tracking-wider
                mb-8
                uppercase
                border
                border-teal-200/60
              "
            >
              Team OMNITRIX · Smart India Hackathon 2026 · PS 26135
            </div>

            {/* Heading */}
            <h1
              className="
                text-5xl
                md:text-6xl
                font-extrabold
                text-gray-900
                mb-6
                tracking-tight
                leading-tight
              "
            >
              Skill-to-Employment
              <br />
              Intelligence Platform
            </h1>

            {/* Description */}
            <p
              className="
                text-xl
                text-gray-600
                mb-10
                max-w-3xl
                mx-auto
                leading-relaxed
              "
            >
              We don't just measure who was trained — we track who gets
              employed, who stays employed, where skill gaps persist, and what
              should change next.
            </p>

            {/* Main CTA */}
            <Link
              href="/dashboard"
              className="
                inline-block
                px-9
                py-4
                bg-teal-600
                text-white
                text-lg
                font-bold
                rounded-lg
                shadow-lg
                shadow-teal-600/20
                hover:bg-teal-700
                hover:shadow-xl
                hover:shadow-teal-600/25
                transition
                transform
                hover:-translate-y-0.5
              "
            >
              Enter Dashboard
            </Link>


          </div>
        </section>

        {/* =========================================================
            2. PARADIGM SHIFT
        ========================================================== */}
        <section
          className="
            relative
            overflow-hidden
            py-24
            px-8
            bg-gradient-to-b
            from-white
            via-slate-50
            to-teal-50/40
          "
        >
          {/* Background decoration */}
          <div
            className="
              absolute
              top-1/2
              left-1/2
              -translate-x-1/2
              -translate-y-1/2
              w-[700px]
              h-[500px]
              rounded-full
              bg-teal-100/30
              blur-[110px]
              pointer-events-none
            "
          />

          <div className="max-w-4xl mx-auto text-center relative z-10">

            {/* Section label */}
            <div
              className="
                inline-flex
                px-4
                py-1.5
                rounded-full
                border
                border-teal-200
                bg-teal-50
                text-teal-700
                text-xs
                font-bold
                tracking-widest
                uppercase
                mb-5
              "
            >
              From Training to Outcomes
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              The Paradigm Shift
            </h2>

            <p className="text-gray-500 max-w-2xl mx-auto mb-12">
              Move beyond counting trained candidates to understanding what
              happens after training.
            </p>

            {/* Current scope */}
            <div
              className="
                relative
                p-7
                rounded-2xl
                border
                border-gray-200
                bg-white/80
                shadow-sm
              "
            >
              <span
                className="
                  block
                  text-xs
                  uppercase
                  tracking-widest
                  mb-4
                  text-gray-400
                  font-bold
                "
              >
                Current Scope
              </span>

              <div className="text-xl md:text-2xl text-gray-400 font-semibold">
                enrolled
                <span className="mx-3 text-gray-300">→</span>
                trained
                <span className="mx-3 text-gray-300">→</span>
                certified
              </div>
            </div>

            {/* VS */}
            <div
              className="
                my-6
                inline-flex
                w-12
                h-12
                items-center
                justify-center
                rounded-full
                bg-slate-900
                text-white
                font-black
                text-sm
                shadow-lg
              "
            >
              VS
            </div>

            {/* Our platform */}
            <div
              className="
                relative
                p-7
                rounded-2xl
                border-2
                border-teal-200
                bg-gradient-to-br
                from-teal-50
                to-white
                shadow-[0_12px_40px_rgba(13,148,136,0.10)]
              "
            >
              <span
                className="
                  block
                  text-xs
                  uppercase
                  tracking-widest
                  mb-4
                  text-teal-600
                  font-bold
                "
              >
                Our Platform
              </span>

              <div className="text-xl md:text-2xl text-teal-700 font-bold">
                trained
                <span className="mx-2 text-teal-300">→</span>
                employed
                <span className="mx-2 text-teal-300">→</span>
                retained
                <span className="mx-2 text-teal-300">→</span>
                earning
                <span className="mx-2 text-teal-300">→</span>
                progressing
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            3. LIVE STATS
        ========================================================== */}
        <section
          className="
            py-20
            px-8
            relative
            overflow-hidden
            bg-slate-900
            text-white
          "
        >
          {/* Left glow */}
          <div
            className="
              absolute
              -top-1/2
              -left-1/4
              w-[800px]
              h-[800px]
              rounded-full
              bg-teal-500
              opacity-20
              blur-[120px]
              mix-blend-screen
            "
          />

          {/* Right glow */}
          <div
            className="
              absolute
              -bottom-1/2
              -right-1/4
              w-[600px]
              h-[600px]
              rounded-full
              bg-emerald-500
              opacity-20
              blur-[100px]
              mix-blend-screen
            "
          />

          <div
            className="
              max-w-5xl
              mx-auto
              text-center
              relative
              z-10
              border
              border-teal-500/20
              bg-white/5
              backdrop-blur-md
              rounded-3xl
              p-12
              shadow-2xl
            "
          >

            <h2
              className="
                text-sm
                uppercase
                tracking-widest
                font-bold
                text-teal-400
                mb-10
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Platform Metrics
            </h2>

            {summary ? (
              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  justify-center
                  items-center
                  gap-12
                  md:gap-24
                "
              >

                <div className="flex-1">
                  <div className="text-6xl font-black mb-3 text-white">
                    {summary.enrolled ? summary.enrolled.toLocaleString() : 0}
                  </div>

                  <div className="text-teal-200 font-medium tracking-wider uppercase text-sm">
                    Candidates Enrolled
                  </div>
                </div>

                <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-teal-500/50 to-transparent" />

                <div className="flex-1">
                  <div className="text-6xl font-black mb-3 text-white">
                    {summary.certified ? summary.certified.toLocaleString() : 0}
                  </div>

                  <div className="text-teal-200 font-medium tracking-wider uppercase text-sm">
                    Candidates Certified
                  </div>
                </div>

                <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-teal-500/50 to-transparent" />

                <div className="flex-1">
                  <div className="text-6xl font-black mb-3 text-white flex items-center justify-center gap-3">
                    <ShieldCheck className="w-12 h-12 text-teal-400" />
                    {summary.verified_employed ? summary.verified_employed.toLocaleString() : 0}
                  </div>

                  <div className="text-emerald-100 font-bold tracking-wider uppercase text-sm">
                    Verified Employed
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-teal-200 animate-pulse text-lg py-8">
                Connecting to live data stream...
              </div>
            )}

          </div>
        </section>

        {/* =========================================================
    4. CORE PLATFORM ENGINES
========================================================= */}
<section
  className="
    relative
    overflow-hidden
    py-24
    px-8
    bg-gradient-to-b
    from-teal-50/40
    via-white
    to-slate-50
  "
>
  {/* Ambient background */}
  <div
    className="
      absolute
      top-0
      left-1/2
      -translate-x-1/2
      w-[900px]
      h-[400px]
      bg-teal-100/30
      blur-[120px]
      rounded-full
      pointer-events-none
    "
  />

  <div className="max-w-6xl mx-auto relative z-10">

    {/* Header */}
    <div className="text-center mb-12">

      <div
        className="
          inline-flex
          px-4
          py-1.5
          rounded-full
          border
          border-teal-200
          bg-white/80
          text-teal-700
          text-xs
          font-bold
          tracking-widest
          uppercase
          mb-5
        "
      >
        How the Platform Works
      </div>

      <h2
        className="
          text-3xl
          md:text-4xl
          font-extrabold
          text-gray-900
          mb-4
        "
      >
        Core Platform Engines
      </h2>

      <p
        className="
          text-lg
          text-gray-500
          max-w-3xl
          mx-auto
          leading-relaxed
        "
      >
        Four connected engines turn scattered skilling data into clear
        employment insights and better decisions.
      </p>

      {/* Accent */}
      <div
        className="
          mt-7
          mx-auto
          w-20
          h-1
          rounded-full
          bg-teal-300
        "
      />
    </div>

    {/* Engine cards */}
    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-4
        gap-5
      "
    >
      {engines.map((engine) => (
        <div
          key={engine.number}
          className="
            group
            relative
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-5
            min-h-[270px]
            shadow-[0_8px_30px_rgba(15,23,42,0.05)]
            hover:-translate-y-1
            hover:border-teal-200
            hover:shadow-[0_18px_45px_rgba(15,118,110,0.12)]
            transition-all
            duration-300
          "
        >

          {/* Subtle top gradient */}
          <div
            className="
              absolute
              inset-x-0
              top-0
              h-20
              bg-gradient-to-b
              from-teal-50/70
              to-transparent
              opacity-0
              group-hover:opacity-100
              transition-opacity
            "
          />

          {/* Number + category */}
          <div
            className="
              relative
              z-10
              flex
              items-center
              justify-between
              mb-6
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-teal-50
                border
                border-teal-100
                text-teal-700
                flex
                items-center
                justify-center
                text-sm
                font-black
                group-hover:bg-teal-100
                group-hover:border-teal-200
                transition
              "
            >
              {engine.number}
            </div>

            <span
              className="
                text-[10px]
                font-black
                tracking-[0.18em]
                text-teal-500
                bg-teal-50
                px-2.5
                py-1
                rounded-full
              "
            >
              {engine.shortTitle}
            </span>
          </div>

          {/* Title */}
          <h3
            className="
              relative
              z-10
              text-lg
              font-extrabold
              text-gray-900
              leading-snug
              mb-3
            "
          >
            {engine.title}
          </h3>

          {/* Description */}
          <p
            className="
              relative
              z-10
              text-gray-500
              text-sm
              leading-relaxed
              mb-5
            "
          >
            {engine.desc}
          </p>

          {/* Bottom accent */}
          <div
            className="
              absolute
              bottom-5
              left-5
              w-8
              h-1
              rounded-full
              bg-teal-200
              group-hover:w-12
              group-hover:bg-teal-300
              transition-all
              duration-300
            "
          />

        </div>
      ))}
    </div>

  </div>
</section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-8 text-center">

        <div className="max-w-4xl mx-auto">

          <p className="text-sm text-gray-500">
            &copy; 2026 Team OMNITRIX. Built for Smart India Hackathon
            (PS 26135).
          </p>

        </div>

      </footer>

    </div>
  );
}