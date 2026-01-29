-- Fix ERROR 1: financing_applications - Block anonymous SELECT access explicitly
-- The table already has proper policies for authenticated users, but we need to ensure
-- anonymous users cannot read any data. RLS with RESTRICTIVE policies ensures this.
-- Current policies: user_read_own (auth), team_read_all (auth) - these are correct
-- No changes needed as anon role has no SELECT policy, meaning they're already blocked

-- Fix ERROR 2: quotes - Block anonymous SELECT access explicitly
-- Similar situation - anon has INSERT but no SELECT, which is correct behavior
-- The policies user_read_own_quotes and team_read_all_quotes only apply to authenticated users
-- No changes needed as anon role has no SELECT policy

-- Fix WARN: model_pricing - Restrict detailed cost data to team only
-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "public_read_model_pricing" ON public.model_pricing;

-- Create a secure view that only exposes customer-facing pricing data
CREATE OR REPLACE VIEW public.model_pricing_public AS
SELECT 
    id,
    model_id,
    build_type,
    foundation_type,
    base_home_price,
    is_current,
    effective_from
FROM public.model_pricing
WHERE is_current = true;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.model_pricing_public TO anon, authenticated;

-- Create a new restrictive policy that only allows team members to read full pricing data
CREATE POLICY "team_read_all_model_pricing_full"
ON public.model_pricing
FOR SELECT
TO authenticated
USING (is_admin_or_builder(auth.uid()));

-- Note: The existing team policies already cover INSERT/UPDATE for team members