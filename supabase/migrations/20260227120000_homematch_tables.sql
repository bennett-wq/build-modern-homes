-- ============================================================================
-- HomeMatch Platform — Database Migration
-- Creates all tables for the three-tab HomeMatch platform:
--   mls_listings, municipalities, zoning_districts, parcel_zoning,
--   model_dimensions, model_fits, land_divisions, acquisition_scores,
--   homematch_inquiries, search_analytics
-- Reference: docs/homematch/PLATFORM-ARCHITECTURE.md Section 2.1
-- ============================================================================

-- ============================================================================
-- TABLE 1: mls_listings — Vacant land from Spark API
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mls_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  listing_type TEXT NOT NULL DEFAULT 'vacant_land',

  -- Location
  address TEXT NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'MI',
  zip_code TEXT,
  county TEXT,
  municipality TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  -- Lot dimensions (from MLS + Regrid enrichment)
  lot_acres NUMERIC(10,4),
  lot_sqft NUMERIC(12,2),
  frontage_ft NUMERIC(8,2),
  depth_ft NUMERIC(8,2),

  -- Listing details
  list_price NUMERIC(12,2),
  original_list_price NUMERIC(12,2),
  price_per_acre NUMERIC(12,2),
  days_on_market INTEGER,
  list_date DATE,
  sold_date DATE,
  sold_price NUMERIC(12,2),
  expiration_date DATE,
  withdrawal_date DATE,

  -- Agent / Office
  listing_agent_name TEXT,
  listing_agent_phone TEXT,
  listing_agent_email TEXT,
  listing_office TEXT,
  coop_commission TEXT,

  -- Utilities & Features
  water TEXT,
  sewer TEXT,
  electric BOOLEAN DEFAULT true,
  gas TEXT,
  road_type TEXT,
  topography TEXT,

  -- MLS description
  description TEXT,
  photos JSONB DEFAULT '[]',

  -- Regrid enrichment
  regrid_parcel_id TEXT,
  parcel_boundary JSONB,

  -- Metadata
  source TEXT DEFAULT 'spark_api',
  raw_data JSONB,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mls_listings_status ON public.mls_listings(status);
CREATE INDEX IF NOT EXISTS idx_mls_listings_municipality ON public.mls_listings(municipality);
CREATE INDEX IF NOT EXISTS idx_mls_listings_zip ON public.mls_listings(zip_code);
CREATE INDEX IF NOT EXISTS idx_mls_listings_price ON public.mls_listings(list_price);
CREATE INDEX IF NOT EXISTS idx_mls_listings_mls_number ON public.mls_listings(mls_number);
CREATE INDEX IF NOT EXISTS idx_mls_listings_coords ON public.mls_listings(latitude, longitude);

-- ============================================================================
-- TABLE 2: municipalities — Zoning intelligence per municipality
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  county TEXT NOT NULL,
  state TEXT DEFAULT 'MI',
  fips_code TEXT,

  -- Subsection 6 / PA 58
  subsection_6_adopted TEXT DEFAULT 'unknown',
  subsection_6_details TEXT,

  -- Market intelligence
  market_strength TEXT DEFAULT 'moderate',
  new_construction_activity TEXT DEFAULT 'medium',
  planning_commission_trend TEXT DEFAULT 'neutral',
  intel_score INTEGER DEFAULT 0,

  -- Coverage
  homematch_live BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'p3',

  -- Metadata
  ordinance_url TEXT,
  last_verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_municipalities_name_county
  ON public.municipalities(name, county, state);

-- ============================================================================
-- TABLE 3: zoning_districts — Dimensional requirements per zone
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.zoning_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality_id UUID REFERENCES public.municipalities(id) ON DELETE CASCADE,
  district_code TEXT NOT NULL,
  district_name TEXT NOT NULL,

  -- Dimensional requirements
  min_lot_width_ft NUMERIC(8,2),
  min_lot_depth_ft NUMERIC(8,2),
  min_lot_area_sqft NUMERIC(12,2),
  front_setback_ft NUMERIC(8,2),
  side_setback_ft NUMERIC(8,2),
  rear_setback_ft NUMERIC(8,2),
  max_lot_coverage_pct NUMERIC(5,2),
  max_height_ft NUMERIC(8,2),
  max_dwelling_units INTEGER DEFAULT 1,

  -- Confidence
  confidence TEXT DEFAULT 'not_started',
  confidence_source TEXT,
  last_verified_at TIMESTAMPTZ,
  verified_by TEXT,

  -- Metadata
  notes TEXT,
  raw_ordinance_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zoning_districts_municipality
  ON public.zoning_districts(municipality_id);

