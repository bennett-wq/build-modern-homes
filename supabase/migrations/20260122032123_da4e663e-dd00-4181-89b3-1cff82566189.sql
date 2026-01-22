-- ============================================================================
-- PRICING ADMIN SCHEMA
-- ============================================================================
-- After creating the first user in Supabase Auth, you must insert that user's
-- id into admin_users to bootstrap admin access:
-- INSERT INTO public.admin_users (user_id) VALUES ('<auth.users.id uuid>');
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PRICING CONFIGS TABLE
-- Stores versioned pricing configurations with draft/publish workflow
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pricing_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  label TEXT,
  effective_at TIMESTAMPTZ,
  config JSONB NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS pricing_configs_status_idx ON public.pricing_configs(status);
CREATE INDEX IF NOT EXISTS pricing_configs_effective_at_idx ON public.pricing_configs(effective_at);

-- ============================================================================
-- ADMIN USERS TABLE
-- Controls who can access the pricing admin console
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.pricing_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECURITY DEFINER FUNCTION FOR ADMIN CHECK
-- Avoids RLS recursion by using security definer
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = uid
  );
$$;

-- ============================================================================
-- RLS POLICIES FOR pricing_configs
-- ============================================================================

-- Anyone can read ONLY published configs (public site uses this)
CREATE POLICY "public_can_read_published_pricing"
ON public.pricing_configs
FOR SELECT
USING (status = 'published');

-- Admins can read all configs (draft + published + archived)
CREATE POLICY "admins_can_read_all_pricing"
ON public.pricing_configs
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can insert new configs
CREATE POLICY "admins_can_insert_pricing"
ON public.pricing_configs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Admins can update configs
CREATE POLICY "admins_can_update_pricing"
ON public.pricing_configs
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- RLS POLICIES FOR admin_users
-- ============================================================================

-- Admins can read admin_users table
CREATE POLICY "admins_can_read_admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can manage admin_users (add/remove other admins)
CREATE POLICY "admins_can_insert_admin_users"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admins_can_delete_admin_users"
ON public.admin_users
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));