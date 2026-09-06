import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { DevStore } from '@/lib/dev-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const adminAuth = await verifyAdminAccess();
  if (!adminAuth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized — Admin access required' }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json({ coupons: data });
      }
    } catch (err) {
      console.warn('Coupons fetch Supabase error, falling back to DevStore:', err);
    }
  }

  // DevStore fallback
  const coupons = DevStore.getAllCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const adminAuth = await verifyAdminAccess();
  if (!adminAuth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized — Admin access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { code, effectType, effectValue, maxUses, expiresAt, active = true } = body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    if (!effectType || !['set_plan', 'extend_plan', 'bonus_free_scans'].includes(effectType)) {
      return NextResponse.json({ error: 'Valid effect type is required (set_plan, extend_plan, bonus_free_scans)' }, { status: 400 });
    }

    if (!effectValue || typeof effectValue !== 'object') {
      return NextResponse.json({ error: 'Effect value details are required' }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const parsedMaxUses = maxUses !== undefined && maxUses !== null && maxUses !== '' ? Number(maxUses) : null;
    const parsedExpiresAt = expiresAt ? new Date(expiresAt).toISOString() : null;

    const supabase = getSupabaseAdmin();
    let createdCoupon: any = null;

    if (supabase) {
      // Check existing code
      const { data: existing } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', cleanCode)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: `Coupon code '${cleanCode}' already exists` }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('coupons')
        .insert({
          code: cleanCode,
          effect_type: effectType,
          effect_value: effectValue,
          max_uses: parsedMaxUses,
          expires_at: parsedExpiresAt,
          active: Boolean(active),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      createdCoupon = data;
    }

    // Sync to DevStore
    try {
      createdCoupon = DevStore.createCoupon({
        code: cleanCode,
        effect_type: effectType,
        effect_value: effectValue,
        max_uses: parsedMaxUses,
        expires_at: parsedExpiresAt,
        active: Boolean(active),
      });
    } catch {
      // If DevStore already has it or offline
    }

    return NextResponse.json({ success: true, coupon: createdCoupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const adminAuth = await verifyAdminAccess();
  if (!adminAuth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized — Admin access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { couponId, active, maxUses, expiresAt } = body;

    if (!couponId) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (typeof active === 'boolean') updates.active = active;
    if (maxUses !== undefined) updates.max_uses = maxUses !== null && maxUses !== '' ? Number(maxUses) : null;
    if (expiresAt !== undefined) updates.expires_at = expiresAt ? new Date(expiresAt).toISOString() : null;

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from('coupons').update(updates).eq('id', couponId);
    }

    DevStore.updateCoupon(couponId, updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update coupon' }, { status: 500 });
  }
}
