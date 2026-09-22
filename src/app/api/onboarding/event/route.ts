import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const VALID_EVENTS = ['quiz_shown', 'quiz_dismissed', 'quiz_completed', 'bonus_claimed'] as const;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json().catch(() => null);

    if (!body || !body.event || !VALID_EVENTS.includes(body.event)) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from('quiz_events').insert({
          event: body.event,
          user_id: userId || null,
          metadata: body.metadata || {},
          created_at: new Date().toISOString(),
        });
      } catch {
        // Telemetry failure is non-blocking
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // Always return 200 for analytics
  }
}
