import { getSupabaseAdmin } from './admin';
import { IScanDocument, PlanType, UserRole } from '@/types';
import { DevStore } from '@/lib/dev-store';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import { REAL_SEEDED_SCANS } from '@/lib/seeds/real-scans';

export const SupabaseDB = {
  /**
   * Sync Clerk User with Supabase Users table
   */
  async syncUser(clerkId: string, email: string): Promise<{
    id: string;
    clerkId: string;
    email: string;
    plan: PlanType;
    role: UserRole;
    scansUsedThisMonth: number;
    scansRemaining: number;
    scansResetDate: Date;
  }> {
    const supabase = getSupabaseAdmin();
    const cleanEmail = email.toLowerCase().trim();

    if (supabase) {
      try {
        // 1. Try to find user
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .or(`clerk_id.eq.${clerkId},email.eq.${cleanEmail}`)
          .maybeSingle();

        if (existingUser) {
          // If user exists, check if reset date passed
          let scansUsed = existingUser.scans_used_this_month;
          let resetDate = new Date(existingUser.scans_reset_date);

          if (new Date() > resetDate) {
            scansUsed = 0;
            const nextReset = new Date();
            nextReset.setMonth(nextReset.getMonth() + 1);
            nextReset.setDate(1);
            nextReset.setHours(0, 0, 0, 0);
            resetDate = nextReset;

            await supabase
              .from('users')
              .update({
                scans_used_this_month: 0,
                scans_reset_date: resetDate.toISOString(),
                clerk_id: clerkId,
              })
              .eq('id', existingUser.id);
          }

          const FREE_CAP = 3;
          const remaining = existingUser.plan === 'pro' ? 9999 : Math.max(0, FREE_CAP - scansUsed);

          return {
            id: existingUser.id,
            clerkId: existingUser.clerk_id || clerkId,
            email: existingUser.email,
            plan: (existingUser.plan as PlanType) || 'free',
            role: (existingUser.role as UserRole) || 'user',
            scansUsedThisMonth: scansUsed,
            scansRemaining: remaining,
            scansResetDate: resetDate,
          };
        }

        // 2. Create new user in Supabase
        const adminEnv = (process.env.ADMIN_EMAIL || 'ismysaastaken@gmail.com').toLowerCase();
        const allowedAdmins = adminEnv.split(',').map((e) => e.trim()).filter(Boolean);
        const assignedRole: UserRole = allowedAdmins.includes(cleanEmail) ? 'admin' : 'user';

        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1);
        nextReset.setDate(1);
        nextReset.setHours(0, 0, 0, 0);

        const { data: newUser } = await supabase
          .from('users')
          .insert({
            clerk_id: clerkId,
            email: cleanEmail,
            role: assignedRole,
            plan: 'free',
            scans_used_this_month: 0,
            scans_reset_date: nextReset.toISOString(),
          })
          .select()
          .single();

        if (newUser) {
          // Auto-subscribe new user to The Weekly SaaS Gap Report
          try {
            await SupabaseDB.addSubscriber(cleanEmail);
          } catch (subErr) {
            console.warn('Auto-subscribe on signup failed:', subErr);
          }

          return {
            id: newUser.id,
            clerkId: newUser.clerk_id,
            email: newUser.email,
            plan: 'free',
            role: assignedRole,
            scansUsedThisMonth: 0,
            scansRemaining: 3,
            scansResetDate: nextReset,
          };
        }
      } catch (err) {
        console.warn('Supabase syncUser failed, falling back:', err);
      }
    }

    // DevStore Fallback
    const adminEnv = (process.env.ADMIN_EMAIL || 'ismysaastaken@gmail.com').toLowerCase();
    const allowedAdmins = adminEnv.split(',').map((e) => e.trim()).filter(Boolean);
    const assignedRole: UserRole = allowedAdmins.includes(cleanEmail) ? 'admin' : 'user';

    let devUser = DevStore.findUserByEmail(cleanEmail);
    if (!devUser) {
      devUser = DevStore.createUser(cleanEmail, assignedRole);
    }

    return {
      id: devUser._id,
      clerkId,
      email: devUser.email,
      plan: devUser.plan,
      role: devUser.role,
      scansUsedThisMonth: devUser.scansUsedThisMonth,
      scansRemaining: devUser.plan === 'pro' ? 9999 : Math.max(0, 3 - devUser.scansUsedThisMonth),
      scansResetDate: devUser.scansResetDate,
    };
  },

  /**
   * Save a scan report to Supabase
   */
  async saveScan(scanData: {
    userId?: string | null;
    ideaText: string;
    competitors: any[];
    saturationScore: string;
    saturationReasoning: string;
    gapAnalysis: string;
    pivotAngles?: any[];
    shareSlug: string;
  }): Promise<void> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        await supabase.from('scans').insert({
          user_id: scanData.userId || null,
          idea_text: scanData.ideaText,
          competitors: scanData.competitors,
          saturation_score: scanData.saturationScore,
          saturation_reasoning: scanData.saturationReasoning,
          gap_analysis: scanData.gapAnalysis,
          pivot_angles: scanData.pivotAngles || [],
          share_slug: scanData.shareSlug,
          featured: false,
        });

        // Increment scan count if user exists
        if (scanData.userId) {
          const { data: user } = await supabase
            .from('users')
            .select('id, scans_used_this_month')
            .or(`clerk_id.eq.${scanData.userId},id.eq.${scanData.userId}`)
            .maybeSingle();

          if (user) {
            await supabase
              .from('users')
              .update({ scans_used_this_month: (user.scans_used_this_month || 0) + 1 })
              .eq('id', user.id);
          }
        }
        return;
      } catch (err) {
        console.warn('Supabase saveScan failed, fallback to DevStore:', err);
      }
    }

    // Fallback: DevStore & MongoDB
    DevStore.createScan({
      userId: scanData.userId || null,
      ideaText: scanData.ideaText,
      competitors: scanData.competitors,
      saturationScore: scanData.saturationScore as any,
      saturationReasoning: scanData.saturationReasoning,
      gapAnalysis: scanData.gapAnalysis,
      shareSlug: scanData.shareSlug,
      featured: false,
    });
  },

  /**
   * Get scan by shareSlug
   */
  async getScanBySlug(shareSlug: string): Promise<IScanDocument | null> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data } = await supabase
          .from('scans')
          .select('*')
          .eq('share_slug', shareSlug)
          .maybeSingle();

        if (data) {
          return {
            _id: data.id,
            userId: data.user_id,
            ideaText: data.idea_text,
            competitors: data.competitors,
            saturationScore: data.saturation_score,
            saturationReasoning: data.saturation_reasoning,
            gapAnalysis: data.gap_analysis,
            shareSlug: data.share_slug,
            featured: data.featured,
            createdAt: new Date(data.created_at),
          } as unknown as IScanDocument;
        }
      } catch (err) {
        console.warn('Supabase getScanBySlug failed:', err);
      }
    }

    const devScan = DevStore.findScanBySlug(shareSlug);
    if (devScan) {
      return devScan as unknown as IScanDocument;
    }

    // Check pre-seeded real scans
    const { REAL_SEEDED_SCANS } = await import('@/lib/seeds/real-scans');
    const seeded = REAL_SEEDED_SCANS.find((s) => s.shareSlug === shareSlug);
    if (seeded) {
      return {
        _id: `seed_${seeded.shareSlug}`,
        userId: 'system',
        ideaText: seeded.ideaText,
        competitors: seeded.competitors,
        saturationScore: seeded.saturationScore,
        saturationReasoning: seeded.saturationReasoning,
        gapAnalysis: seeded.gapAnalysis,
        shareSlug: seeded.shareSlug,
        featured: true,
        createdAt: new Date('2026-08-25T10:00:00Z'),
      } as unknown as IScanDocument;
    }

    try {
      await dbConnect();
      return (await Scan.findOne({ shareSlug })) as unknown as IScanDocument;
    } catch {
      return null;
    }
  },

  /**
   * Get recent public scans for the live feed
   */
  async getRecentScans(limit: number = 6): Promise<any[]> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data } = await supabase
          .from('scans')
          .select('id, idea_text, competitors, saturation_score, share_slug, featured, created_at')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (data && data.length > 0) {
          return data.map((s) => ({
            _id: s.id,
            idea: s.idea_text,
            competitors: Array.isArray(s.competitors) ? s.competitors.length : 0,
            saturationScore: s.saturation_score,
            shareSlug: s.share_slug,
            featured: s.featured,
            createdAt: s.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getRecentScans failed:', err);
      }
    }

    return DevStore.getAllScans().slice(0, limit).map((s) => ({
      _id: s._id,
      idea: s.ideaText,
      competitors: s.competitors.length,
      saturationScore: s.saturationScore,
      shareSlug: s.shareSlug,
      featured: s.featured,
      createdAt: s.createdAt,
    }));
  },

  /**
   * Get user scans history
   */
  async getUserScans(userId: string): Promise<any[]> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const [{ data: scansData }, { data: bookmarksData }] = await Promise.all([
          supabase
            .from('scans')
            .select('id, idea_text, competitors, saturation_score, share_slug, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('bookmarks')
            .select('scan_id')
            .eq('user_id', userId),
        ]);

        const bookmarkedIds = new Set((bookmarksData || []).map((b) => b.scan_id));

        if (scansData) {
          return scansData.map((s) => ({
            _id: s.id,
            ideaText: s.idea_text,
            competitorCount: Array.isArray(s.competitors) ? s.competitors.length : 0,
            saturationScore: s.saturation_score,
            shareSlug: s.share_slug,
            createdAt: s.created_at,
            isBookmarked: bookmarkedIds.has(s.id),
          }));
        }
      } catch (err) {
        console.warn('Supabase getUserScans failed:', err);
      }
    }

    return DevStore.getAllScans()
      .filter((s) => s.userId === userId)
      .map((s) => ({
        _id: s._id,
        ideaText: s.ideaText,
        competitorCount: s.competitors.length,
        saturationScore: s.saturationScore,
        shareSlug: s.shareSlug,
        createdAt: s.createdAt,
        isBookmarked: false,
      }));
  },

  /**
   * Toggle Bookmark for a scan
   */
  async toggleBookmark(userId: string, scanId: string): Promise<{ bookmarked: boolean }> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', userId)
          .eq('scan_id', scanId)
          .maybeSingle();

        if (existing) {
          await supabase.from('bookmarks').delete().eq('id', existing.id);
          return { bookmarked: false };
        } else {
          await supabase.from('bookmarks').insert({ user_id: userId, scan_id: scanId });
          return { bookmarked: true };
        }
      } catch (err) {
        console.warn('Supabase toggleBookmark failed:', err);
      }
    }

    return { bookmarked: true };
  },

  /**
   * Add or reactivate a newsletter subscriber
   */
  async addSubscriber(email: string): Promise<{ success: boolean; message: string; alreadyActive?: boolean }> {
    const supabase = getSupabaseAdmin();
    const cleanEmail = email.toLowerCase().trim();
    const token = crypto.randomUUID();

    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('subscribers')
          .select('id, status')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existing) {
          if (existing.status === 'active') {
            return {
              success: true,
              message: "You're already subscribed to the Weekly Gap Report!",
              alreadyActive: true,
            };
          } else {
            await supabase
              .from('subscribers')
              .update({
                status: 'active',
                subscribed_at: new Date().toISOString(),
                unsubscribe_token: token,
              })
              .eq('id', existing.id);
            return {
              success: true,
              message: 'Welcome back! Your subscription has been reactivated.',
            };
          }
        }

        const { error } = await supabase
          .from('subscribers')
          .insert({
            email: cleanEmail,
            status: 'active',
            unsubscribe_token: token,
          });

        if (!error) {
          return {
            success: true,
            message: "You're subscribed! Expect the top 5 gaps every Monday.",
          };
        }
      } catch (err) {
        console.warn('Supabase addSubscriber error, falling back:', err);
      }
    }

    return DevStore.addSubscriber(cleanEmail);
  },

  /**
   * Unsubscribe a subscriber using their token
   */
  async unsubscribeByToken(token: string): Promise<{ success: boolean; email?: string }> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('id, email, status')
          .eq('unsubscribe_token', token)
          .maybeSingle();

        if (subscriber) {
          await supabase
            .from('subscribers')
            .update({ status: 'inactive' })
            .eq('id', subscriber.id);
          return { success: true, email: subscriber.email };
        }
      } catch (err) {
        console.warn('Supabase unsubscribeByToken error:', err);
      }
    }

    return DevStore.unsubscribeByToken(token);
  },

  /**
   * Get active subscribers for the weekly report sendout
   */
  async getActiveSubscribers(): Promise<Array<{ id: string; email: string; unsubscribe_token: string; plan?: string }>> {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        const { data: subs } = await supabase
          .from('subscribers')
          .select('id, email, unsubscribe_token')
          .eq('status', 'active');

        if (subs && subs.length > 0) {
          const emails = subs.map((s) => s.email.toLowerCase().trim());
          const { data: users } = await supabase
            .from('users')
            .select('email, plan')
            .in('email', emails);

          const userMap = new Map((users || []).map((u) => [u.email.toLowerCase().trim(), u]));

          return subs.map((s) => {
            const matched = userMap.get(s.email.toLowerCase().trim());
            return {
              id: s.id,
              email: s.email,
              unsubscribe_token: s.unsubscribe_token,
              plan: matched?.plan || 'free',
            };
          });
        }
      } catch (err) {
        console.warn('Supabase getActiveSubscribers error:', err);
      }
    }

    return DevStore.getActiveSubscribers();
  },

  /**
   * Fetch top 5 gaps for the weekly report from the last 7 days
   */
  async getWeeklyGaps(): Promise<Array<{
    id: string;
    idea_text: string;
    category: string;
    tag: 'open_gap' | 'low_moat' | 'underserved';
    gap_analysis?: string;
    found_at: string;
  }>> {
    const supabase = getSupabaseAdmin();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Try querying 'gaps' table if it exists
    if (supabase) {
      try {
        const { data: gapsData, error } = await supabase
          .from('gaps')
          .select('*')
          .gte('found_at', sevenDaysAgo.toISOString())
          .order('found_at', { ascending: false })
          .limit(5);

        if (!error && gapsData && gapsData.length >= 5) {
          return gapsData;
        }
      } catch {
        // Fallback to scans
      }

      // 2. Query 'scans' table
      try {
        const { data: scansData } = await supabase
          .from('scans')
          .select('id, idea_text, saturation_score, gap_analysis, created_at')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5);

        if (scansData && scansData.length > 0) {
          return scansData.map((s) => {
            let tag: 'open_gap' | 'low_moat' | 'underserved' = 'open_gap';
            if (s.saturation_score === 'high') tag = 'low_moat';
            else if (s.saturation_score === 'medium') tag = 'underserved';

            return {
              id: s.id,
              idea_text: s.idea_text,
              category: 'SaaS Market Intelligence',
              tag,
              gap_analysis: s.gap_analysis,
              found_at: s.created_at,
            };
          });
        }
      } catch (err) {
        console.warn('Supabase getWeeklyGaps from scans error:', err);
      }
    }

    // 3. Guaranteed authentic seed fallback
    const tagCycle: Array<'open_gap' | 'low_moat' | 'underserved'> = [
      'open_gap',
      'low_moat',
      'open_gap',
      'underserved',
      'open_gap',
    ];

    return REAL_SEEDED_SCANS.slice(0, 5).map((scan, i) => ({
      id: `gap_${i + 1}`,
      idea_text: scan.ideaText,
      category: scan.category
        .replace('-', ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      tag: tagCycle[i % tagCycle.length],
      gap_analysis: scan.gapAnalysis,
      found_at: new Date().toISOString(),
    }));
  },

  /**
   * Get cached keyword research data
   */
  async getKeywordCache(seed: string): Promise<any | null> {
    const supabase = getSupabaseAdmin();
    const normalized = seed.toLowerCase().trim();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('keyword_cache')
          .select('*')
          .eq('seed', normalized)
          .maybeSingle();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase getKeywordCache failed, falling back to DevStore:', err);
      }
    }

    return DevStore.getKeywordCache(normalized);
  },

  /**
   * Save or update keyword research cache (48h TTL)
   */
  async saveKeywordCache(data: {
    seed: string;
    trend_data: any;
    generated_keywords: any;
    competition_signal: any;
  }): Promise<void> {
    const supabase = getSupabaseAdmin();
    const normalized = data.seed.toLowerCase().trim();

    if (supabase) {
      try {
        await supabase.from('keyword_cache').upsert(
          {
            seed: normalized,
            trend_data: data.trend_data,
            generated_keywords: data.generated_keywords,
            competition_signal: data.competition_signal,
            fetched_at: new Date().toISOString(),
          },
          { onConflict: 'seed' }
        );
      } catch (err) {
        console.warn('Supabase saveKeywordCache failed, falling back to DevStore:', err);
      }
    }

    DevStore.upsertKeywordCache(data);
  },

  /**
   * Record keyword lookup usage for a user
   */
  async recordKeywordUsage(userId: string): Promise<void> {
    if (!userId) return;
    const supabase = getSupabaseAdmin();

    if (supabase) {
      try {
        await supabase.from('keyword_usage').insert({
          user_id: userId,
          used_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase recordKeywordUsage failed:', err);
      }
    }

    DevStore.recordKeywordUsage(userId);
  },

  /**
   * Get user's keyword usage count for the current calendar month
   */
  async getKeywordUsageThisMonth(userId: string): Promise<number> {
    if (!userId) return 0;
    const supabase = getSupabaseAdmin();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    if (supabase) {
      try {
        const { count, error } = await supabase
          .from('keyword_usage')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('used_at', startOfMonth.toISOString());

        if (!error && typeof count === 'number') {
          return count;
        }
      } catch (err) {
        console.warn('Supabase getKeywordUsageThisMonth failed:', err);
      }
    }

    return DevStore.getKeywordUsageCount(userId, startOfMonth);
  },
};
