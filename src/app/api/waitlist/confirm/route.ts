import { NextRequest, NextResponse } from 'next/server';
import { WaitlistDB } from '@/lib/waitlistDb';
import { sendWaitlistWelcomeEmail } from '@/lib/waitlistEmail';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token || typeof token !== 'string') {
    return NextResponse.redirect(`${SITE_URL}/waitlist?error=invalid_token`);
  }

  try {
    const result = await WaitlistDB.confirmEntry(token.trim());

    if (!result.success || !result.entry) {
      return NextResponse.redirect(`${SITE_URL}/waitlist?error=token_not_found`);
    }

    // Only send the welcome email the first time they confirm (idempotent)
    if (!result.alreadyConfirmed) {
      await sendWaitlistWelcomeEmail({
        email: result.entry.email,
        referralCode: result.entry.referral_code,
        unsubscribeToken: result.entry.unsubscribe_token,
      });
    }

    return NextResponse.redirect(
      `${SITE_URL}/waitlist/confirmed?code=${encodeURIComponent(result.entry.referral_code)}`
    );
  } catch (err: any) {
    console.error('[WaitlistConfirm] Unexpected confirmation error:', err);
    return NextResponse.redirect(`${SITE_URL}/waitlist?error=internal_error`);
  }
}
