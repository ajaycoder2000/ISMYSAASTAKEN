import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { DevStore } from '@/lib/dev-store';
import { getSession, isAdminEmail } from '@/lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import { PLAN_ENTITLEMENTS, type FeatureKey, type PlanId } from './entitlements';

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: 'SIGN_IN_REQUIRED' | 'PAYWALL';
  plan?: PlanId;
}

/**
 * Evaluates plan rules against a user's record with lazy expiry for timed passes.
 */
function evaluatePlanRules(
  record: {
    plan?: string | null;
    plan_expires_at?: string | Date | null;
    idea_scans_used?: number | null;
    new_tools_scans_used?: number | null;
    bonus_scans?: number | null;
  },
  feature: FeatureKey
): EntitlementCheckResult {
  let effectivePlan: PlanId = (record.plan === 'pro' ? 'founder_pro' : record.plan) as PlanId;
  if (!effectivePlan || !(effectivePlan in PLAN_ENTITLEMENTS)) {
    effectivePlan = 'free';
  }

  // Lazy expiry check: if a timed plan (Sprint Pass) has expired, treat the
  // user as 'free' for this check even if profiles.plan hasn't been updated
  // yet by a cleanup job. This matters — don't rely solely on a cron to
  // downgrade expired plans in time; check it live on every request.
  if (
    effectivePlan === 'sprint_pass' &&
    record.plan_expires_at &&
    new Date(record.plan_expires_at) < new Date()
  ) {
    effectivePlan = 'free';
  }

  const rules = PLAN_ENTITLEMENTS[effectivePlan][feature];

  if (rules.period === 'ongoing' || rules.limit === null) {
    return { allowed: true, plan: effectivePlan };
  }

  const usedField = feature === 'ideaScans' ? 'idea_scans_used' : 'new_tools_scans_used';
  const used = record[usedField] ?? 0;
  const limit = rules.limit + (record.bonus_scans ?? 0);

  if (used >= limit) {
    return { allowed: false, reason: 'PAYWALL', plan: effectivePlan };
  }

  return { allowed: true, plan: effectivePlan };
}

/**
 * Single function called by every gated route to verify access to a feature.
 *
 * Rules:
 * 1. Unauthenticated attempts return SIGN_IN_REQUIRED (HTTP 401).
 * 2. Admins have unlimited full access (never paywalled).
 * 3. Free accounts get exactly 1 lifetime idea scan and 1 combined lifetime new tools scan.
 * 4. Sprint Pass gets 25 idea scans and unlimited new tools within plan duration.
 * 5. Founder Pro & Studio get unlimited access.
 */
export async function checkEntitlement(
  userId: string | null,
  feature: FeatureKey
): Promise<EntitlementCheckResult> {
  // 1. Unauthenticated / anonymous check
  if (!userId || userId === 'anonymous') {
    return { allowed: false, reason: 'SIGN_IN_REQUIRED' };
  }

  // 2. Admin privileges bypass all paywalls
  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    if (isAdminEmail(email)) {
      return { allowed: true, plan: 'founder_pro' };
    }
  } catch {
    // Fallback to legacy session check
    const session = await getSession();
    if (
      session?.role === 'admin' ||
      (session as any)?.is_admin ||
      isAdminEmail(session?.email)
    ) {
      return { allowed: true, plan: 'founder_pro' };
    }
  }

  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      // 3a. Check profiles table first (with Clerk userId)
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('plan, plan_expires_at, idea_scans_used, new_tools_scans_used, bonus_scans, is_admin, role, email')
        .eq('id', userId)
        .maybeSingle();

      if (profile && !profileErr) {
        if (profile.is_admin || profile.role === 'admin' || isAdminEmail(profile.email)) {
          return { allowed: true, plan: 'founder_pro' };
        }

        return evaluatePlanRules(profile, feature);
      }

      // If profile not yet created for this signed-in Clerk user, auto-create it
      try {
        const clerkUser = await currentUser();
        const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || `${userId}@user.clerk`;
        const isAuthorizedAdmin = isAdminEmail(userEmail);
        const initialPlan = isAuthorizedAdmin ? 'founder_pro' : 'free';

        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              email: userEmail,
              plan: initialPlan,
              is_admin: isAuthorizedAdmin,
              role: isAuthorizedAdmin ? 'admin' : 'user',
              idea_scans_used: 0,
              new_tools_scans_used: 0,
              bonus_scans: 0,
            },
            { onConflict: 'id' }
          )
          .select()
          .maybeSingle();

        if (newProfile) {
          if (newProfile.is_admin || newProfile.role === 'admin' || isAdminEmail(newProfile.email)) {
            return { allowed: true, plan: 'founder_pro' };
          }
          return evaluatePlanRules(newProfile, feature);
        }
      } catch {
        // Fall back to users table
      }

      // 3b. Check users table (synced users table)
      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('id, clerk_id, plan, plan_expires_at, idea_scans_used, new_tools_scans_used, bonus_scans, is_admin, role, email')
        .or(`id.eq.${userId},clerk_id.eq.${userId}`)
        .maybeSingle();

      if (userRow && !userErr) {
        if (userRow.is_admin || userRow.role === 'admin' || isAdminEmail(userRow.email)) {
          return { allowed: true, plan: 'founder_pro' };
        }

        return evaluatePlanRules(userRow, feature);
      }
    } catch (err) {
      console.warn('checkEntitlement Supabase query error, falling back to DevStore:', err);
    }
  }

  // 4. Fallback to DevStore (local development & offline mock testing)
  const devUser = DevStore.findUserById(userId) || DevStore.findUserByEmail(userId);
  if (devUser && (devUser.is_admin || devUser.role === 'admin' || isAdminEmail(devUser.email))) {
    return { allowed: true, plan: 'founder_pro' };
  }

  const devData = DevStore.getFeatureUsage(userId, feature);
  if (devData) {
    let effectivePlan: PlanId = (devData.plan === 'pro' ? 'founder_pro' : devData.plan) as PlanId;
    if (!(effectivePlan in PLAN_ENTITLEMENTS)) {
      effectivePlan = 'free';
    }

    if (
      effectivePlan === 'sprint_pass' &&
      devData.plan_expires_at &&
      new Date(devData.plan_expires_at) < new Date()
    ) {
      effectivePlan = 'free';
    }

    const rules = PLAN_ENTITLEMENTS[effectivePlan][feature];
    if (rules.period === 'ongoing' || rules.limit === null) {
      return { allowed: true, plan: effectivePlan };
    }

    const limit = rules.limit + (devData.bonus_scans ?? 0);
    if (devData.used >= limit) {
      return { allowed: false, reason: 'PAYWALL', plan: effectivePlan };
    }

    return { allowed: true, plan: effectivePlan };
  }

  // 5. If user ID was provided but user doesn't exist yet, treat as free account with 0 scans used
  return { allowed: true, plan: 'free' };
}

