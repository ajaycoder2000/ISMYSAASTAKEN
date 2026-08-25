import { NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase/db';

export async function GET() {
  try {
    const scans = await SupabaseDB.getRecentScans(10);
    return NextResponse.json({ success: true, data: scans });
  } catch (error) {
    console.error('Fetch recent scans error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
