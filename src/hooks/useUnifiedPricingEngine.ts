// ============================================================================
// Unified Pricing Engine Hook
// Single source of truth for all pricing calculations
// Reads from relational database via React Query hooks
// ============================================================================

import { useMemo } from 'react';
import { useModels, type UseModelsResult } from './useModels';
import { usePricingZones, type SiteworkCosts } from './usePricingZones';
import { usePricingMarkups, type MarkupConfig, type MarkupMultipliers } from './usePricingMarkups';
import { useUpgradeOptions, type UseUpgradeOptionsResult } from './useUpgradeOptions';
import type { Model, ModelPricingRow, BuildType, UpgradeOption } from '@/types/database';

// ============================================================================
// Types
// ============================================================================

export type PricingMode = 'supply_only' | 'delivered_installed' | 'community_all_in';
export type ServicePackage = 'home_only' | 'installed';
export type FoundationType = 'slab' | 'basement' | 'crawl';

export interface UnifiedPriceInput {
  modelSlug: string;
  buildType: BuildType;
  foundationType?: FoundationType;
  servicePackage: ServicePackage;
  selectedOptionIds: string[];
  includeSitework?: boolean;
  includeFeesAllowance?: boolean;
  includeSiteworkContingency?: boolean;
  zoneSlug?: string; // Optional zone override
  // Lot integration for community_all_in mode
  lotPremium?: number; // Lot premium from lots table
  lotNumber?: string; // Lot label for display
  developmentName?: string; // Development name for display
}

export interface LineItemDetail {
  id: string;
  label: string;
  baseAmount: number;
  retailAmount: number;
  category: 'home' | 'options' | 'sitework' | 'fees' | 'contingency' | 'lot';
}

export interface UnifiedPriceBreakdown {
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
  
  // Sitework
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
  
  // Lot premium (community builds only)
  lot: {
    premium: number;
    lotNumber: string | null;
    developmentName: string | null;
    isIncluded: boolean;
  };
  
  // Totals
  totals: {
    homeOnlyTotal: number;
    installedTypicalTotal: number;
    allInTotal: number; // Includes lot premium for community builds
    displayedTotal: number;
    lineItems: LineItemDetail[];
  };
  
  // Metadata
  version: string;
  freightPending: boolean;
  modelConfig: Model | null;
  
  // Audit trail
  pricingSource?: string;
  quoteNumber?: string;
  quoteDate?: string;
  
  // Disclaimers
  disclaimers: {
    short: string;
    long: string;
    notIncluded: string[];
  };
}

// ============================================================================
// Main Hook
// ============================================================================

export interface UseUnifiedPricingEngineResult {
  // Data loading state
  isLoading: boolean;
  error: Error | null;
  
  // Core data hooks
  models: UseModelsResult;
  upgradeOptions: UseUpgradeOptionsResult;
  
  // Pricing calculation
  calculatePrice: (input: UnifiedPriceInput) => UnifiedPriceBreakdown;
  getStartingFromPrice: (modelSlug: string) => UnifiedPriceBreakdown;
  
  // Helpers
  getMarkupConfig: () => MarkupConfig;
  getMultipliers: () => MarkupMultipliers;
  getSiteworkCosts: (zoneSlug?: string) => SiteworkCosts;
  
  // Format helpers
  formatPrice: (amount: number) => string;
  getPricingModeLabel: (mode: PricingMode) => string;
}

