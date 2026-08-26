import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareSlug: string }> }
) {
  const { shareSlug } = await params;
  const targetUrl = new URL(`/scan/${shareSlug}`, request.url);
  return NextResponse.redirect(targetUrl, 307);
}
