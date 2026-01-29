-- ============================================================================
-- Unified Pricing Architecture - Phase 1: Database Foundation
-- Creates normalized relational schema for models, developments, lots, pricing
-- ============================================================================

-- Enums for type safety
CREATE TYPE public.development_status AS ENUM ('active', 'coming-soon', 'sold-out');
CREATE TYPE public.lot_status AS ENUM ('available', 'reserved', 'sold', 'pending');
CREATE TYPE public.build_type AS ENUM ('xmod', 'mod');
CREATE TYPE public.foundation_type AS ENUM ('slab', 'basement');
CREATE TYPE public.upgrade_category AS ENUM ('floor_plan', 'exterior', 'garage');
CREATE TYPE public.garage_style AS ENUM ('traditional', 'carriage', 'modern', 'craftsman');
CREATE TYPE public.quote_status AS ENUM ('draft', 'submitted', 'contacted', 'converted');
CREATE TYPE public.service_package AS ENUM ('delivered_installed', 'supply_only', 'community_all_in');

-- ============================================================================
-- PRICING ZONES (Regional site costs)
-- ============================================================================
CREATE TABLE public.pricing_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  crane_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  home_set_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  on_site_portion NUMERIC(10,2) NOT NULL DEFAULT 0,
  baseline_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  contingency_buffer NUMERIC(5,4) NOT NULL DEFAULT 0.10,
  utility_authority_fees NUMERIC(10,2) NOT NULL DEFAULT 0,
  permits_soft_costs NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PRICING MARKUPS (Dealer/Installer/Developer margins)
-- ============================================================================
CREATE TABLE public.pricing_markups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dealer_markup_pct NUMERIC(5,4) NOT NULL DEFAULT 0.20,
  installer_markup_pct NUMERIC(5,4) NOT NULL DEFAULT 0.00,
  developer_markup_pct NUMERIC(5,4) NOT NULL DEFAULT 0.00,
  is_default BOOLEAN NOT NULL DEFAULT false,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- DEVELOPMENTS (Communities)
-- ============================================================================
CREATE TABLE public.developments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  status public.development_status NOT NULL DEFAULT 'coming-soon',
  site_plan_image_url TEXT,
  arb_guidelines_url TEXT,
  pricing_zone_id UUID REFERENCES public.pricing_zones(id),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- LOTS (Within developments)
-- ============================================================================
CREATE TABLE public.lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  development_id UUID NOT NULL REFERENCES public.developments(id) ON DELETE CASCADE,
  lot_number TEXT NOT NULL,
  status public.lot_status NOT NULL DEFAULT 'available',
  acreage NUMERIC(6,3),
  net_acreage NUMERIC(6,3),
  premium NUMERIC(10,2) NOT NULL DEFAULT 0,
  polygon_coordinates JSONB DEFAULT '[]'::jsonb,
  restrictions JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(development_id, lot_number)
);

-- ============================================================================
-- MODELS (Home models)
-- ============================================================================
CREATE TABLE public.models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  beds INTEGER NOT NULL,
  baths NUMERIC(3,1) NOT NULL,
  sqft INTEGER NOT NULL,
  length INTEGER,
  hero_image_url TEXT,
  floorplan_pdf_url TEXT,
  floorplan_image_url TEXT,
  description TEXT,
  tagline TEXT,
  badge TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- MODEL PRICING (Versioned pricing per build/foundation type)
-- ============================================================================
CREATE TABLE public.model_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  build_type public.build_type NOT NULL,
  foundation_type public.foundation_type NOT NULL,
  base_home_price NUMERIC(10,2) NOT NULL,
  freight_allowance NUMERIC(10,2) NOT NULL DEFAULT 0,
  freight_pending BOOLEAN NOT NULL DEFAULT false,
  pricing_source TEXT,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(model_id, build_type, foundation_type, effective_from)
);