export function useUnifiedPricingEngine(): UseUnifiedPricingEngineResult {
  // Load all data from database
  const models = useModels();
  const zones = usePricingZones();
  const markups = usePricingMarkups();
  const upgradeOptions = useUpgradeOptions();
  
  const isLoading = models.isLoading || zones.isLoading || markups.isLoading || upgradeOptions.isLoading;
  const error = models.error || zones.error || markups.error || upgradeOptions.error;
  
  // Memoized calculation function
  const calculatePrice = useMemo(() => {
    return (input: UnifiedPriceInput): UnifiedPriceBreakdown => {
      const {
        modelSlug,
        buildType,
        foundationType = 'crawl',
        servicePackage,
        selectedOptionIds = [],
        includeSitework = servicePackage === 'installed',
        includeFeesAllowance = false,
        includeSiteworkContingency = true,
        zoneSlug,
        lotPremium = 0,
        lotNumber = null,
        developmentName = null,
      } = input;
      
      // Get model and pricing from database
      const model = models.getModelBySlug(modelSlug);
      const pricing = model?.pricing?.[buildType];
      
      // Get sitework costs from database
      const sitework = zones.getSiteworkCosts(zoneSlug);
      
      // Get markup multipliers from database
      const multipliers = markups.getMultipliers();
      
      // Extract factory quote total from database
      const factoryQuoteTotal = pricing?.base_home_price ?? 0;
      // freight_pending is only available in full ModelPricingRow (admin access)
      const freightPending = (pricing && 'freight_pending' in pricing) ? pricing.freight_pending : false;
      
      const modelName = model?.name ?? 'Unknown';
      const buildTypeLabel = buildType === 'xmod' ? 'Factory-Built' : 'Modular';
      
      // Calculate retail home price
      const retailHomeTotal = Math.round(factoryQuoteTotal * multipliers.home);
      
      // Calculate selected options
      const optionItems: LineItemDetail[] = [];
      let optionsBaseTotal = 0;
      
      for (const optionId of selectedOptionIds) {
        const option = upgradeOptions.getOptionById(optionId) || upgradeOptions.getOptionBySlug(optionId);
        if (option) {
          // Verify option applies to this model/build type
          const modelMatch = !option.applies_to_models || 
            option.applies_to_models.length === 0 || 
            option.applies_to_models.includes(model?.id || modelSlug);
          const buildMatch = !option.applies_to_build_types || 
            option.applies_to_build_types.length === 0 || 
            option.applies_to_build_types.includes(buildType);
          
          if (modelMatch && buildMatch) {
            optionsBaseTotal += option.base_price;
            optionItems.push({
              id: option.id,
              label: option.label,
              baseAmount: option.base_price,
              retailAmount: Math.round(option.base_price * multipliers.options),
              category: 'options',
            });
          }
        }
      }
      
      const optionsRetailTotal = Math.round(optionsBaseTotal * multipliers.options);
      
      // Calculate sitework
      const siteworkBaseline = sitework.baseline;
      const siteworkBuffer = includeSiteworkContingency ? sitework.buffer : 0;
      const siteworkBaseTotal = siteworkBaseline + siteworkBuffer;
      const siteworkRetailTotal = includeSitework 
        ? Math.round(siteworkBaseTotal * multipliers.sitework)
        : 0;
      
      // Calculate fees
      const feesAllowanceTotal = includeFeesAllowance 
        ? sitework.feesTotal
        : 0;
      
      // Determine if lot is included (community_all_in mode)
      const hasLotPremium = lotPremium > 0;
      
      // Calculate totals
      const homeOnlyTotal = retailHomeTotal + optionsRetailTotal + (includeFeesAllowance ? feesAllowanceTotal : 0);
      const installedTypicalTotal = retailHomeTotal + optionsRetailTotal + siteworkRetailTotal + (includeFeesAllowance ? feesAllowanceTotal : 0);
      const allInTotal = installedTypicalTotal + lotPremium;
      
      // Displayed total depends on service package and lot selection
      let displayedTotal: number;
      if (servicePackage === 'home_only') {
        displayedTotal = homeOnlyTotal;
      } else if (hasLotPremium) {
        displayedTotal = allInTotal;
      } else {
        displayedTotal = installedTypicalTotal;
      }
      
      // Build line items for display
      const lineItems: LineItemDetail[] = [];
      
      // Lot premium line (first if included for community builds)
      if (hasLotPremium) {
        lineItems.push({
          id: 'lot-premium',
          label: lotNumber ? `Lot ${lotNumber}` : 'Lot Premium',
          baseAmount: lotPremium,
          retailAmount: lotPremium, // Lot premium passes through without markup
          category: 'lot',
        });
      }
      
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
      
      // Derive pricing mode from service package and lot selection
      let pricingMode: PricingMode;
      if (servicePackage === 'home_only') {
        pricingMode = 'supply_only';
      } else if (hasLotPremium) {
        pricingMode = 'community_all_in';
      } else {
        pricingMode = 'delivered_installed';
      }
      
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
            crane: sitework.crane,
            homeSet: sitework.homeSet,
            onSitePortion: sitework.onSitePortion,
            buffer: siteworkBuffer,
          },
        },
        
        fees: {
          allowanceTotal: feesAllowanceTotal,
          isIncluded: includeFeesAllowance,
          label: 'Utility & Permit Allowance',
        },
        
        lot: {
          premium: lotPremium,
          lotNumber: lotNumber,
          developmentName: developmentName,
          isIncluded: hasLotPremium,
        },
        
        totals: {
          homeOnlyTotal,
          installedTypicalTotal,
          allInTotal,
          displayedTotal,
          lineItems,
        },
        
        version: new Date().toISOString().split('T')[0],
        freightPending,
        modelConfig: model || null,
        
        // Audit trail from database (only available in full ModelPricingRow for admin)
        pricingSource: (pricing && 'pricing_source' in pricing) ? pricing.pricing_source || undefined : undefined,
        quoteNumber: (pricing && 'quote_number' in pricing) ? pricing.quote_number || undefined : undefined,
        quoteDate: (pricing && 'quote_date' in pricing) ? pricing.quote_date || undefined : undefined,
        
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
    };
  }, [models, zones, markups, upgradeOptions]);
  
  // Convenience function for "Starting from" prices
  const getStartingFromPrice = useMemo(() => {
    return (modelSlug: string): UnifiedPriceBreakdown => {
      const model = models.getModelBySlug(modelSlug);
      const defaultBuildType: BuildType = model?.pricing?.xmod ? 'xmod' : 'mod';
      
      return calculatePrice({
        modelSlug,
        buildType: defaultBuildType,
        foundationType: 'crawl',
        servicePackage: 'installed',
        selectedOptionIds: [],
        includeFeesAllowance: false,
        includeSiteworkContingency: true,
      });
    };
  }, [models, calculatePrice]);
  
  // Format helpers
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const getPricingModeLabel = (mode: PricingMode): string => {
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
  };
  
  return {
    isLoading,
    error,
    models,
    upgradeOptions,
    calculatePrice,
    getStartingFromPrice,
    getMarkupConfig: markups.getMarkupConfig,
    getMultipliers: markups.getMultipliers,
    getSiteworkCosts: zones.getSiteworkCosts,
    formatPrice,
    getPricingModeLabel,
  };
}

export default useUnifiedPricingEngine;
