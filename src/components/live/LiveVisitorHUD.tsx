'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { GlobeMarker } from './LiveGlobe';

const LiveGlobe = dynamic(() => import('./LiveGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square max-w-[340px] sm:max-w-[400px] mx-auto flex items-center justify-center">
      <div className="w-48 h-48 rounded-full border border-[var(--border)] animate-pulse bg-[var(--bg-surface-alt)]" />
    </div>
  ),
});

interface ActivityItem {
  id: string;
  countryCode: string;
  countryName: string;
  path: string;
  timestamp: number;
  lat: number;
  lng: number;
}

interface CountryStat {
  code: string;
  name: string;
  count: number;
}

interface LiveStatsResponse {
  activeNow: number;
  countriesCount: number;
  totalVisits: number;
  startDate: string;
  recentActivity: ActivityItem[];
  topCountries7D: CountryStat[];
}

function formatTimeAgo(timestamp: number, currentNow: number): string {
  const seconds = Math.max(1, Math.floor((currentNow - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

interface LiveVisitorHUDProps {
  className?: string;
}

export default function LiveVisitorHUD({ className = '' }: LiveVisitorHUDProps) {
  const [stats, setStats] = useState<LiveStatsResponse>({
    activeNow: 39,
    countriesCount: 26,
    totalVisits: 950326,
    startDate: '29 jul',
    recentActivity: [
      { id: '1', countryCode: 'MA', countryName: 'Morocco', path: '/', timestamp: Date.now() - 31000, lat: 31.7917, lng: -7.0926 },
      { id: '2', countryCode: 'BR', countryName: 'Brazil', path: '/', timestamp: Date.now() - 31000, lat: -14.235, lng: -51.9253 },
      { id: '3', countryCode: 'BR', countryName: 'Brazil', path: '/pricing', timestamp: Date.now() - 33000, lat: -23.5505, lng: -46.6333 },
      { id: '4', countryCode: 'US', countryName: 'United States', path: '/category/ai-agents', timestamp: Date.now() - 38000, lat: 37.7749, lng: -122.4194 },
    ],
    topCountries7D: [
      { code: 'BR', name: 'Brazil', count: 1674 },
      { code: 'AR', name: 'Argentina', count: 1530 },
      { code: 'US', name: 'United States', count: 1136 },
      { code: 'ES', name: 'Spain', count: 388 },
      { code: 'IN', name: 'India', count: 373 },
    ],
  });

  const [currentNow, setCurrentNow] = useState<number>(Date.now());

  // Periodically fetch live stats
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/live/stats', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setStats(data);
          }
        }
      } catch {
        // Fallback gracefully to existing state
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 9000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Update relative timestamps every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Map recent activity coordinates to Globe markers
  const markers = useMemo<GlobeMarker[]>(() => {
    return stats.recentActivity.map((item) => ({
      location: [item.lat, item.lng],
      size: 0.045,
    }));
  }, [stats.recentActivity]);

  return (
    <section
      className={`w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 md:p-8 text-left relative overflow-hidden shadow-xl font-[family-name:var(--font-jetbrains-mono)] ${className}`}
    >
      {/* Background ambient radial glows matching site palette */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[var(--accent-amber)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[var(--accent-emerald)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[var(--border)] text-xs">
        <div className="flex items-center flex-wrap gap-2 text-[var(--text-secondary)]">
          {/* Pulsing Emerald Live Indicator */}
          <span className="flex items-center gap-1.5 font-bold text-[var(--accent-emerald)] tracking-wider">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-emerald)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent-emerald)]" />
            </span>
            LIVE
          </span>
          <span className="text-[var(--border)]">·</span>
          <span className="text-[var(--text-primary)] uppercase tracking-wider text-[11px] sm:text-xs font-semibold">
            WHO&apos;S ON THE SITE RIGHT NOW
          </span>
          <span className="text-[var(--border)] hidden md:inline">·</span>
          <span className="text-[var(--text-muted)] hidden md:inline text-[11px]">
            PUBLIC, BECAUSE WHY NOT
          </span>
          <span className="text-[var(--border)] hidden md:inline">·</span>
          <Link
            href="/live"
            className="text-[var(--accent-amber)] hover:text-[var(--text-primary)] transition-colors underline-offset-4 hover:underline text-[11px] font-semibold flex items-center gap-1"
          >
            FULL DASHBOARD →
          </Link>
        </div>

        {/* Privacy Note */}
        <div className="text-[11px] text-[var(--text-muted)] sm:text-right tracking-tight font-[family-name:var(--font-inter)]">
          country-level only, nobody is identifiable
        </div>
      </div>

      {/* Main Grid: Globe Left, Live Telemetry Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center mt-6">
        {/* Left Column: Interactive 3D Dotted Earth */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <LiveGlobe markers={markers} />
          <div className="text-[10.5px] text-[var(--text-muted)] mt-1.5 text-center tracking-wide font-mono">
            drag to rotate globe
          </div>
        </div>

        {/* Right Column: Numbers, Live Activity Stream & 7D Countries */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {/* Big Active Counter */}
          <div className="flex items-baseline flex-wrap gap-3 mb-1">
            <span className="text-5xl sm:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight font-[family-name:var(--font-space-grotesk)]">
              {stats.activeNow}
            </span>
            <span className="text-base sm:text-lg text-[var(--text-secondary)] font-medium font-[family-name:var(--font-inter)]">
              people on the site right now
            </span>
          </div>

          {/* Subtitle Telemetry */}
          <div className="text-xs sm:text-sm text-[var(--text-muted)] mb-5 tracking-tight font-mono">
            from {stats.countriesCount} countries · {stats.totalVisits.toLocaleString()} visits since {stats.startDate}
          </div>

          {/* Real-Time Activity Feed */}
          <div className="space-y-2.5 py-4 border-t border-b border-[var(--border)]">
            {stats.recentActivity.slice(0, 4).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between text-xs sm:text-[13px] text-[var(--text-secondary)] font-mono hover:text-[var(--text-primary)] transition-colors gap-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-emerald)] shrink-0" />
                  <span className="font-bold text-[var(--accent-amber)] px-1.5 py-0.5 rounded bg-[var(--bg-surface-alt)] border border-[var(--border)] text-[10px]">
                    {activity.countryCode}
                  </span>
                  <span className="truncate">
                    someone in <span className="text-[var(--text-primary)] font-medium">{activity.countryName}</span> is reading{' '}
                    <span className="text-[var(--accent-amber)] font-semibold">{activity.path}</span>
                  </span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] shrink-0 font-mono">
                  {formatTimeAgo(activity.timestamp, currentNow)}
                </span>
              </div>
            ))}
          </div>

          {/* 7-Day Visitors By Country */}
          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2.5 font-bold">
              VISITORS · 7D · BY COUNTRY
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {stats.topCountries7D.slice(0, 5).map((country) => (
                <div
                  key={country.code}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border)] text-xs font-mono flex items-center gap-1.5 text-[var(--text-primary)] hover:border-[var(--accent-amber)]/40 transition-colors"
                >
                  <span className="font-bold text-[var(--accent-amber)]">{country.code}</span>
                  <span className="text-[var(--text-primary)] font-semibold">{country.code}</span>
                  <span className="text-[var(--text-muted)] text-[11px]">{country.count.toLocaleString()}</span>
                </div>
              ))}

              <Link
                href="/live"
                className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface-alt)]/60 border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent-amber)] hover:border-[var(--accent-amber)]/40 transition-colors"
              >
                + 95 more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
