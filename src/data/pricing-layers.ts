// ============================================================================
// BaseMod Pricing Layers - Markup Configuration for Retail Pricing
// Defines markup percentages and pricing modes for buyer-facing prices
// ============================================================================

/**
 * Pricing modes determine which layers of markup apply:
 * - supply_only: Factory home only (dealer markup)
 * - delivered_installed: Factory home + install (dealer + installer markup)
 * - community_all_in: Full turnkey in BaseMod community (dealer + installer + developer markup)
 */
export type PricingMode = 'supply_only' | 'delivered_installed' | 'community_all_in';

export interface MarkupConfig {
  /** Dealer markup on factory cost (default 20%) */
  dealerMarkupPct: number;
  /** Installer markup on sitework cost (default 8%, editable) */
  installerMarkupPct: number;
  /** Developer markup for community all-in builds (default 5%) */
  developerMarkupPct: number;
}

export interface PricingLayerConfig {
  defaults: MarkupConfig;
  modes: {
    [key in PricingMode]: {
      name: string;
      description: string;
      appliesDealer: boolean;
      appliesInstaller: boolean;
      appliesDeveloper: boolean;
    };
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const pricingLayerConfig: PricingLayerConfig = {
  defaults: {
    dealerMarkupPct: 0.20,      // 20% dealer markup on factory cost
    installerMarkupPct: 0.08,   // 8% installer markup on sitework (editable)
    developerMarkupPct: 0.05,   // 5% developer markup for community builds
  },
  modes: {
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
  },
};

// ============================================================================
// BUYER-FACING PACKAGE LABELS
// These labels are what buyers see - no mention of markup or cost-plus
// ============================================================================

export const buyerPackageLabels = {
  homePackage: 'BaseMod Home Package',
  installPackage: 'Professional Installation',
  communityPackage: 'Community & Land',
  feesPermits: 'Fees & Permits',
  optionsUpgrades: 'Options & Upgrades',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Apply markup percentage to a base amount
 */
export function applyMarkup(baseAmount: number, markupPct: number): number {
  return Math.round(baseAmount * (1 + markupPct));
}

/**
 * Get the markup amount (not the total)
 */
export function getMarkupAmount(baseAmount: number, markupPct: number): number {
  return Math.round(baseAmount * markupPct);
}

/**
 * Get default markup config
 */
export function getDefaultMarkups(): MarkupConfig {
  return { ...pricingLayerConfig.defaults };
}

/**
 * Get pricing mode configuration
 */
export function getPricingModeConfig(mode: PricingMode) {
  return pricingLayerConfig.modes[mode];
}

/**
 * Calculate buyer-facing price from internal cost
 */
export function calculateBuyerPrice(
  factoryCost: number,
  siteworkCost: number,
  optionalFees: number,
  mode: PricingMode,
  markups: MarkupConfig = pricingLayerConfig.defaults
): {
  homePackagePrice: number;
  installPackagePrice: number;
  communityAdder: number;
  feesTotal: number;
  grandTotal: number;
} {
  const modeConfig = pricingLayerConfig.modes[mode];
  
  // Home package = factory cost + dealer markup
  const homePackagePrice = modeConfig.appliesDealer 
    ? applyMarkup(factoryCost, markups.dealerMarkupPct)
    : factoryCost;
  
  // Install package = sitework + installer markup
  const installPackagePrice = modeConfig.appliesInstaller
    ? applyMarkup(siteworkCost, markups.installerMarkupPct)
    : 0;
  
  // Community adder = (home + install) * developer markup
  const subtotalBeforeDeveloper = homePackagePrice + installPackagePrice;
  const communityAdder = modeConfig.appliesDeveloper
    ? getMarkupAmount(subtotalBeforeDeveloper, markups.developerMarkupPct)
    : 0;
  
  // Fees pass through without markup
  const feesTotal = optionalFees;
  
  const grandTotal = homePackagePrice + installPackagePrice + communityAdder + feesTotal;
  
  return {
    homePackagePrice,
    installPackagePrice,
    communityAdder,
    feesTotal,
    grandTotal,
  };
}
