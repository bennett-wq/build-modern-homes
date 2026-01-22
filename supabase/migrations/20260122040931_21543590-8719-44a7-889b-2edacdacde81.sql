-- ============================================================================
-- Pricing Admin v1.1: User Roles + Enhanced Workflow
-- ============================================================================

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'builder');

-- 2. Create user_roles table (separate from admin_users for proper RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Create security definer function to check if user has ANY admin-level role
CREATE OR REPLACE FUNCTION public.is_admin_or_builder(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'builder')
  )
$$;

-- 6. RLS policies for user_roles
-- Only admins can read all roles
CREATE POLICY "admins_can_read_user_roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert roles
CREATE POLICY "admins_can_insert_user_roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete roles
CREATE POLICY "admins_can_delete_user_roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Update pricing_configs RLS to support builder role
-- Drop existing admin-only policies and recreate with admin OR builder
DROP POLICY IF EXISTS "admins_can_read_all_pricing" ON public.pricing_configs;
DROP POLICY IF EXISTS "admins_can_insert_pricing" ON public.pricing_configs;
DROP POLICY IF EXISTS "admins_can_update_pricing" ON public.pricing_configs;

-- Admins and builders can read all configs
CREATE POLICY "team_can_read_all_pricing" 
ON public.pricing_configs 
FOR SELECT 
USING (public.is_admin_or_builder(auth.uid()));

-- Admins and builders can insert drafts
CREATE POLICY "team_can_insert_pricing" 
ON public.pricing_configs 
FOR INSERT 
WITH CHECK (public.is_admin_or_builder(auth.uid()));

-- Admins and builders can update configs
CREATE POLICY "team_can_update_pricing" 
ON public.pricing_configs 
FOR UPDATE 
USING (public.is_admin_or_builder(auth.uid()))
WITH CHECK (public.is_admin_or_builder(auth.uid()));

-- 8. Add index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);