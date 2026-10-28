import { NextResponse } from 'next/server';
import { getLivePresenceStats } from '@/lib/live-presence';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const stats = getLivePresenceStats();
    return NextResponse.json(
      {
        success: true,
        ...stats,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
