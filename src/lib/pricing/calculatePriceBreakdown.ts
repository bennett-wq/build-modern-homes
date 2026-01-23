// ============================================================================
// Canonical Pricing Calculation - SINGLE SOURCE OF TRUTH
// All pricing UI must consume this function's output
// ============================================================================

import {
  PRICING_VERSION,
  MODELS,
  OPTIONS,
  SITE_COSTS,
  FEES,
  MARKUPS,
  type BuildType,
  type FoundationType,
  type PricingMode,
  type ModelConfig,
  getModelConfig,
  getModelPricing,
} from '@/data/pricing/pricingConfig';

// ============================================================================
// TYPES
// ============================================================================

export type ServicePackage = 'home_only' | 'installed';

export interface PriceBreakdownInput {
  modelSlug: string;
  buildType: BuildType;
  foundationType?: FoundationType;
  servicePackage: ServicePackage;
  selectedOptionIds: string[];
  includeSitework?: boolean; // Force include sitework even for home_only (for "show installed" toggle)
  includeFeesAllowance?: boolean; // Default false - optional fee toggle
  includeSiteworkContingency?: boolean; // Default true - include buffer
}

export interface LineItemDetail {
  id: string;
  label: string;
  baseAmount: number;
  retailAmount: number;
  category: 'home' | 'options' | 'sitework' | 'fees' | 'contingency';
}

export interface PriceBreakdown {
  // Service package info
  servicePackage: ServicePackage;
  pricingMode: PricingMode;
  
  // Home package
  home: {
    factoryQuoteTotal: number;
    retailHomeTotal: number;
    modelName: string;
    buildTypeLabel: string;
  };
  
  // Selected options/add-ons
  options: {
    baseTotal: number;
    retailTotal: number;
    items: LineItemDetail[];
  };
  
  // Sitework (only populated if included)
  sitework: {
    baselineTotal: number;
    contingencyBuffer: number;
    baseTotal: number;
    retailTotal: number;
    isIncludedInThisServicePackage: boolean;
    breakdown: {
      crane: number;
      homeSet: number;
      onSitePortion: number;
      buffer: number;
    };
  };
  
  // Fees allowance
  fees: {
    allowanceTotal: number;
    isIncluded: boolean;
    label: string;
  };
  
  // Totals
  totals: {
    homeOnlyTotal: number;
    installedTypicalTotal: number;
    displayedTotal: number;
    lineItems: LineItemDetail[];
  };
  
  // Metadata
  version: string;
  freightPending: boolean;
  modelConfig: ModelConfig | null;
  
