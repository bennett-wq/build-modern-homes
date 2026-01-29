-- ============================================================================
-- Security Hardening - Fix linter warnings
-- ============================================================================

-- Fix 1: Set search_path on set_updated_at function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix 2: Replace overly permissive quotes INSERT policy
-- Anonymous users should only be able to insert quotes without user_id
-- Authenticated users can only insert quotes with their own user_id
DROP POLICY IF EXISTS "public_insert_quotes" ON public.quotes;

-- Anonymous quote submissions (lead capture without login)
CREATE POLICY "anon_insert_quotes" ON public.quotes 
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- Authenticated users can only create quotes linked to themselves
CREATE POLICY "auth_insert_own_quotes" ON public.quotes 
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);