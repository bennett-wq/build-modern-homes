// ============================================================================
// BaseMod Pricing Engine - Public API
// Single entry point for all pricing functionality
// ============================================================================

export {
  // Main calculator
  calcInstalledEstimate,
  getStartingFromPrice,
  formatPriceResult,
  getPricingModeLabel,
  
  // Types
  type CalcPriceInput,
  type CalcPriceResult,
  type LineItem,
  
  // Config exports
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
} from './calcPrice';

// Re-export config helpers
export {
  getModelPricing,
  getAvailableOptions,
  getSidingUpgradePrice,
  hasPricingForBuildType,
} from './pricingConfig';
