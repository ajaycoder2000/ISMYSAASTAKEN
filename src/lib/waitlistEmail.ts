import { SITE_URL } from '@/lib/site';
import { WAITLIST_BASE_REWARD, REFERRAL_TIERS } from '@/lib/waitlistRewards';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM_EMAIL = process.env.WAITLIST_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'IsMySaaSTaken <hello@ismysaastaken.live>';
const FALLBACK_FROM_EMAIL = 'IsMySaaSTaken <onboarding@resend.dev>';
const COMPANY_ADDRESS = 'IsMySaaSTaken • Automated Founder Intelligence • ismysaastaken.live';

/**
 * Escapes HTML characters for safe email rendering
 */
function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Common HTML Wrapper for Waitlist transactional emails (Light & Dark mode compatible)
 */
function renderEmailShell(contentHtml: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Is My SaaS Taken?</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0c0e12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; }
    .email-container { max-width: 520px; margin: 0 auto; background-color: #14171f; border: 1px solid #232731; border-radius: 12px; overflow: hidden; }
    .email-body { padding: 32px 28px; }
    .btn { display: inline-block; background-color: #f5a623; color: #0c0e12 !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 28px; border-radius: 8px; letter-spacing: 0.3px; }
    .footer { padding: 24px 28px; background-color: #0c0e12; border-top: 1px solid #232731; font-size: 11px; color: #71717a; line-height: 1.6; text-align: center; }
    .footer a { color: #a1a1aa; text-decoration: underline; }
    @media (max-width: 560px) {
      .email-container { border-radius: 0; border-left: none; border-right: none; }
      .email-body { padding: 24px 18px; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #0c0e12;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: #14171f; border: 1px solid #232731; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px 20px; border-bottom: 1px solid #232731; background-color: #0f1218;">
              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 800; color: #f4f4f5; letter-spacing: -0.5px;">
                ismysaas<span style="color: #f5a623;">taken</span>?
              </span>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px; color: #e4e4e7; font-size: 14px; line-height: 1.6;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px 24px; background-color: #0c0e12; border-top: 1px solid #232731; font-size: 11px; color: #71717a; line-height: 1.7; text-align: center;">
              You received this email because you signed up for the pre-launch waitlist at ismysaastaken.live.<br>
              <a href="${unsubscribeUrl}" style="color: #a1a1aa; text-decoration: underline;">Unsubscribe from waitlist updates</a><br><br>
              <span style="color: #52525b;">${COMPANY_ADDRESS}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * 1. Double Opt-in: Send Confirmation Email
 */
export async function sendWaitlistConfirmEmail({
  email,
  confirmToken,
  unsubscribeToken,
}: {
  email: string;
  confirmToken: string;
  unsubscribeToken: string;
}): Promise<{ ok: boolean; simulated?: boolean; error?: string }> {
  const confirmUrl = `${SITE_URL}/api/waitlist/confirm?token=${confirmToken}`;
  const unsubscribeUrl = `${SITE_URL}/api/waitlist/unsubscribe?token=${unsubscribeToken}`;

  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 700; color: #fafafa; margin: 0 0 16px; line-height: 1.3;">
      Confirm your spot on the waitlist
    </h1>
    <p style="margin: 0 0 24px; color: #d4d4d8; font-size: 14px; line-height: 1.6;">
      Click the button below to confirm your email and lock in your Founding Member perks for <strong>ismysaastaken?</strong> before our public launch.
    </p>
    <div style="margin: 28px 0; text-align: left;">
      <a href="${confirmUrl}" style="display: inline-block; background-color: #f5a623; color: #0c0e12; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 28px; border-radius: 8px;">
        Confirm My Spot &rarr;
      </a>
    </div>
    <p style="margin: 24px 0 0; font-size: 12px; color: #71717a; line-height: 1.5;">
      If you did not request to join the waitlist, you can safely ignore this email.
    </p>
  `;

  const html = renderEmailShell(contentHtml, unsubscribeUrl);

  return sendViaResend({
    to: email,
    subject: 'Confirm your spot on the ismysaastaken? waitlist',
    html,
  });
}

/**
 * 2. Welcome Email (Dispatched automatically after confirming)
 */
export async function sendWaitlistWelcomeEmail({
  email,
  referralCode,
  unsubscribeToken,
}: {
  email: string;
  referralCode: string;
  unsubscribeToken: string;
}): Promise<{ ok: boolean; simulated?: boolean; error?: string }> {
  const shareUrl = `${SITE_URL}/waitlist?ref=${referralCode}`;
  const unsubscribeUrl = `${SITE_URL}/api/waitlist/unsubscribe?token=${unsubscribeToken}`;

  const tierRowsHtml = REFERRAL_TIERS.map(
    (t) => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; margin-bottom: 6px; background-color: #1a1e27; border: 1px solid #272c38; border-radius: 6px;">
      <span style="font-size: 13px; color: #e4e4e7; font-weight: 600;">${t.friends} ${t.friends === 1 ? 'friend' : 'friends'}</span>
      <span style="font-size: 12px; color: #f5a623; font-weight: 700;">${escapeHtml(t.label)}</span>
    </div>
  `
  ).join('');

  const contentHtml = `
    <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">
      ✓ Spot Confirmed
    </div>
    <h1 style="font-size: 20px; font-weight: 700; color: #fafafa; margin: 0 0 16px; line-height: 1.3;">
      You're in. Your founding perks are locked.
    </h1>
    <p style="margin: 0 0 16px; color: #d4d4d8; font-size: 14px; line-height: 1.6;">
      We're putting the finishing touches on the automated SaaS market intelligence engine. You will be among the very first founders with access the moment we launch.
    </p>

    <div style="background-color: #191c24; border: 1px solid rgba(245, 166, 35, 0.3); border-radius: 8px; padding: 14px 16px; margin: 20px 0;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #f5a623; font-weight: 700; margin-bottom: 4px;">
        Locked Founding Reward
      </div>
      <div style="font-size: 15px; font-weight: 700; color: #f4f4f5;">
        ${escapeHtml(WAITLIST_BASE_REWARD)}
      </div>
    </div>

    <div style="margin: 28px 0 20px;">
      <h2 style="font-size: 14px; font-weight: 700; color: #fafafa; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">
        Invite friends to unlock extra launch perks
      </h2>
      <p style="margin: 0 0 14px; color: #a1a1aa; font-size: 13px;">
        Share your personal invite link. When friends confirm their spot, your rewards unlock automatically:
      </p>

      <div style="margin: 12px 0 18px;">
        ${tierRowsHtml}
      </div>

      <div style="background-color: #0f1218; border: 1px dashed #3f3f46; border-radius: 8px; padding: 12px; margin-top: 14px; text-align: center;">
        <span style="display: block; font-size: 11px; color: #71717a; margin-bottom: 4px;">Your Personal Share Link</span>
        <a href="${shareUrl}" style="color: #f5a623; font-family: monospace; font-size: 13px; font-weight: 700; word-break: break-all; text-decoration: none;">
          ${shareUrl}
        </a>
      </div>
    </div>
  `;

  const html = renderEmailShell(contentHtml, unsubscribeUrl);

  return sendViaResend({
    to: email,
    subject: "You're confirmed for the ismysaastaken? waitlist!",
    html,
  });
}

/**
 * Dispatch helper with Resend REST API & dev simulation fallback
 */
async function sendViaResend({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; simulated?: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.log('\n====================================================');
    console.log(`[WAITLIST EMAIL - DEV SIMULATED MODE]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    const links = Array.from(html.matchAll(/href="([^"]+)"/g)).map((m) => m[1]);
    if (links.length > 0) {
      console.log('Action links:');
      links.forEach((l) => console.log(`  -> ${l}`));
    }
    console.log('Configure RESEND_API_KEY in production to dispatch live emails.');
    console.log('====================================================\n');
    return { ok: true, simulated: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: DEFAULT_FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (res.ok) {
      return { ok: true };
    }

    const errData = await res.json().catch(() => ({}));
    console.warn('[WaitlistEmail] Resend error with primary from address:', errData);

    // If custom domain is not yet verified in Resend, retry with onboarding@resend.dev
    if (res.status === 403 || (errData?.message && errData.message.includes('domain'))) {
      console.log('[WaitlistEmail] Retrying with fallback address:', FALLBACK_FROM_EMAIL);
      const fallbackRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FALLBACK_FROM_EMAIL,
          to,
          subject,
          html,
        }),
      });

      if (fallbackRes.ok) {
        return { ok: true };
      }
    }

    return { ok: false, error: errData?.message || 'Failed to dispatch email via Resend' };
  } catch (err: any) {
    console.error('[WaitlistEmail] Unexpected dispatch error:', err);
    return { ok: false, error: err?.message || 'Network error' };
  }
}
