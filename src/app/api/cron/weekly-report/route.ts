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

    // 3. Fetch all active subscribers with their plan status
    const subscribers = await SupabaseDB.getActiveSubscribers();

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscribers to email.',
        subscribersCount: 0,
        gapsCount: gaps.length,
      });
    }

    // 4. Calculate dynamic issue number (weeks since launch)
    const launchDate = new Date('2026-08-01').getTime();
    const currentWeekDiff = Math.floor((Date.now() - launchDate) / (7 * 24 * 60 * 60 * 1000));
    const issueNumber = Math.max(1, currentWeekDiff + 1);

    // 5. Prepare Resend API configuration
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'IsMySaaSTaken <onboarding@resend.dev>';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ismysaastaken.vercel.app';

    // If Resend API key is not configured (e.g. local dev / test), log and return simulated response
    if (!resendApiKey) {
      console.log('====================================================');
      console.log('WEEKLY SAAS GAP REPORT (Simulated Mode - No RESEND_API_KEY)');
      console.log(`Subscribers (${subscribers.length}):`, subscribers.map((s) => `${s.email} (${s.plan || 'free'})`));
      console.log(`Gaps (${gaps.length}):`, gaps.map((g) => g.idea_text));
      console.log('====================================================');

      return NextResponse.json({
        success: true,
        mode: 'simulated_dev',
        message: `Simulated weekly report send for ${subscribers.length} subscribers. Configure RESEND_API_KEY in production to dispatch live emails.`,
        issueNumber,
        subscribersCount: subscribers.length,
        gapsCount: gaps.length,
        sampleSubscriber: subscribers[0],
      });
    }

    // 6. Build personalized email payloads with custom template
    const emailPayloads = subscribers.map((subscriber) => {
      const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${subscriber.unsubscribe_token}`;
      const emailHtml = renderCustomWeeklyReportTemplate({
        gaps,
        subscriber,
        issueNumber,
        siteUrl,
        unsubscribeUrl,
      });

      return {
        from: fromEmail,
        to: subscriber.email,
        subject: `📡 The Weekly SaaS Gap Report: 5 Defensible Wedges (Issue #${issueNumber})`,
        html: emailHtml,
      };
    });

    // 7. Send in batches of 50 via Resend Batch API
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
      issueNumber,
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
 * Extracts a readable first name from an email or user profile
 */
function extractUserName(email: string): string {
  const prefix = email.split('@')[0];
  const clean = prefix.split(/[._-]/)[0];
  if (clean && clean.length >= 2 && isNaN(Number(clean))) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return 'Founder';
}

/**
 * Returns a styled plan badge based on user tier
 */
function getPlanBadgeHtml(plan?: string): string {
  const normalized = (plan || 'free').toLowerCase();
  if (normalized === 'pro') {
    return `<span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 10px; font-weight: 700; color: #10b981; background-color: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); padding: 4px 10px; border-radius: 999px; letter-spacing: 1px; text-transform: uppercase;">&#x2B50; FOUNDER PRO</span>`;
  }
  if (normalized === 'sprint' || normalized === 'pass') {
    return `<span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 10px; font-weight: 700; color: #f5a623; background-color: rgba(245,166,35,0.15); border: 1px solid rgba(245,166,35,0.3); padding: 4px 10px; border-radius: 999px; letter-spacing: 1px; text-transform: uppercase;">&#x1F3C3; SPRINT PASS</span>`;
  }
  return `<span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 10px; font-weight: 700; color: #8a8f98; background-color: rgba(138,143,152,0.12); border: 1px solid rgba(138,143,152,0.25); padding: 4px 10px; border-radius: 999px; letter-spacing: 1px; text-transform: uppercase;">&#x1F331; FREE TIER</span>`;
}

/**
 * Returns dynamic footer text with upgrade link for free users
 */
function getPlanStatusText(plan?: string, siteUrl = 'https://ismysaastaken.vercel.app'): string {
  const normalized = (plan || 'free').toLowerCase();
  if (normalized === 'pro') {
    return `<strong style="color: #10b981;">Founder Pro</strong> (Unlimited Scans &amp; Deep Web Grounding)`;
  }
  if (normalized === 'sprint' || normalized === 'pass') {
    return `<strong style="color: #f5a623;">Sprint Pass Active</strong> (30-Day Speedrun Validation)`;
  }
  return `<strong style="color: #e0e0e0;">Free Tier (3 Scans/Mo)</strong> &bull; <a href="${siteUrl}/pricing" style="color: #f5a623; text-decoration: underline; font-weight: 600;">Upgrade to Founder Pro for Unlimited Scans &rarr;</a>`;
}

/**
 * Returns styled HTML tag for each gap opportunity
 */
