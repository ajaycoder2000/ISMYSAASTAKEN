import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate the Cron request
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    const isAuthorized =
      (cronSecret && (authHeader === `Bearer ${cronSecret}` || authHeader === cronSecret)) ||
      (!cronSecret && process.env.NODE_ENV !== 'production');

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing CRON_SECRET authorization.' },
        { status: 401 }
      );
    }

    // 2. Query top 5 gaps from the last 7 days
    const gaps = await SupabaseDB.getWeeklyGaps();

    // 3. Fetch all active subscribers
    const subscribers = await SupabaseDB.getActiveSubscribers();

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscribers to email.',
        subscribersCount: 0,
        gapsCount: gaps.length,
      });
    }

    // 4. Prepare Resend API configuration
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'IsMySaaSTaken <onboarding@resend.dev>';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ismysaastaken.vercel.app';

    // If Resend API key is not configured (e.g. local dev / test), log and return success
    if (!resendApiKey) {
      console.log('====================================================');
      console.log('WEEKLY SAAS GAP REPORT (Simulated Mode - No RESEND_API_KEY)');
      console.log(`Subscribers (${subscribers.length}):`, subscribers.map((s) => s.email));
      console.log(`Gaps (${gaps.length}):`, gaps.map((g) => g.idea_text));
      console.log('====================================================');

      return NextResponse.json({
        success: true,
        mode: 'simulated_dev',
        message: `Simulated weekly report send for ${subscribers.length} subscribers. Configure RESEND_API_KEY in production to dispatch live emails.`,
        subscribersCount: subscribers.length,
        gapsCount: gaps.length,
        gapsSample: gaps.slice(0, 2),
      });
    }

    // 5. Build personalized email payloads with unique unsubscribe tokens
    const emailPayloads = subscribers.map((subscriber) => {
      const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${subscriber.unsubscribe_token}`;
      const emailHtml = generateWeeklyReportEmailHtml({
        gaps,
        siteUrl,
        unsubscribeUrl,
      });

      return {
        from: fromEmail,
        to: subscriber.email,
        subject: `📡 The Weekly SaaS Gap Report: 5 Defensible Wedges`,
        html: emailHtml,
      };
    });

    // 6. Send in batches of 50 via Resend Batch API
    const BATCH_SIZE = 50;
    const batchResults = [];

    for (let i = 0; i < emailPayloads.length; i += BATCH_SIZE) {
      const chunk = emailPayloads.slice(i, i + BATCH_SIZE);

      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(chunk),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Resend batch API error (${res.status}):`, errText);

        // Fallback for unverified custom domains: retry with onboarding@resend.dev
        if (errText.includes('domain is not verified') || errText.includes('from_email')) {
          const fallbackChunk = chunk.map((item) => ({
            ...item,
            from: 'IsMySaaSTaken <onboarding@resend.dev>',
          }));

          const fallbackRes = await fetch('https://api.resend.com/emails/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify(fallbackChunk),
          });

          const fallbackData = await fallbackRes.json().catch(() => null);
          batchResults.push(fallbackData);
          continue;
        }
      }

      const data = await res.json().catch(() => null);
      batchResults.push(data);
    }

    return NextResponse.json({
      success: true,
      sentCount: emailPayloads.length,
      gapsCount: gaps.length,
      batchResults,
    });
  } catch (error) {
    console.error('Weekly report cron error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Cron Error' },
      { status: 500 }
    );
  }
}

/**
 * Generate dark-themed, responsive HTML matching the site's design tokens
 */
