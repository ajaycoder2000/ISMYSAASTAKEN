import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { DevStore } from '@/lib/dev-store';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { PlanType } from '@/types';

const VALID_PLANS: PlanType[] = ['free', 'sprint_pass', 'founder_pro', 'pro'];

export async function POST(req: NextRequest) {
  // 1. Independent Server-side Admin Verification
  const adminAuth = await verifyAdminAccess();
  if (!adminAuth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { targetUserId, newPlan, expiresAt, reason } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    if (!newPlan || !VALID_PLANS.includes(newPlan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${VALID_PLANS.join(', ')}` },
        { status: 400 }
      );
    }

    // Reason is strictly required per build brief
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json(
        { error: 'A specific reason is required for manual plan overrides (audit logging).' },
        { status: 400 }
      );
    }

    const cleanReason = reason.trim();
    const isoExpiry = expiresAt ? new Date(expiresAt).toISOString() : null;
    const adminId = adminAuth.adminId || null;

    // 2. Update Supabase
    const supabase = getSupabaseAdmin();
    let updatedInSupabase = false;

    if (supabase) {
      try {
        // Try profiles table
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({
            plan: newPlan,
            plan_expires_at: isoExpiry,
          })
          .eq('id', targetUserId);

        if (!profileErr) {
          updatedInSupabase = true;
        }

        // Try users table
        const { error: userErr } = await supabase
          .from('users')
          .update({
            plan: newPlan,
            plan_expires_at: isoExpiry,
          })
          .or(`id.eq.${targetUserId},clerk_id.eq.${targetUserId}`);

        if (!userErr) {
          updatedInSupabase = true;
        }

        // Insert audit record into admin_actions_log
        await supabase.from('admin_actions_log').insert({
          admin_id: adminId,
          target_user_id: targetUserId,
          action: 'plan_override',
          details: {
            newPlan,
            expiresAt: isoExpiry,
            reason: cleanReason,
            adminEmail: adminAuth.adminEmail || 'admin',
          },
        });
      } catch (sbErr) {
        console.warn('Supabase override error, continuing fallback:', sbErr);
      }
    }

    // 3. Fallback: DevStore & Mongo
    DevStore.overrideUserPlan(targetUserId, newPlan, isoExpiry, cleanReason, adminId);

    try {
      await dbConnect();
      await User.findByIdAndUpdate(targetUserId, {
        plan: newPlan,
        adminNotes: cleanReason,
      });
    } catch {
      // Offline fallback ok
    }

    return NextResponse.json({
      success: true,
      message: `Plan successfully updated to ${newPlan}.`,
      data: {
        targetUserId,
        newPlan,
        expiresAt: isoExpiry,
        reason: cleanReason,
      },
    });
  } catch (error: any) {
    console.error('Plan override error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute plan override' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // 1. Independent Server-side Admin Verification
  const adminAuth = await verifyAdminAccess();
  if (!adminAuth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ logs: [] });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_actions_log')
          .select('*')
          .eq('target_user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          return NextResponse.json({ success: true, logs: data });
        }
      } catch (sbErr) {
        console.warn('Supabase admin_actions_log fetch error:', sbErr);
      }
    }

    // Fallback: DevStore
    const logs = DevStore.getAdminActionLogs(targetUserId);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('Fetch override logs error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch logs' }, { status: 500 });
  }
}
