import { NextRequest, NextResponse } from 'next/server';
import { WaitlistDB } from '@/lib/waitlistDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token || typeof token !== 'string') {
    return new NextResponse(renderHtml({
      title: 'Invalid Unsubscribe Link',
      message: 'The link appears to be invalid or missing a token.',
      success: false,
    }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  try {
    const result = await WaitlistDB.unsubscribe(token.trim());

    if (!result.success) {
      return new NextResponse(renderHtml({
        title: 'Unsubscribe Link Expired',
        message: 'We could not locate this subscription token. You may already be unsubscribed.',
        success: false,
      }), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new NextResponse(renderHtml({
      title: 'You Have Been Unsubscribed',
      message: 'You have been removed from the waitlist updates. You will not receive any further launch emails.',
      success: true,
    }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err: any) {
    console.error('[WaitlistUnsubscribe] Error:', err);
    return new NextResponse(renderHtml({
      title: 'Error',
      message: 'An error occurred while processing your request.',
      success: false,
    }), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

function renderHtml({
  title,
  message,
  success,
}: {
  title: string;
  message: string;
  success: boolean;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Is My SaaS Taken?</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0c0e12;
      color: #ede8dc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .card {
      max-width: 440px;
      margin: 20px;
      padding: 36px 30px;
      background-color: #14171f;
      border: 1px solid #232731;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .icon {
      font-size: 36px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 12px;
      color: ${success ? '#34d399' : '#f87171'};
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #a1a1aa;
      margin: 0 0 24px;
    }
    a.btn {
      display: inline-block;
      padding: 10px 22px;
      background-color: #232731;
      color: #ede8dc;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid #323846;
      transition: all 0.2s;
    }
    a.btn:hover {
      background-color: #2d3340;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✓' : '⚠️'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/" class="btn">Return to Is My SaaS Taken? &rarr;</a>
  </div>
</body>
</html>`.trim();
}
