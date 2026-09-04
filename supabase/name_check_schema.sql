-- ============================================================
-- NAME & HANDLE AVAILABILITY CACHE & USAGE TRACKING SCHEMA
-- Execute this in your Supabase SQL Editor
-- ============================================================

-- 1. NAME CHECK CACHE TABLE (24-hour TTL cache for RDAP Domains & Social Handles)
CREATE TABLE IF NOT EXISTS public.name_check_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    results JSONB,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_name_check_cache_name ON public.name_check_cache (name);
CREATE INDEX IF NOT EXISTS idx_name_check_cache_fetched_at ON public.name_check_cache (fetched_at DESC);

-- 2. NAME CHECK USAGE TABLE (Monthly lookup quota tracking per user)
CREATE TABLE IF NOT EXISTS public.name_check_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_name_check_usage_user_id ON public.name_check_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_name_check_usage_used_at ON public.name_check_usage (used_at DESC);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.name_check_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.name_check_usage ENABLE ROW LEVEL SECURITY;

-- Allow server backend (Service Role) full access while shielding public scraping
CREATE POLICY "Service role full access to name_check_cache" 
ON public.name_check_cache FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to name_check_usage" 
ON public.name_check_usage FOR ALL USING (true) WITH CHECK (true);
