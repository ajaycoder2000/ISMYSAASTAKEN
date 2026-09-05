-- ============================================================
-- ADMIN PANEL V1 — ACCESS CONTROL, EXPIRY & AUDIT LOG
-- Execute this migration in your Supabase SQL Editor
-- ============================================================

-- 1. Enable gen_random_uuid if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add columns to profiles table if it exists (Supabase Auth default)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
END $$;

-- 3. Add columns to users table if it exists (IsMySaaSTaken users table)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
END $$;

-- 4. Create admin_actions_log audit table
CREATE TABLE IF NOT EXISTS public.admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT, -- stores UUID or clerk_id
  target_user_id TEXT NOT NULL,
  action TEXT NOT NULL, -- e.g. 'plan_override'
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_log_target_user_id ON public.admin_actions_log (target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_created_at ON public.admin_actions_log (created_at DESC);
