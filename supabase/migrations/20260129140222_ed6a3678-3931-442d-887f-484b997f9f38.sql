-- Drop restrictive policies and create unified insert policy
DROP POLICY IF EXISTS "anon_insert_financing_applications" ON public.financing_applications;
DROP POLICY IF EXISTS "auth_insert_own_financing_applications" ON public.financing_applications;

-- Create unified insert policy that allows both anon and authenticated users
-- When user_id is null (anon) or matches auth.uid() (authenticated)
CREATE POLICY "public_insert_financing_applications"
ON public.financing_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());