-- ============================================================================
-- TABLE 4: parcel_zoning — Links parcels to their zoning district
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.parcel_zoning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_listing_id UUID REFERENCES public.mls_listings(id) ON DELETE CASCADE,
  zoning_district_id UUID REFERENCES public.zoning_districts(id),
  regrid_parcel_id TEXT,

  -- Parcel-specific overrides (from Regrid / GIS)
  actual_frontage_ft NUMERIC(8,2),
  actual_depth_ft NUMERIC(8,2),
  actual_area_sqft NUMERIC(12,2),

  -- Computed buildable envelope
  buildable_width_ft NUMERIC(8,2),
  buildable_depth_ft NUMERIC(8,2),
  buildable_area_sqft NUMERIC(12,2),

  -- Special conditions
  floodplain BOOLEAN DEFAULT false,
  historic_district BOOLEAN DEFAULT false,
  pud_overlay BOOLEAN DEFAULT false,
  special_conditions TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parcel_zoning_listing
  ON public.parcel_zoning(mls_listing_id);

-- ============================================================================
-- TABLE 5: model_dimensions — Physical footprints for model fit
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.model_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_slug TEXT NOT NULL,
  model_name TEXT NOT NULL,

  -- Physical dimensions
  width_ft NUMERIC(8,2) NOT NULL,
  depth_ft NUMERIC(8,2) NOT NULL,
  height_ft NUMERIC(8,2) NOT NULL,
  footprint_sqft NUMERIC(12,2) GENERATED ALWAYS AS (width_ft * depth_ft) STORED,

  -- Build type variants
  build_type TEXT NOT NULL,

  -- Reference to existing pricing
  beds INTEGER,
  baths INTEGER,
  living_sqft NUMERIC(8,2),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(model_slug, build_type)
);

-- ============================================================================
-- TABLE 6: model_fits — Pre-calculated fit results (batch computed)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.model_fits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_listing_id UUID REFERENCES public.mls_listings(id) ON DELETE CASCADE,
  model_slug TEXT NOT NULL,
  build_type TEXT NOT NULL,

  -- Fit result
  fit_status TEXT NOT NULL,
  fit_reason TEXT,

  -- Margins
  width_margin_ft NUMERIC(8,2),
  depth_margin_ft NUMERIC(8,2),
  coverage_pct NUMERIC(5,2),

  -- Pricing
  lot_price NUMERIC(12,2),
  home_price NUMERIC(12,2),
  site_work_low NUMERIC(12,2),
  site_work_high NUMERIC(12,2),
  total_delivered_low NUMERIC(12,2),
  total_delivered_high NUMERIC(12,2),

  -- Confidence inherits from zoning
  zoning_confidence TEXT,

  computed_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(mls_listing_id, model_slug, build_type)
);

CREATE INDEX IF NOT EXISTS idx_model_fits_listing ON public.model_fits(mls_listing_id);
CREATE INDEX IF NOT EXISTS idx_model_fits_status ON public.model_fits(fit_status);
CREATE INDEX IF NOT EXISTS idx_model_fits_model ON public.model_fits(model_slug);

-- ============================================================================
-- TABLE 7: land_divisions — Division potential per lot
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.land_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_listing_id UUID REFERENCES public.mls_listings(id) ON DELETE CASCADE,

  -- Division analysis
  total_frontage_ft NUMERIC(8,2),
  min_lot_width_ft NUMERIC(8,2),
  max_possible_lots INTEGER,
  feasible_lots INTEGER,

  -- Per resulting lot (JSONB array)
  resulting_lots JSONB DEFAULT '[]',

  -- Development economics
  total_acquisition_cost NUMERIC(12,2),
  total_build_cost NUMERIC(12,2),
  total_site_work NUMERIC(12,2),
  total_development_cost NUMERIC(12,2),
  estimated_total_value NUMERIC(12,2),
  estimated_margin NUMERIC(12,2),
  estimated_roi_pct NUMERIC(5,2),

  computed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- TABLE 8: acquisition_scores — Tab 3 scoring for expired/withdrawn lots
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.acquisition_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_listing_id UUID REFERENCES public.mls_listings(id) ON DELETE CASCADE,

  -- Composite score (0-100)
  total_score INTEGER NOT NULL,

  -- Sub-scores (each 0-25)
  seller_motivation_score INTEGER,
  lot_viability_score INTEGER,
  margin_potential_score INTEGER,
  market_strength_score INTEGER,

  -- Score reasoning
  score_factors JSONB DEFAULT '{}',

  -- Actions
  recommended_action TEXT,
  recommended_offer NUMERIC(12,2),

  -- Status tracking
  review_status TEXT DEFAULT 'unreviewed',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,

  computed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acquisition_scores_total ON public.acquisition_scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_acquisition_scores_status ON public.acquisition_scores(review_status);

