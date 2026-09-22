-- ==============================================================================
-- Migration: 20260923_founder_quiz_onboarding.sql
-- Description: Adds founder quiz onboarding columns to profiles table and creates
--              the quiz_events table for telemetry / conversion funnel tracking.
-- ==============================================================================

-- 1. Add onboarding columns to profiles table
DO $$
BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS founder_stage TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS validation_experience TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS main_worry TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS building_type TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS decision_timeline TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_bonus_claimed BOOLEAN DEFAULT FALSE;
  -- bonus_scans already exists on profiles table from previous migrations.
  -- Ensure it has default 0 if not present:
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bonus_scans INTEGER DEFAULT 0;
END $$;

-- 2. Add same columns to users table (if public.users exists as sync/legacy table)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS founder_stage TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS validation_experience TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS main_worry TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS building_type TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS decision_timeline TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_bonus_claimed BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bonus_scans INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. Create quiz_events table for analytics and conversion measurement
CREATE TABLE IF NOT EXISTS public.quiz_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL, -- 'quiz_shown', 'quiz_dismissed', 'quiz_completed', 'bonus_claimed'
  user_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast event aggregation
CREATE INDEX IF NOT EXISTS idx_quiz_events_event_created ON public.quiz_events(event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_events_user_id ON public.quiz_events(user_id);
