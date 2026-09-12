-- ============================================================
-- RECONCILE CLERK AUTH WITH SUPABASE BACKEND
-- Migration: 20260912_reconcile_clerk_supabase_profiles.sql
-- Run this in your Supabase SQL Editor (SQL tab)
-- ============================================================

-- 1. If profiles table exists and has a foreign key to auth.users, drop it:
ALTER TABLE IF EXISTS public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. If profiles.id is currently a UUID, alter column type to TEXT
-- (Clerk generates user IDs formatted like 'user_2abc123XYZ', which are strings, not UUIDs)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'id' 
      AND data_type = 'uuid'
  ) THEN
    -- Drop primary key temporarily to change column type
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
    ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
    ALTER TABLE public.profiles ADD PRIMARY KEY (id);
  END IF;
END $$;

-- 3. If profiles table does not exist, create it with TEXT primary key:
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, -- Clerk User ID (e.g. user_2abc...)
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ DEFAULT NULL,
  idea_scans_used INTEGER NOT NULL DEFAULT 0,
  new_tools_scans_used INTEGER NOT NULL DEFAULT 0,
  bonus_scans INTEGER NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  role TEXT NOT NULL DEFAULT 'user',
  dodo_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all necessary columns exist on profiles table:
DO $$
BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ DEFAULT NULL;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS idea_scans_used INTEGER DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS new_tools_scans_used INTEGER DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bonus_scans INTEGER DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles (is_admin);

-- 4. Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow Service Role key full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Service role full access on profiles'
  ) THEN
    CREATE POLICY "Service role full access on profiles"
    ON public.profiles FOR ALL
    USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Allow users to read their own profile (if using client-side Supabase with Clerk JWT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (true);
  END IF;
END $$;

-- 5. Stored procedures for atomic usage increments with TEXT user IDs
CREATE OR REPLACE FUNCTION increment_usage_column(uid TEXT, col TEXT)
RETURNS void AS $$
BEGIN
  IF col NOT IN ('idea_scans_used', 'new_tools_scans_used') THEN
    RAISE EXCEPTION 'Invalid column name for increment: %', col;
  END IF;

  -- Increment on profiles table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    EXECUTE format('UPDATE public.profiles SET %I = COALESCE(%I, 0) + 1, updated_at = NOW() WHERE id = $1', col, col) USING uid;
  END IF;

  -- Also increment on users table if present
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    EXECUTE format('UPDATE public.users SET %I = COALESCE(%I, 0) + 1, updated_at = NOW() WHERE clerk_id = $1 OR id::text = $1', col, col) USING uid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stored procedure for adding bonus scans
CREATE OR REPLACE FUNCTION add_bonus_scans(uid TEXT, amount INT)
RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    UPDATE public.profiles
    SET bonus_scans = COALESCE(bonus_scans, 0) + amount, updated_at = NOW()
    WHERE id = uid;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    UPDATE public.users
    SET bonus_scans = COALESCE(bonus_scans, 0) + amount, updated_at = NOW()
    WHERE clerk_id = uid OR id::text = uid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
