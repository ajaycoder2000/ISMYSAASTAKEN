import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getSession, isAdminEmail } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSiteConfig } from '@/models/SiteConfig';
import { DevStore } from '@/lib/dev-store';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    let clerkEmail = '';
    let clerkName = '';

    if (clerkUserId) {
      try {
        const clerkUser = await currentUser();
        clerkEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
        clerkName = clerkUser?.fullName || clerkUser?.firstName || '';
      } catch {
        // ignore
      }
    }

    const session = !clerkUserId ? await getSession() : null;
    const activeUserId = clerkUserId || session?.userId;

    if (!activeUserId) {
      return NextResponse.json({ user: null });
    }

    let userEmail = clerkEmail || session?.email || '';
    let userPlan = session?.plan || 'free';
    let userRole = session?.role || 'user';
    let userSuspended = false;
    let scansUsed = 0;
    let scansResetDate = new Date();
    let monthlyCap = 3;

    // 1. Check Supabase 'users' table
    const supabase = getSupabaseAdmin();
    let isUserAdmin = isAdminEmail(userEmail) || userRole === 'admin';

    if (supabase) {
      try {
        const { data: userRow } = await supabase
          .from('users')
          .select('*')
          .or(`clerk_id.eq.${activeUserId},id.eq.${activeUserId},email.eq.${userEmail}`)
          .maybeSingle();

        if (userRow) {
          userEmail = userRow.email || userEmail;
          if (userRow.is_admin === true || userRow.role === 'admin' || isAdminEmail(userEmail)) {
            isUserAdmin = true;
          }
          userPlan = userRow.plan || userPlan;
          userRole = isUserAdmin ? 'admin' : (userRow.role || userRole);
          userSuspended = !!userRow.suspended;
          scansUsed = userRow.scans_used_this_month || 0;
          if (userRow.scans_reset_date) scansResetDate = new Date(userRow.scans_reset_date);
        }
      } catch (err) {
        console.warn('Session Supabase user check error:', err);
      }

      try {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${activeUserId},email.eq.${userEmail}`)
          .maybeSingle();

        if (profileRow) {
          if (profileRow.is_admin === true || profileRow.role === 'admin' || isAdminEmail(userEmail)) {
            isUserAdmin = true;
          }
          if (profileRow.plan && !isUserAdmin) {
            userPlan = profileRow.plan;
          }
        }
      } catch (err) {
        // profile table check optional
      }
    }

    // 2. Check MongoDB / DevStore
    try {
      const conn = await dbConnect();
      if (conn) {
        let userDoc = null;
        try {
          userDoc = await User.findOne({ $or: [{ _id: activeUserId }, { clerkId: activeUserId }, { email: userEmail }] }).lean();
        } catch {
          // ignore id cast errors
        }
        if (userDoc) {
          userEmail = userDoc.email || userEmail;
          if (userDoc.role === 'admin' || (userDoc as any).is_admin || isAdminEmail(userEmail)) {
            isUserAdmin = true;
          }
          userPlan = userDoc.plan || userPlan;
          userRole = isUserAdmin ? 'admin' : (userDoc.role || userRole);
          userSuspended = !!userDoc.suspended;
          scansUsed = userDoc.scansUsedThisMonth || scansUsed;
          if (userDoc.scansResetDate) scansResetDate = userDoc.scansResetDate;
        }

        const config = await getSiteConfig();
        if (config?.freeTierMonthlyLimit) {
          monthlyCap = config.freeTierMonthlyLimit;
        }
      } else {
        const devUser = DevStore.findUserById(activeUserId) || DevStore.findUserByEmail(userEmail);
        if (devUser) {
          userEmail = devUser.email;
          if (devUser.role === 'admin' || devUser.is_admin || isAdminEmail(userEmail)) {
            isUserAdmin = true;
          }
          userPlan = devUser.plan;
          userRole = isUserAdmin ? 'admin' : (devUser.role || userRole);
          userSuspended = !!devUser.suspended;
          scansUsed = devUser.scansUsedThisMonth || 0;
          scansResetDate = devUser.scansResetDate;
        }
        const devConfig = DevStore.getConfig();
        monthlyCap = devConfig.freeTierMonthlyLimit || 3;
      }
    } catch {
      const devUser = DevStore.findUserById(activeUserId) || DevStore.findUserByEmail(userEmail);
      if (devUser) {
        userEmail = devUser.email;
        if (devUser.role === 'admin' || devUser.is_admin || isAdminEmail(userEmail)) {
          isUserAdmin = true;
        }
        userPlan = devUser.plan;
        userRole = isUserAdmin ? 'admin' : (devUser.role || userRole);
        userSuspended = !!devUser.suspended;
        scansUsed = devUser.scansUsedThisMonth || 0;
        scansResetDate = devUser.scansResetDate;
      }
    }

    // 3. ADMIN PRIVILEGE OVERRIDE
    // Admins have full access to the highest plan (founder_pro) for unlimited testing
    if (isUserAdmin) {
      userRole = 'admin';
      userPlan = 'founder_pro';
    }
    
    const isPaid = isUserAdmin || ['pro', 'founder_pro', 'sprint_pass'].includes(userPlan);
    const remaining = isPaid ? Infinity : Math.max(0, monthlyCap - scansUsed);
    
    return NextResponse.json({
      user: {
        id: activeUserId,
        email: userEmail,
        plan: userPlan,
        role: userRole,
        is_admin: isUserAdmin,
        suspended: userSuspended,
        scansUsedThisMonth: scansUsed,
        scansRemaining: remaining,
        scansResetDate,
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}
