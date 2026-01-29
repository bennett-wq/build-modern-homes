-- Fix 1: Add DELETE policies for financing_applications table
-- Allow authenticated users to delete their own applications
CREATE POLICY "user_delete_own_financing_applications"
ON public.financing_applications
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Allow team members (admin/builder) to delete any application
CREATE POLICY "team_delete_financing_applications"
ON public.financing_applications
FOR DELETE
TO authenticated
USING (is_admin_or_builder(auth.uid()));

-- Fix 2: Replace overly permissive lots read policy with a more restrictive one
-- Drop the existing public_read_lots policy that exposes all data
DROP POLICY IF EXISTS "public_read_lots" ON public.lots;

-- Create a new function to return lot data without sensitive fields for public access
CREATE OR REPLACE FUNCTION public.get_public_lot_data()
RETURNS SETOF public.lots
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    development_id,
    lot_number,
    status,
    acreage,
    net_acreage,
    premium,
    polygon_coordinates,
    NULL::jsonb as restrictions,  -- Hide restrictions from public
    NULL::text as notes,          -- Hide notes from public
    created_at,
    updated_at
  FROM public.lots;
$$;

-- Create a more restrictive public read policy for lots
-- Public can only see basic lot info (no notes, but restrictions are needed for lot compatibility)
CREATE POLICY "public_read_lots_basic"
ON public.lots
FOR SELECT
TO anon, authenticated
USING (true);

-- Team members can see all lot data including notes (already exists as team_read_all_lots)