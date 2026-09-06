-- ============================================================
-- USAGE ANALYTICS & COUPON MANAGEMENT
-- Migration: 20260906_usage_analytics_and_coupons.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. UNIFIED SCAN EVENTS LOGGING TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- Clerk ID, UUID, or null for anonymous scans
  tool TEXT NOT NULL, -- 'idea_scanner' | 'keyword_radar' | 'is_it_taken'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_events_created_at ON public.scan_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_events_tool ON public.scan_events (tool);
CREATE INDEX IF NOT EXISTS idx_scan_events_user_id ON public.scan_events (user_id);

ALTER TABLE public.scan_events ENABLE ROW LEVEL SECURITY;

-- Allow Service Role full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scan_events' AND policyname = 'Service role full access on scan_events'
  ) THEN
    CREATE POLICY "Service role full access on scan_events" 
    ON public.scan_events FOR ALL 
    USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2. SCAN COUNTS BY PERIOD FUNCTION (Postgres RPC)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION scan_counts_by_period(trunc_unit text)
RETURNS TABLE(period TIMESTAMPTZ, tool TEXT, scan_count BIGINT) AS $$
  SELECT 
    date_trunc(trunc_unit, created_at) AS period, 
    tool, 
    count(*)::bigint AS scan_count
  FROM public.scan_events
  WHERE created_at > now() - interval '90 days'
  GROUP BY 1, 2
  ORDER BY 1 DESC;
$$ LANGUAGE sql STABLE;

-- ------------------------------------------------------------
-- 3. COUPONS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  effect_type TEXT NOT NULL, -- 'set_plan' | 'extend_plan' | 'bonus_free_scans'
  effect_value JSONB NOT NULL, -- e.g. {"plan": "sprint_pass", "days": 7} or {"bonus_scans": 5}
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL, -- NULL = never expires
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons (active);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Service role full access on coupons'
  ) THEN
    CREATE POLICY "Service role full access on coupons" 
    ON public.coupons FOR ALL 
    USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ------------------------------------------------------------
-- 4. COUPON REDEMPTIONS AUDIT TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  applied_by_admin_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_id ON public.coupon_redemptions (user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON public.coupon_redemptions (coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_created_at ON public.coupon_redemptions (created_at DESC);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coupon_redemptions' AND policyname = 'Service role full access on coupon_redemptions'
  ) THEN
    CREATE POLICY "Service role full access on coupon_redemptions" 
    ON public.coupon_redemptions FOR ALL 
    USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ------------------------------------------------------------
-- 5. BONUS SCANS COLUMN & RPC
-- ------------------------------------------------------------
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bonus_scans INTEGER DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS bonus_scans INTEGER DEFAULT 0;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION add_bonus_scans(uid TEXT, amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET bonus_scans = COALESCE(bonus_scans, 0) + amount
  WHERE id::text = uid OR clerk_id = uid;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    UPDATE public.profiles
    SET bonus_scans = COALESCE(bonus_scans, 0) + amount
    WHERE id::text = uid;
  END IF;
END;
$$ LANGUAGE plpgsql;
