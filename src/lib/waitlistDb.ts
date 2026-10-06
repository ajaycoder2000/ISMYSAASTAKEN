import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { DevStore, DevWaitlistEntry } from '@/lib/dev-store';

export interface WaitlistEntry {
  id: string;
  email: string;
  status: 'pending' | 'confirmed';
  confirm_token: string;
  unsubscribe_token: string;
  referral_code: string;
  referred_by?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  building_type?: string | null;
  ip_hash?: string | null;
  reward_claimed?: boolean;
  created_at: string;
  confirmed_at?: string | null;
  unsubscribed_at?: string | null;
}

export const WaitlistDB = {
  /**
   * Find a waitlist entry by email (case-insensitive)
   */
  async findByEmail(email: string): Promise<WaitlistEntry | null> {
    const cleanEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('waitlist')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (!error && data) {
          return data as WaitlistEntry;
        }
      } catch (err) {
        console.warn('[WaitlistDB] Supabase query failed, falling back to DevStore:', err);
      }
    }

    return DevStore.getWaitlistByEmail(cleanEmail);
  },

  /**
   * Find entry by confirm_token
   */
  async findByConfirmToken(token: string): Promise<WaitlistEntry | null> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('waitlist')
          .select('*')
          .eq('confirm_token', token)
          .maybeSingle();

        if (!error && data) {
          return data as WaitlistEntry;
        }
      } catch (err) {
        console.warn('[WaitlistDB] Supabase query failed, falling back to DevStore:', err);
      }
    }

    return DevStore.getWaitlistByConfirmToken(token);
  },

  /**
   * Find entry by unsubscribe_token
   */
  async findByUnsubscribeToken(token: string): Promise<WaitlistEntry | null> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('waitlist')
          .select('*')
          .eq('unsubscribe_token', token)
          .maybeSingle();

        if (!error && data) {
          return data as WaitlistEntry;
        }
      } catch (err) {
        console.warn('[WaitlistDB] Supabase query failed, falling back to DevStore:', err);
      }
    }

    return DevStore.getWaitlistByUnsubscribeToken(token);
  },

  /**
   * Find entry by referral code
   */
  async findByReferralCode(code: string): Promise<WaitlistEntry | null> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('waitlist')
          .select('*')
          .eq('referral_code', code)
          .maybeSingle();

        if (!error && data) {
          return data as WaitlistEntry;
        }
      } catch (err) {
        console.warn('[WaitlistDB] Supabase query failed, falling back to DevStore:', err);
      }
    }

    return DevStore.getWaitlistByReferralCode(code);
  },

  /**
   * Count joins from this IP hash in the last 60 minutes (Rate limiting: max 5 per hour)
   */
  async countIpJoinsLastHour(ipHash: string): Promise<number> {
    const supabase = getSupabaseAdmin();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    if (supabase) {
      try {
        const { count, error } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })
          .eq('ip_hash', ipHash)
          .gte('created_at', oneHourAgo);

        if (!error && typeof count === 'number') {
          return count;
        }
      } catch (err) {
        console.warn('[WaitlistDB] Supabase count failed, falling back to DevStore:', err);
      }
    }

    return DevStore.countIpJoinsLastHour(ipHash);
  },

  /**
   * Create a new waitlist entry
   */
  async createEntry(data: {
    email: string;
    referral_code: string;
    referred_by?: string | null;
    utm_source?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    ip_hash?: string | null;
  }): Promise<WaitlistEntry> {
    const cleanEmail = data.email.toLowerCase().trim();
    const supabase = getSupabaseAdmin();

    const newRecord = {
      email: cleanEmail,
      status: 'pending',
      referral_code: data.referral_code,
      referred_by: data.referred_by || null,
      utm_source: data.utm_source || null,
      utm_campaign: data.utm_campaign || null,
      utm_content: data.utm_content || null,
      ip_hash: data.ip_hash || null,
      reward_claimed: false,
    };

    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('waitlist')
          .insert(newRecord)
          .select()
          .single();

        if (!error && inserted) {
          return inserted as WaitlistEntry;
        }
        if (error) {
          console.error('[WaitlistDB] Supabase insert error:', error.message);
        }
      } catch (err) {
        console.warn('[WaitlistDB] Supabase insert failed, falling back to DevStore:', err);
      }
    }

    return DevStore.createWaitlistEntry(newRecord);
  },

  /**
   * Update building_type answer
   */
  async updateBuildingType(codeOrEmail: string, buildingType: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();
    const cleanVal = codeOrEmail.trim();

    if (supabase) {
      try {
        const { error } = await supabase
          .from('waitlist')
          .update({ building_type: buildingType })
          .or(`referral_code.eq.${cleanVal},email.ilike.${cleanVal.toLowerCase()}`);

        if (!error) return true;
      } catch (err) {
        console.warn('[WaitlistDB] Supabase update building_type failed:', err);
      }
    }

    return DevStore.updateWaitlistBuildingType(cleanVal, buildingType);
  },

  /**
   * Confirm waitlist entry (double opt-in verification)
   */
  async confirmEntry(token: string): Promise<{
    success: boolean;
    entry: WaitlistEntry | null;
    alreadyConfirmed: boolean;
  }> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('waitlist')
          .select('*')
          .eq('confirm_token', token)
          .maybeSingle();

        if (!existing) {
          return { success: false, entry: null, alreadyConfirmed: false };
        }

        if (existing.status === 'confirmed') {
          return { success: true, entry: existing as WaitlistEntry, alreadyConfirmed: true };
        }

        const now = new Date().toISOString();
        const { data: updated, error } = await supabase
          .from('waitlist')
          .update({ status: 'confirmed', confirmed_at: now })
          .eq('id', existing.id)
          .select()
          .single();

        if (!error && updated) {
          return { success: true, entry: updated as WaitlistEntry, alreadyConfirmed: false };
        }
      } catch (err) {
        console.warn('[WaitlistDB] Supabase confirm failed, falling back to DevStore:', err);
      }
    }

    return DevStore.confirmWaitlistEntry(token);
  },

  /**
   * Unsubscribe from waitlist
   */
  async unsubscribe(token: string): Promise<{ success: boolean; entry: WaitlistEntry | null }> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('waitlist')
          .update({ unsubscribed_at: now })
          .eq('unsubscribe_token', token)
          .select()
          .single();

        if (!error && data) {
          return { success: true, entry: data as WaitlistEntry };
        }
      } catch (err) {
        console.warn('[WaitlistDB] Supabase unsubscribe failed:', err);
      }
    }

    return DevStore.unsubscribeWaitlistEntry(token);
  },

  /**
   * Count confirmed friends invited by a referral code
   * Only rows where referred_by = referralCode AND status = 'confirmed'
   */
  async countConfirmedFriends(referralCode: string): Promise<number> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { count, error } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })
          .eq('referred_by', referralCode)
          .eq('status', 'confirmed');

        if (!error && typeof count === 'number') {
          return count;
        }
      } catch (err) {
        console.warn('[WaitlistDB] Supabase referral count failed:', err);
      }
    }

    return DevStore.countConfirmedFriends(referralCode);
  },

  /**
   * Aggregated statistics for admin dashboard
   */
  async getStats(): Promise<{
    totalConfirmed: number;
    totalPending: number;
    totalUnsubscribed: number;
    signupsPerDay: { date: string; count: number }[];
    signupsByUtmContent: { content: string; count: number }[];
    topReferrers: { code: string; count: number }[];
  }> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data: rows, error } = await supabase
          .from('waitlist')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && rows) {
          return computeStatsFromRows(rows as WaitlistEntry[]);
        }
      } catch (err) {
        console.warn('[WaitlistDB] Supabase getStats failed:', err);
      }
    }

    return DevStore.getWaitlistStats();
  },

  /**
   * Export CSV of confirmed, non-unsubscribed waitlist emails
   */
  async getConfirmedCsv(): Promise<string> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data: rows, error } = await supabase
          .from('waitlist')
          .select('email, referral_code, building_type, created_at, confirmed_at')
          .eq('status', 'confirmed')
          .is('unsubscribed_at', null)
          .order('confirmed_at', { ascending: false });

        if (!error && rows) {
          return generateCsv(rows);
        }
      } catch (err) {
        console.warn('[WaitlistDB] Supabase getConfirmedCsv failed:', err);
      }
    }

    return DevStore.getWaitlistCsv();
  },

  /**
   * Launch Day: Claim waitlist rewards for newly registered user in Clerk webhook
   */
  async claimRewardIfEligible(email: string): Promise<{
    claimed: boolean;
    bonusScans: number;
    referralsCount: number;
  } | null> {
    const cleanEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data: entry } = await supabase
          .from('waitlist')
          .select('*')
          .ilike('email', cleanEmail)
          .eq('status', 'confirmed')
          .is('unsubscribed_at', null)
          .maybeSingle();

        if (entry && !entry.reward_claimed) {
          // Count confirmed referrals
          const { count } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', entry.referral_code)
            .eq('status', 'confirmed');

          const friendsCount = count || 0;
          // Base reward: 1 bonus scan + 1 bonus scan per reached tier
          let bonusScans = 1;
          if (friendsCount >= 1) bonusScans += 1;
          if (friendsCount >= 3) bonusScans += 1;
          if (friendsCount >= 5) bonusScans += 1;

          // Mark claimed
          await supabase
            .from('waitlist')
            .update({ reward_claimed: true })
            .eq('id', entry.id);

          return { claimed: true, bonusScans, referralsCount: friendsCount };
        }

        return null;
      } catch (err) {
        console.warn('[WaitlistDB] Supabase claimReward failed:', err);
      }
    }

    return DevStore.claimWaitlistReward(cleanEmail);
  },
};

