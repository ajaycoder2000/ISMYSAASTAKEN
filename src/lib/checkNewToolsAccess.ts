import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { DevStore } from '@/lib/dev-store';

const FREE_SCAN_LIMIT = 1;

export interface AccessCheckResult {
  allowed: boolean;
  reason?: 'SIGN_IN_REQUIRED' | 'PAYWALL';
}

/**
 * Checks whether an account can access SaaS Keyword Radar or Is It Taken.
 *
 * Rules:
 * 1. Sign-in is required (anonymous attempts return SIGN_IN_REQUIRED).
 * 2. Free accounts get exactly 1 combined free scan shared across both tools.
 * 3. On 2nd attempt, returns PAYWALL.
 * 4. Sprint Pass ('sprint_pass') and Founder Pro ('founder_pro' / 'pro') get unlimited use.
 */
export async function checkNewToolsAccess(userId: string | null): Promise<AccessCheckResult> {
  if (!userId || userId === 'anonymous') {
    return { allowed: false, reason: 'SIGN_IN_REQUIRED' };
  }

  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      // 1. Check profiles table first (Supabase Auth default)
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('plan, new_tools_scans_used')
        .eq('id', userId)
        .maybeSingle();

      if (profile && !profileErr) {
        if (profile.plan === 'sprint_pass' || profile.plan === 'founder_pro' || profile.plan === 'pro') {
          return { allowed: true };
        }
        const scansUsed = profile.new_tools_scans_used ?? 0;
        if (scansUsed >= FREE_SCAN_LIMIT) {
          return { allowed: false, reason: 'PAYWALL' };
        }
        return { allowed: true };
      }

      // 2. Check users table (IsMySaaSTaken synced users table)
      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('id, clerk_id, plan, new_tools_scans_used')
        .or(`id.eq.${userId},clerk_id.eq.${userId}`)
        .maybeSingle();

      if (userRow && !userErr) {
        if (userRow.plan === 'sprint_pass' || userRow.plan === 'founder_pro' || userRow.plan === 'pro') {
          return { allowed: true };
        }
        const scansUsed = userRow.new_tools_scans_used ?? 0;
        if (scansUsed >= FREE_SCAN_LIMIT) {
          return { allowed: false, reason: 'PAYWALL' };
        }
        return { allowed: true };
      }
    } catch (err) {
      console.warn('Supabase checkNewToolsAccess query failed, falling back to DevStore:', err);
    }
  }

  // 3. Fallback to DevStore (local development & offline mock testing)
  const devData = DevStore.getNewToolsUsage(userId);
  if (devData) {
    if (devData.plan === 'sprint_pass' || devData.plan === 'founder_pro' || devData.plan === 'pro') {
      return { allowed: true };
    }
    if (devData.used >= FREE_SCAN_LIMIT) {
      return { allowed: false, reason: 'PAYWALL' };
    }
    return { allowed: true };
  }

  // If user ID was provided but user doesn't exist yet, treat as free account with 0 scans
  return { allowed: true };
}

/**
 * Atomically increments new_tools_scans_used counter for the user.
 * Shared across Keyword Radar and Is It Taken.
 */
export async function incrementNewToolsUsage(userId: string): Promise<void> {
  if (!userId || userId === 'anonymous') return;

  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      // 1. Try atomic Postgres stored procedure
      const { error: rpcErr } = await supabase.rpc('increment_new_tools_scans', { uid: userId });

      if (rpcErr) {
        // Fallback: direct update on profiles or users table
        // Try profiles
        const { data: prof } = await supabase
          .from('profiles')
          .select('new_tools_scans_used')
          .eq('id', userId)
          .maybeSingle();

        if (prof) {
          await supabase
            .from('profiles')
            .update({ new_tools_scans_used: (prof.new_tools_scans_used ?? 0) + 1 })
            .eq('id', userId);
        } else {
          // Try users
          const { data: usr } = await supabase
            .from('users')
            .select('id, new_tools_scans_used')
            .or(`id.eq.${userId},clerk_id.eq.${userId}`)
            .maybeSingle();

          if (usr) {
            await supabase
              .from('users')
              .update({ new_tools_scans_used: (usr.new_tools_scans_used ?? 0) + 1 })
              .eq('id', usr.id);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to increment new_tools_scans_used in Supabase:', err);
    }
  }

  // Always sync local dev store in development/testing
  DevStore.incrementNewToolsUsage(userId);
}
