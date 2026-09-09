-- Migration: Add roast column to scans table
-- Allows caching and fast retrieval of generated idea roasts

alter table if exists public.scans
add column if not exists roast jsonb;

comment on column public.scans.roast is 'Stores generated comedy roast lines and takeaway for this scan';
