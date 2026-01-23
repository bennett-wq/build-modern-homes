// ============================================================================
// BaseMod Canonical Pricing Configuration v1
// SINGLE SOURCE OF TRUTH for all pricing inputs
// Admin-ready (versioned config), but no admin UI in this pass
// ============================================================================

export const PRICING_VERSION = "2026-01-22";

// ============================================================================
// TYPE DEFINITIONS
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

// ============================================================================
// CANONICAL MODEL PRICING
// ============================================================================

export const MODELS: ModelConfig[] = [
  {
    slug: 'hawthorne',
    name: 'Hawthorne',
    beds: 3,
    baths: 2,
    sqft: 1620,
    length: 64,
    defaultBuildType: 'xmod',
    defaultFoundationType: 'slab',
    pricing: [
      { buildType: 'xmod', foundationType: 'slab', baseHomePrice: 97087, deliveryInstallAllowance: 22500 },
      { buildType: 'xmod', foundationType: 'basement', baseHomePrice: 97087, deliveryInstallAllowance: 28000 },
      { buildType: 'mod', foundationType: 'slab', baseHomePrice: 107904, deliveryInstallAllowance: 22500 },
      { buildType: 'mod', foundationType: 'basement', baseHomePrice: 107904, deliveryInstallAllowance: 28000 },
    ],
  },
  {
    slug: 'aspen',
    name: 'Aspen',
    beds: 4,
    baths: 2,
    sqft: 1620,
    length: 64,
    defaultBuildType: 'xmod',
    defaultFoundationType: 'slab',
    pricing: [
      { buildType: 'xmod', foundationType: 'slab', baseHomePrice: 98246, deliveryInstallAllowance: 22500 },
      { buildType: 'xmod', foundationType: 'basement', baseHomePrice: 98246, deliveryInstallAllowance: 28000 },
      { buildType: 'mod', foundationType: 'slab', baseHomePrice: 112559, deliveryInstallAllowance: 22500 },
      { buildType: 'mod', foundationType: 'basement', baseHomePrice: 112559, deliveryInstallAllowance: 28000 },
    ],
  },
  {
    slug: 'belmont',
    name: 'Belmont',
    beds: 3,
    baths: 2,
    sqft: 1620,
    length: 64,
    defaultBuildType: 'xmod',
    defaultFoundationType: 'slab',
    pricing: [
      { buildType: 'xmod', foundationType: 'slab', baseHomePrice: 97182, deliveryInstallAllowance: 22500 },
      { buildType: 'xmod', foundationType: 'basement', baseHomePrice: 97182, deliveryInstallAllowance: 28000 },
      { buildType: 'mod', foundationType: 'slab', baseHomePrice: 111323, deliveryInstallAllowance: 22500 },
      { buildType: 'mod', foundationType: 'basement', baseHomePrice: 111323, deliveryInstallAllowance: 28000 },
    ],
  },
  {
    slug: 'laurel',
    name: 'Laurel',
    beds: 3,
    baths: 2,
    sqft: 1065,
    length: 48,
    defaultBuildType: 'mod',
    defaultFoundationType: 'slab',
    pricingSource: 'Laurel MOD Quote',
    pricing: [
      { buildType: 'mod', foundationType: 'slab', baseHomePrice: 95245, deliveryInstallAllowance: 22500 },
    ],
  },
  {
    slug: 'keeneland',
    name: 'Keeneland',
    beds: 3,
    baths: 2,
    sqft: 1800,
    length: 58,
    defaultBuildType: 'xmod',
    defaultFoundationType: 'slab',
    pricingSource: 'Keeneland Pricing',
    pricing: [
      { buildType: 'xmod', foundationType: 'slab', baseHomePrice: 106227, deliveryInstallAllowance: 22500 },
    ],
  },
  {
    slug: 'cypress',
    name: 'Cypress',
    beds: 2,
    baths: 2,
    sqft: 990,
    length: 66,
    defaultBuildType: 'xmod',
    defaultFoundationType: 'slab',
    pricingSource: 'BaseMod Home Package (placeholder)',
    pricing: [
      { buildType: 'xmod', foundationType: 'slab', baseHomePrice: 62213, deliveryInstallAllowance: 18000, freightPending: true },
    ],
  },
];

// ============================================================================
// UPGRADE OPTIONS
// ============================================================================