/**
 * Atomically increments the usage counter for a given feature.
 */
export async function incrementFeatureUsage(
  userId: string,
  feature: FeatureKey
): Promise<void> {
  if (!userId || userId === 'anonymous') return;

  const column = feature === 'ideaScans' ? 'idea_scans_used' : 'new_tools_scans_used';
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      // 1. Try atomic Postgres stored procedure
      const { error: rpcErr } = await supabase.rpc('increment_usage_column', {
        uid: userId,
        col: column,
      });

      if (rpcErr) {
        // Fallback: direct update on profiles or users table
        const { data: prof } = await supabase
          .from('profiles')
          .select(column)
          .eq('id', userId)
          .maybeSingle();

        if (prof) {
          await supabase
            .from('profiles')
            .update({ [column]: ((prof as any)[column] ?? 0) + 1 })
            .eq('id', userId);
        } else {
          const { data: usr } = await supabase
            .from('users')
            .select(`id, ${column}`)
            .or(`id.eq.${userId},clerk_id.eq.${userId}`)
            .maybeSingle();

          if (usr) {
            await supabase
              .from('users')
              .update({ [column]: ((usr as any)[column] ?? 0) + 1 })
              .eq('id', usr.id);
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to increment ${column} in Supabase:`, err);
    }
  }

  // Always sync local dev store in development/testing
  DevStore.incrementFeatureUsage(userId, feature);
}

/**
 * Checks whether the owner of a scan has an active paid plan (or admin rights) that permits the Validated Badge.
 * Paid tiers: sprint_pass, founder_pro, studio, admin.
 * Free & anonymous users are not entitled to the badge.
 */
export async function isScanOwnerBadgeEntitled(userId?: string | null): Promise<boolean> {
  if (!userId || userId === 'anonymous') return false;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      // 1. Check profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, plan_expires_at, is_admin, role, email')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        if (profile.is_admin || profile.role === 'admin' || isAdminEmail(profile.email)) {
          return true;
        }
        let effectivePlan: PlanId = (profile.plan === 'pro' ? 'founder_pro' : profile.plan) as PlanId;
        if (
          effectivePlan === 'sprint_pass' &&
          profile.plan_expires_at &&
          new Date(profile.plan_expires_at) < new Date()
        ) {
          effectivePlan = 'free';
        }
        return Boolean(PLAN_ENTITLEMENTS[effectivePlan as PlanId]?.validatedBadge);
      }

      // 2. Check users
      const { data: userRow } = await supabase
        .from('users')
        .select('plan, plan_expires_at, is_admin, role, email')
        .or(`id.eq.${userId},clerk_id.eq.${userId}`)
        .maybeSingle();

      if (userRow) {
        if (userRow.is_admin || userRow.role === 'admin' || isAdminEmail(userRow.email)) {
          return true;
        }
        let effectivePlan: PlanId = (userRow.plan === 'pro' ? 'founder_pro' : userRow.plan) as PlanId;
        if (
          effectivePlan === 'sprint_pass' &&
          userRow.plan_expires_at &&
          new Date(userRow.plan_expires_at) < new Date()
        ) {
          effectivePlan = 'free';
        }
        return Boolean(PLAN_ENTITLEMENTS[effectivePlan as PlanId]?.validatedBadge);
      }
    } catch (err) {
      console.warn('isScanOwnerBadgeEntitled Supabase error:', err);
    }
  }

  // Fallback: DevStore
  const devUser = DevStore.findUserById(userId) || DevStore.findUserByEmail(userId);
  if (devUser) {
    if (devUser.is_admin || devUser.role === 'admin' || isAdminEmail(devUser.email)) {
      return true;
    }
    let effectivePlan: PlanId = (devUser.plan === 'pro' ? 'founder_pro' : devUser.plan) as PlanId;
    if (
      effectivePlan === 'sprint_pass' &&
      devUser.plan_expires_at &&
      new Date(devUser.plan_expires_at) < new Date()
    ) {
      effectivePlan = 'free';
    }
    return Boolean(PLAN_ENTITLEMENTS[effectivePlan as PlanId]?.validatedBadge);
  }

  return false;
}
