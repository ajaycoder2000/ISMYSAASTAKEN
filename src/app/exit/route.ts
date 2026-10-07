import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/', req.url), 307);
  res.cookies.delete('prelaunch_access');
  res.cookies.delete('prelaunch_preview');
  return res;
}
