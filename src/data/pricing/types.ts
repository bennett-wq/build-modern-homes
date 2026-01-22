// ============================================================================
// Pricing Data Types
// Shared type definitions for pricing configuration
// ============================================================================

export type BuildType = 'xmod' | 'mod';
export type FoundationType = 'slab' | 'basement';
export type PricingMode = 'supply_only' | 'delivered_installed' | 'community_all_in';

export interface ModelPricingEntry {
  buildType: BuildType;
  foundationType: FoundationType;
  baseHomePrice: number;
  deliveryInstallAllowance: number;
  freightPending?: boolean;
}

export interface ModelConfig {
  slug: string;
  name: string;
  beds: number;
  baths: number;
  sqft: number;
  length: number;
  defaultBuildType: BuildType;
  defaultFoundationType: FoundationType;
  pricing: ModelPricingEntry[];
  pricingSource?: string;
}

export interface UpgradeOption {
  id: string;
  label: string;
  price: number;
  /** Which model slugs this option applies to. Empty = all models */
  appliesTo: string[];
  /** Which build types this option applies to. Empty = all types */
  buildTypes: BuildType[];
  category: 'floor_plan' | 'exterior' | 'garage';
}

export interface SiteCostConfig {
  baseline: number;
  buffer: number;
  crane: number;
  homeSet: number;
  onSitePortionTotal: number;
}

export interface FeeConfig {
  utilityAuthorityFees: number;
  permitsSoftCosts: number;
}

export interface MarkupConfig {
  dealerMarkupPct: number;
  installerMarkupPct: number;
  developerMarkupPct: number;
}

export interface PricingModeConfig {
  name: string;
  description: string;
  appliesDealer: boolean;
  appliesInstaller: boolean;
  appliesDeveloper: boolean;
}

export interface DisclaimersConfig {
  whatsIncluded: string[];
  whatsNotIncluded: string[];
  estimate: string;
  version: string;
}

/**
 * Complete pricing configuration data structure.
 * This is what gets stored in the database as JSONB.
 */
export interface PricingConfigData {
  version: string;
  models: ModelConfig[];
  options: UpgradeOption[];
  siteCosts: SiteCostConfig;
  fees: FeeConfig;
  markups: MarkupConfig;
  pricingModes: Record<PricingMode, PricingModeConfig>;
  disclaimers: DisclaimersConfig;
}

/**
 * Database record for pricing_configs table
 */
export interface PricingConfigRecord {
  id: string;
  created_at: string;
  created_by: string | null;
  status: 'draft' | 'published' | 'archived';
  label: string | null;
  effective_at: string | null;
  config: PricingConfigData;
}