-- ============================================================================
-- TABLE 9: homematch_inquiries — Lead capture from "I'm Interested"
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.homematch_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_listing_id UUID REFERENCES public.mls_listings(id),
  model_slug TEXT,

  -- Contact info
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,

  -- Context
  is_agent BOOLEAN DEFAULT false,
  agent_name TEXT,
  agent_brokerage TEXT,
  agent_mls_id TEXT,

  -- Source
  source_tab TEXT NOT NULL,
  referrer_url TEXT,

  -- Status
  status TEXT DEFAULT 'new',
  assigned_to TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- TABLE 10: search_analytics — Track search behavior for intelligence
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Search context
  search_type TEXT NOT NULL,
  search_query TEXT,
  municipality TEXT,
  zip_code TEXT,

  -- Filters applied
  filters JSONB DEFAULT '{}',

  -- Results
  result_count INTEGER,

  -- User context (anonymous)
  session_id TEXT,
  source_tab TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_analytics_municipality
  ON public.search_analytics(municipality);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created
  ON public.search_analytics(created_at);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- Uses existing set_updated_at() function from main migration
-- ============================================================================
CREATE TRIGGER set_mls_listings_updated_at BEFORE UPDATE ON public.mls_listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_municipalities_updated_at BEFORE UPDATE ON public.municipalities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_zoning_districts_updated_at BEFORE UPDATE ON public.zoning_districts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_parcel_zoning_updated_at BEFORE UPDATE ON public.parcel_zoning
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_model_dimensions_updated_at BEFORE UPDATE ON public.model_dimensions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_acquisition_scores_updated_at BEFORE UPDATE ON public.acquisition_scores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_homematch_inquiries_updated_at BEFORE UPDATE ON public.homematch_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- Reference: docs/homematch/PLATFORM-ARCHITECTURE.md Section 4.3
-- Uses existing is_admin_or_builder() and has_role() functions
-- ============================================================================

-- mls_listings
ALTER TABLE public.mls_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_listings" ON public.mls_listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "admin_read_all_listings" ON public.mls_listings
  FOR SELECT TO authenticated
  USING (public.is_admin_or_builder(auth.uid()));

CREATE POLICY "admin_insert_listings" ON public.mls_listings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_listings" ON public.mls_listings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_delete_listings" ON public.mls_listings
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- municipalities (public read, admin write)
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_municipalities" ON public.municipalities
  FOR SELECT USING (true);

CREATE POLICY "admin_insert_municipalities" ON public.municipalities
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_municipalities" ON public.municipalities
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- zoning_districts (public read, admin write)
ALTER TABLE public.zoning_districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_zoning_districts" ON public.zoning_districts
  FOR SELECT USING (true);

CREATE POLICY "admin_insert_zoning_districts" ON public.zoning_districts
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_zoning_districts" ON public.zoning_districts
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- parcel_zoning (admin only)
ALTER TABLE public.parcel_zoning ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_read_parcel_zoning" ON public.parcel_zoning
  FOR SELECT TO authenticated
  USING (public.is_admin_or_builder(auth.uid()));

CREATE POLICY "admin_insert_parcel_zoning" ON public.parcel_zoning
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_parcel_zoning" ON public.parcel_zoning
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- model_dimensions (public read, admin write)
ALTER TABLE public.model_dimensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_model_dimensions" ON public.model_dimensions
  FOR SELECT USING (is_active = true);

CREATE POLICY "admin_manage_model_dimensions" ON public.model_dimensions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- model_fits (public read active, admin read all)
ALTER TABLE public.model_fits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_model_fits" ON public.model_fits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mls_listings
      WHERE public.mls_listings.id = public.model_fits.mls_listing_id
      AND public.mls_listings.status = 'active'
    )
  );

CREATE POLICY "admin_read_all_model_fits" ON public.model_fits
  FOR SELECT TO authenticated
  USING (public.is_admin_or_builder(auth.uid()));

CREATE POLICY "admin_insert_model_fits" ON public.model_fits
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_model_fits" ON public.model_fits
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_delete_model_fits" ON public.model_fits
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- land_divisions (admin only)
ALTER TABLE public.land_divisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_read_land_divisions" ON public.land_divisions
  FOR SELECT TO authenticated
  USING (public.is_admin_or_builder(auth.uid()));

CREATE POLICY "admin_insert_land_divisions" ON public.land_divisions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_land_divisions" ON public.land_divisions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- acquisition_scores (admin only)
ALTER TABLE public.acquisition_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_acquisition_scores" ON public.acquisition_scores
  FOR SELECT TO authenticated
  USING (public.is_admin_or_builder(auth.uid()));

CREATE POLICY "admin_insert_acquisition_scores" ON public.acquisition_scores
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_acquisition_scores" ON public.acquisition_scores
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_builder(auth.uid()));

-- homematch_inquiries (public insert, team read)
ALTER TABLE public.homematch_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_inquiries" ON public.homematch_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "team_read_inquiries" ON public.homematch_inquiries
  FOR SELECT TO authenticated
  USING (public.is_admin_or_builder(auth.uid()));

