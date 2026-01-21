// ============================================================================
// BaseMod Pricing Configuration - Config-Driven Architecture
// All pricing data, model specs, options, and fees in one canonical source
// ============================================================================

export type BuildType = 'xmod' | 'mod';

export interface ModelPricing {
  base_cost: number;
  options_adjustment: number;
  freight: number;
  mhi_dues: number;
  factory_quote_total: number;
  freightPending?: boolean; // True if freight cost is not yet confirmed
}

export interface FloorPlanOption {
  id: string;
  name: string;
  description: string;
  price: number;
  buildTypes?: BuildType[]; // If undefined, applies to all
  available: boolean;
}

export interface ModelConfig {
  slug: string;
  name: string;
  beds: number;
  baths: number;
  sqft: number;
  length: number; // Used for length-based pricing
  buildTypes: BuildType[];
  pricing: Partial<Record<BuildType, ModelPricing>>;
  pricingSource?: string; // e.g. "Keeneland Pricing"
  floorPlanOptions: FloorPlanOption[];
  heroImage?: string;
  floorPlanPdf?: string;
}

export interface SidingColor {
  id: string;
  name: string;
  hex: string;
  isUpgrade: boolean;
}

export interface ShingleColor {
  id: string;
  name: string;
  hex: string;
}

export interface DoorStyle {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface ExteriorOption {
  id: string;
  name: string;
  description: string;
  price: number;
  perUnit?: boolean; // If true, uses quantity selector
  maxQuantity?: number;
}

export interface ExteriorConfig {
  sidingColors: SidingColor[];
  shingleColors: ShingleColor[];
  doorStyles: DoorStyle[];
  options: ExteriorOption[];
  plygem_upgrade_pricing: {
    under_55: number;
    '55_to_64': number;
    over_64: number;
  };
}

export interface SiteworkConfig {
  crane: number;
  home_set: number;
  delivery_setup_total: number;
  on_site_portion_total: number;
  basemod_sitework_total: number;
}

export interface FeeConfig {
  utility_authority_fees: number;
  permits_soft_costs: number;
}

export interface ZoneConfig {
  id: string;
  name: string;
  sitework: SiteworkConfig;
  fees: FeeConfig;
}

// ============================================================================
// MODEL CONFIGURATIONS
// ============================================================================

export const models: ModelConfig[] = [
  {
    slug: 'hawthorne',
    name: 'Hawthorne',
    beds: 3,
    baths: 2,
    sqft: 1620,
    length: 64,
    buildTypes: ['xmod', 'mod'],
    heroImage: '/images/models/hawthorne/hero.webp',
    floorPlanPdf: '/floorplans/hawthorne/hawthorne-floorplan.pdf',
    pricing: {
      xmod: {
        base_cost: 94200,
        options_adjustment: -1902,
        freight: 4754,
        mhi_dues: 35,
        factory_quote_total: 97087,
      },
      mod: {
        base_cost: 100700,
        options_adjustment: -1857,
        freight: 5312,
        mhi_dues: 35,
        factory_quote_total: 104190,
      },
    },
    floorPlanOptions: [
      {
        id: 'office-replaces-bedroom',
        name: 'Office replaces bedroom',
        description: 'Convert one bedroom into a dedicated home office',
        price: 1500,
        available: true,
      },
      {
        id: 'add-half-bath',
        name: 'Add 1/2 bath',
        description: 'Add a convenient half bathroom',
        price: 1000,
        available: true,
      },
      {
        id: '9ft-walls',
        name: "9' walls",
        description: 'Upgrade to 9-foot ceilings for a more spacious feel',
        price: 11050,
        buildTypes: ['mod'],
        available: true,
      },
    ],
  },
  {
    slug: 'aspen',
    name: 'Aspen',
    beds: 4,
    baths: 2,
    sqft: 1620,
    length: 64,
    buildTypes: ['xmod', 'mod'],
    heroImage: '/images/models/aspen/hero.webp',
    floorPlanPdf: '/floorplans/aspen/aspen-floorplan.pdf',
    pricing: {
      xmod: {
        base_cost: 94575,
        options_adjustment: -1760,
        freight: 5396,
        mhi_dues: 35,
        factory_quote_total: 98246,
      },
      mod: {
        base_cost: 103650,
        options_adjustment: -2033,
        freight: 6841,
        mhi_dues: 35,
        factory_quote_total: 108493,
      },
    },
    floorPlanOptions: [
      {
        id: 'add-half-bath',
        name: 'Add 1/2 bath',
        description: 'Add a convenient half bathroom',
        price: 1000,
        available: true,
      },
    ],
  },
  {
    slug: 'belmont',
    name: 'Belmont',
    beds: 3,
    baths: 2,
    sqft: 1620,
    length: 64,
    buildTypes: ['xmod', 'mod'],
    heroImage: '/images/models/belmont/hero.webp',
    floorPlanPdf: '/floorplans/belmont/belmont-floorplan.pdf',
    pricing: {
      xmod: {
        base_cost: 93425,
        options_adjustment: -1674,
        freight: 5396,
        mhi_dues: 35,
        factory_quote_total: 97182,
      },
      mod: {
        base_cost: 102500,
        options_adjustment: -1947,
        freight: 6841,
        mhi_dues: 35,
        factory_quote_total: 107429,
      },
    },
    floorPlanOptions: [
      {
        id: 'third-bathroom',
        name: '3rd Bathroom',
        description: 'Not available on this model',
        price: 0,
        available: false,
      },
    ],
  },
  {
    slug: 'laurel',
    name: 'Laurel',
    beds: 3,
    baths: 2,
    sqft: 1065,
    length: 48,
    buildTypes: ['xmod', 'mod'],
    heroImage: '/images/models/laurel/hero-no-garage.webp',
    floorPlanPdf: '/floorplans/laurel/laurel-floorplan.pdf',
    pricing: {
      xmod: {
        base_cost: 80500,
        options_adjustment: 0,
        freight: 0,
        mhi_dues: 35,
        factory_quote_total: 80535,
        freightPending: true,
      },
      mod: {
        base_cost: 87500,
        options_adjustment: 0,
        freight: 0,
        mhi_dues: 35,
        factory_quote_total: 87535,
        freightPending: true,
      },
    },
    pricingSource: 'Ballpark estimate - freight pending',
    floorPlanOptions: [
      {
        id: '9ft-walls',
        name: "9' walls",
        description: 'Upgrade to 9-foot ceilings for a more spacious feel',
        price: 11000,
        buildTypes: ['mod'],
        available: true,
      },
      {
        id: 'garage-two-door',
        name: 'Two-Car Garage (Two Doors)',
        description: 'Site-built attached garage with two separate doors',
        price: 0, // Pricing handled separately
        available: true,
      },
      {
        id: 'garage-single-door',
        name: 'Two-Car Garage (Single Door)',
        description: 'Site-built attached garage with one large modern door',
        price: 0, // Pricing handled separately
        available: true,
      },
    ],
  },
  {
    slug: 'keeneland',
    name: 'Keeneland',
    beds: 3,
    baths: 2,
    sqft: 1800,
    length: 58,
    buildTypes: ['xmod'],
    heroImage: '/images/models/keeneland/hero.webp',
    floorPlanPdf: '/floorplans/keeneland/keeneland-floorplan.pdf',
    pricing: {
      xmod: {
        base_cost: 99737,
        options_adjustment: 1715,
        freight: 4740,
        mhi_dues: 35,
        factory_quote_total: 106227,
      },
    },
    pricingSource: 'Keeneland Pricing',
    floorPlanOptions: [],
  },
  {
    slug: 'cypress',
    name: 'Cypress',
    beds: 2,
    baths: 2,
    sqft: 990,
    length: 66, // 16' x 66' box
    buildTypes: ['xmod'],
    heroImage: '/images/models/cypress/hero-v2.webp',
    floorPlanPdf: '/floorplans/cypress/cypress-floorplan.pdf',
    pricing: {
      xmod: {
        base_cost: 56362,
        options_adjustment: 0,
        freight: 0,
        mhi_dues: 35,
        factory_quote_total: 56397,
        freightPending: true,
      },
    },
    pricingSource: 'BaseMod Home Package (factory)',
    floorPlanOptions: [
      {
        id: 'flex-room-office',
        name: 'Flex room as Office',
        description: 'Label the flex room as a dedicated home office',
        price: 0,
        available: true,
      },
    ],
  },
];

// ============================================================================
// EXTERIOR CONFIGURATION
// ============================================================================

export const exteriorConfig: ExteriorConfig = {
  sidingColors: [
    // Standard colors (no upcharge)
    { id: 'blue', name: 'Blue', hex: '#4A6FA5', isUpgrade: false },
    { id: 'cypress', name: 'Cypress', hex: '#7B8B6F', isUpgrade: false },
    { id: 'flint', name: 'Flint', hex: '#6B6B6B', isUpgrade: false },
    { id: 'mist', name: 'Mist', hex: '#C8D4D8', isUpgrade: false },
    { id: 'white', name: 'White', hex: '#F5F5F5', isUpgrade: false },
    // Upgrade colors (PlyGem siding upgrade applies)
    { id: 'brunswick', name: 'Brunswick', hex: '#2C3E2D', isUpgrade: true },
    { id: 'shadow', name: 'Shadow', hex: '#3D3D3D', isUpgrade: true },
    { id: 'pewter', name: 'Pewter', hex: '#8B8B7A', isUpgrade: true },
    { id: 'sagebrook', name: 'Sagebrook', hex: '#A4B494', isUpgrade: true },
  ],
  shingleColors: [
    { id: 'charcoal', name: 'Charcoal', hex: '#36454F' },
    { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355' },
  ],
  doorStyles: [
    {
      id: 'craftsman-3-lite',
      name: 'Craftsman 3-lite (White)',
      description: 'Classic craftsman style with 3 glass panels',
      price: 0,
    },
    {
      id: 'prairie',
      name: 'Prairie (White)',
      description: 'Clean prairie-style door design',
      price: 50,
    },
    {
      id: 'full-glass-blinds',
      name: 'Full Glass w/ Integrated Blinds',
      description: 'Modern full glass with built-in privacy blinds',
      price: 300,
    },
  ],
  options: [
    {
      id: 'black-fascia-package',
      name: 'Black Fascia + Drip Edge + Soffit',
      description: 'Premium black exterior trim package',
      price: 525,
    },
    {
      id: 'black-exterior-door',
      name: 'Black Exterior Door (in place of white)',
      description: 'Upgrade Craftsman/Prairie doors to black finish',
      price: 280,
      perUnit: true,
      maxQuantity: 4,
    },
    {
      id: 'storm-door',
      name: 'Storm Door (White, shipped loose)',
      description: 'Additional storm door for entry protection',
      price: 230,
      perUnit: true,
      maxQuantity: 3,
    },
  ],
  plygem_upgrade_pricing: {
    under_55: 1205,
    '55_to_64': 1355,
    over_64: 1505,
  },
};

// ============================================================================
// ZONE CONFIGURATIONS (Sitework & Fees)
// ============================================================================

export const zones: ZoneConfig[] = [
  {
    id: 'zone-3',
    name: 'Regional Baseline (Zone 3)',
    sitework: {
      crane: 8750,
      home_set: 13750,
      delivery_setup_total: 22500,
      on_site_portion_total: 64267.11,
      basemod_sitework_total: 86767.11,
    },
    fees: {
      utility_authority_fees: 7546,
      permits_soft_costs: 2085,
    },
  },
];

// ============================================================================
// BUILD INTENT OPTIONS
// ============================================================================

export type BuildIntent = 'my-land' | 'find-land' | 'basemod-community';

export const buildIntentOptions: { id: BuildIntent; name: string; description: string; icon: string }[] = [
  {
    id: 'my-land',
    name: 'Build on My Land',
    description: "You have land or you're buying land - we'll help you build there",
    icon: 'map-pin',
  },
  {
    id: 'find-land',
    name: 'Find Land to Build',
    description: "We'll help you find the perfect lot for your new home",
    icon: 'search',
  },
  {
    id: 'basemod-community',
    name: 'Build in a BaseMod Community',
    description: 'Choose from our curated development communities',
    icon: 'building-2',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getModelBySlug(slug: string): ModelConfig | undefined {
  return models.find((m) => m.slug === slug);
}

export function getZoneById(id: string): ZoneConfig | undefined {
  return zones.find((z) => z.id === id);
}

export function getDefaultZone(): ZoneConfig {
  return zones[0];
}

export function hasFactoryPricing(model: ModelConfig, buildType: BuildType): boolean {
  const pricing = model.pricing[buildType];
  return !!pricing && pricing.factory_quote_total > 0;
}

export function getPlygremUpgradePrice(length: number): number {
  if (length < 55) return exteriorConfig.plygem_upgrade_pricing.under_55;
  if (length <= 64) return exteriorConfig.plygem_upgrade_pricing['55_to_64'];
  return exteriorConfig.plygem_upgrade_pricing.over_64;
}

export function getAvailableFloorPlanOptions(
  model: ModelConfig,
  buildType: BuildType
): FloorPlanOption[] {
  return model.floorPlanOptions.filter((option) => {
    if (!option.available) return true; // Show unavailable options (greyed out)
    if (!option.buildTypes) return true;
    return option.buildTypes.includes(buildType);
  });
}
