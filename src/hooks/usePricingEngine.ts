// ============================================================================
// BaseMod Pricing Engine Hook
// Real-time price calculation with internal costs and buyer-facing retail prices
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
import {
  type PricingMode,
  type MarkupConfig,
  pricingLayerConfig,
  applyMarkup,
  getMarkupAmount,
  buyerPackageLabels,
} from '@/data/pricing-layers';

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
  pricingMode?: PricingMode;
  // Unified exterior design selections (used by Step3Design)
  packageId: string | null;
  garageDoorId: string | null;
}

// Internal cost breakdown (admin view only)
export interface InternalCostBreakdown {
  // Factory pricing
  baseCost: number;
  optionsAdjustment: number;
  freight: number;
  mhiDues: number;
  factoryTotal: number;

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
  allInCostTotal: number;
}

// Buyer-facing price breakdown (no cost-plus visible)
export interface BuyerFacingBreakdown {
  // Packaged prices (what buyers see)
  homePackagePrice: number;        // BaseMod Home Package
  installPackagePrice: number;     // Professional Installation
  communityAdder: number;          // Community & Land (only for community_all_in)
  optionsUpgradesTotal: number;    // Floor plan + exterior adders
  feesPermitsTotal: number;        // Utility fees + permits

  // Line item details for options
  optionDetails: { name: string; price: number }[];

  // Grand total
  startingFromPrice: number;

  // Labels for display
  labels: typeof buyerPackageLabels;
}

// Combined pricing output
export interface PricingOutput {
  // Meta flags
  hasPricing: boolean;
  freightPending: boolean;
  basementSelectedRequiresQuote: boolean;
  estimateConfidence: 'high' | 'medium' | 'low';
  pricingSource?: string;
  pricingMode: PricingMode;

  // Internal costs (admin only - do not expose to buyers)
  internalCostBreakdown: InternalCostBreakdown;

  // Buyer-facing prices (safe to show)
  buyerFacingBreakdown: BuyerFacingBreakdown;
}

// Legacy type for backward compatibility
export interface PriceBreakdown {
  baseCost: number;
  optionsAdjustment: number;
  freight: number;
  mhiDues: number;
  factoryTotal: number;
  freightPending: boolean;
  crane: number;
  homeSet: number;
  deliverySetupTotal: number;
  onSitePortionTotal: number;
  basemodSiteworkTotal: number;
  utilityAuthorityFees: number;
  permitsAndSoftCosts: number;
  optionalFeesTotal: number;
  floorPlanAddersTotal: number;
  floorPlanAdderDetails: { name: string; price: number }[];
  exteriorAddersTotal: number;
  exteriorAdderDetails: { name: string; price: number }[];
  homeAndSiteworkTotal: number;
  allInEstimateTotal: number;
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
  pricingMode: 'delivered_installed',
  packageId: null,
  garageDoorId: null,
};

// ============================================================================
// PRICING ENGINE
// ============================================================================