-- ============================================================================
-- DEVELOPMENT CONFORMING MODELS (Junction: which models allowed in which dev)
-- ============================================================================
CREATE TABLE public.development_conforming_models (
  development_id UUID NOT NULL REFERENCES public.developments(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (development_id, model_id)
);

-- ============================================================================
-- EXTERIOR PACKAGES (Color schemes)
-- ============================================================================
CREATE TABLE public.exterior_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  siding_color_hex TEXT,
  trim_color_hex TEXT,
  accent_color_hex TEXT,
  roof_color_hex TEXT,
  upgrade_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- DEVELOPMENT ARB PACKAGES (Junction: which exteriors approved for which dev)
-- ============================================================================
CREATE TABLE public.development_arb_packages (
  development_id UUID NOT NULL REFERENCES public.developments(id) ON DELETE CASCADE,
  exterior_package_id UUID NOT NULL REFERENCES public.exterior_packages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (development_id, exterior_package_id)
);

-- ============================================================================
-- GARAGE DOOR OPTIONS
-- ============================================================================
CREATE TABLE public.garage_door_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  style public.garage_style NOT NULL DEFAULT 'traditional',
  color_hex TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- UPGRADE OPTIONS (Floor plan and other add-ons)
-- ============================================================================
CREATE TABLE public.upgrade_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  category public.upgrade_category NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  applies_to_models UUID[] DEFAULT '{}',
  applies_to_build_types public.build_type[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- QUOTES (Lead capture - unified for both flows)
-- ============================================================================
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  development_id UUID REFERENCES public.developments(id),
  lot_id UUID REFERENCES public.lots(id),
  model_id UUID REFERENCES public.models(id),
  build_type public.build_type,
  foundation_type public.foundation_type DEFAULT 'slab',
  service_package public.service_package NOT NULL DEFAULT 'delivered_installed',
  exterior_package_id UUID REFERENCES public.exterior_packages(id),
  garage_door_id UUID REFERENCES public.garage_door_options(id),
  selected_options UUID[] DEFAULT '{}',
  include_utility_fees BOOLEAN NOT NULL DEFAULT true,
  include_permits_costs BOOLEAN NOT NULL DEFAULT true,
  total_estimate NUMERIC(12,2),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  zip_code TEXT,
  address TEXT,
  notes TEXT,
  status public.quote_status NOT NULL DEFAULT 'draft',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================
CREATE INDEX idx_lots_development ON public.lots(development_id);
CREATE INDEX idx_lots_status ON public.lots(status);
CREATE INDEX idx_model_pricing_model ON public.model_pricing(model_id);
CREATE INDEX idx_model_pricing_current ON public.model_pricing(model_id, is_current) WHERE is_current = true;
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_development ON public.quotes(development_id);
CREATE INDEX idx_quotes_user ON public.quotes(user_id);
CREATE INDEX idx_developments_status ON public.developments(status);
CREATE INDEX idx_models_active ON public.models(is_active);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pricing_zones_updated_at BEFORE UPDATE ON public.pricing_zones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_developments_updated_at BEFORE UPDATE ON public.developments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_lots_updated_at BEFORE UPDATE ON public.lots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_models_updated_at BEFORE UPDATE ON public.models
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_exterior_packages_updated_at BEFORE UPDATE ON public.exterior_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_garage_door_options_updated_at BEFORE UPDATE ON public.garage_door_options
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_upgrade_options_updated_at BEFORE UPDATE ON public.upgrade_options
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.pricing_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_markups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_conforming_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exterior_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_arb_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garage_door_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upgrade_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: Models, Exterior Packages, Garage Doors, Pricing Zones (for buyer-facing app)
CREATE POLICY "public_read_models" ON public.models FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_exterior_packages" ON public.exterior_packages FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_garage_door_options" ON public.garage_door_options FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_pricing_zones" ON public.pricing_zones FOR SELECT USING (true);
CREATE POLICY "public_read_upgrade_options" ON public.upgrade_options FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_developments" ON public.developments FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_lots" ON public.lots FOR SELECT USING (true);
CREATE POLICY "public_read_model_pricing" ON public.model_pricing FOR SELECT USING (is_current = true);
CREATE POLICY "public_read_conforming_models" ON public.development_conforming_models FOR SELECT USING (true);
CREATE POLICY "public_read_arb_packages" ON public.development_arb_packages FOR SELECT USING (true);

-- TEAM READ ALL (admin + builder can see everything including inactive)
CREATE POLICY "team_read_all_models" ON public.models FOR SELECT TO authenticated 
  USING (public.is_admin_or_builder(auth.uid()));
CREATE POLICY "team_read_all_exterior_packages" ON public.exterior_packages FOR SELECT TO authenticated 
  USING (public.is_admin_or_builder(auth.uid()));
CREATE POLICY "team_read_all_garage_door_options" ON public.garage_door_options FOR SELECT TO authenticated 
  USING (public.is_admin_or_builder(auth.uid()));
CREATE POLICY "team_read_all_developments" ON public.developments FOR SELECT TO authenticated 
  USING (public.is_admin_or_builder(auth.uid()));
CREATE POLICY "team_read_all_lots" ON public.lots FOR SELECT TO authenticated 
  USING (public.is_admin_or_builder(auth.uid()));
CREATE POLICY "team_read_all_model_pricing" ON public.model_pricing FOR SELECT TO authenticated 
  USING (public.is_admin_or_builder(auth.uid()));
CREATE POLICY "team_read_all_upgrade_options" ON public.upgrade_options FOR SELECT TO authenticated 
  USING (public.is_admin_or_builder(auth.uid()));
CREATE POLICY "team_read_pricing_markups" ON public.pricing_markups FOR SELECT TO authenticated 
  USING (public.is_admin_or_builder(auth.uid()));

-- ADMIN WRITE: Full CRUD for admins
CREATE POLICY "admin_insert_models" ON public.models FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_models" ON public.models FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_models" ON public.models FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_developments" ON public.developments FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_developments" ON public.developments FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_developments" ON public.developments FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_lots" ON public.lots FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_lots" ON public.lots FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_lots" ON public.lots FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_exterior_packages" ON public.exterior_packages FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_exterior_packages" ON public.exterior_packages FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_exterior_packages" ON public.exterior_packages FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_garage_door_options" ON public.garage_door_options FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_garage_door_options" ON public.garage_door_options FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_garage_door_options" ON public.garage_door_options FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_upgrade_options" ON public.upgrade_options FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_upgrade_options" ON public.upgrade_options FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_upgrade_options" ON public.upgrade_options FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_pricing_zones" ON public.pricing_zones FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_pricing_zones" ON public.pricing_zones FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_pricing_zones" ON public.pricing_zones FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_pricing_markups" ON public.pricing_markups FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_update_pricing_markups" ON public.pricing_markups FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_pricing_markups" ON public.pricing_markups FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_manage_conforming_models" ON public.development_conforming_models FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_manage_arb_packages" ON public.development_arb_packages FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- TEAM WRITE: Model pricing (both admin and builder can edit)
CREATE POLICY "team_insert_model_pricing" ON public.model_pricing FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin_or_builder(auth.uid()));
CREATE POLICY "team_update_model_pricing" ON public.model_pricing FOR UPDATE TO authenticated 
  USING (public.is_admin_or_builder(auth.uid()));

-- QUOTES: Public can create, users can see their own, team can see all
CREATE POLICY "public_insert_quotes" ON public.quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "user_read_own_quotes" ON public.quotes FOR SELECT TO authenticated 
  USING (user_id = auth.uid());
CREATE POLICY "team_read_all_quotes" ON public.quotes FOR SELECT TO authenticated 
  USING (public.is_admin_or_builder(auth.uid()));
CREATE POLICY "team_update_quotes" ON public.quotes FOR UPDATE TO authenticated 
  USING (public.is_admin_or_builder(auth.uid()));
CREATE POLICY "user_update_own_quotes" ON public.quotes FOR UPDATE TO authenticated 
  USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS for documentation
-- ============================================================================
COMMENT ON TABLE public.pricing_zones IS 'Regional site costs and fees by geographic zone';
COMMENT ON TABLE public.pricing_markups IS 'Markup percentages for dealer, installer, developer';
COMMENT ON TABLE public.developments IS 'Communities/developments where homes can be built';
COMMENT ON TABLE public.lots IS 'Individual lots within developments';
COMMENT ON TABLE public.models IS 'Home model catalog';
COMMENT ON TABLE public.model_pricing IS 'Versioned pricing for each model/build-type combination';
COMMENT ON TABLE public.exterior_packages IS 'Color scheme packages for home exteriors';
COMMENT ON TABLE public.garage_door_options IS 'Garage door style and color options';
COMMENT ON TABLE public.upgrade_options IS 'Add-on options for floor plans and exteriors';
COMMENT ON TABLE public.quotes IS 'Lead capture and saved builds from both flows';