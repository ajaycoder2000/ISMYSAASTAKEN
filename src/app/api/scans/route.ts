import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { SupabaseDB } from '@/lib/supabase/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Sign in to view your scan history.' }, { status: 401 });
    }

    const scans = await SupabaseDB.getUserScans(session.userId);
    return NextResponse.json({ scans });
  } catch (error) {
    console.error('Scan history error:', error);
    return NextResponse.json({ error: 'Failed to load scan history.' }, { status: 500 });
  }
}
