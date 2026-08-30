import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase/db';
import { renderCustomWeeklyReportTemplate } from '@/lib/email-template';

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
