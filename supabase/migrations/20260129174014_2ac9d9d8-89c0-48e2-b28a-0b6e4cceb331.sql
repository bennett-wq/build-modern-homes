-- Restore public read access for pricing_zones since this data IS needed for the public pricing calculator
-- The sitework breakdown is displayed to customers as part of the transparent pricing model
CREATE POLICY "public_read_pricing_zones"
ON public.pricing_zones
FOR SELECT
TO anon, authenticated
USING (true);