export const OPTIONS: UpgradeOption[] = [
  // Floor plan options
  {
    id: 'office-replaces-bedroom',
    label: 'Office replaces bedroom',
    price: 1500,
    appliesTo: ['hawthorne'],
    buildTypes: [],
    category: 'floor_plan',
  },
  {
    id: 'add-half-bath',
    label: 'Add 1/2 bath',
    price: 1000,
    appliesTo: ['hawthorne', 'aspen'],
    buildTypes: [],
    category: 'floor_plan',
  },
  {
    id: '9ft-walls',
    label: "9' walls",
    price: 11050,
    appliesTo: ['hawthorne'],
    buildTypes: ['mod'],
    category: 'floor_plan',
  },
  {
    id: '9ft-walls-laurel',
    label: "9' walls",
    price: 11000,
    appliesTo: ['laurel'],
    buildTypes: ['mod'],
    category: 'floor_plan',
  },
  // Exterior options
  {
    id: 'black-fascia-package',
    label: 'Black Fascia + Drip Edge + Soffit',
    price: 525,
    appliesTo: [],
    buildTypes: [],
    category: 'exterior',
  },
  {
    id: 'black-exterior-door',
    label: 'Black Exterior Door',
    price: 280,
    appliesTo: [],
    buildTypes: [],
    category: 'exterior',
  },
  {
    id: 'storm-door',
    label: 'Storm Door (White)',
    price: 230,
    appliesTo: [],
    buildTypes: [],
    category: 'exterior',
  },
  // Siding upgrades (PlyGem) - length-based, handled separately
  {
    id: 'plygem-under-55',
    label: 'Premium Siding Upgrade',
    price: 1205,
    appliesTo: [],
    buildTypes: [],
    category: 'exterior',
  },
  {
    id: 'plygem-55-64',
    label: 'Premium Siding Upgrade',
    price: 1355,
    appliesTo: [],
    buildTypes: [],
    category: 'exterior',
  },
  {
    id: 'plygem-over-64',
    label: 'Premium Siding Upgrade',
    price: 1505,
    appliesTo: [],
    buildTypes: [],
    category: 'exterior',
  },
];

// ============================================================================
// SITE COST BASELINE
// ============================================================================

export const SITE_COSTS: SiteCostConfig = {
  baseline: 86767,    // Total baseline site cost
  buffer: 5000,       // Contingency buffer
  crane: 8750,
  homeSet: 13750,
  onSitePortionTotal: 64267,
};

// ============================================================================
// FEES
// ============================================================================

export const FEES: FeeConfig = {
  utilityAuthorityFees: 7546,
  permitsSoftCosts: 2085,
};

// ============================================================================
// MARKUPS (Buyer-facing retail layer)
// ============================================================================

export const MARKUPS: MarkupConfig = {
  dealerMarkupPct: 0.20,      // 20% dealer markup on factory cost
  installerMarkupPct: 0.08,   // 8% installer markup on sitework
  developerMarkupPct: 0.05,   // 5% developer markup for community builds
};

// ============================================================================
// PRICING MODES
// ============================================================================

export const PRICING_MODES: Record<PricingMode, PricingModeConfig> = {
  supply_only: {
    name: 'Home Package Only',
    description: 'Factory-built home delivered to your site',
    appliesDealer: true,
    appliesInstaller: false,
    appliesDeveloper: false,
  },
  delivered_installed: {
    name: 'Delivered & Installed',
    description: 'Home delivered and professionally installed on your land',
    appliesDealer: true,
    appliesInstaller: true,
    appliesDeveloper: false,
  },
  community_all_in: {
    name: 'Community All-In',
    description: 'Complete turnkey home in a BaseMod community with land',
    appliesDealer: true,
    appliesInstaller: true,
    appliesDeveloper: true,
  },
};

// ============================================================================
// DISCLAIMERS
// ============================================================================

export const DISCLAIMERS = {
  whatsIncluded: [
    'Factory-built home to site-built standards',
    'Professional delivery and installation',
    'Foundation (slab or basement as configured)',
    'Exterior finishes as specified',
  ],
  whatsNotIncluded: [
    'Land/lot cost',
    'Permits and utility connections (estimated separately)',
    'Site preparation beyond standard',
    'Interior upgrades beyond standard specifications',
  ],
  estimate: 'This is an estimate based on current pricing. Final pricing may vary based on site conditions, permitting, and market factors.',
  version: `Pricing version: ${PRICING_VERSION}`,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a model by slug. Returns undefined if not found.
 */
export function getModelConfig(slug: string): ModelConfig | undefined {
  return MODELS.find((m) => m.slug === slug);
}

/**
 * Get pricing for a specific model/buildType/foundationType combo.
 * Returns undefined if the combination is not available.
 */
export function getModelPricing(
  modelSlug: string,
  buildType: BuildType,
  foundationType: FoundationType
): ModelPricingEntry | undefined {
  const model = getModelConfig(modelSlug);
  if (!model) return undefined;
  
  return model.pricing.find(
    (p) => p.buildType === buildType && p.foundationType === foundationType
  );
}

/**
 * Get available options for a model and build type.
 */
export function getAvailableOptions(
  modelSlug: string,
  buildType: BuildType
): UpgradeOption[] {
  return OPTIONS.filter((opt) => {
    // Check if applies to this model (empty = all models)
    const modelMatch = opt.appliesTo.length === 0 || opt.appliesTo.includes(modelSlug);
    // Check if applies to this build type (empty = all types)
    const buildMatch = opt.buildTypes.length === 0 || opt.buildTypes.includes(buildType);
    return modelMatch && buildMatch;
  });
}

/**
 * Get siding upgrade price based on model length.
 */
export function getSidingUpgradePrice(modelLength: number): number {
  if (modelLength < 55) return 1205;
  if (modelLength <= 64) return 1355;
  return 1505;
}

/**
 * Check if a model has pricing for a given build type.
 */
export function hasPricingForBuildType(modelSlug: string, buildType: BuildType): boolean {
  const model = getModelConfig(modelSlug);
  if (!model) return false;
  return model.pricing.some((p) => p.buildType === buildType);
}
