import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { PlanType, UserRole, SaturationLevel, ICompetitor, SponsorTier } from '@/types';

interface DevUser {
  _id: string;
  email: string;
  role: UserRole;
  plan: PlanType;
  suspended: boolean;
  adminNotes?: string;
  stripeCustomerId?: string;
  scansUsedThisMonth: number;
  scansResetDate: Date;
  createdAt: Date;
}

interface DevMagicToken {
  _id: string;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

interface DevScan {
  _id: string;
  userId: string | null;
  ideaText: string;
  competitors: ICompetitor[];
  saturationScore: SaturationLevel;
  saturationReasoning: string;
  gapAnalysis: string;
  shareSlug: string;
  featured: boolean;
  createdAt: Date;
}

interface DevSponsor {
  _id: string;
  name: string;
  url: string;
  description: string;
  iconText: string;
  tier: SponsorTier;
  active: boolean;
  priority: number;
  impressions: number;
  clicks: number;
  createdAt: Date;
}

interface DevSiteConfig {
  freeTierMonthlyLimit: number;
  proMonthlyPrice: number;
  proYearlyPrice: number;
  estimatedCostPerScan: number;
  updatedAt: Date;
}

interface DevAdminLog {
  _id: string;
  adminUserId: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  targetType?: string;
  note?: string;
  timestamp: Date;
}

interface DevSubscriber {
  id: string;
  email: string;
  subscribed_at: Date;
  status: 'active' | 'inactive';
  unsubscribe_token: string;
}

interface StoreState {
  users: DevUser[];
  tokens: DevMagicToken[];
  scans: DevScan[];
  sponsors: DevSponsor[];
  config: DevSiteConfig;
  logs: DevAdminLog[];
  subscribers?: DevSubscriber[];
}

const STORE_PATH = path.join(process.cwd(), '.dev-store.json');

function loadState(): StoreState {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
      // Restore Dates
      if (data.users) {
        data.users.forEach((u: DevUser) => {
          u.scansResetDate = new Date(u.scansResetDate);
          u.createdAt = new Date(u.createdAt);
        });
      }
      if (data.tokens) {
        data.tokens.forEach((t: DevMagicToken) => {
          t.expiresAt = new Date(t.expiresAt);
          t.createdAt = new Date(t.createdAt);
        });
      }
      if (data.scans) {
        data.scans.forEach((s: DevScan) => {
          s.createdAt = new Date(s.createdAt);
        });
      }
      if (data.sponsors) {
        data.sponsors.forEach((s: DevSponsor) => {
          s.createdAt = new Date(s.createdAt);
        });
      }
      if (data.logs) {
        data.logs.forEach((l: DevAdminLog) => {
          l.timestamp = new Date(l.timestamp);
        });
      }
      return data;
    }
  } catch {
    // Fallback to default
  }

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);

  return {
    users: [],
    tokens: [],
    scans: [],
    sponsors: [
      {
        _id: 'sp_1',
        name: 'Supastack Cloud',
        url: 'https://example.com/sponsor-1',
        description: 'Instant Postgres, Auth & background queues for early SaaS.',
        iconText: '⚡',
        tier: 'featured',
        active: true,
        priority: 10,
        impressions: 420,
        clicks: 34,
        createdAt: new Date(),
      },
      {
        _id: 'sp_2',
        name: 'Reship Starter',
        url: 'https://example.com/sponsor-2',
        description: 'Next.js boilerplate with Stripe & Auth pre-wired.',
        iconText: '🚀',
        tier: 'starter',
        active: true,
        priority: 5,
        impressions: 310,
        clicks: 18,
        createdAt: new Date(),
      },
    ],
    config: {
      freeTierMonthlyLimit: 3,
      proMonthlyPrice: 12,
      proYearlyPrice: 99,
      estimatedCostPerScan: 0.02,
      updatedAt: new Date(),
    },
    logs: [],
  };
}

let inMemoryState: StoreState = loadState();

function saveState() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(inMemoryState, null, 2), 'utf-8');
  } catch {
    // In-memory fallback
  }
}

