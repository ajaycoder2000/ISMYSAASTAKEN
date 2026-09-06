import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { DevStore } from '@/lib/dev-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Strict server-side admin check
  const adminAuth = await verifyAdminAccess();
  if (!adminAuth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized — Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const periodParam = searchParams.get('period') ?? 'day';
  const truncUnit: 'day' | 'week' | 'month' =
    periodParam === 'month' ? 'month' : periodParam === 'week' ? 'week' : 'day';

  const supabase = getSupabaseAdmin();

  let rawCounts: Array<{ period: string; tool: string; scan_count: number }> = [];
  let summary = {
    totalToday: 0,
    totalWeek: 0,
    totalMonth: 0,
    mostUsedTool: 'idea_scanner',
    toolBreakdown: {
      idea_scanner: 0,
      keyword_radar: 0,
      is_it_taken: 0,
    },
  };

  if (supabase) {
    try {
      // 2. Try Supabase RPC
      const { data, error } = await supabase.rpc('scan_counts_by_period', { trunc_unit: truncUnit });

      if (!error && Array.isArray(data)) {
        rawCounts = data.map((row: any) => ({
          period: typeof row.period === 'string' ? row.period : new Date(row.period).toISOString(),
          tool: String(row.tool),
          scan_count: Number(row.scan_count || 0),
        }));
      }

      // Compute summary metrics from last 30 days of events
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentEvents, error: recentErr } = await supabase
        .from('scan_events')
        .select('created_at, tool')
        .gte('created_at', thirtyDaysAgo);

      if (!recentErr && recentEvents) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        recentEvents.forEach((ev: any) => {
          const d = new Date(ev.created_at);
          const tool = ev.tool as 'idea_scanner' | 'keyword_radar' | 'is_it_taken';

          summary.totalMonth++;
          if (d >= sevenDaysAgo) summary.totalWeek++;
          if (d >= startOfToday) summary.totalToday++;

          if (summary.toolBreakdown[tool] !== undefined) {
            summary.toolBreakdown[tool]++;
          }
        });

        // Determine most used tool
        let maxCount = -1;
        (Object.keys(summary.toolBreakdown) as Array<keyof typeof summary.toolBreakdown>).forEach((t) => {
          if (summary.toolBreakdown[t] > maxCount) {
            maxCount = summary.toolBreakdown[t];
            summary.mostUsedTool = t;
          }
        });
      }
    } catch (err) {
      console.warn('Analytics Supabase query error, falling back to DevStore:', err);
    }
  }

  // 3. Fallback to DevStore if empty or offline
  if (rawCounts.length === 0) {
    rawCounts = DevStore.getScanCountsByPeriod(truncUnit);
    const devSummary = DevStore.getScanAnalyticsSummary();
    summary.totalToday = devSummary.totalToday;
    summary.totalWeek = devSummary.totalWeek;
    summary.totalMonth = devSummary.totalMonth;
    summary.mostUsedTool = devSummary.mostUsedTool;

    // Populate dev breakdown
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const events = DevStore.getScanEvents(thirtyDaysAgo);
    events.forEach((e) => {
      if (summary.toolBreakdown[e.tool] !== undefined) {
        summary.toolBreakdown[e.tool]++;
      }
    });
  }

  // 4. Format series data for Recharts (group by period, ascending chronological order)
  const periodMap = new Map<
    string,
    { period: string; dateLabel: string; idea_scanner: number; keyword_radar: number; is_it_taken: number; total: number }
  >();

  rawCounts.forEach((item) => {
    const periodIso = item.period;
    const dateObj = new Date(periodIso);

    let dateLabel = '';
    if (truncUnit === 'month') {
      dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (truncUnit === 'week') {
      dateLabel = `Wk of ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (!periodMap.has(periodIso)) {
      periodMap.set(periodIso, {
        period: periodIso,
        dateLabel,
        idea_scanner: 0,
        keyword_radar: 0,
        is_it_taken: 0,
        total: 0,
      });
    }

    const entry = periodMap.get(periodIso)!;
    const count = Number(item.scan_count || 0);

    if (item.tool === 'idea_scanner') entry.idea_scanner += count;
    else if (item.tool === 'keyword_radar') entry.keyword_radar += count;
    else if (item.tool === 'is_it_taken') entry.is_it_taken += count;

    entry.total += count;
  });

  // Sort chronologically ascending for chart left-to-right display
  const chartData = Array.from(periodMap.values()).sort(
    (a, b) => new Date(a.period).getTime() - new Date(b.period).getTime()
  );

  return NextResponse.json({
    success: true,
    period: truncUnit,
    chartData,
    rawCounts,
    summary,
  });
}
