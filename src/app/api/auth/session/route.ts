import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSiteConfig } from '@/models/SiteConfig';
import { DevStore } from '@/lib/dev-store';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ user: null });
    }
    
    let userEmail = session.email;
    let userPlan = session.plan;
    let userRole = session.role || 'user';
    let userSuspended = false;
    let scansUsed = 0;
    let scansResetDate = new Date();
    let monthlyCap = 3;

    try {
      const conn = await dbConnect();
      if (conn) {
        const userDoc = await User.findById(session.userId).lean();
        if (userDoc) {
          userEmail = userDoc.email;
          userPlan = userDoc.plan;
          userRole = userDoc.role || 'user';
          userSuspended = !!userDoc.suspended;
          scansUsed = userDoc.scansUsedThisMonth || 0;
          scansResetDate = userDoc.scansResetDate;
        }

        const config = await getSiteConfig();
        if (config?.freeTierMonthlyLimit) {
          monthlyCap = config.freeTierMonthlyLimit;
        }
      } else {
        const devUser = DevStore.findUserById(session.userId);
        if (devUser) {
          userEmail = devUser.email;
          userPlan = devUser.plan;
          userRole = devUser.role || 'user';
          userSuspended = !!devUser.suspended;
          scansUsed = devUser.scansUsedThisMonth || 0;
          scansResetDate = devUser.scansResetDate;
        }
        const devConfig = DevStore.getConfig();
        monthlyCap = devConfig.freeTierMonthlyLimit || 3;
      }
    } catch {
      const devUser = DevStore.findUserById(session.userId);
      if (devUser) {
        userEmail = devUser.email;
        userPlan = devUser.plan;
        userRole = devUser.role || 'user';
        userSuspended = !!devUser.suspended;
        scansUsed = devUser.scansUsedThisMonth || 0;
        scansResetDate = devUser.scansResetDate;
      }
    }
    
    const remaining = userPlan === 'pro' ? Infinity : Math.max(0, monthlyCap - scansUsed);
    
    return NextResponse.json({
      user: {
        id: session.userId,
        email: userEmail,
        plan: userPlan,
        role: userRole,
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
