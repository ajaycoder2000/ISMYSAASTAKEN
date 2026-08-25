import { getSupabaseAdmin } from './admin';
import { IScanDocument, PlanType, UserRole } from '@/types';
import { DevStore } from '@/lib/dev-store';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';

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
        const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const isFirst = (count || 0) === 0;

        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1);
        nextReset.setDate(1);
        nextReset.setHours(0, 0, 0, 0);

        const { data: newUser } = await supabase
          .from('users')
          .insert({
            clerk_id: clerkId,
            email: cleanEmail,
            role: isFirst ? 'admin' : 'user',
            plan: 'free',
            scans_used_this_month: 0,
            scans_reset_date: nextReset.toISOString(),
          })
          .select()
          .single();

        if (newUser) {
          return {
            id: newUser.id,
            clerkId: newUser.clerk_id,
            email: newUser.email,
            plan: 'free',
            role: newUser.role as UserRole,
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
    let devUser = DevStore.findUserByEmail(cleanEmail);
    if (!devUser) {
      const isFirst = DevStore.getAllUsers().length === 0;
      devUser = DevStore.createUser(cleanEmail, isFirst ? 'admin' : 'user');
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
        const { data } = await supabase
          .from('scans')
          .select('id, idea_text, competitors, saturation_score, share_slug, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (data) {
          return data.map((s) => ({
            _id: s.id,
            ideaText: s.idea_text,
            competitorCount: Array.isArray(s.competitors) ? s.competitors.length : 0,
            saturationScore: s.saturation_score,
            shareSlug: s.share_slug,
            createdAt: s.created_at,
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
};