function generateWeeklyReportEmailHtml({
  gaps,
  siteUrl,
  unsubscribeUrl,
}: {
  gaps: Array<{
    id: string;
    idea_text: string;
    category: string;
    tag: 'open_gap' | 'low_moat' | 'underserved';
    gap_analysis?: string;
  }>;
  siteUrl: string;
  unsubscribeUrl: string;
}): string {
  const getBadgeStyle = (tag: string) => {
    switch (tag) {
      case 'open_gap':
        return {
          label: 'OPEN GAP',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
        };
      case 'low_moat':
        return {
          label: 'LOW MOAT',
          color: '#f5a623',
          bg: 'rgba(245, 166, 35, 0.12)',
          border: 'rgba(245, 166, 35, 0.3)',
        };
      case 'underserved':
      default:
        return {
          label: 'UNDERSERVED',
          color: '#b967ff',
          bg: 'rgba(185, 103, 255, 0.12)',
          border: 'rgba(185, 103, 255, 0.3)',
        };
    }
  };

  const gapCardsHtml = gaps
    .map((gap, index) => {
      const badge = getBadgeStyle(gap.tag);
      return `
      <div style="background-color: #12151b; border: 1px solid #232731; border-radius: 12px; padding: 18px 20px; margin-bottom: 14px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="middle" align="left">
              <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; font-size: 10px; font-weight: 700; color: #788090; text-transform: uppercase; letter-spacing: 0.15em;">
                #0${index + 1} • ${escapeHtml(gap.category)}
              </span>
            </td>
            <td valign="middle" align="right">
              <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; font-size: 9px; font-weight: 700; color: ${badge.color}; background-color: ${badge.bg}; border: 1px solid ${badge.border}; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.05em; display: inline-block;">
                ${badge.label}
              </span>
            </td>
          </tr>
        </table>
        <h3 style="margin: 10px 0 6px 0; font-size: 15px; font-weight: 700; color: #ede8dc; line-height: 1.4;">
          &ldquo;${escapeHtml(gap.idea_text)}&rdquo;
        </h3>
        ${
          gap.gap_analysis
            ? `<p style="margin: 0; font-size: 12px; color: #9aa1b1; line-height: 1.55;">${escapeHtml(gap.gap_analysis)}</p>`
            : ''
        }
      </div>
    `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Weekly SaaS Gap Report</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0c0e12; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
  </style>
</head>
<body style="background-color: #0c0e12; margin: 0; padding: 32px 16px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <div style="max-width: 560px; width: 100%; text-align: left;">
          
          <!-- Header -->
          <div style="padding-bottom: 24px; border-bottom: 1px solid #1f232b; margin-bottom: 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; font-size: 10px; font-weight: 700; color: #f5a623; text-transform: uppercase; letter-spacing: 0.2em;">
                    📡 FOUNDER MARKET INTELLIGENCE
                  </span>
                  <h1 style="margin: 8px 0 6px 0; font-size: 24px; font-weight: 800; color: #ede8dc; letter-spacing: -0.02em;">
                    The Weekly SaaS Gap Report
                  </h1>
                  <p style="margin: 0; font-size: 13px; color: #8c92a0; line-height: 1.6;">
                    Here are the top 5 defensible software wedges and underserved market spaces discovered by live scanner runs this week.
                  </p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Gap Cards -->
          <div style="margin-bottom: 28px;">
            ${gapCardsHtml}
          </div>

          <!-- CTA Box -->
          <div style="background: linear-gradient(180deg, #161920 0%, #101217 100%); border: 1px solid #232731; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <h4 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #ede8dc;">
              Have an idea you want to validate?
            </h4>
            <p style="margin: 0 0 16px 0; font-size: 12px; color: #8c92a0;">
              Run a live web-grounded competitor crawl in 5 seconds.
            </p>
            <a href="${siteUrl}" style="display: inline-block; background-color: #f5a623; color: #0c0e12; font-weight: 700; font-size: 13px; text-decoration: none; padding: 11px 24px; border-radius: 8px;">
              Scan your SaaS idea free →
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #1f232b; padding-top: 20px; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #5a606e; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
              Sent every Monday morning by IsMySaaSTaken
            </p>
            <p style="margin: 0; font-size: 11px; color: #5a606e;">
              <a href="${unsubscribeUrl}" style="color: #8c92a0; text-decoration: underline;">Unsubscribe</a> with one click at any time.
            </p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
