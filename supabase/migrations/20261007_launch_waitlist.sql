-- ============================================================
-- PRE-LAUNCH WAITLIST WITH DOUBLE OPT-IN & REFERRALS
-- Migration: 20261007_launch_waitlist.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',          -- 'pending' | 'confirmed'
  confirm_token UUID NOT NULL DEFAULT gen_random_uuid(),
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid(),
  referral_code TEXT NOT NULL UNIQUE,              -- short public code for sharing
  referred_by TEXT,                                -- referral_code of whoever invited them
  utm_source TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  building_type TEXT,                              -- optional follow-up answer
  ip_hash TEXT,                                    -- hashed, for rate limiting only
  reward_claimed BOOLEAN DEFAULT false,            -- tracked when clerk user signs up
  created_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_lower_idx ON public.waitlist (lower(email));
CREATE INDEX IF NOT EXISTS waitlist_referred_by_idx ON public.waitlist (referred_by);
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON public.waitlist (created_at);
CREATE INDEX IF NOT EXISTS waitlist_confirm_token_idx ON public.waitlist (confirm_token);
CREATE INDEX IF NOT EXISTS waitlist_unsubscribe_token_idx ON public.waitlist (unsubscribe_token);
CREATE INDEX IF NOT EXISTS waitlist_ip_hash_idx ON public.waitlist (ip_hash);

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow service_role complete access
DROP POLICY IF EXISTS "Service role has full access to waitlist" ON public.waitlist;
CREATE POLICY "Service role has full access to waitlist"
  ON public.waitlist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
