import { NextRequest, NextResponse } from 'next/server';
import { WaitlistDB } from '@/lib/waitlistDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ confirmedFriends: 0 });
  }

  try {
    const cleanCode = code.trim();
    const count = await WaitlistDB.countConfirmedFriends(cleanCode);
    return NextResponse.json({ confirmedFriends: count });
  } catch (err: any) {
    console.error('[WaitlistProgress] Error counting referrals:', err);
    return NextResponse.json({ confirmedFriends: 0 });
  }
}
