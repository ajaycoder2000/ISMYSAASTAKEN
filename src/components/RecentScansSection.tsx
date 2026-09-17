'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Show, SignInButton, SignUpButton } from '@clerk/nextjs';
import SignalBars from './SignalBars';
import { SaturationLevel } from '@/types';

interface ScanDisplayItem {
  id: string;
  timeAgo: string;
  idea: string;
  competitors: number;
  saturationScore: SaturationLevel;
  shareSlug?: string;
  featured?: boolean;
  isLive?: boolean;
  category?: string;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Scans' },
  { id: 'today', label: '🔥 Trending Today' },
  { id: 'low', label: '🟢 Open Space (Low Saturation)' },
  { id: 'ai', label: '🤖 AI & Automation' },
  { id: 'devtools', label: '🛠️ DevTools' },
];

export default function RecentScansSection() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [scans, setScans] = useState<ScanDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState<number>(12);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/scans/recent?category=${activeTab}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setScans(res.data);
          if (res.todayCount) setTodayCount(res.todayCount);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <section id="recent-scans" className="w-full mx-auto pt-4 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] tracking-tight">
              Live Validation Stream
            </h2>
            <span className="flex items-center gap-1.5 text-[10px] font-bold font-[family-name:var(--font-mono)] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE FEED
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-inter)] mt-1">
            Real ideas tested by founders today • Updated dynamically every 24 hours
          </p>
        </div>

        <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--accent-amber)] bg-[var(--accent-amber)]/10 px-2.5 py-1 rounded-lg border border-[var(--accent-amber)]/25 self-start sm:self-auto font-semibold">
          ⚡ {todayCount} ideas validated today
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-space-grotesk)] font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[var(--bg-surface)] text-[var(--accent-amber)] border border-[var(--accent-amber)]/40 shadow-sm font-bold'
                  : 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--text-dim)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Logged-In Members: Full Interactive Stream */}
      <Show when="signed-in">
        <div className="space-y-2.5">
          {loading ? (
            <div className="py-8 text-center text-xs font-[family-name:var(--font-mono)] text-[var(--text-dim)] animate-pulse">
              Retrieving live stream...
            </div>
          ) : (
            scans.map((scan) => (
              <div
                key={scan.id}
                className="bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-amber)]/40 rounded-xl px-4 py-3.5 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-muted)]">
                      {scan.timeAgo}
                    </span>
                    <span className="text-[10px] text-[var(--border)]">•</span>
                    <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-secondary)]">
                      {scan.competitors} competitors found
                    </span>
                    {scan.isLive && (
                      <span className="text-[9px] font-[family-name:var(--font-mono)] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-bold border border-emerald-500/25">
                        ● Just Scanned
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] font-[family-name:var(--font-inter)] leading-snug group-hover:text-[var(--accent-amber)] transition-colors">
                    &ldquo;{scan.idea}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 self-start sm:self-center">
                  {/* Saturation meter */}
                  <SignalBars score={scan.saturationScore} size="sm" />

                  {/* 1-Click Inspect Link */}
                  {scan.shareSlug && (
                    <Link
                      href={`/scan/${scan.shareSlug}`}
                      className="px-2.5 py-1 bg-[var(--bg-surface-alt)] hover:bg-[var(--accent-amber)] text-[var(--text-secondary)] hover:text-black border border-[var(--border)] rounded-lg text-[11px] font-[family-name:var(--font-mono)] font-bold transition-all"
                    >
                      View Moat →
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Show>

      {/* Logged-Out Guests: 2 Teasers + Cyber Member Gate Card */}
      <Show when="signed-out">
        <div className="space-y-3">
          {/* Top 2 preview teasers */}
          {scans.slice(0, 2).map((scan) => (
            <div
              key={scan.id}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-muted)]">
                    {scan.timeAgo}
                  </span>
                  <span className="text-[10px] text-[var(--border)]">•</span>
                  <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-secondary)]">
                    {scan.competitors} competitors found
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] font-[family-name:var(--font-inter)] leading-snug">
                  &ldquo;{scan.idea}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3">
                <SignalBars score={scan.saturationScore} size="sm" />
              </div>
            </div>
          ))}

          {/* Member Lock Gate Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--accent-amber)]/30 bg-[var(--bg-surface-alt)] p-6 sm:p-8 text-center shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-amber)]/5 rounded-full blur-3xl pointer-events-none" />

            <span className="text-2xl mb-2 block">🔒</span>
            <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] mb-1">
              Unlock Today&apos;s Full Stream of {todayCount}+ SaaS Scans
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] max-w-md mx-auto mb-5 leading-relaxed">
              Sign in free to explore full competitor breakdowns, open space gap analyses, and trending founder ideas updated daily.
            </p>

            <div className="flex items-center justify-center gap-3">
              <SignUpButton mode="modal">
                <button className="px-5 py-2 bg-[var(--accent-amber)] hover:opacity-90 text-black text-xs font-bold font-[family-name:var(--font-space-grotesk)] rounded-xl transition-all shadow-md cursor-pointer">
                  Sign up free to unlock →
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-alt)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-medium font-[family-name:var(--font-space-grotesk)] rounded-xl transition-all cursor-pointer">
                  Sign in
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </Show>
    </section>
  );
}
