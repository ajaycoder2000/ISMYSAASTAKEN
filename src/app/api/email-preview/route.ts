import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase/db';
import { renderCustomWeeklyReportTemplate, extractUserName } from '@/lib/email-template';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const plan = (searchParams.get('plan') || 'free') as 'free' | 'sprint' | 'pro';
    const email = searchParams.get('email') || 'founder@example.com';
    const name = searchParams.get('name') || extractUserName(email);

    // Fetch real weekly gaps
    const gaps = await SupabaseDB.getWeeklyGaps();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ismysaastaken.vercel.app';
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=preview-test-token`;

    // Dynamic issue number
    const launchDate = new Date('2026-08-01').getTime();
    const currentWeekDiff = Math.floor((Date.now() - launchDate) / (7 * 24 * 60 * 60 * 1000));
    const issueNumber = Math.max(1, currentWeekDiff + 1);

    const emailHtml = renderCustomWeeklyReportTemplate({
      gaps,
      subscriber: {
        id: 'preview_sub',
        email,
        name,
        plan,
        unsubscribe_token: 'preview-test-token',
      },
      issueNumber,
      siteUrl,
      unsubscribeUrl,
    });

    // Inject an interactive floating test-toolbar for in-browser testing
    const interactiveBanner = `
      <div id="email-preview-bar" style="position: fixed; top: 0; left: 0; right: 0; z-index: 999999; background: #161922; border-bottom: 1px solid #292e3d; color: #ede8dc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; padding: 10px 16px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 11px; font-weight: 700; color: #f5a623; letter-spacing: 1px; text-transform: uppercase;">📡 Email Preview Mode</span>
          <span style="font-size: 11px; color: #788090;">• Plan:</span>
          <div style="display: inline-flex; background: #0c0e12; border: 1px solid #232731; border-radius: 6px; padding: 2px;">
            <a href="?plan=free" style="font-size: 11px; padding: 3px 8px; border-radius: 4px; text-decoration: none; color: ${plan === 'free' ? '#f5a623' : '#788090'}; font-weight: ${plan === 'free' ? '700' : '500'}; background: ${plan === 'free' ? 'rgba(245,166,35,0.15)' : 'transparent'};">Free</a>
            <a href="?plan=sprint" style="font-size: 11px; padding: 3px 8px; border-radius: 4px; text-decoration: none; color: ${plan === 'sprint' ? '#f5a623' : '#788090'}; font-weight: ${plan === 'sprint' ? '700' : '500'}; background: ${plan === 'sprint' ? 'rgba(245,166,35,0.15)' : 'transparent'};">Sprint</a>
            <a href="?plan=pro" style="font-size: 11px; padding: 3px 8px; border-radius: 4px; text-decoration: none; color: ${plan === 'pro' ? '#10b981' : '#788090'}; font-weight: ${plan === 'pro' ? '700' : '500'}; background: ${plan === 'pro' ? 'rgba(16,185,129,0.15)' : 'transparent'};">Founder Pro</a>
          </div>
        </div>

        <form id="test-send-form" onsubmit="handleSendTest(event)" style="display: flex; align-items: center; gap: 6px; margin: 0;">
          <input id="test-email-input" type="email" required placeholder="Enter your email to test" style="background: #0c0e12; border: 1px solid #2e3444; border-radius: 6px; color: #ede8dc; font-size: 11px; padding: 6px 10px; width: 220px; outline: none;" />
          <button id="test-send-btn" type="submit" style="background: #10b981; color: #0c0e12; font-weight: 700; font-size: 11px; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer; transition: opacity 0.2s;">Send Test Email →</button>
          <span id="test-status" style="font-size: 11px; margin-left: 6px;"></span>
        </form>
      </div>

      <script>
        async function handleSendTest(e) {
          e.preventDefault();
          const email = document.getElementById('test-email-input').value.trim();
          const btn = document.getElementById('test-send-btn');
          const status = document.getElementById('test-status');
          if (!email) return;

          btn.disabled = true;
          btn.textContent = 'Sending...';
          status.textContent = '';

          try {
            const res = await fetch('/api/email-preview', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email, plan: '${plan}' }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
              status.style.color = '#10b981';
              status.textContent = '✓ Sent! Check your inbox.';
            } else {
              status.style.color = '#f87171';
              status.textContent = '✗ ' + (data.error || 'Failed to send');
            }
          } catch (err) {
            status.style.color = '#f87171';
            status.textContent = '✗ Network error';
          } finally {
            btn.disabled = false;
            btn.textContent = 'Send Test Email →';
          }
        }
      </script>
      <div style="height: 52px;"></div>
    `;

    const htmlWithToolbar = emailHtml.replace('<body>', '<body>' + interactiveBanner);

    return new NextResponse(htmlWithToolbar, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Email preview error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal preview error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const plan = (typeof body.plan === 'string' ? body.plan : 'free') as 'free' | 'sprint' | 'pro';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({
        error: 'RESEND_API_KEY is not configured in Vercel. Please add it in project settings.',
      }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ismysaastaken.vercel.app';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'IsMySaaSTaken <onboarding@resend.dev>';
    const gaps = await SupabaseDB.getWeeklyGaps();

    const launchDate = new Date('2026-08-01').getTime();
    const currentWeekDiff = Math.floor((Date.now() - launchDate) / (7 * 24 * 60 * 60 * 1000));
    const issueNumber = Math.max(1, currentWeekDiff + 1);

    const emailHtml = renderCustomWeeklyReportTemplate({
      gaps,
      subscriber: {
        id: 'test_subscriber',
        email,
        name: extractUserName(email),
        plan,
        unsubscribe_token: 'test-token',
      },
      issueNumber,
      siteUrl,
      unsubscribeUrl: `${siteUrl}/api/unsubscribe?token=test-token`,
    });

    // Send single email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: `[TEST] 📡 The Weekly SaaS Gap Report: 5 Defensible Wedges (Issue #${issueNumber})`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend test send error:', errText);

      // Retry with onboarding@resend.dev if custom domain is not yet verified
      if (errText.includes('domain is not verified') || errText.includes('from_email')) {
        const fallbackRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'IsMySaaSTaken <onboarding@resend.dev>',
            to: email,
            subject: `[TEST] 📡 The Weekly SaaS Gap Report: 5 Defensible Wedges (Issue #${issueNumber})`,
            html: emailHtml,
          }),
        });

        if (fallbackRes.ok) {
          return NextResponse.json({
            success: true,
            message: `Test email sent to ${email} using onboarding@resend.dev!`,
          });
        }
      }

      return NextResponse.json({ error: `Resend error: ${errText}` }, { status: 500 });
    }

    const data = await res.json().catch(() => null);
    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${email}!`,
      resendId: data?.id,
    });
  } catch (error) {
    console.error('Test email POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal send error' },
      { status: 500 }
    );
  }
}
