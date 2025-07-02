
-- Phase 1: Fix RLS policies for proper data visibility

-- First, let's ensure opportunities are visible to everyone when they're open
DROP POLICY IF EXISTS "Anyone can view open opportunities" ON public.opportunities;
CREATE POLICY "Anyone can view open opportunities" 
  ON public.opportunities 
  FOR SELECT 
  USING (status = 'open'::opportunity_status);

-- Ensure profiles are visible to everyone for discovery
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Fix user_skills visibility for profile discovery
DROP POLICY IF EXISTS "Anyone can view user skills" ON public.user_skills;
CREATE POLICY "Anyone can view user skills" 
  ON public.user_skills 
  FOR SELECT 
  USING (true);

-- Fix portfolios visibility
DROP POLICY IF EXISTS "Anyone can view portfolios" ON public.portfolios;
CREATE POLICY "Anyone can view portfolios" 
  ON public.portfolios 
  FOR SELECT 
  USING (true);

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_client_country ON public.opportunities(client_country);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON public.profiles(experience_level);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);

-- Ensure proper default values for better data integrity
ALTER TABLE public.profiles ALTER COLUMN experience_level SET DEFAULT 'mid';
ALTER TABLE public.opportunities ALTER COLUMN proposals_count SET DEFAULT 0;
