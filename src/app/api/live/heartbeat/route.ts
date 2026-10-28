import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordHeartbeat } from '@/lib/live-presence';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body?.path === 'string' ? body.path : '/';

    // 1. Extract Geolocation from Vercel Edge Headers
    const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || undefined;
    const rawLat = req.headers.get('x-vercel-ip-latitude');
    const rawLng = req.headers.get('x-vercel-ip-longitude');

    const lat = rawLat ? parseFloat(rawLat) : undefined;
    const lng = rawLng ? parseFloat(rawLng) : undefined;

    // 2. Anonymously hash IP + User-Agent for privacy (no raw IP stored)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const dayBucket = new Date().toISOString().slice(0, 10);
    const sessionId = crypto
      .createHash('sha256')
      .update(`${clientIp}-${userAgent}-${dayBucket}`)
      .digest('hex')
      .substring(0, 16);

    // 3. Record session in live presence store
    recordHeartbeat({
      sessionId,
      countryCode: country,
      lat,
      lng,
      path,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
