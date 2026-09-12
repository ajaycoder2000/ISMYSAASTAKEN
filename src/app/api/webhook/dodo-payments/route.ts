import { Webhooks } from '@dodopayments/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { DevStore } from '@/lib/dev-store';
import { PlanType } from '@/types';

export const dynamic = 'force-dynamic';

// Live product IDs
const LIVE_SPRINT_PASS = 'pdt_0NnMyu4e7QVSBFRVyfgTG';
const LIVE_FOUNDER_PRO = 'pdt_0NnMytX9JyLRoQljhwwmj';
const LIVE_FOUNDER_PRO_ANNUAL = 'pdt_0NnMytpeAfTAkzo2P45pE';
const LIVE_STUDIO = 'pdt_0NnMytHDvd9MYJIXYfCwq';

// Test product IDs
const TEST_SPRINT_PASS = 'pdt_0NnJVAdQ1ALuw6XvK1Rje';
const TEST_FOUNDER_PRO = 'pdt_0NnJVsQ5qEml9FppiJH7v';
const TEST_FOUNDER_PRO_ANNUAL = 'pdt_0NnJaTRdnDi9VvdxutDF0';
const TEST_STUDIO = 'pdt_0NnJW4Mykqa4cSzBJXKib';

const SPRINT_PASS_IDS = [process.env.DODO_SPRINT_PASS_PRODUCT_ID, LIVE_SPRINT_PASS, TEST_SPRINT_PASS].filter(Boolean);
const FOUNDER_PRO_IDS = [process.env.DODO_FOUNDER_PRO_PRODUCT_ID, LIVE_FOUNDER_PRO, TEST_FOUNDER_PRO].filter(Boolean);
const FOUNDER_PRO_ANNUAL_IDS = [process.env.DODO_FOUNDER_PRO_ANNUAL_PRODUCT_ID, LIVE_FOUNDER_PRO_ANNUAL, TEST_FOUNDER_PRO_ANNUAL].filter(Boolean);
const STUDIO_IDS = [process.env.DODO_STUDIO_PRODUCT_ID, LIVE_STUDIO, TEST_STUDIO].filter(Boolean);

function resolvePlanFromProductId(productId?: string | null): PlanType {
  if (!productId) return 'founder_pro';
  if (SPRINT_PASS_IDS.includes(productId)) return 'sprint_pass';
  if (STUDIO_IDS.includes(productId)) return 'studio';
  if (FOUNDER_PRO_IDS.includes(productId) || FOUNDER_PRO_ANNUAL_IDS.includes(productId)) return 'founder_pro';
  return 'founder_pro';
}

async function provisionUserPlan({
  userId,
  email,
  plan,
  expiresAt,
  dodoCustomerId,
}: {
  userId?: string | null;
  email?: string | null;
  plan: PlanType;
  expiresAt: string | null;
  dodoCustomerId?: string | null;
}) {
  const isSprintPass = plan === 'sprint_pass';
  console.log(
    `[Dodo Webhook] Provisioning plan "${plan}" for user="${userId || 'n/a'}", email="${
      email || 'n/a'
    }", expires="${expiresAt || 'never'}"`
  );

  // 1. Update Supabase
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const updateData: Record<string, any> = {
        plan,
        plan_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      };
      if (isSprintPass) {
        updateData.idea_scans_used = 0;
        updateData.new_tools_scans_used = 0;
      }
      if (dodoCustomerId) {
        updateData.dodo_customer_id = dodoCustomerId;
      }

      if (userId) {
        await supabase.from('profiles').update(updateData).eq('id', userId);
        await supabase.from('users').update(updateData).or(`id.eq.${userId},clerk_id.eq.${userId}`);
      }

      if (email) {
        await supabase.from('profiles').update(updateData).eq('email', email);
        await supabase.from('users').update(updateData).eq('email', email);
      }
    } catch (err) {
      console.error('[Dodo Webhook] Supabase update error:', err);
    }
  }

  // 2. Update MongoDB
  try {
    await dbConnect();
    const mongoUpdate: Record<string, any> = {
      plan,
      plan_expires_at: expiresAt ? new Date(expiresAt) : null,
    };
    if (isSprintPass) {
      mongoUpdate.idea_scans_used = 0;
      mongoUpdate.new_tools_scans_used = 0;
    }

    const conditions: any[] = [];
    if (userId) conditions.push({ _id: userId }, { clerkId: userId });
    if (email) conditions.push({ email: email.toLowerCase() });

    if (conditions.length > 0) {
      await User.findOneAndUpdate({ $or: conditions }, mongoUpdate);
    }
  } catch (err) {
    console.warn('[Dodo Webhook] MongoDB update failed:', err);
  }

  // 3. Update DevStore
  try {
    let devUser = null;
    if (userId) devUser = DevStore.findUserById(userId);
    if (!devUser && email) devUser = DevStore.findUserByEmail(email);

    if (devUser) {
      DevStore.updateUser(devUser._id, {
        plan,
        plan_expires_at: expiresAt,
        ...(isSprintPass ? { idea_scans_used: 0, new_tools_scans_used: 0 } : {}),
      });
    }
  } catch (err) {
    console.warn('[Dodo Webhook] DevStore update failed:', err);
  }
}

