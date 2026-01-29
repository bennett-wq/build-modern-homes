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
    length: 64, // CMH Quote: 64' x 32'
    defaultBuildType: 'xmod' as const,
    defaultFoundationType: 'slab' as const,
    pricingSource: 'CMH Quote #52202 (XMOD), #52407 (MOD)',
    pricing: [
      { buildType: 'xmod' as const, foundationType: 'slab' as const, baseHomePrice: 97087, deliveryInstallAllowance: 22500 },
      { buildType: 'xmod' as const, foundationType: 'basement' as const, baseHomePrice: 97087, deliveryInstallAllowance: 28000 },
      { buildType: 'mod' as const, foundationType: 'slab' as const, baseHomePrice: 107904, deliveryInstallAllowance: 22500 },
      { buildType: 'mod' as const, foundationType: 'basement' as const, baseHomePrice: 107904, deliveryInstallAllowance: 28000 },
    ],
  },
  {
    slug: 'aspen',
    name: 'Aspen',
    beds: 4,
    baths: 2,
    sqft: 1620,
    length: 60, // CMH Quote: 32' x 60'
    defaultBuildType: 'xmod' as const,
    defaultFoundationType: 'slab' as const,
    pricingSource: 'CMH Quote #52418 (XMOD), #52422 (MOD)',
    pricing: [
      { buildType: 'xmod' as const, foundationType: 'slab' as const, baseHomePrice: 98246, deliveryInstallAllowance: 22500 },
      { buildType: 'xmod' as const, foundationType: 'basement' as const, baseHomePrice: 98246, deliveryInstallAllowance: 28000 },
      { buildType: 'mod' as const, foundationType: 'slab' as const, baseHomePrice: 108493, deliveryInstallAllowance: 22500 }, // Updated from $112,559 per audit
      { buildType: 'mod' as const, foundationType: 'basement' as const, baseHomePrice: 108493, deliveryInstallAllowance: 28000 },
    ],
  },
  {
    slug: 'belmont',
    name: 'Belmont',
    beds: 3,
    baths: 2,
    sqft: 1620,
    length: 60, // CMH Quote: 32' x 60'
    defaultBuildType: 'xmod' as const,
    defaultFoundationType: 'slab' as const,
    pricingSource: 'CMH Quote #52409 (XMOD), #52410 (MOD)',
    pricing: [
      { buildType: 'xmod' as const, foundationType: 'slab' as const, baseHomePrice: 97182, deliveryInstallAllowance: 22500 },
      { buildType: 'xmod' as const, foundationType: 'basement' as const, baseHomePrice: 97182, deliveryInstallAllowance: 28000 },
      { buildType: 'mod' as const, foundationType: 'slab' as const, baseHomePrice: 111323, deliveryInstallAllowance: 22500 },
      { buildType: 'mod' as const, foundationType: 'basement' as const, baseHomePrice: 111323, deliveryInstallAllowance: 28000 },
    ],
  },
  {
    slug: 'laurel',
    name: 'Laurel',
    beds: 3,
    baths: 2,
    sqft: 1065,
    length: 48, // CMH Quote: 24' x 48'
    defaultBuildType: 'mod' as const,
    defaultFoundationType: 'slab' as const,
    pricingSource: 'CMH Quote #52533 (MOD)',
    pricing: [
      { buildType: 'mod' as const, foundationType: 'slab' as const, baseHomePrice: 95245, deliveryInstallAllowance: 22500 },
    ],
  },
  {
    slug: 'keeneland',
    name: 'Keeneland',
    beds: 3,
    baths: 2,
    sqft: 1635, // Livable sqft (58x32 includes garage)
    length: 58, // CMH Quote: 58' x 32'
    defaultBuildType: 'xmod' as const,
    defaultFoundationType: 'slab' as const,
    pricingSource: 'CMH Quote #52250 (XMOD)',
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
    length: 66, // 16' x 66'
    defaultBuildType: 'xmod' as const,
    defaultFoundationType: 'slab' as const,
    pricingSource: 'BaseMod Placeholder (awaiting CMH quote)',
    pricing: [
      { buildType: 'xmod' as const, foundationType: 'slab' as const, baseHomePrice: 62213, deliveryInstallAllowance: 18000, freightPending: true },
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
  // New options from CMH Buyer Selections tabs
  {
    id: 'ebuilt-plus-electric',
    label: 'eBuilt Plus - DOE Certified',
    price: 1500,
    appliesTo: [],
    buildTypes: [],
    category: 'floor_plan',
  },
  {
    id: 'crossmod-inspection-fee',
    label: 'CrossMod Inspection Fee (SC)',
    price: 750,
    appliesTo: [],
    buildTypes: ['xmod'],
    category: 'floor_plan',
  },
  {
    id: 'garbage-disposal',
    label: 'Garbage Disposal',
    price: 170,
    appliesTo: [],
    buildTypes: [],
    category: 'floor_plan',
  },
  {
    id: 'carrier-gas-furnace',
    label: 'Carrier High Efficiency Gas Furnace',
    price: 765,
    appliesTo: [],
    buildTypes: [],
    category: 'floor_plan',
  },
  {
    id: 'basement-upgrade',
    label: 'Full Basement (upgrade from crawl)',
    price: 17907,
    appliesTo: [],
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
// All markups are 20% for consistency and margin safety
// ============================================================================

const MARKUPS = {
  dealerMarkupPct: 0.20,      // 20% markup on factory cost (home package)
  installerMarkupPct: 0.20,   // 20% markup on sitework (installation)
  developerMarkupPct: 0.05,   // 5% developer markup for community builds
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
  version: `Pricing version: ${LOCAL_PRICING_VERSION}`,
};
