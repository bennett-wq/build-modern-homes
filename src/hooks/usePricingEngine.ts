// ============================================================================
// BaseMod Pricing Engine Hook
// Real-time price calculation based on user selections
// ============================================================================

import { useMemo, useCallback } from 'react';
import {
  type ModelConfig,
  type BuildType,
  type ZoneConfig,
  type BuildIntent,
  getModelBySlug,
  getDefaultZone,
  getPlygremUpgradePrice,
  exteriorConfig,
} from '@/data/pricing-config';

// ============================================================================
// TYPES
// ============================================================================

export interface FloorPlanSelection {
  optionId: string;
  selected: boolean;
}

export interface ExteriorSelection {
  sidingColorId: string;
  shingleColorId: string;
  doorStyleId: string;
  blackFasciaPackage: boolean;
  blackExteriorDoorCount: number;
  stormDoorCount: number;
}

export interface BuildSelection {
  intent: BuildIntent | null;
  modelSlug: string | null;
  buildType: BuildType | null;
  zoneId: string;
  includeUtilityFees: boolean;
  includePermitsCosts: boolean;
  floorPlanSelections: FloorPlanSelection[];
  exteriorSelection: ExteriorSelection;
}

export interface PriceBreakdown {
  // Factory pricing
  baseCost: number;
  optionsAdjustment: number;
  freight: number;
  mhiDues: number;
  factoryTotal: number;
  freightPending: boolean;

  // BaseMod sitework
  crane: number;
  homeSet: number;
  deliverySetupTotal: number;
  onSitePortionTotal: number;
  basemodSiteworkTotal: number;

  // Optional fees
  utilityAuthorityFees: number;
  permitsAndSoftCosts: number;
  optionalFeesTotal: number;

  // Adders
  floorPlanAddersTotal: number;
  floorPlanAdderDetails: { name: string; price: number }[];
  exteriorAddersTotal: number;
  exteriorAdderDetails: { name: string; price: number }[];

  // Totals
  homeAndSiteworkTotal: number;
  allInEstimateTotal: number;

  // Meta
  hasPricing: boolean;
  pricingSource?: string;
}

export const defaultExteriorSelection: ExteriorSelection = {
  sidingColorId: 'white',
  shingleColorId: 'charcoal',
  doorStyleId: 'craftsman-3-lite',
  blackFasciaPackage: false,
  blackExteriorDoorCount: 0,
  stormDoorCount: 0,
};

export const defaultBuildSelection: BuildSelection = {
  intent: null,
  modelSlug: null,
  buildType: null,
  zoneId: 'zone-3',
  includeUtilityFees: true,
  includePermitsCosts: true,
  floorPlanSelections: [],
  exteriorSelection: defaultExteriorSelection,
};

// ============================================================================
// PRICING ENGINE
// ============================================================================