let cachedWebhookHandler: ((req: NextRequest) => Promise<NextResponse<unknown>>) | null = null;
let lastWebhookKey = '';

function getWebhookHandler(webhookKey: string) {
  if (!cachedWebhookHandler || lastWebhookKey !== webhookKey) {
    lastWebhookKey = webhookKey;
    cachedWebhookHandler = Webhooks({
      webhookKey,
      onPayload: async (payload) => {
        // Inspection log for Step 6 verification
        console.log('[Dodo Webhook] Raw event payload received:', JSON.stringify(payload, null, 2));
      },
      onPaymentSucceeded: async (payload) => {
        console.log('[Dodo Webhook] onPaymentSucceeded payload:', JSON.stringify(payload, null, 2));
        const data = payload.data as any;
        const productId = data.product_cart?.[0]?.product_id || data.product_id;
        const plan = resolvePlanFromProductId(productId);
        const userId = (data.metadata as any)?.userId || (data.customer?.metadata as any)?.userId;
        const customerEmail = data.customer?.email;
        const customerId = data.customer?.customer_id;

        let expiresAt: string | null = null;
        if (plan === 'sprint_pass') {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 7);
          expiresAt = expiry.toISOString();
        }

        await provisionUserPlan({
          userId,
          email: customerEmail,
          plan,
          expiresAt,
          dodoCustomerId: customerId,
        });
      },
      onSubscriptionActive: async (payload) => {
        console.log('[Dodo Webhook] onSubscriptionActive payload:', JSON.stringify(payload, null, 2));
        const data = payload.data as any;
        const plan = resolvePlanFromProductId(data.product_id);
        const userId = (data.metadata as any)?.userId || (data.customer?.metadata as any)?.userId;
        const customerEmail = data.customer?.email;
        const customerId = data.customer?.customer_id;

        await provisionUserPlan({
          userId,
          email: customerEmail,
          plan,
          expiresAt: null,
          dodoCustomerId: customerId,
        });
      },
      onSubscriptionRenewed: async (payload) => {
        console.log('[Dodo Webhook] onSubscriptionRenewed payload:', JSON.stringify(payload, null, 2));
        const data = payload.data as any;
        const plan = resolvePlanFromProductId(data.product_id);
        const userId = (data.metadata as any)?.userId || (data.customer?.metadata as any)?.userId;
        const customerEmail = data.customer?.email;
        const customerId = data.customer?.customer_id;

        await provisionUserPlan({
          userId,
          email: customerEmail,
          plan,
          expiresAt: null,
          dodoCustomerId: customerId,
        });
      },
      onSubscriptionPlanChanged: async (payload) => {
        console.log('[Dodo Webhook] onSubscriptionPlanChanged payload:', JSON.stringify(payload, null, 2));
        const data = payload.data as any;
        const plan = resolvePlanFromProductId(data.product_id);
        const userId = (data.metadata as any)?.userId || (data.customer?.metadata as any)?.userId;
        const customerEmail = data.customer?.email;
        const customerId = data.customer?.customer_id;

        await provisionUserPlan({
          userId,
          email: customerEmail,
          plan,
          expiresAt: null,
          dodoCustomerId: customerId,
        });
      },
      onSubscriptionCancelled: async (payload) => {
        console.log('[Dodo Webhook] onSubscriptionCancelled payload:', JSON.stringify(payload, null, 2));
        const data = payload.data as any;
        const userId = (data.metadata as any)?.userId || (data.customer?.metadata as any)?.userId;
        const customerEmail = data.customer?.email;

        await provisionUserPlan({
          userId,
          email: customerEmail,
          plan: 'free',
          expiresAt: null,
        });
      },
      onSubscriptionExpired: async (payload) => {
        console.log('[Dodo Webhook] onSubscriptionExpired payload:', JSON.stringify(payload, null, 2));
        const data = payload.data as any;
        const userId = (data.metadata as any)?.userId || (data.customer?.metadata as any)?.userId;
        const customerEmail = data.customer?.email;

        await provisionUserPlan({
          userId,
          email: customerEmail,
          plan: 'free',
          expiresAt: null,
        });
      },
      onPaymentFailed: async (payload) => {
        console.log('[Dodo Webhook] onPaymentFailed payload:', JSON.stringify(payload, null, 2));
      },
    });
  }
  return cachedWebhookHandler;
}

export async function POST(req: NextRequest) {
  const currentKey =
    process.env.DODO_PAYMENTS_WEBHOOK_KEY || process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!currentKey) {
    console.warn('[Dodo Webhook] DODO_PAYMENTS_WEBHOOK_KEY is not configured in environment.');
    return NextResponse.json(
      { error: 'DODO_PAYMENTS_WEBHOOK_KEY is not configured.' },
      { status: 500 }
    );
  }
  const handler = getWebhookHandler(currentKey);
  return handler(req);
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'dodo-payments-webhook' });
}
