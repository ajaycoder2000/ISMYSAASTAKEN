import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SupabaseDB } from '@/lib/supabase/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in to view your scan history.' }, { status: 401 });
    }

    const scans = await SupabaseDB.getUserScans(userId);
    return NextResponse.json({ scans });
  } catch (error) {
    console.error('Scan history error:', error);
    return NextResponse.json({ error: 'Failed to load scan history.' }, { status: 500 });
  }
}
