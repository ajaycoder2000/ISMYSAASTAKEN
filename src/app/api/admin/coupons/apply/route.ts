import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { DevStore } from '@/lib/dev-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Strict server-side admin check
  const adminAuth = await verifyAdminAccess();
  if (!adminAuth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized — Admin access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, couponCode, adminId: bodyAdminId } = body;
    const adminId = adminAuth.adminId || bodyAdminId || 'admin';

    if (!userId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    if (!couponCode || typeof couponCode !== 'string' || !couponCode.trim()) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const cleanCode = couponCode.toUpperCase().trim();
    const supabase = getSupabaseAdmin();

    let coupon: any = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
      }
      coupon = data;
    }

    // DevStore fallback for coupon lookup
    if (!coupon) {
      coupon = DevStore.getCouponByCode(cleanCode);
    }

    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: `Coupon '${cleanCode}' is invalid or inactive` }, { status: 400 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: `Coupon '${cleanCode}' has expired on ${new Date(coupon.expires_at).toLocaleDateString()}` }, { status: 400 });
    }

    if (coupon.max_uses !== null && coupon.max_uses !== undefined && coupon.uses_count >= coupon.max_uses) {
      return NextResponse.json({ error: `Coupon '${cleanCode}' has reached its maximum redemptions limit (${coupon.max_uses})` }, { status: 400 });
    }

    // 2. Fetch current user from Supabase to compute extensions if needed
    let existingUser: any = null;
    if (supabase) {
      const { data: userRow } = await supabase
        .from('users')
        .select('id, email, plan, plan_expires_at, bonus_scans')
        .or(`id.eq.${userId},clerk_id.eq.${userId}`)
        .maybeSingle();
      existingUser = userRow;
    }

    // 3. Apply the Effect
    let userUpdates: Record<string, any> = {};
    let effectSummary = '';

    if (coupon.effect_type === 'set_plan') {
      const newPlan = coupon.effect_value.plan || 'sprint_pass';
      const days = coupon.effect_value.days ? Number(coupon.effect_value.days) : null;
      const expiresAt = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : null;

      userUpdates.plan = newPlan;
      userUpdates.plan_expires_at = expiresAt;
      effectSummary = `Set plan to ${newPlan}${days ? ` for ${days} days` : ' (permanent)'}`;

    } else if (coupon.effect_type === 'extend_plan') {
      const days = Number(coupon.effect_value.days || 7);
      const currentExpiry = existingUser?.plan_expires_at ? new Date(existingUser.plan_expires_at) : null;
      const baseTime = currentExpiry && currentExpiry > new Date() ? currentExpiry.getTime() : Date.now();
      const newExpiry = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString();

      userUpdates.plan_expires_at = newExpiry;
      if (coupon.effect_value.plan) {
        userUpdates.plan = coupon.effect_value.plan;
      }
      effectSummary = `Extended plan by ${days} days (expires ${new Date(newExpiry).toLocaleDateString()})`;

    } else if (coupon.effect_type === 'bonus_free_scans') {
      const amount = Number(coupon.effect_value.bonus_scans || 1);
      effectSummary = `Added ${amount} bonus free scans`;

      if (supabase) {
        // Try Postgres RPC first
        const { error: rpcErr } = await supabase.rpc('add_bonus_scans', { uid: userId, amount });
        if (rpcErr) {
          // Direct update fallback
          const currentBonus = existingUser?.bonus_scans || 0;
          userUpdates.bonus_scans = currentBonus + amount;
        }
      }
    }

    // Update user in Supabase
    if (supabase && Object.keys(userUpdates).length > 0) {
      await supabase
        .from('users')
        .update(userUpdates)
        .or(`id.eq.${userId},clerk_id.eq.${userId}`);

      // Try profiles if it exists
      try {
        await supabase
          .from('profiles')
          .update(userUpdates)
          .eq('id', userId);
      } catch {}
    }

    // 4. Record Redemption & Increment uses_count
    if (supabase) {
      // Insert redemption record
      await supabase.from('coupon_redemptions').insert({
        coupon_id: coupon.id,
        user_id: userId,
        applied_by_admin_id: adminId,
      });

      // Increment coupon uses_count
      await supabase
        .from('coupons')
        .update({ uses_count: (coupon.uses_count || 0) + 1 })
        .eq('id', coupon.id);

      // Audit log entry
      try {
        await supabase.from('admin_actions_log').insert({
          admin_id: adminId,
          target_user_id: userId,
          action: 'coupon_applied',
          details: {
            couponCode: coupon.code,
            effectType: coupon.effect_type,
            effectValue: coupon.effect_value,
            effectSummary,
          },
        });
      } catch (auditErr) {
        console.warn('Failed to insert admin_actions_log for coupon:', auditErr);
      }
    }

    // 5. Sync with DevStore
    DevStore.applyCouponToUser(adminId, userId, cleanCode);

    return NextResponse.json({
      success: true,
      message: `Coupon '${cleanCode}' applied: ${effectSummary}`,
      couponCode: cleanCode,
      effectSummary,
    });
  } catch (error: any) {
    console.error('Coupon apply error:', error);
    return NextResponse.json({ error: error.message || 'Failed to apply coupon' }, { status: 500 });
  }
}
