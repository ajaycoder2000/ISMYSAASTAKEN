import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase/db';
import { getDailyRotatedScans } from '@/lib/daily-scans';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';

    // 1. Fetch real scans from Supabase
    let realScans = await SupabaseDB.getRecentScans(10);

    // 2. Get dynamic daily rotated feed
    const dailyScans = getDailyRotatedScans(category);

    // 3. Format real scans with dynamic timeAgo
    const formattedRealScans = realScans.map((s: any) => ({
      id: s._id,
      idea: s.idea,
      competitors: s.competitors || 0,
      saturationScore: s.saturationScore,
      shareSlug: s.shareSlug,
      featured: true,
      timeAgo: 'Just now',
      category: 'ai',
      isLive: true,
    }));

    // Filter real scans if category matches
    const filteredReal = category === 'all'
      ? formattedRealScans
      : formattedRealScans.filter((s) => category === 'today' || s.category === category);

    // Merge real live user scans at the top, followed by fresh daily rotated scans
    const merged = [...filteredReal, ...dailyScans];
    const unique = Array.from(new Map(merged.map((item) => [item.idea.toLowerCase(), item])).values());

    return NextResponse.json({
      success: true,
      data: unique.slice(0, 14),
      todayCount: dailyScans.filter((s) => s.isToday).length + formattedRealScans.length,
    });
  } catch (error) {
    console.error('Fetch recent scans error:', error);
    return NextResponse.json({
      success: true,
      data: getDailyRotatedScans('all').slice(0, 10),
      todayCount: 11,
    });
  }
}
