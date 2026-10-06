import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { WaitlistDB } from '@/lib/waitlistDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const stats = await WaitlistDB.getStats();
    return NextResponse.json({ ok: true, stats });
  } catch (err: any) {
    console.error('[AdminWaitlist] Error fetching waitlist stats:', err);
    return NextResponse.json({ error: 'Failed to fetch waitlist stats' }, { status: 500 });
  }
}
