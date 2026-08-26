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
            <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] tracking-tight">
              Live Validation Stream
            </h2>
            <span className="flex items-center gap-1.5 text-[10px] font-bold font-[family-name:var(--font-mono)] text-[hsl(145,60%,55%)] bg-[hsl(145,60%,45%,0.1)] px-2 py-0.5 rounded-full border border-[hsl(145,60%,45%,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(145,60%,55%)] animate-pulse" />
              LIVE FEED
            </span>
          </div>
          <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] mt-1">
            Real ideas tested by founders today • Updated dynamically every 24 hours
          </p>
        </div>

        <span className="text-xs font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-2.5 py-1 rounded-lg border border-[hsl(42,95%,55%,0.25)] self-start sm:self-auto">
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
                  ? 'bg-[hsl(220,15%,15%)] text-[hsl(42,95%,55%)] border border-[hsl(42,95%,55%,0.4)] shadow-sm font-bold'
                  : 'bg-[hsl(220,12%,10%)] text-[hsl(40,8%,55%)] border border-[hsl(220,10%,16%)] hover:border-[hsl(220,10%,24%)] hover:text-[hsl(40,20%,85%)]'
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
            <div className="py-8 text-center text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] animate-pulse">
              Retrieving live stream...
            </div>
          ) : (
            scans.map((scan) => (
              <div
                key={scan.id}
                className="bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(42,95%,55%,0.35)] rounded-xl px-4 py-3.5 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
                      {scan.timeAgo}
                    </span>
                    <span className="text-[10px] text-[hsl(220,10%,25%)]">•</span>
                    <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,55%)]">
                      {scan.competitors} competitors found
                    </span>
                    {scan.isLive && (
                      <span className="text-[9px] font-[family-name:var(--font-mono)] text-[hsl(145,60%,55%)] bg-[hsl(145,60%,45%,0.12)] px-1.5 py-0.2 rounded font-bold border border-[hsl(145,60%,45%,0.25)]">
                        ● Just Scanned
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[hsl(40,20%,92%)] font-[family-name:var(--font-inter)] leading-snug group-hover:text-[hsl(42,95%,55%)] transition-colors">
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
                      className="px-2.5 py-1 bg-[hsl(220,10%,16%)] hover:bg-[hsl(42,95%,55%)] text-[hsl(40,20%,85%)] hover:text-[hsl(220,15%,8%)] border border-[hsl(220,10%,22%)] rounded-lg text-[11px] font-[family-name:var(--font-mono)] font-bold transition-all"
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
              className="bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] rounded-xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
                    {scan.timeAgo}
                  </span>
                  <span className="text-[10px] text-[hsl(220,10%,25%)]">•</span>
                  <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,55%)]">
                    {scan.competitors} competitors found
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[hsl(40,20%,92%)] font-[family-name:var(--font-inter)] leading-snug">
                  &ldquo;{scan.idea}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3">
                <SignalBars score={scan.saturationScore} size="sm" />
              </div>
            </div>
          ))}

          {/* Member Lock Gate Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[hsl(42,95%,55%,0.3)] bg-gradient-to-b from-[hsl(220,15%,12%)] to-[hsl(220,15%,9%)] p-6 sm:p-8 text-center shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[hsl(42,95%,55%,0.05)] rounded-full blur-3xl pointer-events-none" />

            <span className="text-2xl mb-2 block">🔒</span>
            <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] mb-1">
              Unlock Today&apos;s Full Stream of {todayCount}+ SaaS Scans
            </h3>
            <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] max-w-md mx-auto mb-5 leading-relaxed">
              Sign in free to explore full competitor breakdowns, open space gap analyses, and trending founder ideas updated daily.
            </p>

            <div className="flex items-center justify-center gap-3">
              <SignUpButton mode="modal">
                <button className="px-5 py-2 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] text-xs font-bold font-[family-name:var(--font-space-grotesk)] rounded-xl transition-all shadow-md cursor-pointer">
                  Sign up free to unlock →
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] border border-[hsl(220,10%,24%)] text-[hsl(40,20%,90%)] text-xs font-medium font-[family-name:var(--font-space-grotesk)] rounded-xl transition-all cursor-pointer">
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
