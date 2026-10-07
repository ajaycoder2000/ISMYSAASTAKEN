import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual, createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const given = req.nextUrl.searchParams.get('key') ?? '';
  const expected = process.env.PRELAUNCH_BYPASS_KEY ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  const ok = expected.length > 0 && a.length === b.length && timingSafeEqual(a, b);

  if (!ok) {
    return new NextResponse('Not found', { status: 404 });
  }

  const hash = createHash('sha256').update(`${expected}:prelaunch`).digest('hex');
  const isProd = process.env.NODE_ENV === 'production';

  const res = NextResponse.redirect(new URL('/', req.url), 307);

  // Secure HttpOnly bypass token verified in middleware
  res.cookies.set('prelaunch_access', hash, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Client-readable flag to display the preview pill banner without requiring server-side layout cookies
  res.cookies.set('prelaunch_preview', '1', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
