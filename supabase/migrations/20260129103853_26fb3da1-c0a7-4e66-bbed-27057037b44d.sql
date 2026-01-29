-- ============================================================================
-- Pricing Audit Trail Migration
-- Add CMH quote tracking fields to model_pricing for VC-grade data integrity
-- ============================================================================

-- Add audit trail columns to model_pricing table
ALTER TABLE public.model_pricing
ADD COLUMN IF NOT EXISTS quote_number TEXT,
ADD COLUMN IF NOT EXISTS quote_date DATE,
ADD COLUMN IF NOT EXISTS base_cost NUMERIC,
ADD COLUMN IF NOT EXISTS options_delta NUMERIC,
ADD COLUMN IF NOT EXISTS shipping_charge NUMERIC;

-- Add comments for documentation
COMMENT ON COLUMN public.model_pricing.quote_number IS 'CMH Manufacturing quote reference number (e.g., 52407)';
COMMENT ON COLUMN public.model_pricing.quote_date IS 'Date the CMH quote was issued';
COMMENT ON COLUMN public.model_pricing.base_cost IS 'Base Cost of Home from CMH quote (before options and shipping)';
COMMENT ON COLUMN public.model_pricing.options_delta IS 'Options total delta (can be negative for deductions)';
COMMENT ON COLUMN public.model_pricing.shipping_charge IS 'Shipping & Destination charge from CMH quote';
COMMENT ON TABLE public.model_pricing IS 'Model pricing from CMH quotes. MHI Dues fixed at $35 per unit - not stored per row. base_home_price = base_cost + options_delta + shipping_charge + $35 MHI';

-- Add upgrade_category enum value for foundation if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'foundation' AND enumtypid = 'upgrade_category'::regtype) THEN
    ALTER TYPE upgrade_category ADD VALUE 'foundation';
  END IF;
END$$;