// ============================================================================
// BaseMod Price Calculator - Pure, Deterministic Calculation
// Uses canonical config from pricingConfig.ts
// ============================================================================

import {
  PRICING_VERSION,
  MODELS,
  OPTIONS,
  SITE_COSTS,
  FEES,
  MARKUPS,
  PRICING_MODES,
  DISCLAIMERS,
  type BuildType,
  type FoundationType,
  type PricingMode,
  type ModelConfig,
  type ModelPricingEntry,
  type UpgradeOption,
  getModelConfig,
  getModelPricing,
  getSidingUpgradePrice,
} from './pricingConfig';

// ============================================================================
// INPUT/OUTPUT TYPES
// ============================================================================

export interface CalcPriceInput {
  modelSlug: string;
  buildType: BuildType;
  foundationType: FoundationType;
  selectedOptionIds: string[];
  selectedPackageId?: string | null;
  selectedGarageDoorId?: string | null;
  developmentSlug?: string | null;
  pricingMode?: PricingMode;
  includeFees?: boolean;
}

export interface LineItem {
  id: string;
  label: string;
  amount: number;
  category: 'base' | 'delivery' | 'site' | 'options' | 'fees' | 'buffer';
}

export interface CalcPriceResult {
  /** Total buyer-facing price (null if config missing) */
  total: number | null;
  /** Detailed line items for breakdown display */
  lineItems: LineItem[];
  /** Pricing version string */
  version: string;
  /** User-facing disclaimer text */
  disclaimer: string;
  /** Whether freight cost is pending/unconfirmed */
  freightPending: boolean;
  /** Estimate confidence level */
  confidence: 'high' | 'medium' | 'low';
  /** Human-readable message if pricing is unavailable */
  message?: string;
  /** Pricing mode used */
  pricingMode: PricingMode;
  /** Model config if found */
  modelConfig?: ModelConfig;
  /** Raw internal cost (before markups) */
  internalCost: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function applyMarkup(amount: number, markupPct: number): number {
  return Math.round(amount * (1 + markupPct));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================================================
// MAIN CALCULATOR FUNCTION
// ============================================================================

/**
 * Calculate installed estimate for a home configuration.
 * This is a PURE function - same inputs always produce same outputs.
 * 
 * @param input - Configuration selections
 * @returns CalcPriceResult with total, line items, and metadata
 */
export function calcInstalledEstimate(input: CalcPriceInput): CalcPriceResult {
  const {
    modelSlug,
    buildType,
    foundationType,
    selectedOptionIds = [],
    pricingMode = 'delivered_installed',
    includeFees = true,
  } = input;

  const lineItems: LineItem[] = [];
  let freightPending = false;
  let confidence: 'high' | 'medium' | 'low' = 'high';

  // 1. Get model configuration
  const modelConfig = getModelConfig(modelSlug);
  if (!modelConfig) {
    // DEV-only warning
    if (import.meta.env.DEV) {
      console.warn(`[calcPrice] Model not found in pricing config: ${modelSlug}`);
    }
    return {
      total: null,
      lineItems: [],
      version: PRICING_VERSION,
      disclaimer: DISCLAIMERS.estimate,
      freightPending: false,
      confidence: 'low',
      message: `Pricing not available for model "${modelSlug}". Please contact us for a quote.`,
      pricingMode,
      internalCost: 0,
    };
  }

  // 2. Get pricing for this build/foundation combo
  const pricing = getModelPricing(modelSlug, buildType, foundationType);
  if (!pricing) {
    // DEV-only warning
    if (import.meta.env.DEV) {
      console.warn(
        `[calcPrice] No pricing for ${modelSlug} with ${buildType}/${foundationType}`
      );
    }
    return {
      total: null,
      lineItems: [],
      version: PRICING_VERSION,
      disclaimer: DISCLAIMERS.estimate,
      freightPending: false,
      confidence: 'low',
      message: `Pricing not available for ${modelConfig.name} with ${buildType === 'xmod' ? 'Factory-Built' : 'Modular'} build type and ${foundationType} foundation. Please contact us.`,
      pricingMode,
      modelConfig,
      internalCost: 0,
    };
  }

  // Track freight pending status
  freightPending = pricing.freightPending ?? false;
  if (freightPending) {
    confidence = 'medium';
  }

  // 3. Calculate internal costs (before markups)
  
  // Base home price
  const baseHomeInternal = pricing.baseHomePrice;
  lineItems.push({
    id: 'base-home',
    label: `${modelConfig.name} Home (${buildType === 'xmod' ? 'Factory-Built' : 'Modular'})`,
    amount: 0, // Will be set after markup
    category: 'base',
  });

  // Delivery & installation
  const deliveryInternal = pricing.deliveryInstallAllowance;
  lineItems.push({
    id: 'delivery-install',
    label: 'Delivery & Installation',
    amount: 0, // Will be set after markup
    category: 'delivery',
  });

  // Site costs
  const siteInternal = SITE_COSTS.baseline;
  lineItems.push({
    id: 'site-baseline',
    label: 'Site Work Baseline',
    amount: 0,
    category: 'site',
  });

  // Buffer
  const bufferInternal = SITE_COSTS.buffer;
  lineItems.push({
    id: 'contingency-buffer',
    label: 'Contingency Buffer',
    amount: bufferInternal,
    category: 'buffer',
  });

  // 4. Calculate selected options
  let optionsInternalTotal = 0;
  const selectedOptions: UpgradeOption[] = [];
  
  for (const optionId of selectedOptionIds) {
    const option = OPTIONS.find((o) => o.id === optionId);
    if (option) {
      // Verify option applies to this model/build type
      const modelMatch = option.appliesTo.length === 0 || option.appliesTo.includes(modelSlug);
      const buildMatch = option.buildTypes.length === 0 || option.buildTypes.includes(buildType);
      
      if (modelMatch && buildMatch) {
        selectedOptions.push(option);
        optionsInternalTotal += option.price;
        lineItems.push({
          id: `option-${option.id}`,
          label: option.label,
          amount: 0, // Will be set after markup
          category: 'options',
        });
      }
    }
  }

  // 5. Apply markups based on pricing mode
  const modeConfig = PRICING_MODES[pricingMode];
  
  // Factory costs (base + options) get dealer markup
  const factoryInternal = baseHomeInternal + optionsInternalTotal;
  const factoryRetail = modeConfig.appliesDealer
    ? applyMarkup(factoryInternal, MARKUPS.dealerMarkupPct)
    : factoryInternal;

  // Update base home line item with retail price
  const baseRetail = modeConfig.appliesDealer
    ? applyMarkup(baseHomeInternal, MARKUPS.dealerMarkupPct)
    : baseHomeInternal;
  lineItems[0].amount = baseRetail;

  // Update options with retail prices
  let optionLineIndex = 4; // After base, delivery, site, buffer
  for (const option of selectedOptions) {
    const optionRetail = modeConfig.appliesDealer
      ? applyMarkup(option.price, MARKUPS.dealerMarkupPct)
      : option.price;
    if (lineItems[optionLineIndex]) {
      lineItems[optionLineIndex].amount = optionRetail;
    }
    optionLineIndex++;
  }

  // Sitework gets installer markup (only for installed modes)
  const siteworkInternal = siteInternal + deliveryInternal;
  let siteworkRetail = 0;
  if (modeConfig.appliesInstaller) {
    siteworkRetail = applyMarkup(siteworkInternal, MARKUPS.installerMarkupPct);
    lineItems[1].amount = applyMarkup(deliveryInternal, MARKUPS.installerMarkupPct);
    lineItems[2].amount = applyMarkup(siteInternal, MARKUPS.installerMarkupPct);
  } else {
    // Supply only - no install package
    lineItems[1].amount = 0;
    lineItems[2].amount = 0;
  }

  // Fees (pass through without markup)
  let feesTotal = 0;
  if (includeFees) {
    feesTotal = FEES.utilityAuthorityFees + FEES.permitsSoftCosts;
    lineItems.push({
      id: 'fees-permits',
      label: 'Fees & Permits',
      amount: feesTotal,
      category: 'fees',
    });
  }

  // Developer markup for community builds
  const subtotal = factoryRetail + siteworkRetail + bufferInternal;
  let developerAdder = 0;
  if (modeConfig.appliesDeveloper) {
    developerAdder = Math.round(subtotal * MARKUPS.developerMarkupPct);
  }

  // 6. Calculate totals
  const internalCost = factoryInternal + siteworkInternal + bufferInternal;
  const total = factoryRetail + siteworkRetail + bufferInternal + feesTotal + developerAdder;

  // Filter out zero-amount line items for cleaner display
  const displayLineItems = lineItems.filter((item) => item.amount > 0);

  return {
    total,
    lineItems: displayLineItems,
    version: PRICING_VERSION,
    disclaimer: DISCLAIMERS.estimate,
    freightPending,
    confidence,
    pricingMode,
    modelConfig,
    internalCost,
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get a quick "starting from" price for model cards.
 * Uses default buildType, slab foundation, no options, delivered_installed mode.
 */
export function getStartingFromPrice(modelSlug: string): CalcPriceResult {
  const model = getModelConfig(modelSlug);
  return calcInstalledEstimate({
    modelSlug,
    buildType: model?.defaultBuildType || 'xmod',
    foundationType: model?.defaultFoundationType || 'slab',
    selectedOptionIds: [],
    pricingMode: 'delivered_installed',
    includeFees: false, // Starting price excludes optional fees
  });
}

/**
 * Format price result for display.
 * Returns "Contact for pricing" if total is null.
 */
export function formatPriceResult(result: CalcPriceResult): string {
  if (result.total === null) {
    return 'Contact for pricing';
  }
  return formatCurrency(result.total);
}

/**
 * Get pricing mode display label.
 */
export function getPricingModeLabel(mode: PricingMode): string {
  const labels: Record<PricingMode, string> = {
    supply_only: 'Home Package Only',
    delivered_installed: 'Delivered & Installed Estimate',
    community_all_in: 'All-in Price (Includes Lot)',
  };
  return labels[mode];
}

/**
 * Re-export types and constants for convenience.
 */
export {
  PRICING_VERSION,
  MODELS,
  OPTIONS,
  SITE_COSTS,
  FEES,
  MARKUPS,
  PRICING_MODES,
  DISCLAIMERS,
  type BuildType,
  type FoundationType,
  type PricingMode,
  type ModelConfig,
  getModelConfig,
};