// Dev Store API
export const DevStore = {
  // Users
  findUserByEmail(email: string): DevUser | null {
    return inMemoryState.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findUserById(id: string): DevUser | null {
    return inMemoryState.users.find((u) => u._id === id) || null;
  },

  createUser(email: string, role: UserRole = 'user'): DevUser {
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1);
    nextReset.setDate(1);
    nextReset.setHours(0, 0, 0, 0);

    const user: DevUser = {
      _id: 'usr_' + nanoid(12),
      email: email.toLowerCase().trim(),
      role,
      plan: 'free',
      suspended: false,
      scansUsedThisMonth: 0,
      scansResetDate: nextReset,
      createdAt: new Date(),
    };
    inMemoryState.users.push(user);
    this.addSubscriber(email);
    saveState();
    return user;
  },

  updateUser(id: string, updates: Partial<DevUser>): DevUser | null {
    const user = inMemoryState.users.find((u) => u._id === id);
    if (!user) return null;
    Object.assign(user, updates);
    saveState();
    return user;
  },

  getAllUsers(): DevUser[] {
    return [...inMemoryState.users];
  },

  countUsers(filter: Partial<DevUser> = {}): number {
    return inMemoryState.users.filter((u) => {
      for (const key of Object.keys(filter) as (keyof DevUser)[]) {
        if (filter[key] !== undefined && u[key] !== filter[key]) return false;
      }
      return true;
    }).length;
  },

  // Magic Tokens
  createMagicToken(email: string): string {
    inMemoryState.tokens = inMemoryState.tokens.filter((t) => t.email.toLowerCase() !== email.toLowerCase());
    const token = nanoid(32);
    inMemoryState.tokens.push({
      _id: 'tok_' + nanoid(10),
      email: email.toLowerCase().trim(),
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      createdAt: new Date(),
    });
    saveState();
    return token;
  },

  verifyMagicToken(token: string): { user: DevUser } | null {
    const matchIndex = inMemoryState.tokens.findIndex((t) => t.token === token);
    if (matchIndex === -1) return null;

    const tok = inMemoryState.tokens[matchIndex];
    if (tok.expiresAt < new Date()) {
      inMemoryState.tokens.splice(matchIndex, 1);
      saveState();
      return null;
    }

    inMemoryState.tokens.splice(matchIndex, 1);
    saveState();

    let user = this.findUserByEmail(tok.email);
    if (!user) {
      const isFirst = inMemoryState.users.length === 0;
      user = this.createUser(tok.email, isFirst ? 'admin' : 'user');
    }

    return { user };
  },

  // Scans
  createScan(data: Omit<DevScan, '_id' | 'createdAt'>): DevScan {
    const scan: DevScan = {
      _id: 'scn_' + nanoid(12),
      ...data,
      createdAt: new Date(),
    };
    inMemoryState.scans.unshift(scan);
    saveState();
    return scan;
  },

  findScanBySlug(slug: string): DevScan | null {
    return inMemoryState.scans.find((s) => s.shareSlug === slug) || null;
  },

  getAllScans(): DevScan[] {
    return [...inMemoryState.scans];
  },

  deleteScan(id: string): boolean {
    const idx = inMemoryState.scans.findIndex((s) => s._id === id);
    if (idx === -1) return false;
    inMemoryState.scans.splice(idx, 1);
    saveState();
    return true;
  },

  toggleScanFeatured(id: string, featured: boolean): DevScan | null {
    const scan = inMemoryState.scans.find((s) => s._id === id);
    if (!scan) return null;
    scan.featured = featured;
    saveState();
    return scan;
  },

  // Sponsors
  getAllSponsors(): DevSponsor[] {
    return [...inMemoryState.sponsors];
  },

  createSponsor(data: Omit<DevSponsor, '_id' | 'createdAt' | 'impressions' | 'clicks'>): DevSponsor {
    const sponsor: DevSponsor = {
      _id: 'sp_' + nanoid(10),
      ...data,
      impressions: 0,
      clicks: 0,
      createdAt: new Date(),
    };
    inMemoryState.sponsors.push(sponsor);
    saveState();
    return sponsor;
  },

  updateSponsor(id: string, updates: Partial<DevSponsor>): DevSponsor | null {
    const sponsor = inMemoryState.sponsors.find((s) => s._id === id);
    if (!sponsor) return null;
    Object.assign(sponsor, updates);
    saveState();
    return sponsor;
  },

  deleteSponsor(id: string): boolean {
    const idx = inMemoryState.sponsors.findIndex((s) => s._id === id);
    if (idx === -1) return false;
    inMemoryState.sponsors.splice(idx, 1);
    saveState();
    return true;
  },

  incrementSponsorClick(id: string) {
    const sponsor = inMemoryState.sponsors.find((s) => s._id === id);
    if (sponsor) {
      sponsor.clicks += 1;
      saveState();
    }
  },

  // Config
  getConfig(): DevSiteConfig {
    return { ...inMemoryState.config };
  },

  updateConfig(updates: Partial<DevSiteConfig>): DevSiteConfig {
    Object.assign(inMemoryState.config, updates, { updatedAt: new Date() });
    saveState();
    return { ...inMemoryState.config };
  },

  // Admin Logs
  addAdminLog(log: Omit<DevAdminLog, '_id' | 'timestamp'>) {
    inMemoryState.logs.unshift({
      _id: 'log_' + nanoid(10),
      ...log,
      timestamp: new Date(),
    });
    saveState();
  },

  getAdminLogs(limit = 50): DevAdminLog[] {
    return inMemoryState.logs.slice(0, limit);
  },

  // Newsletter Subscribers
  addSubscriber(email: string): { success: boolean; message: string; alreadyActive?: boolean } {
    if (!inMemoryState.subscribers) inMemoryState.subscribers = [];
    const cleanEmail = email.toLowerCase().trim();
    const existing = inMemoryState.subscribers.find((s) => s.email === cleanEmail);

    if (existing) {
      if (existing.status === 'active') {
        return { success: true, message: "You're already subscribed to the Weekly Gap Report!", alreadyActive: true };
      }
      existing.status = 'active';
      existing.subscribed_at = new Date();
      existing.unsubscribe_token = nanoid(24);
      saveState();
      return { success: true, message: 'Welcome back! Your subscription has been reactivated.' };
    }

    inMemoryState.subscribers.push({
      id: 'sub_' + nanoid(10),
      email: cleanEmail,
      subscribed_at: new Date(),
      status: 'active',
      unsubscribe_token: nanoid(24),
    });
    saveState();
    return { success: true, message: "You're subscribed! Expect the top 5 gaps every Monday." };
  },

  unsubscribeByToken(token: string): { success: boolean; email?: string } {
    if (!inMemoryState.subscribers) inMemoryState.subscribers = [];
    const sub = inMemoryState.subscribers.find((s) => s.unsubscribe_token === token);
    if (sub) {
      sub.status = 'inactive';
      saveState();
      return { success: true, email: sub.email };
    }
    return { success: false };
  },

  getActiveSubscribers(): Array<{ id: string; email: string; unsubscribe_token: string }> {
    if (!inMemoryState.subscribers) inMemoryState.subscribers = [];
    return inMemoryState.subscribers
      .filter((s) => s.status === 'active')
      .map((s) => ({ id: s.id, email: s.email, unsubscribe_token: s.unsubscribe_token }));
  },
};
