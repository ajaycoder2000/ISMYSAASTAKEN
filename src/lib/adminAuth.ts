import { getSession, isAdminEmail } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { DevStore } from '@/lib/dev-store';

export interface AdminAuthResult {
  isAdmin: boolean;
  adminId?: string;
  adminEmail?: string;
}

/**
 * Independently verifies admin privileges on the server.
 * Never trust client headers or middleware alone.
 * 
 * Checks:
 * 1. Current authenticated session (Clerk / JWT).
 * 2. Hardcoded / Env ADMIN_EMAIL whitelist.
 * 3. Supabase 'profiles' table for `is_admin = true`.
 * 4. Supabase 'users' table for `is_admin = true` or `role = 'admin'`.
 * 5. DevStore in local fallback environments.
 */
export async function verifyAdminAccess(): Promise<AdminAuthResult> {
  const session = await getSession();
  if (!session?.userId || !session?.email) {
    return { isAdmin: false };
  }

  const cleanEmail = session.email.toLowerCase().trim();

  // 1. Environment whitelist check
  if (isAdminEmail(cleanEmail)) {
    return {
      isAdmin: true,
      adminId: session.userId,
      adminEmail: cleanEmail,
    };
  }

  // 2. Session role check
  if (session.role === 'admin') {
    return {
      isAdmin: true,
      adminId: session.userId,
      adminEmail: cleanEmail,
    };
  }

  // 3. Supabase query checks
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      // Check profiles table (brief specification)
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, id, email')
        .or(`id.eq.${session.userId},email.eq.${cleanEmail}`)
        .maybeSingle();

      if (profile?.is_admin === true) {
        return {
          isAdmin: true,
          adminId: profile.id || session.userId,
          adminEmail: cleanEmail,
        };
      }
    } catch {
      // Continue to users table
    }

    try {
      // Check users table
      const { data: userRow } = await supabase
        .from('users')
        .select('is_admin, role, id, clerk_id, email')
        .or(`clerk_id.eq.${session.userId},id.eq.${session.userId},email.eq.${cleanEmail}`)
        .maybeSingle();

      if (userRow?.is_admin === true || userRow?.role === 'admin') {
        return {
          isAdmin: true,
          adminId: userRow.id || userRow.clerk_id || session.userId,
          adminEmail: cleanEmail,
        };
      }
    } catch {
      // Fallback
    }
  }

  // 4. DevStore fallback
  const devUser = DevStore.findUserById(session.userId) || DevStore.findUserByEmail(cleanEmail);
  if (devUser && (devUser.is_admin === true || devUser.role === 'admin')) {
    return {
      isAdmin: true,
      adminId: devUser._id,
      adminEmail: cleanEmail,
    };
  }

  return { isAdmin: false };
}