function computeStatsFromRows(rows: WaitlistEntry[]) {
  let totalConfirmed = 0;
  let totalPending = 0;
  let totalUnsubscribed = 0;

  const perDayMap: Record<string, number> = {};
  const utmContentMap: Record<string, number> = {};
  const referrerMap: Record<string, number> = {};

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  for (const r of rows) {
    if (r.unsubscribed_at) {
      totalUnsubscribed += 1;
    }
    if (r.status === 'confirmed') {
      totalConfirmed += 1;
    } else {
      totalPending += 1;
    }

    const createdTime = new Date(r.created_at).getTime();
    if (createdTime >= thirtyDaysAgo) {
      const dateStr = r.created_at.slice(0, 10);
      perDayMap[dateStr] = (perDayMap[dateStr] || 0) + 1;
    }

    if (r.utm_content) {
      utmContentMap[r.utm_content] = (utmContentMap[r.utm_content] || 0) + 1;
    }

    if (r.referred_by && r.status === 'confirmed') {
      referrerMap[r.referred_by] = (referrerMap[r.referred_by] || 0) + 1;
    }
  }

  const signupsPerDay = Object.entries(perDayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const signupsByUtmContent = Object.entries(utmContentMap)
    .sort(([, a], [, b]) => b - a)
    .map(([content, count]) => ({ content, count }));

  const topReferrers = Object.entries(referrerMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([code, count]) => ({ code, count }));

  return {
    totalConfirmed,
    totalPending,
    totalUnsubscribed,
    signupsPerDay,
    signupsByUtmContent,
    topReferrers,
  };
}

function generateCsv(rows: any[]): string {
  const headers = ['Email', 'Referral Code', 'Building Type', 'Joined At', 'Confirmed At'];
  const lines = [headers.join(',')];

  for (const r of rows) {
    const fields = [
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${r.referral_code || ''}"`,
      `"${(r.building_type || '').replace(/"/g, '""')}"`,
      `"${r.created_at || ''}"`,
      `"${r.confirmed_at || ''}"`,
    ];
    lines.push(fields.join(','));
  }

  return lines.join('\n');
}
