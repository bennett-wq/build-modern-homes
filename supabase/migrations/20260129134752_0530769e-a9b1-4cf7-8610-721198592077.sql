-- Create enums for financing applications
CREATE TYPE public.intended_use AS ENUM ('primary', 'second_home', 'investment');
CREATE TYPE public.employment_status AS ENUM ('employed', 'self_employed', 'retired', 'other');
CREATE TYPE public.income_range AS ENUM ('under_50k', '50k_75k', '75k_100k', '100k_150k', '150k_plus');
CREATE TYPE public.credit_score_range AS ENUM ('excellent_750', 'good_700', 'fair_650', 'below_650', 'unsure');
CREATE TYPE public.purchase_timeframe AS ENUM ('0_3_months', '3_6_months', '6_12_months', '12_plus');
CREATE TYPE public.prequal_status AS ENUM ('pending', 'pre_qualified', 'needs_review', 'declined');

-- Create financing_applications table
CREATE TABLE public.financing_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Contact Information
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  
  -- Property Details
  intended_use intended_use NOT NULL DEFAULT 'primary',
  purchase_price NUMERIC NOT NULL,
  
  -- Financial Profile
  employment_status employment_status NOT NULL DEFAULT 'employed',
  annual_income_range income_range NOT NULL DEFAULT '75k_100k',
  credit_score_range credit_score_range NOT NULL DEFAULT 'unsure',
  
  -- Loan Details
  down_payment_percent NUMERIC NOT NULL DEFAULT 5,
  down_payment_amount NUMERIC NOT NULL DEFAULT 0,
  loan_amount_requested NUMERIC NOT NULL DEFAULT 0,
  loan_term_years INTEGER NOT NULL DEFAULT 30,
  interest_rate NUMERIC NOT NULL DEFAULT 6.5,
  
  -- Calculated Fields
  monthly_payment_estimate NUMERIC,
  
  -- Timeline & Status
  purchase_timeframe purchase_timeframe NOT NULL DEFAULT '3_6_months',
  pre_qualification_status prequal_status NOT NULL DEFAULT 'pending',
  pre_qualified_amount NUMERIC,
  
  -- Additional
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financing_applications ENABLE ROW LEVEL SECURITY;

-- Anonymous users can INSERT for lead capture (no user_id required)
CREATE POLICY "anon_insert_financing_applications"
ON public.financing_applications
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Authenticated users can insert their own applications
CREATE POLICY "auth_insert_own_financing_applications"
ON public.financing_applications
FOR INSERT
TO authenticated
WITH CHECK ((user_id = auth.uid()) OR (user_id IS NULL));

-- Users can read their own applications
CREATE POLICY "user_read_own_financing_applications"
ON public.financing_applications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own applications
CREATE POLICY "user_update_own_financing_applications"
ON public.financing_applications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Admin/builder can read all applications
CREATE POLICY "team_read_all_financing_applications"
ON public.financing_applications
FOR SELECT
TO authenticated
USING (is_admin_or_builder(auth.uid()));

-- Admin/builder can update all applications
CREATE POLICY "team_update_financing_applications"
ON public.financing_applications
FOR UPDATE
TO authenticated
USING (is_admin_or_builder(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER set_financing_applications_updated_at
  BEFORE UPDATE ON public.financing_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create indexes for efficient querying
CREATE INDEX idx_financing_applications_quote_id ON public.financing_applications(quote_id);
CREATE INDEX idx_financing_applications_user_id ON public.financing_applications(user_id);
CREATE INDEX idx_financing_applications_status ON public.financing_applications(pre_qualification_status);
CREATE INDEX idx_financing_applications_created_at ON public.financing_applications(created_at DESC);