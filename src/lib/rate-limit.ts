import { cookies } from 'next/headers';
import { getSession } from './auth';
import dbConnect from './mongodb';
import User from '@/models/User';
import { getSiteConfig } from '@/models/SiteConfig';
import { DevStore } from './dev-store';

const ANON_COOKIE = 'anon_scan_used';

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  isAnonymous: boolean;
  userId?: string;
  remaining?: number;
}

export async function checkRateLimit(): Promise<RateLimitResult> {
  const session = await getSession();
  
  // Logged-in user
  if (session?.userId) {
    let userPlan = session.plan;
    let userSuspended = false;
    let scansUsed = 0;
    let scansResetDate = new Date();
    let monthlyCap = 3;

    try {
      const conn = await dbConnect();
      if (conn) {
        let user = null;
        try {
          user = await User.findById(session.userId);
        } catch {
          user = await User.findOne({ email: session.email });
        }

        if (user) {
          if (user.suspended) {
            return { allowed: false, reason: 'Your account is suspended. Please contact support.', isAnonymous: false };
          }
          if (user.plan === 'pro') {
            return { allowed: true, isAnonymous: false, userId: user._id.toString() };
          }

          const config = await getSiteConfig();
          monthlyCap = config?.freeTierMonthlyLimit || 3;

          // Check reset
          if (new Date() > user.scansResetDate) {
            user.scansUsedThisMonth = 0;
            const nextReset = new Date();
            nextReset.setMonth(nextReset.getMonth() + 1);
            nextReset.setDate(1);
            nextReset.setHours(0, 0, 0, 0);
            user.scansResetDate = nextReset;
            await user.save();
          }

          userPlan = user.plan;
          scansUsed = user.scansUsedThisMonth || 0;
          scansResetDate = user.scansResetDate;
        }
      } else {
        const devUser = DevStore.findUserById(session.userId) || DevStore.findUserByEmail(session.email);
        if (devUser) {
          if (devUser.suspended) {
            return { allowed: false, reason: 'Your account is suspended. Please contact support.', isAnonymous: false };
          }
          if (devUser.plan === 'pro') {
            return { allowed: true, isAnonymous: false, userId: devUser._id };
          }
          monthlyCap = DevStore.getConfig().freeTierMonthlyLimit || 3;
          userPlan = devUser.plan;
          scansUsed = devUser.scansUsedThisMonth || 0;
          scansResetDate = devUser.scansResetDate;
        }
      }
    } catch {
      const devUser = DevStore.findUserById(session.userId) || DevStore.findUserByEmail(session.email);
      if (devUser) {
        if (devUser.suspended) {
          return { allowed: false, reason: 'Your account is suspended. Please contact support.', isAnonymous: false };
        }
        if (devUser.plan === 'pro') {
          return { allowed: true, isAnonymous: false, userId: devUser._id };
        }
        monthlyCap = DevStore.getConfig().freeTierMonthlyLimit || 3;
        scansUsed = devUser.scansUsedThisMonth || 0;
        scansResetDate = devUser.scansResetDate;
      }
    }

    const remaining = userPlan === 'pro' ? Infinity : Math.max(0, monthlyCap - scansUsed);

    if (userPlan !== 'pro' && scansUsed >= monthlyCap) {
      return {
        allowed: false,
        reason: `You've used all ${monthlyCap} free scans this month. Resets on ${new Date(scansResetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. Upgrade to Pro for unlimited.`,
        isAnonymous: false,
        userId: session.userId,
        remaining: 0,
      };
    }

    return { allowed: true, isAnonymous: false, userId: session.userId, remaining };
  }
  
  // Anonymous user — check cookie
  const cookieStore = await cookies();
  const anonUsed = cookieStore.get(ANON_COOKIE)?.value;
  
  if (anonUsed === 'true') {
    return {
      allowed: false,
      reason: 'You\'ve used your free scan. Sign up to unlock more — it takes 10 seconds, no password needed.',
      isAnonymous: true,
    };
  }
  
  return { allowed: true, isAnonymous: true };
}

export async function recordScanUsage(userId?: string): Promise<void> {
  if (userId) {
    try {
      const conn = await dbConnect();
      if (conn) {
        try {
          await User.findByIdAndUpdate(userId, { $inc: { scansUsedThisMonth: 1 } });
          return;
        } catch {
          // fallback
        }
      }
    } catch {
      // fallback
    }

    const devUser = DevStore.findUserById(userId);
    if (devUser) {
      DevStore.updateUser(userId, { scansUsedThisMonth: (devUser.scansUsedThisMonth || 0) + 1 });
    }
  } else {
    // Set anonymous cookie
    const cookieStore = await cookies();
    cookieStore.set(ANON_COOKIE, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
    });
  }
}