function calculateInternalCosts(
  selection: BuildSelection,
  model: ModelConfig | null,
  zone: ZoneConfig
): InternalCostBreakdown & { freightPending: boolean } {
  const empty: InternalCostBreakdown & { freightPending: boolean } = {
    baseCost: 0,
    optionsAdjustment: 0,
    freight: 0,
    mhiDues: 0,
    factoryTotal: 0,
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
    allInCostTotal: 0,
    freightPending: false,
  };

  if (!model || !selection.buildType) {
    return empty;
  }

  const buildType = selection.buildType;
  const pricing = model.pricing[buildType];
  const freightPending = pricing?.freightPending ?? (pricing?.freight === 0);

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
    const selected = selection.floorPlanSelections.find(
      (s) => s.optionId === option.id && s.selected
    );
    if (selected) {
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
  const allInCostTotal = homeAndSiteworkTotal + optionalFeesTotal;

  return {
    baseCost,
    optionsAdjustment,
    freight,
    mhiDues,
    factoryTotal,
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
    allInCostTotal,
    freightPending,
  };
}

function calculateBuyerFacingPrices(
  internalCosts: InternalCostBreakdown,
  pricingMode: PricingMode,
  markups: MarkupConfig = pricingLayerConfig.defaults
): BuyerFacingBreakdown {
  const modeConfig = pricingLayerConfig.modes[pricingMode];

  // Factory cost for markup = base factory total + adders
  const factoryCostForMarkup = internalCosts.factoryTotal + 
    internalCosts.floorPlanAddersTotal + 
    internalCosts.exteriorAddersTotal;

  // Home package = factory cost with dealer markup
  const homePackagePrice = modeConfig.appliesDealer
    ? applyMarkup(factoryCostForMarkup, markups.dealerMarkupPct)
    : factoryCostForMarkup;

  // Install package = sitework with installer markup
  const installPackagePrice = modeConfig.appliesInstaller
    ? applyMarkup(internalCosts.basemodSiteworkTotal, markups.installerMarkupPct)
    : 0;

  // Community adder = developer markup on subtotal
  const subtotalBeforeDeveloper = homePackagePrice + installPackagePrice;
  const communityAdder = modeConfig.appliesDeveloper
    ? getMarkupAmount(subtotalBeforeDeveloper, markups.developerMarkupPct)
    : 0;

  // Options/upgrades - shown as line items (already included in homePackagePrice)
  // We calculate the retail value of upgrades for display
  const optionsUpgradesTotal = modeConfig.appliesDealer
    ? applyMarkup(internalCosts.floorPlanAddersTotal + internalCosts.exteriorAddersTotal, markups.dealerMarkupPct)
    : internalCosts.floorPlanAddersTotal + internalCosts.exteriorAddersTotal;

  // Combine option details with marked-up prices
  const optionDetails = [
    ...internalCosts.floorPlanAdderDetails,
    ...internalCosts.exteriorAdderDetails,
  ].map((detail) => ({
    name: detail.name,
    price: modeConfig.appliesDealer ? applyMarkup(detail.price, markups.dealerMarkupPct) : detail.price,
  }));

  // Fees pass through without markup
  const feesPermitsTotal = internalCosts.optionalFeesTotal;

  // Grand total
  const startingFromPrice = homePackagePrice + installPackagePrice + communityAdder + feesPermitsTotal;

  return {
    homePackagePrice,
    installPackagePrice,
    communityAdder,
    optionsUpgradesTotal,
    feesPermitsTotal,
    optionDetails,
    startingFromPrice,
    labels: buyerPackageLabels,
  };
}

export function calculateFullPricing(
  selection: BuildSelection,
  model: ModelConfig | null,
  zone: ZoneConfig
): PricingOutput {
  const pricingMode = selection.pricingMode || 'delivered_installed';
  const internalCostsWithFreight = calculateInternalCosts(selection, model, zone);
  const { freightPending, ...internalCostBreakdown } = internalCostsWithFreight;

  const hasPricing = model !== null && 
    selection.buildType !== null && 
    (model.pricing[selection.buildType]?.factory_quote_total ?? 0) > 0;

  // Determine estimate confidence
  let estimateConfidence: 'high' | 'medium' | 'low' = 'high';
  if (freightPending) {
    estimateConfidence = 'medium';
  }
  if (!hasPricing) {
    estimateConfidence = 'low';
  }

  // Check for basement selection (would require custom quote)
  const basementSelectedRequiresQuote = false; // TODO: add basement detection if needed

  const buyerFacingBreakdown = calculateBuyerFacingPrices(
    internalCostBreakdown,
    pricingMode
  );

  return {
    hasPricing,
    freightPending,
    basementSelectedRequiresQuote,
    estimateConfidence,
    pricingSource: model?.pricingSource,
    pricingMode,
    internalCostBreakdown,
    buyerFacingBreakdown,
  };
}

// Legacy function for backward compatibility
export function calculatePriceBreakdown(
  selection: BuildSelection,
  model: ModelConfig | null,
  zone: ZoneConfig
): PriceBreakdown {
  const output = calculateFullPricing(selection, model, zone);
  const ic = output.internalCostBreakdown;

  return {
    baseCost: ic.baseCost,
    optionsAdjustment: ic.optionsAdjustment,
    freight: ic.freight,
    mhiDues: ic.mhiDues,
    factoryTotal: ic.factoryTotal,
    freightPending: output.freightPending,
    crane: ic.crane,
    homeSet: ic.homeSet,
    deliverySetupTotal: ic.deliverySetupTotal,
    onSitePortionTotal: ic.onSitePortionTotal,
    basemodSiteworkTotal: ic.basemodSiteworkTotal,
    utilityAuthorityFees: ic.utilityAuthorityFees,
    permitsAndSoftCosts: ic.permitsAndSoftCosts,
    optionalFeesTotal: ic.optionalFeesTotal,
    floorPlanAddersTotal: ic.floorPlanAddersTotal,
    floorPlanAdderDetails: ic.floorPlanAdderDetails,
    exteriorAddersTotal: ic.exteriorAddersTotal,
    exteriorAdderDetails: ic.exteriorAdderDetails,
    homeAndSiteworkTotal: ic.homeAndSiteworkTotal,
    allInEstimateTotal: ic.allInCostTotal + ic.optionalFeesTotal,
    hasPricing: output.hasPricing,
    pricingSource: output.pricingSource,
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

  // Full pricing output (new API)
  const pricing = useMemo(
    () => calculateFullPricing(selection, model, zone),
    [selection, model, zone]
  );

  // Legacy breakdown for backward compatibility
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
    breakdown,        // Legacy API
    pricing,          // New full pricing API
    formatPrice,
  };
}

export default usePricingEngine;
