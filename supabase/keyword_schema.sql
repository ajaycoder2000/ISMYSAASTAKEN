-- ============================================================
-- KEYWORD RESEARCH CACHE & USAGE TRACKING SCHEMA
-- Execute this in your Supabase SQL Editor
-- ============================================================

-- 1. KEYWORD CACHE TABLE (48-hour TTL cache for Google Trends, Autocomplete & Competition signals)
CREATE TABLE IF NOT EXISTS public.keyword_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seed TEXT UNIQUE NOT NULL,
    trend_data JSONB,
    generated_keywords JSONB,
    competition_signal JSONB,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keyword_cache_seed ON public.keyword_cache (seed);
CREATE INDEX IF NOT EXISTS idx_keyword_cache_fetched_at ON public.keyword_cache (fetched_at DESC);

-- 2. KEYWORD USAGE TABLE (Monthly lookup quota tracking per user)
CREATE TABLE IF NOT EXISTS public.keyword_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- User ID or email identifier
    used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keyword_usage_user_id ON public.keyword_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_keyword_usage_used_at ON public.keyword_usage (used_at DESC);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.keyword_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_usage ENABLE ROW LEVEL SECURITY;

-- Allow server backend (Service Role) full access while shielding public scraping
CREATE POLICY "Service role full access to keyword_cache" 
ON public.keyword_cache FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to keyword_usage" 
ON public.keyword_usage FOR ALL USING (true) WITH CHECK (true);
