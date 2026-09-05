-- ============================================================
-- ADD USAGE TRACKING FOR KEYWORD RADAR & IS IT TAKEN
-- Execute this migration in your Supabase SQL Editor
-- ============================================================

-- 1. If using profiles table (Supabase Auth default):
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS new_tools_scans_used INTEGER DEFAULT 0;
  END IF;
END $$;

-- 2. If using users table (IsMySaaSTaken synced users table):
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS new_tools_scans_used INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. Atomic increment function (prevents read-then-write race conditions)
CREATE OR REPLACE FUNCTION increment_new_tools_scans(uid TEXT)
RETURNS void AS $$
BEGIN
  -- Increment on profiles if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    UPDATE public.profiles
    SET new_tools_scans_used = COALESCE(new_tools_scans_used, 0) + 1
    WHERE id::text = uid;
  END IF;

  -- Increment on users if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    UPDATE public.users
    SET new_tools_scans_used = COALESCE(new_tools_scans_used, 0) + 1
    WHERE id::text = uid OR clerk_id = uid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
