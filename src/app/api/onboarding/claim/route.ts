import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { DevStore } from '@/lib/dev-store';

export const dynamic = 'force-dynamic';

const ALLOWED = {
  stage: ['exploring', 'has_idea', 'building', 'launched'],
  validated: ['never', 'informal', 'proper'],
  worry: ['already_built', 'no_search', 'name_taken', 'brutal_honesty'],
  building: ['saas', 'mobile', 'ai', 'unsure'],
  timeline: ['this_week', 'this_month', 'curious'],
} as const;

export async function POST(req: Request) {
  try {
    // 1. Authenticate userId server-side from Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { stage, validated, worry, building, timeline } = body;
    const answers = { stage, validated, worry, building, timeline };

    // 3. Strict validation against allowed enums
    for (const [key, allowedValues] of Object.entries(ALLOWED)) {
      const val = answers[key as keyof typeof ALLOWED];
      if (!val || !(allowedValues as readonly string[]).includes(val)) {
        return NextResponse.json(
          { error: `Invalid or missing answer for ${key}` },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();

    if (supabase) {
      // 4a. Fetch current profile state
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_bonus_claimed, bonus_scans')
        .eq('id', userId)
        .maybeSingle();

      const alreadyClaimed = profile?.onboarding_bonus_claimed === true;
      const currentBonus = profile?.bonus_scans ?? 0;
      const newBonus = alreadyClaimed ? currentBonus : currentBonus + 1;

      // 4b. Update profiles table
      const updateData: Record<string, any> = {
        founder_stage: answers.stage,
        validation_experience: answers.validated,
        main_worry: answers.worry,
        building_type: answers.building,
        decision_timeline: answers.timeline,
        onboarding_completed_at: nowIso,
        updated_at: nowIso,
      };

      if (!alreadyClaimed) {
        updateData.onboarding_bonus_claimed = true;
        updateData.bonus_scans = newBonus;
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      // Also update users table if present
      try {
        await supabase
          .from('users')
          .update(updateData)
          .or(`id.eq.${userId},clerk_id.eq.${userId}`);
      } catch {
        // ignore if users table is omitted
      }

      // Log the event
      try {
        await supabase.from('quiz_events').insert({
          event: alreadyClaimed ? 'quiz_completed' : 'bonus_claimed',
          user_id: userId,
          metadata: { ...answers, bonusGranted: !alreadyClaimed },
          created_at: nowIso,
        });
      } catch {
        // non-blocking
      }

      return NextResponse.json({
        success: true,
        bonusGranted: !alreadyClaimed,
        totalBonusScans: newBonus,
      });
    }

    // 5. Fallback for DevStore (local mock/offline mode)
    const devUser = DevStore.findUserById(userId);
    let devClaimed = false;
    if (devUser) {
      devClaimed = (devUser as any).onboarding_bonus_claimed === true;
      (devUser as any).founder_stage = answers.stage;
      (devUser as any).validation_experience = answers.validated;
      (devUser as any).main_worry = answers.worry;
      (devUser as any).building_type = answers.building;
      (devUser as any).decision_timeline = answers.timeline;
      (devUser as any).onboarding_completed_at = nowIso;
      if (!devClaimed) {
        (devUser as any).onboarding_bonus_claimed = true;
        devUser.bonus_scans = (devUser.bonus_scans || 0) + 1;
      }
    }

    return NextResponse.json({
      success: true,
      bonusGranted: !devClaimed,
    });
  } catch (error: any) {
    console.error('Error claiming onboarding quiz bonus:', error);
    return NextResponse.json(
      { error: 'Internal server error processing claim' },
      { status: 500 }
    );
  }
}
