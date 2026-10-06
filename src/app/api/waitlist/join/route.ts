import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { WaitlistDB } from '@/lib/waitlistDb';
import { sendWaitlistConfirmEmail } from '@/lib/waitlistEmail';

export const dynamic = 'force-dynamic';

// 7-character charset without look-alikes: no 0, O, 1, l, I
const CODE_CHARSET = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRandomCode(): string {
  let result = '';
  const bytes = crypto.randomBytes(7);
  for (let i = 0; i < 7; i++) {
    result += CODE_CHARSET[bytes[i] % CODE_CHARSET.length];
  }
  return result;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}

function hashIp(ip: string): string {
  const salt = process.env.CRON_SECRET || process.env.CLERK_SECRET_KEY || 'waitlist-ip-salt-secret';
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, ref, utm_source, utm_campaign, utm_content, website } = body;

    // 1. Honeypot check: silently return standard success if bot filled 'website'
    if (website && typeof website === 'string' && website.trim().length > 0) {
      console.log('[WaitlistJoin] Bot trap triggered by honeypot field.');
      return NextResponse.json({ ok: true });
    }

    // 2. Validate email format and length
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.length === 0 || cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // 3. Rate limiting by hashed IP: max 5 joins per IP per hour
    const clientIp = getClientIp(req);
    const ipHash = hashIp(clientIp);

    const joinsLastHour = await WaitlistDB.countIpJoinsLastHour(ipHash);
    if (joinsLastHour >= 5) {
      return NextResponse.json(
        { ok: false, error: 'Too many tries, please wait a bit.' },
        { status: 429 }
      );
    }

    // 4. Look up existing email
    const existing = await WaitlistDB.findByEmail(cleanEmail);

    if (existing) {
      // Exists and confirmed: do nothing, return standard success without exposing state
      if (existing.status === 'confirmed') {
        return NextResponse.json({ ok: true });
      }

      // Exists and pending: re-send confirmation email (cooldown: max once per 10 minutes)
      const lastCreated = new Date(existing.created_at).getTime();
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

      if (lastCreated < tenMinutesAgo) {
        await sendWaitlistConfirmEmail({
          email: existing.email,
          confirmToken: existing.confirm_token,
          unsubscribeToken: existing.unsubscribe_token,
        });
      }

      return NextResponse.json({ ok: true, referralCode: existing.referral_code });
    }

    // 5. New signup: generate unique 7-character referral code
    let referralCode = generateRandomCode();
    let attempts = 0;
    while (attempts < 5) {
      const collision = await WaitlistDB.findByReferralCode(referralCode);
      if (!collision) break;
      referralCode = generateRandomCode();
      attempts++;
    }

    // Validate referred_by code if present
    let referredBy: string | null = null;
    if (ref && typeof ref === 'string' && ref.trim().length > 0) {
      const cleanRef = ref.trim();
      if (cleanRef !== referralCode) {
        const inviter = await WaitlistDB.findByReferralCode(cleanRef);
        if (inviter) {
          referredBy = cleanRef;
        }
      }
    }

    const newEntry = await WaitlistDB.createEntry({
      email: cleanEmail,
      referral_code: referralCode,
      referred_by: referredBy,
      utm_source: typeof utm_source === 'string' ? utm_source.slice(0, 100) : null,
      utm_campaign: typeof utm_campaign === 'string' ? utm_campaign.slice(0, 100) : null,
      utm_content: typeof utm_content === 'string' ? utm_content.slice(0, 100) : null,
      ip_hash: ipHash,
    });

    // Send Double Opt-in Confirmation Email
    await sendWaitlistConfirmEmail({
      email: newEntry.email,
      confirmToken: newEntry.confirm_token,
      unsubscribeToken: newEntry.unsubscribe_token,
    });

    return NextResponse.json({ ok: true, referralCode: newEntry.referral_code });
  } catch (err: any) {
    console.error('[WaitlistJoin] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to join waitlist. Please try again.' }, { status: 500 });
  }
}
