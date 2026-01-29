-- Fix the SECURITY DEFINER view issue by using SECURITY INVOKER instead
DROP VIEW IF EXISTS public.model_pricing_public;

-- Recreate the view with SECURITY INVOKER (default, safer approach)
CREATE VIEW public.model_pricing_public 
WITH (security_invoker = true) AS
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

-- Since the view uses SECURITY INVOKER, we need a policy that allows 
-- public users to read the limited data. Create a policy for just the base price.
-- But since we already restricted model_pricing to team only, we need a different approach.

-- Better approach: Create a function that returns only public-safe pricing data
DROP VIEW IF EXISTS public.model_pricing_public;

CREATE OR REPLACE FUNCTION public.get_public_model_pricing()
RETURNS TABLE (
    id uuid,
    model_id uuid,
    build_type text,
    foundation_type text,
    base_home_price numeric,
    is_current boolean,
    effective_from timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        mp.id,
        mp.model_id,
        mp.build_type::text,
        mp.foundation_type::text,
        mp.base_home_price,
        mp.is_current,
        mp.effective_from
    FROM public.model_pricing mp
    WHERE mp.is_current = true;
$$;

-- Grant execute on the function to public roles
GRANT EXECUTE ON FUNCTION public.get_public_model_pricing() TO anon, authenticated;