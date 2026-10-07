import { Webhook } from 'svix';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/auth';
import { SupabaseDB } from '@/lib/supabase/db';
import { DevStore } from '@/lib/dev-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || process.env.CLERK_WEBHOOK_KEY;

  if (!webhookSecret) {
    console.error('[Clerk Webhook] Missing CLERK_WEBHOOK_SECRET in environment variables.');
    return NextResponse.json(
      { error: 'CLERK_WEBHOOK_SECRET is not configured' },
      { status: 500 }
    );
  }

  // Extract raw body text and Svix verification headers
  const payload = await req.text();
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.warn('[Clerk Webhook] Missing Svix headers');
    return new NextResponse('Missing Svix signature headers', { status: 400 });
  }

  const wh = new Webhook(webhookSecret);
  let evt: any;

  try {
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err: any) {
    console.error('[Clerk Webhook] Signature verification failed:', err?.message);
    return new NextResponse('Invalid signature', { status: 401 });
  }

  const eventType = evt.type;
  console.log(`[Clerk Webhook] Received event: ${eventType} for user: ${evt.data?.id}`);

  const supabase = getSupabaseAdmin();

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const clerkId = evt.data.id;
    const primaryEmail = (
      evt.data.email_addresses?.find((e: any) => e.id === evt.data.primary_email_address_id)
        ?.email_address ||
      evt.data.email_addresses?.[0]?.email_address ||
      ''
    ).toLowerCase().trim();

    const isAuthorizedAdmin = isAdminEmail(primaryEmail);
    const plan = isAuthorizedAdmin ? 'founder_pro' : 'free';
    const role = isAuthorizedAdmin ? 'admin' : 'user';

    // 1. Provision / update in Supabase 'profiles' table (id is Clerk userId)
    if (supabase) {
      try {
        const profileData: Record<string, any> = {
          id: clerkId,
          email: primaryEmail,
          is_admin: isAuthorizedAdmin,
          role,
          updated_at: new Date().toISOString(),
        };

        // Only initialize usage counters and plan on initial creation
        if (eventType === 'user.created') {
          profileData.plan = plan;
          profileData.idea_scans_used = 0;
          profileData.new_tools_scans_used = 0;
          profileData.bonus_scans = 0;
        }

        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' });

        if (profileErr) {
          console.warn('[Clerk Webhook] Supabase profiles upsert warning:', profileErr.message);
        } else {
          console.log(`[Clerk Webhook] Successfully provisioned profile for ${clerkId} (${primaryEmail})`);
        }
      } catch (err) {
        console.error('[Clerk Webhook] Profiles update failed:', err);
      }
    }

    // 2. Also keep 'users' table in sync for backward compatibility
    if (primaryEmail) {
      try {
        await SupabaseDB.syncUser(clerkId, primaryEmail);
      } catch (syncErr) {
        console.warn('[Clerk Webhook] SupabaseDB.syncUser failed:', syncErr);
      }
    }

    // 3. Sync local DevStore for offline/testing mode
    try {
      const existing = DevStore.findUserById(clerkId) || DevStore.findUserByEmail(primaryEmail);
      if (existing) {
        DevStore.updateUser(existing._id, {
          plan,
          role,
          is_admin: isAuthorizedAdmin,
        });
      } else {
        const u = DevStore.createUser(primaryEmail, role);
        DevStore.updateUser(u._id, { plan, is_admin: isAuthorizedAdmin });
      }
    } catch {
      // ignore
    }
  } else if (eventType === 'user.deleted') {
    const clerkId = evt.data.id;
    console.log(`[Clerk Webhook] User deleted: ${clerkId}`);

    if (supabase && clerkId) {
      try {
        await supabase.from('profiles').delete().eq('id', clerkId);
        await supabase.from('users').delete().eq('clerk_id', clerkId);
      } catch (delErr) {
        console.warn('[Clerk Webhook] Supabase user delete failed:', delErr);
      }
    }
  }

  return NextResponse.json({ success: true, event: eventType }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'clerk-webhook' });
}
