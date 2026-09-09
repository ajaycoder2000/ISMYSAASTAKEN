-- ============================================================
-- CENTRALIZED PLAN ENTITLEMENTS MIGRATION
-- Run this migration in your Supabase SQL Editor
-- ============================================================

-- 1. Ensure usage tracking columns exist on profiles table (Supabase Auth default)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS idea_scans_used INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS new_tools_scans_used INTEGER DEFAULT 0;
  END IF;
END $$;

-- 2. Ensure usage tracking columns exist on users table (Synced users table)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS idea_scans_used INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS new_tools_scans_used INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. Atomic increment stored function for usage columns
CREATE OR REPLACE FUNCTION increment_usage_column(uid TEXT, col TEXT)
RETURNS void AS $$
BEGIN
  -- Strict whitelist validation of allowed column names to prevent SQL injection
  IF col NOT IN ('idea_scans_used', 'new_tools_scans_used') THEN
    RAISE EXCEPTION 'Invalid column name for increment: %', col;
  END IF;

  -- Increment on profiles if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    EXECUTE format('UPDATE public.profiles SET %I = COALESCE(%I, 0) + 1 WHERE id::text = $1', col, col) USING uid;
  END IF;

  -- Increment on users if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    EXECUTE format('UPDATE public.users SET %I = COALESCE(%I, 0) + 1 WHERE id::text = $1 OR clerk_id = $1', col, col) USING uid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
