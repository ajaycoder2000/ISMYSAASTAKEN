'use client';

import React from 'react';
import Link from 'next/link';

export default function KeywordTeaserSection() {
  const sampleSeeds = [
    'ai meeting notes',
    'linear alternative',
    'postgres backup saas',
    'b2b onboarding checklist',
    'social proof widget',
  ];

  return (
    <section className="w-full py-10 sm:py-16">
      {/* Section Eyebrow */}
      <div className="text-center mb-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10.5px] font-bold font-[family-name:var(--font-mono)] tracking-[0.2em] text-[var(--accent-emerald)] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-emerald)] animate-pulse" />
          NEW CAPABILITY // SEARCH DEMAND TELEMETRY
        </span>
      </div>

      {/* Headline */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] text-center leading-snug mb-3">
        Before You Write Code: Check Real Search Demand
      </h2>

      {/* Subheadline */}
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] text-center mb-10 max-w-xl mx-auto leading-relaxed">
        Competitors are only half the picture. Discover if customers are actively searching for your solution with Google Trends interest curves (0–100 scale), live autocomplete suggestions, and organic SERP competition signals.
      </p>

      {/* Interactive Telemetry Preview Console */}
      <div className="w-full max-w-4xl mx-auto bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            <span className="ml-2 text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-muted)]">
              radar://keyword-engine &bull; seed: &quot;linear alternative&quot;
            </span>
          </div>

          <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] text-[var(--accent-emerald)] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
            LIVE PREVIEW
          </span>
        </div>

        {/* 3 Grid Sub-Panels Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Signal 1: Search Interest Curve */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">
                <span>01. Interest Trend</span>
                <span className="text-[var(--accent-emerald)] font-bold">↗ Rising</span>
              </div>
              <div className="text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                78 <span className="text-xs text-[var(--text-muted)] font-mono">/ 100</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-[family-name:var(--font-inter)]">
                Relative 12-mo search demand curve via Google Trends.
              </p>
            </div>

            {/* Simulated mini SVG Sparkline */}
            <div className="h-10 w-full pt-1">
              <svg viewBox="0 0 160 40" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="miniSparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 32 Q 25 30, 45 22 T 90 25 T 130 14 T 160 8 L 160 40 L 0 40 Z"
                  fill="url(#miniSparkGrad)"
                />
                <path
                  d="M 0 32 Q 25 30, 45 22 T 90 25 T 130 14 T 160 8"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
                <circle cx="160" cy="8" r="3" fill="#10b981" />
              </svg>
            </div>
          </div>

          {/* Signal 2: Live Autocomplete & Long-Tail */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">
                <span>02. Real Autocomplete</span>
                <span className="text-[var(--accent-amber)] font-bold">Live</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mb-2">
                What active buyers type + AI uncrowded questions.
              </p>
            </div>

            <div className="space-y-1.5 text-[11px] font-[family-name:var(--font-mono)]">
              <div className="p-1.5 rounded bg-[var(--bg-surface)] text-[var(--text-primary)] truncate border border-[var(--border)]">
                &bull; linear alternative for small teams
              </div>
              <div className="p-1.5 rounded bg-[var(--bg-surface)] text-[var(--text-primary)] truncate border border-[var(--border)]">
                &bull; open source linear vs jira
              </div>
              <div className="p-1.5 rounded bg-[var(--bg-surface)] text-[var(--accent-emerald)] truncate border border-emerald-500/30 font-medium">
                &bull; why is linear so popular reddit
              </div>
            </div>
          </div>

          {/* Signal 3: Competition Signal (Proxy) */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">
                <span>03. Competition Signal</span>
                <span className="text-[var(--accent-emerald)] font-bold">Proxy</span>
              </div>
              <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/15 text-[var(--accent-emerald)] font-bold text-xs font-[family-name:var(--font-mono)] border border-emerald-500/30 mt-0.5">
                Lower competition
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-2 font-[family-name:var(--font-inter)] leading-snug">
                Multiple Reddit and community discussions rank on page 1 — signaling open wedge opportunity.
              </p>
            </div>

            <div className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
              ⚖️ No fake numeric difficulty scores.
            </div>
          </div>
        </div>

        {/* Quick Launch Buttons & CTA Footer */}
        <div className="mt-6 pt-5 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] uppercase tracking-wider mr-1">
              Sample Radars:
            </span>
            {sampleSeeds.map((seed) => (
              <Link
                key={seed}
                href={`/keywords`}
                className="text-[11px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border)]"
              >
                {seed}
              </Link>
            ))}
          </div>

          <Link
            href="/keywords"
            className="w-full sm:w-auto px-6 py-2.5 bg-[var(--accent-emerald)] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] flex items-center justify-center gap-2 shadow-lg shrink-0 cursor-pointer"
          >
            <span>Launch Free Keyword Radar</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
