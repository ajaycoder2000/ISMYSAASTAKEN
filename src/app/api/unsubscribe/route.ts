import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase/db';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token || typeof token !== 'string') {
    return new NextResponse(renderHtml({
      title: 'Invalid Unsubscribe Link',
      message: 'The unsubscribe link appears to be invalid or missing a token.',
      success: false,
    }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const result = await SupabaseDB.unsubscribeByToken(token);

  if (!result.success) {
    return new NextResponse(renderHtml({
      title: 'Token Not Found',
      message: 'We could not locate an active subscription for this token. You may already be unsubscribed.',
      success: false,
    }), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return new NextResponse(renderHtml({
    title: 'You Have Been Unsubscribed',
    message: result.email 
      ? `<strong>${escapeHtml(result.email)}</strong> has been removed from The Weekly SaaS Gap Report.`
      : 'You will no longer receive The Weekly SaaS Gap Report.',
    success: true,
  }), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — IsMySaaSTaken</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0c0e12;
      color: #ede8dc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #14171d;
      border: 1px solid #232730;
      border-radius: 16px;
      padding: 36px 32px;
      max-width: 460px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .tag {
      display: inline-block;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-weight: 700;
      color: ${success ? '#10b981' : '#f87171'};
      background: ${success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
      border: 1px solid ${success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 18px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #ede8dc;
      margin-bottom: 12px;
    }
    p {
      font-size: 13px;
      line-height: 1.6;
      color: #8c92a0;
      margin-bottom: 28px;
    }
    strong { color: #f5a623; }
    .btn {
      display: inline-block;
      width: 100%;
      padding: 12px 20px;
      background: #f5a623;
      color: #0c0e12;
      font-weight: 700;
      font-size: 13px;
      text-decoration: none;
      border-radius: 10px;
      transition: background 0.2s;
    }
    .btn:hover { background: #e09419; }
    .sublink {
      display: block;
      margin-top: 14px;
      font-size: 12px;
      color: #636b7b;
      text-decoration: none;
    }
    .sublink:hover { color: #8c92a0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="tag">${success ? 'PREFERENCES UPDATED' : 'NOTICE'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/" class="btn">Return to IsMySaaSTaken →</a>
    <a href="/#weekly-gaps" class="sublink">Changed your mind? Resubscribe anytime</a>
  </div>
</body>
</html>`;
}