export function calculatePriceBreakdown(
  selection: BuildSelection,
  model: ModelConfig | null,
  zone: ZoneConfig
): PriceBreakdown {
  const emptyBreakdown: PriceBreakdown = {
    baseCost: 0,
    optionsAdjustment: 0,
    freight: 0,
    mhiDues: 0,
    factoryTotal: 0,
    freightPending: false,
    crane: 0,
    homeSet: 0,
    deliverySetupTotal: 0,
    onSitePortionTotal: 0,
    basemodSiteworkTotal: 0,
    utilityAuthorityFees: 0,
    permitsAndSoftCosts: 0,
    optionalFeesTotal: 0,
    floorPlanAddersTotal: 0,
    floorPlanAdderDetails: [],
    exteriorAddersTotal: 0,
    exteriorAdderDetails: [],
    homeAndSiteworkTotal: 0,
    allInEstimateTotal: 0,
    hasPricing: false,
  };

  if (!model || !selection.buildType) {
    return emptyBreakdown;
  }

  const buildType = selection.buildType;
  const pricing = model.pricing[buildType];

  // Check if we have factory pricing
  const hasPricing = !!pricing && pricing.factory_quote_total > 0;
  const freightPending = pricing?.freight === 0;

  // Factory pricing
  const baseCost = pricing?.base_cost ?? 0;
  const optionsAdjustment = pricing?.options_adjustment ?? 0;
  const freight = pricing?.freight ?? 0;
  const mhiDues = pricing?.mhi_dues ?? 0;
  const factoryTotal = pricing?.factory_quote_total ?? 0;

  // Sitework
  const crane = zone.sitework.crane;
  const homeSet = zone.sitework.home_set;
  const deliverySetupTotal = zone.sitework.delivery_setup_total;
  const onSitePortionTotal = zone.sitework.on_site_portion_total;
  const basemodSiteworkTotal = zone.sitework.basemod_sitework_total;

  // Optional fees
  const utilityAuthorityFees = selection.includeUtilityFees ? zone.fees.utility_authority_fees : 0;
  const permitsAndSoftCosts = selection.includePermitsCosts ? zone.fees.permits_soft_costs : 0;
  const optionalFeesTotal = utilityAuthorityFees + permitsAndSoftCosts;

  // Floor plan adders
  const floorPlanAdderDetails: { name: string; price: number }[] = [];
  let floorPlanAddersTotal = 0;

  model.floorPlanOptions.forEach((option) => {
    if (!option.available) return;
    
    // Check if option is selected
    const selected = selection.floorPlanSelections.find(
      (s) => s.optionId === option.id && s.selected
    );
    
    if (selected) {
      // Check if option applies to current build type
      if (!option.buildTypes || option.buildTypes.includes(buildType)) {
        floorPlanAdderDetails.push({ name: option.name, price: option.price });
        floorPlanAddersTotal += option.price;
      }
    }
  });

  // Exterior adders
  const exteriorAdderDetails: { name: string; price: number }[] = [];
  let exteriorAddersTotal = 0;

  // Siding upgrade
  const selectedSiding = exteriorConfig.sidingColors.find(
    (c) => c.id === selection.exteriorSelection.sidingColorId
  );
  if (selectedSiding?.isUpgrade) {
    const sidingUpgradePrice = getPlygremUpgradePrice(model.length);
    exteriorAdderDetails.push({ name: `${selectedSiding.name} siding upgrade`, price: sidingUpgradePrice });
    exteriorAddersTotal += sidingUpgradePrice;
  }

  // Door style
  const selectedDoor = exteriorConfig.doorStyles.find(
    (d) => d.id === selection.exteriorSelection.doorStyleId
  );
  if (selectedDoor && selectedDoor.price > 0) {
    exteriorAdderDetails.push({ name: selectedDoor.name, price: selectedDoor.price });
    exteriorAddersTotal += selectedDoor.price;
  }

  // Black fascia package
  if (selection.exteriorSelection.blackFasciaPackage) {
    const fasciaOption = exteriorConfig.options.find((o) => o.id === 'black-fascia-package');
    if (fasciaOption) {
      exteriorAdderDetails.push({ name: fasciaOption.name, price: fasciaOption.price });
      exteriorAddersTotal += fasciaOption.price;
    }
  }

  // Black exterior doors
  if (selection.exteriorSelection.blackExteriorDoorCount > 0) {
    const doorOption = exteriorConfig.options.find((o) => o.id === 'black-exterior-door');
    if (doorOption) {
      const totalPrice = doorOption.price * selection.exteriorSelection.blackExteriorDoorCount;
      exteriorAdderDetails.push({
        name: `${doorOption.name} (x${selection.exteriorSelection.blackExteriorDoorCount})`,
        price: totalPrice,
      });
      exteriorAddersTotal += totalPrice;
    }
  }

  // Storm doors
  if (selection.exteriorSelection.stormDoorCount > 0) {
    const stormOption = exteriorConfig.options.find((o) => o.id === 'storm-door');
    if (stormOption) {
      const totalPrice = stormOption.price * selection.exteriorSelection.stormDoorCount;
      exteriorAdderDetails.push({
        name: `${stormOption.name} (x${selection.exteriorSelection.stormDoorCount})`,
        price: totalPrice,
      });
      exteriorAddersTotal += totalPrice;
    }
  }

  // Calculate totals
  const homeAndSiteworkTotal = factoryTotal + basemodSiteworkTotal + floorPlanAddersTotal + exteriorAddersTotal;
  const allInEstimateTotal = homeAndSiteworkTotal + optionalFeesTotal;

  return {
    baseCost,
    optionsAdjustment,
    freight,
    mhiDues,
    factoryTotal,
    freightPending,
    crane,
    homeSet,
    deliverySetupTotal,
    onSitePortionTotal,
    basemodSiteworkTotal,
    utilityAuthorityFees,
    permitsAndSoftCosts,
    optionalFeesTotal,
    floorPlanAddersTotal,
    floorPlanAdderDetails,
    exteriorAddersTotal,
    exteriorAdderDetails,
    homeAndSiteworkTotal,
    allInEstimateTotal,
    hasPricing,
    pricingSource: model.pricingSource,
  };
}

// ============================================================================
// REACT HOOK
// ============================================================================

export function usePricingEngine(selection: BuildSelection) {
  const model = useMemo(
    () => (selection.modelSlug ? getModelBySlug(selection.modelSlug) : null),
    [selection.modelSlug]
  );

  const zone = useMemo(
    () => getDefaultZone(),
    []
  );

  const breakdown = useMemo(
    () => calculatePriceBreakdown(selection, model, zone),
    [selection, model, zone]
  );

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  return {
    model,
    zone,
    breakdown,
    formatPrice,
  };
}

export default usePricingEngine;