CREATE POLICY "admin_update_inquiries" ON public.homematch_inquiries
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- search_analytics (public insert, admin read)
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_analytics" ON public.search_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_read_analytics" ON public.search_analytics
  FOR SELECT TO authenticated
  USING (public.is_admin_or_builder(auth.uid()));

-- ============================================================================
-- SEED DATA: model_dimensions (from architecture doc Section 2.2)
-- ============================================================================
INSERT INTO public.model_dimensions (model_slug, model_name, width_ft, depth_ft, height_ft, build_type, beds, baths, living_sqft) VALUES
  ('hawthorne', 'Hawthorne', 32, 64, 15, 'xmod', 3, 2, 1620),
  ('hawthorne', 'Hawthorne', 32, 64, 15, 'mod', 3, 2, 1620),
  ('aspen', 'Aspen', 32, 64, 15, 'xmod', 4, 2, 1620),
  ('belmont', 'Belmont', 32, 64, 15, 'xmod', 3, 2, 1620),
  ('keeneland', 'Keeneland', 32, 58, 15, 'xmod', 3, 2, 1800),
  ('laurel', 'Laurel', 24, 48, 15, 'mod', 3, 2, 1065),
  ('cypress', 'Cypress', 16, 66, 15, 'xmod', 2, 2, 990)
ON CONFLICT (model_slug, build_type) DO UPDATE SET
  model_name = EXCLUDED.model_name,
  width_ft = EXCLUDED.width_ft,
  depth_ft = EXCLUDED.depth_ft,
  height_ft = EXCLUDED.height_ft,
  beds = EXCLUDED.beds,
  baths = EXCLUDED.baths,
  living_sqft = EXCLUDED.living_sqft;

-- ============================================================================
-- SEED DATA: Phase 1 municipalities (from architecture doc Section 7)
-- ============================================================================
INSERT INTO public.municipalities (name, county, state, priority, market_strength, new_construction_activity, intel_score, subsection_6_adopted) VALUES
  ('Ypsilanti Township', 'Washtenaw', 'MI', 'p1', 'moderate', 'medium', 55, 'unknown'),
  ('Grand Haven', 'Ottawa', 'MI', 'p1', 'strong', 'high', 80, 'yes'),
  ('Spring Lake Township', 'Ottawa', 'MI', 'p1', 'strong', 'medium', 65, 'partial'),
  ('Wyoming', 'Kent', 'MI', 'p1', 'strong', 'high', 70, 'yes'),
  ('Byron Township', 'Kent', 'MI', 'p1', 'moderate', 'medium', 60, 'partial'),
  ('Georgetown Township', 'Ottawa', 'MI', 'p1', 'strong', 'high', 75, 'yes'),
  ('Kentwood', 'Kent', 'MI', 'p1', 'strong', 'high', 72, 'yes'),
  ('Walker', 'Kent', 'MI', 'p1', 'moderate', 'medium', 62, 'unknown'),
  ('Plainfield Township', 'Kent', 'MI', 'p1', 'moderate', 'medium', 58, 'unknown'),
  ('Holland Township', 'Ottawa', 'MI', 'p1', 'strong', 'high', 68, 'yes'),
  ('Zeeland Township', 'Ottawa', 'MI', 'p1', 'moderate', 'medium', 55, 'partial'),
  ('Pittsfield Township', 'Washtenaw', 'MI', 'p2', 'moderate', 'medium', 50, 'unknown'),
  ('Ypsilanti City', 'Washtenaw', 'MI', 'p2', 'moderate', 'low', 45, 'unknown'),
  ('Grand Rapids', 'Kent', 'MI', 'p2', 'strong', 'high', 75, 'yes'),
  ('Lansing Township', 'Ingham', 'MI', 'p2', 'moderate', 'medium', 48, 'unknown'),
  ('Delhi Township', 'Ingham', 'MI', 'p2', 'moderate', 'medium', 50, 'unknown'),
  ('Canton Township', 'Wayne', 'MI', 'p2', 'strong', 'medium', 60, 'partial'),
  ('Brownstown Township', 'Wayne', 'MI', 'p2', 'moderate', 'low', 42, 'unknown'),
  ('Muskegon', 'Muskegon', 'MI', 'p3', 'moderate', 'low', 40, 'unknown'),
  ('Kalamazoo Township', 'Kalamazoo', 'MI', 'p3', 'moderate', 'medium', 45, 'unknown')
ON CONFLICT (name, county, state) DO UPDATE SET
  priority = EXCLUDED.priority,
  market_strength = EXCLUDED.market_strength,
  new_construction_activity = EXCLUDED.new_construction_activity,
  intel_score = EXCLUDED.intel_score,
  subsection_6_adopted = EXCLUDED.subsection_6_adopted;
