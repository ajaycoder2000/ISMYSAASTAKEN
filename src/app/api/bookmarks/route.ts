import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { SupabaseDB } from '@/lib/supabase/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Sign in to bookmark ideas' }, { status: 401 });
    }

    const { scanId } = await req.json();
    if (!scanId) {
      return NextResponse.json({ error: 'Missing scanId' }, { status: 400 });
    }

    const result = await SupabaseDB.toggleBookmark(session.userId, scanId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Bookmark error:', error);
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}