function getGapTagHtml(tag: string): string {
  switch (tag) {
    case 'open_gap':
      return `<span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 9px; font-weight: 700; color: #10b981; background-color: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); padding: 3px 8px; border-radius: 4px; letter-spacing: 0.8px; text-transform: uppercase;">OPEN GAP</span>`;
    case 'low_moat':
      return `<span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 9px; font-weight: 700; color: #f5a623; background-color: rgba(245,166,35,0.12); border: 1px solid rgba(245,166,35,0.3); padding: 3px 8px; border-radius: 4px; letter-spacing: 0.8px; text-transform: uppercase;">LOW MOAT</span>`;
    case 'underserved':
    default:
      return `<span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 9px; font-weight: 700; color: #b967ff; background-color: rgba(185,103,255,0.12); border: 1px solid rgba(185,103,255,0.3); padding: 3px 8px; border-radius: 4px; letter-spacing: 0.8px; text-transform: uppercase;">UNDERSERVED</span>`;
  }
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Renders the custom client-safe HTML email template
 */
function renderCustomWeeklyReportTemplate({
  gaps,
  subscriber,
  issueNumber,
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
  subscriber: {
    id: string;
    email: string;
    unsubscribe_token: string;
    plan?: string;
  };
  issueNumber: number;
  siteUrl: string;
  unsubscribeUrl: string;
}): string {
  const userName = extractUserName(subscriber.email);
  const planBadgeHtml = getPlanBadgeHtml(subscriber.plan);
  const planStatusText = getPlanStatusText(subscriber.plan, siteUrl);
  const scanUrl = `${siteUrl}/`;
  const logoUrl = `${siteUrl}/icon.png`;
  const companyAddress = `IsMySaaSTaken • Automated Founder Intelligence • ismysaastaken.vercel.app`;

  // Only use real gaps (up to 5) — never fabricate or pad with fake ones
  const realGaps = (gaps || []).slice(0, 5);

  const gapCardsHtml = realGaps
    .map((gap, index) => {
      const num = String(index + 1).padStart(2, '0');
      return `
              <!-- GAP CARD ${num} -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                <tr>
                  <td style="background-color: #14171d; border: 1px solid #2a2d35; border-radius: 6px; padding: 0; mso-line-height-rule: exactly;" bgcolor="#14171d" class="force-card-bg">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="60" class="gap-num-cell" style="padding: 20px 0 20px 20px; vertical-align: top;">
                          <div class="gap-number" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 36px; font-weight: 700; color: #f5a623; line-height: 1; letter-spacing: -1px; opacity: 0.7;">${num}</div>
                        </td>
                        <td class="gap-content-cell" style="padding: 18px 20px 18px 12px; vertical-align: top;">
                          <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 10px; letter-spacing: 1.5px; color: #8a8f98; margin-bottom: 6px; mso-line-height-rule: exactly; line-height: 1.4;">${escapeHtml(gap.category)}</div>
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: #e0e0e0; line-height: 1.4; margin-bottom: 8px; mso-line-height-rule: exactly;">${escapeHtml(gap.idea_text)}</div>
                          <div style="margin-bottom: 10px;">${getGapTagHtml(gap.tag)}</div>
                          ${gap.gap_analysis ? `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #8a8f98; line-height: 1.55; mso-line-height-rule: exactly;">${escapeHtml(gap.gap_analysis)}</div>` : ''}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>The Weekly SaaS Gap Report</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Mobile single-column stacking */
    @media only screen and (max-width: 480px) {
      .mobile-full { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .gap-num-cell { width: 44px !important; padding-left: 14px !important; }
      .gap-num-cell .gap-number { font-size: 28px !important; }
      .gap-content-cell { padding: 14px 14px 14px 8px !important; }
    }
    /* Prevent dark-mode auto-inversion on key elements */
    [data-ogsc] .force-bg { background-color: #0c0e12 !important; }
    [data-ogsc] .force-card-bg { background-color: #14171d !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0e12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e0e0e0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-line-height-rule: exactly;">

  <!-- PREHEADER (hidden inbox preview text) -->
  <div style="display: none; font-size: 1px; color: #0c0e12; line-height: 1px; max-height: 0; overflow: hidden; mso-hide: all;">
    This week: 5 open wedges in AI workflows, DevTools &amp; micro-SaaS &rarr;
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- OUTER WRAPPER -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0c0e12;" bgcolor="#0c0e12" class="force-bg">
    <tr>
      <td align="center" style="padding: 0;">

        <!-- INNER 600px CONTAINER -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="mobile-full" style="max-width: 600px; width: 100%;">

          <!-- ============ LOGO + TOP BAR ============ -->
          <tr>
            <td class="mobile-padding" style="padding: 28px 32px 20px 32px; background-color: #0c0e12;" bgcolor="#0c0e12">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align: middle;">
                    <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${siteUrl}/logo.png" width="190" height="23" alt="IsMySaaSTaken" style="display: block; border: 0; max-height: 26px; width: auto;" />
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    ${planBadgeHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============ ISSUE LINE + TITLE ============ -->
          <tr>
            <td class="mobile-padding" style="padding: 0 32px 4px 32px; background-color: #0c0e12;" bgcolor="#0c0e12">
              <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 10px; letter-spacing: 1.5px; color: #8a8f98; margin-bottom: 8px; mso-line-height-rule: exactly; line-height: 1.4;">
                ISSUE #${issueNumber} &bull; MONDAY BRIEFING
              </div>
              <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 18px; font-weight: 700; color: #f5a623; letter-spacing: -0.5px; line-height: 1.3; mso-line-height-rule: exactly;">
                The Weekly SaaS Gap Report
              </div>
            </td>
          </tr>

          <!-- DIVIDER UNDER HEADER -->
          <tr>
            <td class="mobile-padding" style="padding: 16px 32px 0 32px; background-color: #0c0e12;" bgcolor="#0c0e12">
              <div style="height: 1px; background-color: #2a2d35; font-size: 1px; line-height: 1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- ============ GREETING ============ -->
          <tr>
            <td class="mobile-padding" style="padding: 20px 32px 24px 32px; background-color: #0c0e12;" bgcolor="#0c0e12">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #e0e0e0; line-height: 1.6; mso-line-height-rule: exactly;">
                Hey ${escapeHtml(userName)}, here are ${realGaps.length > 0 ? `the top ${realGaps.length}` : "this week's"} defensible SaaS wedges our crawler uncovered across AI, DevTools, and Micro-SaaS.
              </div>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td class="mobile-padding" style="padding: 0 32px; background-color: #0c0e12;" bgcolor="#0c0e12">
              <div style="height: 1px; background-color: #2a2d35; font-size: 1px; line-height: 1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- ============ GAP CARDS ============ -->
          <tr>
            <td class="mobile-padding" style="padding: 24px 32px 12px 32px; background-color: #0c0e12;" bgcolor="#0c0e12">
              ${gapCardsHtml}
            </td>
          </tr>

            </td>
          </tr>

          <!-- ============ SCAN CTA BOX ============ -->
          <tr>
            <td class="mobile-padding" style="padding: 8px 32px 32px 32px; background-color: #0c0e12;" bgcolor="#0c0e12">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background-color: #14171d; border: 1px solid rgba(245,166,35,0.25); border-radius: 6px; padding: 24px 28px; text-align: center;" bgcolor="#14171d" class="force-card-bg">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #e0e0e0; margin-bottom: 16px; line-height: 1.5; mso-line-height-rule: exactly;">
                      Testing a new concept this week?
                    </div>
                    <!-- Bulletproof button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="background-color: #f5a623; border-radius: 5px; mso-padding-alt: 0;" bgcolor="#f5a623">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${scanUrl}" style="height:42px;v-text-anchor:middle;width:260px;" arcsize="12%" strokecolor="#f5a623" fillcolor="#f5a623">
                            <w:anchorlock/>
                            <center style="color:#0c0e12;font-family:Consolas,Courier,monospace;font-size:13px;font-weight:bold;">Run a live 5-second scan &rarr;</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${scanUrl}" style="display: block; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 13px; font-weight: 700; color: #0c0e12; text-decoration: none; padding: 12px 28px; letter-spacing: 0.5px; mso-line-height-rule: exactly; line-height: 1.3;">
                            Run a live 5-second scan &rarr;
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td class="mobile-padding" style="padding: 0 32px; background-color: #0c0e12;" bgcolor="#0c0e12">
              <div style="height: 1px; background-color: #2a2d35; font-size: 1px; line-height: 1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- ============ FOOTER ============ -->
          <tr>
            <td class="mobile-padding" style="padding: 24px 32px 32px 32px; background-color: #0c0e12;" bgcolor="#0c0e12">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #8a8f98; line-height: 1.7; mso-line-height-rule: exactly;">
                Sent to ${escapeHtml(subscriber.email)} because you have an active IsMySaaSTaken account.<br>
                Your current plan: ${planStatusText}<br><br>
                <a href="${unsubscribeUrl}" style="color: #8a8f98; text-decoration: underline;">Unsubscribe</a><br><br>
                <span style="font-size: 11px; color: #555555;">${companyAddress}</span>
              </div>
            </td>
          </tr>

        </table>
        <!-- /INNER CONTAINER -->

      </td>
    </tr>
  </table>
  <!-- /OUTER WRAPPER -->

</body>
</html>`.trim();
}
