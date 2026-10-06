import { NextRequest, NextResponse } from 'next/server';
import { WaitlistDB } from '@/lib/waitlistDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { referralCode, buildingType } = body;

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing referral code' }, { status: 400 });
    }

    if (!buildingType || typeof buildingType !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing answer' }, { status: 400 });
    }

    const sanitizedAnswer = buildingType.trim().slice(0, 50);
    const updated = await WaitlistDB.updateBuildingType(referralCode.trim(), sanitizedAnswer);

    return NextResponse.json({ ok: updated });
  } catch (err: any) {
    console.error('[WaitlistAnswer] Error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
