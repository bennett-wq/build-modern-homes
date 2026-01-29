// ============================================================================
// Database Type Mappings
// Maps Supabase generated types to application domain types
// ============================================================================

import type { Tables, Enums } from '@/integrations/supabase/types';

// ============================================================================
// Enum Re-exports (for easy access)
// ============================================================================

export type BuildType = Enums<'build_type'>;
export type FoundationType = Enums<'foundation_type'>;
export type ServicePackage = Enums<'service_package'>;
export type LotStatus = Enums<'lot_status'>;
export type DevelopmentStatus = Enums<'development_status'>;
export type GarageStyle = Enums<'garage_style'>;
export type UpgradeCategory = Enums<'upgrade_category'>;
export type QuoteStatus = Enums<'quote_status'>;
export type AppRole = Enums<'app_role'>;

// ============================================================================
// Table Row Types (direct from Supabase)
// ============================================================================

export type ModelRow = Tables<'models'>;
export type ModelPricingRow = Tables<'model_pricing'>;
export type DevelopmentRow = Tables<'developments'>;
export type LotRow = Tables<'lots'>;
export type ExteriorPackageRow = Tables<'exterior_packages'>;
export type GarageDoorOptionRow = Tables<'garage_door_options'>;
export type UpgradeOptionRow = Tables<'upgrade_options'>;
export type PricingZoneRow = Tables<'pricing_zones'>;
export type PricingMarkupRow = Tables<'pricing_markups'>;
export type QuoteRow = Tables<'quotes'>;

// ============================================================================
// Domain Models (enriched/joined types for application use)
// ============================================================================

/**
 * Public-facing pricing data (subset exposed via get_public_model_pricing RPC)
 * Used for customer-facing displays - does not include internal cost data
 */
export interface PublicModelPricing {
  id: string;
  model_id: string;
  build_type: string; // Comes as string from RPC
  foundation_type: string;
  base_home_price: number;
  is_current: boolean;
  effective_from: string;
}

/**
 * Model with current pricing attached
 * Uses PublicModelPricing for public access, full ModelPricingRow for admin
 */
export interface Model extends ModelRow {
  pricing?: {
    xmod?: PublicModelPricing | ModelPricingRow;
    mod?: PublicModelPricing | ModelPricingRow;
  };
}

/**
 * Development with related data
 */
export interface Development extends DevelopmentRow {
  pricingZone?: PricingZoneRow;
  conformingModelIds?: string[];
  arbPackageIds?: string[];
}

/**
 * Lot with typed coordinates
 */
export interface Lot extends Omit<LotRow, 'polygon_coordinates' | 'restrictions'> {
  polygon_coordinates: LotPolygonPoint[];
  restrictions: LotRestrictions;
}

export interface LotPolygonPoint {
  x: number;
  y: number;
}

export interface LotRestrictions {
  maxSqft?: number;
  minSqft?: number;
  allowedModels?: string[];
  notes?: string;
}

/**
 * Exterior package (direct mapping)
 */
export type ExteriorPackage = ExteriorPackageRow;

/**
 * Garage door option (direct mapping)
 */
export type GarageDoorOption = GarageDoorOptionRow;

/**
 * Upgrade option (direct mapping)
 */
export type UpgradeOption = UpgradeOptionRow;

/**
 * Pricing zone (direct mapping)
 */
export type PricingZone = PricingZoneRow;

/**
 * Pricing markup (direct mapping)
 */
export type PricingMarkup = PricingMarkupRow;

// ============================================================================
// Quote Payload (for inserting quotes)
// ============================================================================

export interface QuoteInsertPayload {
  development_id?: string | null;
  lot_id?: string | null;
  model_id?: string | null;
  build_type?: BuildType | null;
  foundation_type?: FoundationType | null;
  service_package: ServicePackage;
  exterior_package_id?: string | null;
  garage_door_id?: string | null;
  selected_options?: string[];
  include_permits_costs: boolean;
  include_utility_fees: boolean;
  zip_code?: string | null;
  address?: string | null;
  total_estimate?: number | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  notes?: string | null;
}

// ============================================================================
// Legacy Compatibility Types
// (Bridge between old static data and new DB-backed data)
// ============================================================================

/**
 * Legacy model config shape (for fallback during migration)
 */
export interface LegacyModelConfig {
  slug: string;
  name: string;
  beds: number;
  baths: number;
  sqft: number;
  length: number;
  buildTypes: BuildType[];
  heroImage?: string;
  floorPlanPdf?: string;
  pricing: Partial<Record<BuildType, LegacyModelPricing>>;
  floorPlanOptions: LegacyFloorPlanOption[];
}

export interface LegacyModelPricing {
  base_cost: number;
  options_adjustment: number;
  freight: number;
  mhi_dues: number;
  factory_quote_total: number;
  freightPending?: boolean;
}

export interface LegacyFloorPlanOption {
  id: string;
  name: string;
  description: string;
  price: number;
  buildTypes?: BuildType[];
  available: boolean;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isValidBuildType(value: unknown): value is BuildType {
  return value === 'xmod' || value === 'mod';
}

export function isValidFoundationType(value: unknown): value is FoundationType {
  return value === 'slab' || value === 'basement' || value === 'crawl';
}

export function isValidServicePackage(value: unknown): value is ServicePackage {
  return (
    value === 'delivered_installed' ||
    value === 'supply_only' ||
    value === 'community_all_in'
  );
}

export function isValidLotStatus(value: unknown): value is LotStatus {
  return (
    value === 'available' ||
    value === 'reserved' ||
    value === 'sold' ||
    value === 'pending'
  );
}
