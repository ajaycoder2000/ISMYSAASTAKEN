'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ScanningIndicator from '@/components/ScanningIndicator';

interface DashboardStats {
  scans: {
    total: number;
    today: number;
    last7d: number;
    last30d: number;
  };
  users: {
    total: number;
    pro: number;
    free: number;
    suspended: number;
  };
  sponsors: {
    active: number;
    total: number;
  };
  financials: {
    currentMRR: number;
    proPriceMonthly: number;
    estimatedCostPerScan: number;
    estimatedSpendMonth: string;
    estimatedSpendTotal: string;
  };
  recentLogs: Array<{
    _id: string;
    adminEmail: string;
    action: string;
    targetId?: string;
    targetType?: string;
    note?: string;
    timestamp: string;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setStats(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <ScanningIndicator size="lg" className="mb-3" />
        <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">Loading admin metrics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-[hsl(0,72%,60%)] font-[family-name:var(--font-inter)]">
          Failed to load dashboard metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[hsl(220,10%,14%)]">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] tracking-tight">
            Admin Overview
          </h1>
          <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] mt-0.5">
            Real-time telemetry, scans velocity, user billing, and API costs.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="self-start sm:self-auto text-xs font-[family-name:var(--font-mono)] px-3 py-1.5 rounded bg-[hsl(220,10%,14%)] hover:bg-[hsl(220,10%,20%)] text-[hsl(40,20%,90%)] transition-colors"
        >
          Refresh Data ↻
        </button>
      </div>

      {/* Metrics Row 1: Core KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans Card */}
        <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-4 sm:p-5">
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
            Total Scans All-Time
          </span>
          <p className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
            {stats.scans.total.toLocaleString()}
          </p>
          <div className="mt-2.5 pt-2 border-t border-[hsl(220,10%,16%)] flex items-center justify-between text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,55%)]">
            <span>Today: +{stats.scans.today}</span>
            <span>7d: +{stats.scans.last7d}</span>
          </div>
        </div>

        {/* Current MRR */}
        <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-4 sm:p-5">
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
            Current MRR
          </span>
          <p className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(42,95%,55%)]">
            ${stats.financials.currentMRR.toLocaleString()}
          </p>
          <div className="mt-2.5 pt-2 border-t border-[hsl(220,10%,16%)] flex items-center justify-between text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,55%)]">
            <span>{stats.users.pro} Pro subscribers</span>
            <span>${stats.financials.proPriceMonthly}/mo</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-4 sm:p-5">
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
            Registered Users
          </span>
          <p className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
            {stats.users.total.toLocaleString()}
          </p>
          <div className="mt-2.5 pt-2 border-t border-[hsl(220,10%,16%)] flex items-center justify-between text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,55%)]">
            <span>{stats.users.free} Free</span>
            <span className="text-[hsl(42,95%,55%)]">{stats.users.pro} Pro</span>
          </div>
        </div>

        {/* Estimated LLM API Spend */}
        <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-4 sm:p-5">
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
            Est. LLM Spend (30d)
          </span>
          <p className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
            ${stats.financials.estimatedSpendMonth}
          </p>
          <div className="mt-2.5 pt-2 border-t border-[hsl(220,10%,16%)] flex items-center justify-between text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,55%)]">
            <span>All-time: ~${stats.financials.estimatedSpendTotal}</span>
            <span>${stats.financials.estimatedCostPerScan}/scan</span>
          </div>
        </div>
      </div>

      {/* Metrics Row 2: Secondary Quick Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[hsl(220,12%,10%)] border border-[hsl(220,10%,16%)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
              Sponsor Slots Status
            </span>
            <Link href="/admin/sponsors" className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] hover:underline">
              Manage →
            </Link>
          </div>
          <p className="text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)]">
            <span className="text-lg font-bold text-[hsl(40,20%,92%)] font-[family-name:var(--font-mono)]">{stats.sponsors.active}</span> active sponsors currently rotating in rails & feed ({stats.sponsors.total} total registered).
          </p>
        </div>

        <div className="bg-[hsl(220,12%,10%)] border border-[hsl(220,10%,16%)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
              Scans Velocity
            </span>
            <Link href="/admin/scans" className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] hover:underline">
              View Feed →
            </Link>
          </div>
          <p className="text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)]">
            <span className="text-lg font-bold text-[hsl(40,20%,92%)] font-[family-name:var(--font-mono)]">{stats.scans.last30d}</span> ideas processed in the last 30 days. Avg {Math.round(stats.scans.last30d / 30)} scans/day.
          </p>
        </div>

        <div className="bg-[hsl(220,12%,10%)] border border-[hsl(220,10%,16%)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
              Account Security
            </span>
            <Link href="/admin/users" className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] hover:underline">
              Directory →
            </Link>
          </div>
          <p className="text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)]">
            <span className="text-lg font-bold text-[hsl(40,20%,92%)] font-[family-name:var(--font-mono)]">{stats.users.suspended}</span> suspended accounts blocked from API scan consumption.
          </p>
        </div>
      </div>

      {/* Admin Audit Trail */}
      <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
              Recent Admin Activity Log
            </h3>
            <p className="text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)] mt-0.5">
              Immutable record of all configuration changes, plan overrides, and deletions.
            </p>
          </div>
        </div>

        {stats.recentLogs.length === 0 ? (
          <p className="text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-mono)] py-4 text-center">
            No admin actions logged yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-[family-name:var(--font-inter)]">
              <thead>
                <tr className="border-b border-[hsl(220,10%,18%)] text-[hsl(40,8%,45%)] font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider">
                  <th className="pb-2 font-medium">Timestamp</th>
                  <th className="pb-2 font-medium">Admin</th>
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">Note / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(220,10%,16%)]">
                {stats.recentLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[hsl(220,10%,14%)]">
                    <td className="py-2.5 font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 text-[hsl(40,20%,85%)]">{log.adminEmail}</td>
                    <td className="py-2.5 font-[family-name:var(--font-mono)] font-semibold text-[hsl(42,95%,55%)]">
                      {log.action}
                    </td>
                    <td className="py-2.5 text-[hsl(40,8%,60%)] max-w-xs truncate">{log.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
