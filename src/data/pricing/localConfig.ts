// ============================================================================
// Local Pricing Configuration (Fallback)
// This is the bundled config used when remote is unavailable
// ============================================================================

import type { PricingConfigData, PricingMode, PricingModeConfig } from './types';

export const LOCAL_PRICING_VERSION = "2026-01-22";

/**
 * Get the complete local pricing configuration.
 * This is the fallback when remote config is unavailable.
 */
export function getLocalPricingConfig(): PricingConfigData {
  return {
    version: LOCAL_PRICING_VERSION,
    models: MODELS,
    options: OPTIONS,
    siteCosts: SITE_COSTS,
    fees: FEES,
    markups: MARKUPS,
    pricingModes: PRICING_MODES,
    disclaimers: DISCLAIMERS,
  };
}

// ============================================================================
// CANONICAL MODEL PRICING
// ============================================================================

const MODELS = [
  {
    slug: 'hawthorne',
    name: 'Hawthorne',
    beds: 3,
    baths: 2,
    sqft: 1620,
    length: 64,
    defaultBuildType: 'xmod' as const,
    defaultFoundationType: 'slab' as const,
    pricing: [
      { buildType: 'xmod' as const, foundationType: 'slab' as const, baseHomePrice: 97087, deliveryInstallAllowance: 22500 },
      { buildType: 'xmod' as const, foundationType: 'basement' as const, baseHomePrice: 97087, deliveryInstallAllowance: 28000 },
      { buildType: 'mod' as const, foundationType: 'slab' as const, baseHomePrice: 104190, deliveryInstallAllowance: 22500 },
      { buildType: 'mod' as const, foundationType: 'basement' as const, baseHomePrice: 104190, deliveryInstallAllowance: 28000 },
    ],
  },
  {
    slug: 'aspen',
    name: 'Aspen',
    beds: 4,
    baths: 2,
    sqft: 1620,
    length: 64,
    defaultBuildType: 'xmod' as const,
    defaultFoundationType: 'slab' as const,
    pricing: [
      { buildType: 'xmod' as const, foundationType: 'slab' as const, baseHomePrice: 98246, deliveryInstallAllowance: 22500 },
      { buildType: 'xmod' as const, foundationType: 'basement' as const, baseHomePrice: 98246, deliveryInstallAllowance: 28000 },
      { buildType: 'mod' as const, foundationType: 'slab' as const, baseHomePrice: 108493, deliveryInstallAllowance: 22500 },
      { buildType: 'mod' as const, foundationType: 'basement' as const, baseHomePrice: 108493, deliveryInstallAllowance: 28000 },
    ],
  },
  {
    slug: 'belmont',
    name: 'Belmont',
    beds: 3,
    baths: 2,
    sqft: 1620,
    length: 64,
    defaultBuildType: 'xmod' as const,
    defaultFoundationType: 'slab' as const,
    pricing: [
      { buildType: 'xmod' as const, foundationType: 'slab' as const, baseHomePrice: 97182, deliveryInstallAllowance: 22500 },
      { buildType: 'xmod' as const, foundationType: 'basement' as const, baseHomePrice: 97182, deliveryInstallAllowance: 28000 },
      { buildType: 'mod' as const, foundationType: 'slab' as const, baseHomePrice: 107429, deliveryInstallAllowance: 22500 },
      { buildType: 'mod' as const, foundationType: 'basement' as const, baseHomePrice: 107429, deliveryInstallAllowance: 28000 },
    ],
  },
  {
    slug: 'laurel',
    name: 'Laurel',
    beds: 3,
    baths: 2,
    sqft: 1065,
    length: 48,
    defaultBuildType: 'xmod' as const,
    defaultFoundationType: 'slab' as const,
    pricingSource: 'Ballpark estimate - freight pending',
    pricing: [
      { buildType: 'xmod' as const, foundationType: 'slab' as const, baseHomePrice: 80535, deliveryInstallAllowance: 22500, freightPending: true },
      { buildType: 'mod' as const, foundationType: 'slab' as const, baseHomePrice: 87535, deliveryInstallAllowance: 22500, freightPending: true },
    ],
  },
  {
    slug: 'keeneland',
    name: 'Keeneland',
    beds: 3,
    baths: 2,
    sqft: 1800,
    length: 58,
    defaultBuildType: 'xmod' as const,
    defaultFoundationType: 'slab' as const,
    pricingSource: 'Keeneland Pricing',
    pricing: [
      { buildType: 'xmod' as const, foundationType: 'slab' as const, baseHomePrice: 106227, deliveryInstallAllowance: 22500 },
    ],
  },
  {
    slug: 'cypress',
    name: 'Cypress',
    beds: 2,
    baths: 2,
    sqft: 990,
    length: 66,
    defaultBuildType: 'xmod' as const,
    defaultFoundationType: 'slab' as const,
    pricingSource: 'BaseMod Home Package (factory)',
    pricing: [
      { buildType: 'xmod' as const, foundationType: 'slab' as const, baseHomePrice: 56397, deliveryInstallAllowance: 18000, freightPending: true },
    ],
  },
];

// ============================================================================
// UPGRADE OPTIONS
// ============================================================================

const OPTIONS: import('./types').UpgradeOption[] = [
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
  // Siding upgrades (PlyGem) - length-based
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

const SITE_COSTS = {
  baseline: 86767,
  buffer: 5000,
  crane: 8750,
  homeSet: 13750,
  onSitePortionTotal: 64267,
};

// ============================================================================
// FEES
// ============================================================================

const FEES = {
  utilityAuthorityFees: 7546,
  permitsSoftCosts: 2085,
};

// ============================================================================
// MARKUPS (Buyer-facing retail layer)
// ============================================================================

const MARKUPS = {
  dealerMarkupPct: 0.20,
  installerMarkupPct: 0.08,
  developerMarkupPct: 0.05,
};

// ============================================================================
// PRICING MODES
// ============================================================================

const PRICING_MODES: Record<PricingMode, PricingModeConfig> = {
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

const DISCLAIMERS = {
  whatsIncluded: [
    'Factory-built CrossMod® home to site-built standards',
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
  version: `Pricing version: ${LOCAL_PRICING_VERSION}`,
};
