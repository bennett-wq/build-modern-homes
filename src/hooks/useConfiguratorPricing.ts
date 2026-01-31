// ============================================================================
// Configurator Pricing Adapter Hook
// Bridges useUnifiedPricingEngine with the existing BuyerPricingDisplay interface
// ============================================================================

import { useMemo, useCallback } from 'react';
import { useUnifiedPricingEngine } from './useUnifiedPricingEngine';
import type { BuildSelection, BuyerFacingBreakdown } from './usePricingEngine';
import type { PricingMode } from '@/data/pricing-layers';
import type { BuyerPricingFlags } from '@/components/pricing/BuyerPricingDisplay';

// ============================================================================
// Types
// ============================================================================

export interface ConfiguratorPricingInput {
  modelSlug: string | null;
  buildType: 'xmod' | 'mod' | null;
  servicePackage: 'delivered_installed' | 'supply_only' | 'community_all_in';
  selectedOptionIds?: string[];
  includeUtilityFees?: boolean;
  includePermitsCosts?: boolean;
  zipCode?: string;
  locationKnown?: boolean | null;
  // Lot integration for community builds
  lotPremium?: number;
  lotNumber?: string;
  developmentName?: string;
}

export interface ConfiguratorPricingOutput {
  // Legacy BuyerFacingBreakdown interface for BuyerPricingDisplay
  breakdown: BuyerFacingBreakdown;
  
  // Flags for display
  flags: BuyerPricingFlags;
  
  // The new unified pricing output
  pricing: {
    hasPricing: boolean;
    freightPending: boolean;
    basementSelectedRequiresQuote: boolean;
    estimateConfidence: 'high' | 'medium' | 'low';
    pricingMode: PricingMode;
    buyerFacingBreakdown: BuyerFacingBreakdown;
  };
  
  // Helpers
  formatPrice: (amount: number) => string;
  
  // Model data
  model: ReturnType<typeof useUnifiedPricingEngine>['models']['getModelBySlug'] extends (slug: string) => infer R ? R : never;
  
  // Loading state
  isLoading: boolean;
}

// ============================================================================
// Labels for BuyerFacingBreakdown compatibility
// ============================================================================

const buyerPackageLabels = {
  homePackage: 'BaseMod Home Package',
  installPackage: 'Typical Sitework Allowance',
  communityPackage: 'Community & Land',
  lotPremium: 'Lot Premium',
  feesPermits: 'Typical Fees (allowance)',
  optionsUpgrades: 'Selected Add-ons',
};

// ============================================================================
// Hook
// ============================================================================