  // Disclaimers
  disclaimers: {
    short: string;
    long: string;
    notIncluded: string[];
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HOME_RETAIL_MULTIPLIER = 1 + MARKUPS.dealerMarkupPct; // 1.20
const SITEWORK_RETAIL_MULTIPLIER = 1 + MARKUPS.dealerMarkupPct; // 1.20 (same as home)
const OPTIONS_RETAIL_MULTIPLIER = 1 + MARKUPS.dealerMarkupPct; // 1.20

// ============================================================================
// MAIN CALCULATOR FUNCTION
// ============================================================================

/**
 * Calculate price breakdown - PURE function, deterministic output.
 * This is the ONLY function that should calculate pricing.
 * All UI must consume this output.
 */
export function calculatePriceBreakdown(input: PriceBreakdownInput): PriceBreakdown {
  const {
    modelSlug,
    buildType,
    foundationType = 'slab',
    servicePackage,
    selectedOptionIds = [],
    includeSitework = servicePackage === 'installed',
    includeFeesAllowance = false,
    includeSiteworkContingency = true,
  } = input;

  // Get model config
  const modelConfig = getModelConfig(modelSlug);
  const pricing = modelConfig ? getModelPricing(modelSlug, buildType, foundationType) : null;
  
  // Extract factory quote total
  const factoryQuoteTotal = pricing?.baseHomePrice ?? 0;
  const freightPending = pricing?.freightPending ?? false;
  
  const modelName = modelConfig?.name ?? 'Unknown';
  const buildTypeLabel = buildType === 'xmod' ? 'Factory-Built' : 'Modular';
  
  // Calculate retail home price
  const retailHomeTotal = Math.round(factoryQuoteTotal * HOME_RETAIL_MULTIPLIER);
  
  // Calculate selected options
  const optionItems: LineItemDetail[] = [];
  let optionsBaseTotal = 0;
  
  for (const optionId of selectedOptionIds) {
    const option = OPTIONS.find(o => o.id === optionId);
    if (option) {
      // Verify option applies to this model/build type
      const modelMatch = option.appliesTo.length === 0 || option.appliesTo.includes(modelSlug);
      const buildMatch = option.buildTypes.length === 0 || option.buildTypes.includes(buildType);
      
      if (modelMatch && buildMatch) {
        optionsBaseTotal += option.price;
        optionItems.push({
          id: option.id,
          label: option.label,
          baseAmount: option.price,
          retailAmount: Math.round(option.price * OPTIONS_RETAIL_MULTIPLIER),
          category: 'options',
        });
      }
    }
  }
  
  const optionsRetailTotal = Math.round(optionsBaseTotal * OPTIONS_RETAIL_MULTIPLIER);
  
  // Calculate sitework
  const siteworkBaseline = SITE_COSTS.baseline;
  const siteworkBuffer = includeSiteworkContingency ? SITE_COSTS.buffer : 0;
  const siteworkBaseTotal = siteworkBaseline + siteworkBuffer;
  const siteworkRetailTotal = includeSitework 
    ? Math.round(siteworkBaseTotal * SITEWORK_RETAIL_MULTIPLIER)
    : 0;
  
  // Calculate fees
  const feesAllowanceTotal = includeFeesAllowance 
    ? FEES.utilityAuthorityFees + FEES.permitsSoftCosts
    : 0;
  
  // Calculate totals
  const homeOnlyTotal = retailHomeTotal + optionsRetailTotal + (includeFeesAllowance ? feesAllowanceTotal : 0);
  const installedTypicalTotal = retailHomeTotal + optionsRetailTotal + siteworkRetailTotal + (includeFeesAllowance ? feesAllowanceTotal : 0);
  
  // Displayed total depends on service package
  const displayedTotal = servicePackage === 'home_only' 
    ? homeOnlyTotal 
    : installedTypicalTotal;
  
  // Build line items for display (only non-zero items)
  const lineItems: LineItemDetail[] = [];
  
  // Home package line
  lineItems.push({
    id: 'home-package',
    label: 'BaseMod Home Package',
    baseAmount: factoryQuoteTotal,
    retailAmount: retailHomeTotal,
    category: 'home',
  });
  
  // Options line (if any)
  if (optionsRetailTotal > 0) {
    lineItems.push({
      id: 'selected-addons',
      label: 'Selected Add-ons',
      baseAmount: optionsBaseTotal,
      retailAmount: optionsRetailTotal,
      category: 'options',
    });
  }
  
  // Sitework line (only if included)
  if (includeSitework && siteworkRetailTotal > 0) {
    lineItems.push({
      id: 'sitework-allowance',
      label: 'Typical Sitework Allowance',
      baseAmount: siteworkBaseTotal,
      retailAmount: siteworkRetailTotal,
      category: 'sitework',
    });
  }
  
  // Fees line (only if included)
  if (includeFeesAllowance && feesAllowanceTotal > 0) {
    lineItems.push({
      id: 'fees-allowance',
      label: 'Typical Fees (allowance)',
      baseAmount: feesAllowanceTotal,
      retailAmount: feesAllowanceTotal, // Fees pass through without markup
      category: 'fees',
    });
  }
  
  // Derive pricing mode from service package
  const pricingMode: PricingMode = servicePackage === 'home_only' 
    ? 'supply_only' 
    : 'delivered_installed';
  
  // DEV ASSERTION: Verify line items sum to total
  if (import.meta.env.DEV) {
    const lineItemSum = lineItems.reduce((sum, item) => sum + item.retailAmount, 0);
    if (lineItemSum !== displayedTotal) {
      console.error('[PRICING RECONCILIATION ERROR]', {
        lineItemSum,
        displayedTotal,
        difference: displayedTotal - lineItemSum,
        lineItems,
        input,
      });
    }
  }
  
  return {
    servicePackage,
    pricingMode,
    
    home: {
      factoryQuoteTotal,
      retailHomeTotal,
      modelName,
      buildTypeLabel,
    },
    
    options: {
      baseTotal: optionsBaseTotal,
      retailTotal: optionsRetailTotal,
      items: optionItems,
    },
    
    sitework: {
      baselineTotal: siteworkBaseline,
      contingencyBuffer: siteworkBuffer,
      baseTotal: siteworkBaseTotal,
      retailTotal: siteworkRetailTotal,
      isIncludedInThisServicePackage: includeSitework,
      breakdown: {
        crane: SITE_COSTS.crane,
        homeSet: SITE_COSTS.homeSet,
        onSitePortion: SITE_COSTS.onSitePortionTotal,
        buffer: siteworkBuffer,
      },
    },
    
    fees: {
      allowanceTotal: feesAllowanceTotal,
      isIncluded: includeFeesAllowance,
      label: 'Utility & Permit Allowance',
    },
    
    totals: {
      homeOnlyTotal,
      installedTypicalTotal,
      displayedTotal,
      lineItems,
    },
    
    version: PRICING_VERSION,
    freightPending,
    modelConfig,
    
    disclaimers: {
      short: 'Preliminary estimate. Not a contract or final bid.',
      long: 'Final pricing confirmed in a written quote after site review and jurisdiction review.',
      notIncluded: [
        'Foundation/excavation (not included unless explicitly quoted)',
        'Utility runs/trenching (site-dependent, distance/conditions vary)',
        'Permits, impact fees, civil/engineering, tree tagging (not included unless explicitly quoted)',
        'General contractor/builder overhead & profit (varies by delivery model, confirmed in final quote)',
      ],
    },
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get "Starting from" price for model cards.
 * Uses default buildType, installed mode, no options.
 */
export function getStartingFromPrice(modelSlug: string): PriceBreakdown {
  const model = getModelConfig(modelSlug);
  return calculatePriceBreakdown({
    modelSlug,
    buildType: model?.defaultBuildType || 'xmod',
    foundationType: model?.defaultFoundationType || 'slab',
    servicePackage: 'installed',
    selectedOptionIds: [],
    includeFeesAllowance: false,
    includeSiteworkContingency: true,
  });
}

/**
 * Format price as currency string
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get pricing mode label for display
 */
export function getPricingModeLabel(mode: PricingMode): string {
  switch (mode) {
    case 'supply_only':
      return 'Home Package Estimate';
    case 'delivered_installed':
      return 'Typical Installed Allowance (Preliminary)';
    case 'community_all_in':
      return 'All-in Price (Includes Lot)';
    default:
      return 'Preliminary Estimate';
  }
}

/**
 * Get service package headline for display
 */
export function getServicePackageHeadline(servicePackage: ServicePackage): string {
  return servicePackage === 'home_only'
    ? 'Estimated Home Package Total'
    : 'Typical Installed Allowance (Preliminary)';
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export {
  PRICING_VERSION,
  MODELS,
  OPTIONS,
  SITE_COSTS,
  FEES,
  MARKUPS,
  type BuildType,
  type FoundationType,
  type PricingMode,
  type ModelConfig,
  getModelConfig,
} from '@/data/pricing/pricingConfig';
