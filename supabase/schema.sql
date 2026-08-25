-- ============================================================
-- IS MY SAAS TAKEN? — SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (SQL tab)
-- ============================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (Linked with Clerk Authentication)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    suspended BOOLEAN NOT NULL DEFAULT false,
    admin_notes TEXT,
    stripe_customer_id TEXT,
    scans_used_this_month INTEGER NOT NULL DEFAULT 0,
    scans_reset_date TIMESTAMPTZ NOT NULL DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users (clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- 3. SCANS TABLE (Idea Validation Reports)
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT, -- Can store Clerk userId or UUID
    idea_text TEXT NOT NULL,
    competitors JSONB NOT NULL DEFAULT '[]'::jsonb,
    saturation_score TEXT NOT NULL CHECK (saturation_score IN ('low', 'medium', 'high')),
    saturation_reasoning TEXT NOT NULL,
    gap_analysis TEXT NOT NULL,
    pivot_angles JSONB DEFAULT '[]'::jsonb,
    share_slug TEXT UNIQUE NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scans_share_slug ON public.scans (share_slug);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans (user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_featured ON public.scans (featured);

-- 4. BOOKMARKS TABLE (Saved Ideas by User)
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL, -- Clerk userId
    scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
    tag TEXT DEFAULT 'Exploring',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, scan_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks (user_id);

-- 5. SPONSORS TABLE (Monetization Rails)
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_text TEXT NOT NULL DEFAULT '⚡',
    tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard', 'featured')),
    active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial sponsors if table is empty
INSERT INTO public.sponsors (name, url, description, icon_text, tier, active, priority)
SELECT * FROM (VALUES
    ('Supastack Cloud', 'https://example.com/sponsor-1', 'Instant Postgres, Auth & background queues for early SaaS.', '⚡', 'featured', true, 10),
    ('Reship Starter', 'https://example.com/sponsor-2', 'Next.js boilerplate with Stripe & Auth pre-wired.', '🚀', 'standard', true, 9),
    ('LogSnag Alerts', 'https://example.com/sponsor-3', 'Real-time event tracking and push alerts for founders.', '📊', 'standard', true, 8),
    ('PromptArmor Security', 'https://example.com/sponsor-4', 'AI prompt injection security and LLM firewall.', '🛡️', 'standard', true, 7),
    ('LemonVault Tax', 'https://example.com/sponsor-5', 'Merchant-of-record global tax compliance for solo devs.', '🍋', 'featured', true, 10),
    ('CronHQ Tasks', 'https://example.com/sponsor-6', 'Zero-maintenance distributed cron jobs & webhooks.', '⏱️', 'standard', true, 9),
    ('Polar.sh Subscriptions', 'https://example.com/sponsor-7', 'Developer-first monetization & subscriptions for repos.', '❄️', 'standard', true, 8),
    ('Posthog Indie', 'https://example.com/sponsor-8', 'Product analytics, session replays & feature flags.', '🦔', 'standard', true, 7)
) AS v(name, url, description, icon_text, tier, active, priority)
WHERE NOT EXISTS (SELECT 1 FROM public.sponsors);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Allow public read of scans (for permalink sharing & recent feed)
CREATE POLICY "Public scans are viewable by everyone" 
ON public.scans FOR SELECT USING (true);

-- Allow service role / server APIs full access
CREATE POLICY "Service role full access to scans" 
ON public.scans FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public sponsors are viewable by everyone" 
ON public.sponsors FOR SELECT USING (active = true);

CREATE POLICY "Service role full access to sponsors" 
ON public.sponsors FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to users" 
ON public.users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to bookmarks" 
ON public.bookmarks FOR ALL USING (true) WITH CHECK (true);