export function useConfiguratorPricing(input: ConfiguratorPricingInput): ConfiguratorPricingOutput {
  const engine = useUnifiedPricingEngine();
  
  // Convert service package to unified engine format
  const unifiedServicePackage = useMemo(() => {
    switch (input.servicePackage) {
      case 'supply_only':
        return 'home_only' as const;
      case 'community_all_in':
      case 'delivered_installed':
      default:
        return 'installed' as const;
    }
  }, [input.servicePackage]);
  
  // Calculate pricing using the unified engine
  const unifiedPricing = useMemo(() => {
    if (!input.modelSlug) {
      // Return empty pricing when no model selected
      return engine.calculatePrice({
        modelSlug: 'hawthorne', // Fallback
        buildType: 'xmod',
        servicePackage: unifiedServicePackage,
        selectedOptionIds: [],
        lotPremium: 0,
      });
    }
    
    // Use selected buildType, or fallback to 'xmod' for preview pricing
    const effectiveBuildType = input.buildType || 'xmod';
    
    return engine.calculatePrice({
      modelSlug: input.modelSlug,
      buildType: effectiveBuildType,
      foundationType: 'crawl',
      servicePackage: unifiedServicePackage,
      selectedOptionIds: input.selectedOptionIds || [],
      includeFeesAllowance: input.includeUtilityFees || input.includePermitsCosts,
      includeSitework: unifiedServicePackage === 'installed',
      includeSiteworkContingency: true,
      lotPremium: input.lotPremium || 0,
      lotNumber: input.lotNumber,
      developmentName: input.developmentName,
    });
  }, [
    engine, 
    input.modelSlug, 
    input.buildType, 
    unifiedServicePackage, 
    input.selectedOptionIds,
    input.includeUtilityFees,
    input.includePermitsCosts,
    input.lotPremium,
    input.lotNumber,
    input.developmentName,
  ]);
  
  // Convert to legacy BuyerFacingBreakdown interface
  const legacyBreakdown: BuyerFacingBreakdown = useMemo(() => {
    return {
      homePackagePrice: unifiedPricing.home.retailHomeTotal,
      installPackagePrice: unifiedPricing.sitework.retailTotal,
      communityAdder: 0, // Legacy field, lot premium is now separate
      lotPremium: unifiedPricing.lot.premium,
      lotNumber: unifiedPricing.lot.lotNumber,
      developmentName: unifiedPricing.lot.developmentName,
      optionsUpgradesTotal: unifiedPricing.options.retailTotal,
      feesPermitsTotal: unifiedPricing.fees.allowanceTotal,
      optionDetails: unifiedPricing.options.items.map(item => ({
        name: item.label,
        price: item.retailAmount,
      })),
      startingFromPrice: unifiedPricing.totals.displayedTotal,
      allInTotal: unifiedPricing.totals.allInTotal,
      labels: buyerPackageLabels,
    };
  }, [unifiedPricing]);
  
  // Determine estimate confidence
  const estimateConfidence = useMemo((): 'high' | 'medium' | 'low' => {
    const hasValidZip = input.zipCode && input.zipCode.length === 5;
    const locationUnknown = input.locationKnown === false || (!hasValidZip && input.locationKnown === null);
    
    if (!input.modelSlug || !input.buildType) return 'low';
    if (locationUnknown) return 'low';
    if (unifiedPricing.freightPending) return 'medium';
    return 'high';
  }, [input.modelSlug, input.buildType, input.zipCode, input.locationKnown, unifiedPricing.freightPending]);
  
  // Map to legacy PricingMode
  const pricingMode: PricingMode = useMemo(() => {
    switch (input.servicePackage) {
      case 'supply_only':
        return 'supply_only';
      case 'community_all_in':
        return 'community_all_in';
      default:
        return 'delivered_installed';
    }
  }, [input.servicePackage]);
  
  // Build pricing flags
  const flags: BuyerPricingFlags = useMemo(() => ({
    freightPending: unifiedPricing.freightPending,
    basementSelectedRequiresQuote: false, // TODO: add basement detection
    estimateConfidence,
    // Show pricing as soon as model is selected (uses fallback buildType for preview)
    hasPricing: Boolean(input.modelSlug && unifiedPricing.home.factoryQuoteTotal > 0),
    pricingMode,
  }), [unifiedPricing, estimateConfidence, input.modelSlug, pricingMode]);
  
  // Get model from engine
  const model = useMemo(() => {
    if (!input.modelSlug) return undefined;
    return engine.models.getModelBySlug(input.modelSlug);
  }, [engine.models, input.modelSlug]);
  
  // Build legacy pricing output for components that expect it
  const pricing = useMemo(() => ({
    hasPricing: flags.hasPricing,
    freightPending: unifiedPricing.freightPending,
    basementSelectedRequiresQuote: false,
    estimateConfidence,
    pricingMode,
    buyerFacingBreakdown: legacyBreakdown,
  }), [flags.hasPricing, unifiedPricing.freightPending, estimateConfidence, pricingMode, legacyBreakdown]);
  
  return {
    breakdown: legacyBreakdown,
    flags,
    pricing,
    formatPrice: engine.formatPrice,
    model,
    isLoading: engine.isLoading,
  };
}

export default useConfiguratorPricing;
