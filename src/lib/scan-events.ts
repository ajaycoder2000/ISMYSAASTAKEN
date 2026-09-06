import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { DevStore } from '@/lib/dev-store';
import { ScanToolType } from '@/types';

/**
 * Unified Scan Event Logger
 * 
 * Additively logs scan completions across Idea Scanner, Keyword Radar, and Is It Taken.
 * Writes to Supabase `scan_events` table and local DevStore.
 * Non-blocking: will never disrupt user scans if logging fails.
 */
export async function recordScanEvent(
  tool: ScanToolType,
  userId?: string | null
): Promise<void> {
  const cleanUserId = userId && userId !== 'anonymous' ? userId : null;

  // 1. Supabase Postgres Log
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      await supabase.from('scan_events').insert({
        tool,
        user_id: cleanUserId,
      });
    } catch (err) {
      console.warn(`Failed to record scan event in Supabase for ${tool}:`, err);
    }
  }

  // 2. DevStore Local / Offline Log
  try {
    DevStore.recordScanEvent(tool, cleanUserId);
  } catch (devErr) {
    console.warn(`Failed to record scan event in DevStore for ${tool}:`, devErr);
  }
}
