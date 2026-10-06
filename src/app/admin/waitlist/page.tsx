'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface WaitlistStats {
  totalConfirmed: number;
  totalPending: number;
  totalUnsubscribed: number;
  signupsPerDay: { date: string; count: number }[];
  signupsByUtmContent: { content: string; count: number }[];
  topReferrers: { code: string; count: number }[];
}

export default function AdminWaitlistPage() {
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/waitlist');
      if (!res.ok) {
        throw new Error(`Failed to load waitlist stats: ${res.status}`);
      }
      const data = await res.json();
      if (data.ok && data.stats) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportCsv = () => {
    setExporting(true);
    window.location.href = '/api/admin/waitlist/export';
    setTimeout(() => setExporting(false), 2000);
  };

  const totalAll = (stats?.totalConfirmed || 0) + (stats?.totalPending || 0);
  const conversionRate =
    totalAll > 0 ? (((stats?.totalConfirmed || 0) / totalAll) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] tracking-tight">
            Launch Waitlist
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mt-1">
            Pre-launch subscribers, double opt-in confirmations, referral performance, and UTM attribution.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-xs font-medium font-[family-name:var(--font-inter)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-amber)] transition-colors cursor-pointer"
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting || (stats?.totalConfirmed || 0) === 0}
            className="px-4 py-2 rounded-xl bg-[var(--accent-amber)] text-[hsl(220,15%,8%)] text-xs font-bold font-[family-name:var(--font-space-grotesk)] hover:opacity-90 active:scale-95 transition-all shadow cursor-pointer disabled:opacity-50"
          >
            {exporting ? 'Preparing CSV...' : '📥 Export Confirmed (CSV)'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-dim)]">
            Confirmed (Opted-in)
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-mono)] text-emerald-400 mt-2">
            {stats ? stats.totalConfirmed.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-[var(--text-dim)] mt-1">Verified email click</div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-dim)]">
            Pending Confirmation
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-mono)] text-[var(--accent-amber)] mt-2">
            {stats ? stats.totalPending.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-[var(--text-dim)] mt-1">Awaiting confirmation email</div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-dim)]">
            Confirmation Rate
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-mono)] text-[var(--text-primary)] mt-2">
            {stats ? `${conversionRate}%` : '—'}
          </div>
          <div className="text-[11px] text-[var(--text-dim)] mt-1">Double opt-in conversion</div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-dim)]">
            Unsubscribed
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-mono)] text-[var(--text-muted)] mt-2">
            {stats ? stats.totalUnsubscribed.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-[var(--text-dim)] mt-1">Opted out</div>
        </div>
      </div>

      {/* Chart: Signups Per Day (Last 30 Days) */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
              Daily Signups (Last 30 Days)
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
              Tracking momentum and spike days across campaigns.
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          {stats?.signupsPerDay && stats.signupsPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.signupsPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface-alt)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                  itemStyle={{ color: 'var(--accent-amber)' }}
                />
                <Bar dataKey="count" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[var(--text-dim)] font-mono">
              No signups in the selected period yet.
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Breakdown: Top Referrers & Top UTM Campaign/Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Referrers */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
              Top Referrers
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
              Most active ambassadors by verified friend invites.
            </p>
          </div>

          <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
            {stats?.topReferrers && stats.topReferrers.length > 0 ? (
              stats.topReferrers.map((ref, idx) => (
                <div key={ref.code} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-[family-name:var(--font-mono)]">
                    <span className="w-5 text-[var(--text-dim)]">#{idx + 1}</span>
                    <span className="text-[var(--text-primary)] font-semibold">{ref.code}</span>
                  </div>
                  <span className="font-bold text-emerald-400 font-mono">
                    {ref.count} {ref.count === 1 ? 'friend' : 'friends'}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[var(--text-dim)] font-mono">
                No referrals yet.
              </div>
            )}
          </div>
        </div>

        {/* Campaign Breakdown (UTM Content) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
              Acquisition Attribution (utm_content)
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
              Signups grouped by X posts, campaigns, and sources.
            </p>
          </div>

          <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
            {stats?.signupsByUtmContent && stats.signupsByUtmContent.length > 0 ? (
              stats.signupsByUtmContent.map((utm, idx) => (
                <div key={utm.content} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] truncate max-w-[240px]">
                    <span className="w-5 text-[var(--text-dim)]">#{idx + 1}</span>
                    <span className="text-[var(--text-primary)] font-medium truncate" title={utm.content}>
                      {utm.content}
                    </span>
                  </div>
                  <span className="font-bold text-[var(--accent-amber)] font-mono shrink-0">
                    {utm.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[var(--text-dim)] font-mono">
                No tagged UTM signups yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
