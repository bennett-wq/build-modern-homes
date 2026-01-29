-- Fix WARN: pricing_zones - Restrict detailed cost data to team only
-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "public_read_pricing_zones" ON public.pricing_zones;

-- Create a secure function that returns only public-safe zone data
CREATE OR REPLACE FUNCTION public.get_public_pricing_zones()
RETURNS TABLE (
    id uuid,
    name text,
    slug text,
    baseline_total numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        pz.id,
        pz.name,
        pz.slug,
        pz.baseline_total
    FROM public.pricing_zones pz;
$$;

-- Grant execute on the function to public roles
GRANT EXECUTE ON FUNCTION public.get_public_pricing_zones() TO anon, authenticated;

-- Create a restrictive policy that only allows team members to read full zone data
CREATE POLICY "team_read_pricing_zones_full"
ON public.pricing_zones
FOR SELECT
TO authenticated
USING (is_admin_or_builder(auth.uid()));