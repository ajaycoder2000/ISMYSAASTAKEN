'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

type PeriodType = 'day' | 'week' | 'month';

interface AnalyticsData {
  period: PeriodType;
  chartData: Array<{
    period: string;
    dateLabel: string;
    idea_scanner: number;
    keyword_radar: number;
    is_it_taken: number;
    total: number;
  }>;
  summary: {
    totalToday: number;
    totalWeek: number;
    totalMonth: number;
    mostUsedTool: string;
    toolBreakdown: {
      idea_scanner: number;
      keyword_radar: number;
      is_it_taken: number;
    };
  };
}

const TOOL_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; badgeClass: string }
> = {
  idea_scanner: {
    label: 'Idea Scanner',
    icon: '💡',
    color: '#f59e0b', // amber-500
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  keyword_radar: {
    label: 'Keyword Radar',
    icon: '🎯',
    color: '#10b981', // emerald-500
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  is_it_taken: {
    label: 'Is It Taken?',
    icon: '🔍',
    color: '#06b6d4', // cyan-500
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodType>('day');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (selectedPeriod: PeriodType) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?period=${selectedPeriod}`);
      if (!res.ok) {
        throw new Error(`Failed to load analytics: HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.error || 'Failed to fetch analytics');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const mostUsedInfo = useMemo(() => {
    if (!data?.summary?.mostUsedTool) return TOOL_CONFIG.idea_scanner;
    return TOOL_CONFIG[data.summary.mostUsedTool] || TOOL_CONFIG.idea_scanner;
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (Number(entry.value) || 0), 0);
      return (
        <div className="bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,20%)] p-3 rounded-lg shadow-xl font-[family-name:var(--font-mono)] text-xs min-w-[200px]">
          <p className="font-bold text-[hsl(40,20%,92%)] border-b border-[hsl(220,10%,18%)] pb-1 mb-2">
            {label}
          </p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              const toolInfo = TOOL_CONFIG[entry.dataKey] || { label: entry.dataKey, icon: '•' };
              const val = Number(entry.value) || 0;
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return (
                <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[hsl(40,8%,70%)]">
                      {toolInfo.icon} {toolInfo.label}:
                    </span>
                  </div>
                  <span className="font-bold text-[hsl(40,20%,95%)]">
                    {val} <span className="text-[10px] text-[hsl(40,8%,50%)]">({pct}%)</span>
                  </span>
                </div>
              );
            })}
            <div className="pt-1.5 mt-1 border-t border-[hsl(220,10%,18%)] flex justify-between font-bold">
              <span className="text-[hsl(40,8%,50%)]">Total Scans:</span>
              <span className="text-[hsl(42,95%,55%)]">{total}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] tracking-tight flex items-center gap-2">
            <span>📈</span> Usage Analytics
          </h1>
          <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,55%)] mt-1">
            Real-time cross-tool scan volume and adoption breakdown over time.
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="flex items-center bg-[hsl(220,15%,9%)] p-1 rounded-lg border border-[hsl(220,10%,16%)]">
          {(['day', 'week', 'month'] as PeriodType[]).map((p) => {
            const isActive = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold font-[family-name:var(--font-mono)] rounded-md transition-all ${
                  isActive
                    ? 'bg-[hsl(42,95%,55%)] text-[hsl(220,15%,6%)] shadow-sm'
                    : 'text-[hsl(40,8%,60%)] hover:text-[hsl(40,20%,92%)] hover:bg-[hsl(220,10%,14%)]'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today */}
        <div className="p-4 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,14%)] relative overflow-hidden">
          <p className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,50%)]">
            Scans Today
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)]">
              {loading ? '—' : data?.summary?.totalToday ?? 0}
            </span>
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">runs</span>
          </div>
          <p className="mt-1 text-[11px] text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)]">
            Past 24 hours
          </p>
        </div>

        {/* This Week */}
        <div className="p-4 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,14%)] relative overflow-hidden">
          <p className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,50%)]">
            This Week
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-emerald-400">
              {loading ? '—' : data?.summary?.totalWeek ?? 0}
            </span>
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">runs</span>
          </div>
          <p className="mt-1 text-[11px] text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)]">
            Last 7 rolling days
          </p>
        </div>

        {/* This Month */}
        <div className="p-4 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,14%)] relative overflow-hidden">
          <p className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,50%)]">
            This Month
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-[hsl(42,95%,55%)]">
              {loading ? '—' : data?.summary?.totalMonth ?? 0}
            </span>
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">runs</span>
          </div>
          <p className="mt-1 text-[11px] text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)]">
            Last 30 rolling days
          </p>
        </div>

        {/* Most Used Tool */}
        <div className="p-4 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,14%)] relative overflow-hidden">
          <p className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,50%)]">
            Most-Used Tool
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl">{mostUsedInfo.icon}</span>
            <span className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] truncate">
              {loading ? '—' : mostUsedInfo.label}
            </span>
          </div>
          <div className="mt-1">
            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono border ${mostUsedInfo.badgeClass}`}>
              Leader in volume
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="p-5 sm:p-6 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,14%)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[hsl(220,10%,14%)] mb-6 gap-3">
          <div>
            <h2 className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] flex items-center gap-2">
              <span>📊</span> Scan Volume Timeline
            </h2>
            <p className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] mt-0.5">
              Aggregated by {period === 'day' ? 'day' : period === 'week' ? 'week' : 'month'} with stacked tool breakdown
            </p>
          </div>

          {/* Legend indicator */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-[family-name:var(--font-mono)]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
              <span className="text-[hsl(40,8%,70%)]">Idea Scanner</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
              <span className="text-[hsl(40,8%,70%)]">Keyword Radar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4]" />
              <span className="text-[hsl(40,8%,70%)]">Is It Taken?</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-[340px] flex flex-col items-center justify-center gap-2 text-[hsl(40,8%,50%)] font-mono text-xs">
            <div className="w-6 h-6 border-2 border-[hsl(42,95%,55%)] border-t-transparent rounded-full animate-spin" />
            <span>Loading timeline data...</span>
          </div>
        ) : !data?.chartData || data.chartData.length === 0 ? (
          <div className="h-[340px] flex flex-col items-center justify-center gap-3 text-center p-6 border border-dashed border-[hsl(220,10%,18%)] rounded-lg">
            <span className="text-3xl">📭</span>
            <p className="text-sm font-bold text-[hsl(40,20%,90%)] font-[family-name:var(--font-space-grotesk)]">
              No Scan Events Logged Yet
            </p>
            <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-mono)] max-w-md">
              Scan events will automatically appear here as users validate ideas on Idea Scanner, run Keyword Radar searches, or test domains with Is It Taken.
            </p>
          </div>
        ) : (
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 14%)" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  stroke="hsl(40, 8%, 45%)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(220, 10%, 18%)' }}
                />
                <YAxis
                  stroke="hsl(40, 8%, 45%)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(220, 10%, 18%)' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="idea_scanner"
                  name="Idea Scanner"
                  stackId="scans"
                  fill="#f59e0b"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="keyword_radar"
                  name="Keyword Radar"
                  stackId="scans"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="is_it_taken"
                  name="Is It Taken?"
                  stackId="scans"
                  fill="#06b6d4"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Breakdown Summary Table */}
      {data && data.chartData.length > 0 && (
        <div className="p-5 sm:p-6 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,14%)]">
          <h3 className="text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-mono)] text-[hsl(40,8%,60%)] mb-4">
            Detailed Timeframe Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-[family-name:var(--font-mono)]">
              <thead>
                <tr className="border-b border-[hsl(220,10%,16%)] text-[hsl(40,8%,50%)]">
                  <th className="pb-2">Period</th>
                  <th className="pb-2 text-right">💡 Idea Scanner</th>
                  <th className="pb-2 text-right">🎯 Keyword Radar</th>
                  <th className="pb-2 text-right">🔍 Is It Taken</th>
                  <th className="pb-2 text-right font-bold text-[hsl(40,20%,90%)]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(220,10%,12%)]">
                {[...data.chartData].reverse().slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-[hsl(220,10%,11%)] transition-colors">
                    <td className="py-2.5 font-semibold text-[hsl(40,20%,90%)]">{row.dateLabel}</td>
                    <td className="py-2.5 text-right text-amber-400">{row.idea_scanner}</td>
                    <td className="py-2.5 text-right text-emerald-400">{row.keyword_radar}</td>
                    <td className="py-2.5 text-right text-cyan-400">{row.is_it_taken}</td>
                    <td className="py-2.5 text-right font-bold text-[hsl(42,95%,55%)]">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
