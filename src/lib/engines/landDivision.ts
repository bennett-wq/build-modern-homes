// ============================================================================
// Land Division Calculator — Pure TypeScript Engine
// Takes total frontage + min lot width → calculates feasible lot divisions,
// then runs model fit on each resulting lot.
// Reference: docs/homematch/PLATFORM-ARCHITECTURE.md Section 3.2
// ============================================================================

import {
  type ModelFitLot,
  type ModelFitZoning,
  type ModelFitModel,
  type ModelFitWithPricing,
  calculateAllModelFits,
  DEFAULT_MODEL_SPECS,
} from './modelFit';

// --- Interfaces ---

export interface ResultingLot {
  lot_number: number;
  width_ft: number;
  depth_ft: number;
  area_sqft: number;
  fitting_models: string[]; // model slugs that fit
}

export interface DevelopmentEconomics {
  total_acquisition_cost: number;
  total_build_cost: number;
  total_site_work: number;
  total_development_cost: number;
  estimated_total_value: number;
  estimated_margin: number;
  estimated_roi_pct: number;
}

export interface LandDivisionInput {
  total_frontage_ft: number;
  total_depth_ft: number;
  total_area_sqft: number;
  min_lot_width_ft: number; // from zoning
  list_price: number;
  zoning: ModelFitZoning;
  zoning_confidence: string;
  water: string;
  sewer: string;
  topography: string;
  models?: ModelFitModel[];
  comp_multiplier?: number; // estimated value multiplier (default 1.15)
}

export interface LandDivisionResult {
  max_possible_lots: number;
  feasible_lots: number;
  resulting_lots: ResultingLot[];
  lot_model_fits: Map<number, ModelFitWithPricing[]>; // lot_number -> fits
  development_economics: DevelopmentEconomics;
}

// --- Constants ---

const ACCESS_EASEMENT_FT = 20; // Deducted from interior lots for access
const MIN_AREA_MULTIPLIER = 0.9; // Allow 10% tolerance on min area

// --- Calculator ---

/**
 * Calculate feasible lot divisions for a parcel with excess frontage.
 *
 * Logic (from architecture doc):
 * 1. max_lots = floor(total_frontage / min_lot_width)
 * 2. If max_lots > 1: deduct 20ft for access easement from interior lots
 * 3. Verify each resulting lot meets minimum area
 * 4. Run model fit on each resulting lot
 * 5. Calculate development economics
 */
export function calculateLandDivision(input: LandDivisionInput): LandDivisionResult {
  const {
    total_frontage_ft,
    total_depth_ft,
    total_area_sqft,
    min_lot_width_ft,
    list_price,
    zoning,
    zoning_confidence,
    water,
    sewer,
    topography,
    models = DEFAULT_MODEL_SPECS,
    comp_multiplier = 1.15,
  } = input;

  // Step 1: Calculate max possible lots
  const maxLots = Math.floor(total_frontage_ft / min_lot_width_ft);

  if (maxLots <= 1) {
    return {
      max_possible_lots: 1,
      feasible_lots: 1,
      resulting_lots: [{
        lot_number: 1,
        width_ft: total_frontage_ft,
        depth_ft: total_depth_ft,
        area_sqft: total_area_sqft,
        fitting_models: [],
      }],
      lot_model_fits: new Map(),
      development_economics: {
        total_acquisition_cost: list_price,
        total_build_cost: 0,
        total_site_work: 0,
        total_development_cost: list_price,
        estimated_total_value: 0,
        estimated_margin: 0,
        estimated_roi_pct: 0,
      },
    };
  }

  // Step 2: Create resulting lots with access easement deduction
  const resultingLots: ResultingLot[] = [];
  const lotModelFits = new Map<number, ModelFitWithPricing[]>();
  const minAreaSqft = (zoning.front_setback_ft + zoning.rear_setback_ft + 40) * min_lot_width_ft * MIN_AREA_MULTIPLIER;

  // Distribute frontage evenly
  const baseLotWidth = total_frontage_ft / maxLots;

  for (let i = 0; i < maxLots; i++) {
    const lotNumber = i + 1;
    const isInterior = i > 0 && i < maxLots - 1;

    // Interior lots lose frontage to access easement
    const effectiveWidth = isInterior
      ? baseLotWidth - ACCESS_EASEMENT_FT
      : baseLotWidth;

    const lotArea = effectiveWidth * total_depth_ft;

    // Step 3: Verify minimum area
    if (lotArea < minAreaSqft) continue;

    const lot: ModelFitLot = {
      frontage_ft: effectiveWidth,
      depth_ft: total_depth_ft,
      area_sqft: lotArea,
    };

    // Step 4: Run model fits
    const fits = calculateAllModelFits(
      lot,
      zoning,
      Math.round(list_price / maxLots), // proportional lot cost
      zoning_confidence,
      water,
      sewer,
      topography,
      models
    );

    const fittingModelSlugs = fits
      .filter(f => f.fit_status !== 'no_fit')
      .map(f => `${f.model_slug}-${f.build_type}`);

    resultingLots.push({
      lot_number: lotNumber,
      width_ft: Math.round(effectiveWidth * 100) / 100,
      depth_ft: total_depth_ft,
      area_sqft: Math.round(lotArea),
      fitting_models: fittingModelSlugs,
    });

    lotModelFits.set(lotNumber, fits);
  }

  // Step 5: Development economics
  const economics = calculateDevelopmentEconomics(
    list_price,
    resultingLots,
    lotModelFits,
    comp_multiplier
  );

  return {
    max_possible_lots: maxLots,
    feasible_lots: resultingLots.length,
    resulting_lots: resultingLots,
    lot_model_fits: lotModelFits,
    development_economics: economics,
  };
}

/**
 * Calculate development economics for a land division scenario.
 */
function calculateDevelopmentEconomics(
  acquisitionCost: number,
  lots: ResultingLot[],
  lotModelFits: Map<number, ModelFitWithPricing[]>,
  compMultiplier: number
): DevelopmentEconomics {
  let totalBuildCost = 0;
  let totalSiteWork = 0;
  let totalValue = 0;

  for (const lot of lots) {
    const fits = lotModelFits.get(lot.lot_number) || [];
    // Pick the best fitting model (lowest total delivered cost among those that fit)
    const bestFit = fits
      .filter(f => f.fit_status !== 'no_fit')
      .sort((a, b) => a.total_delivered_low - b.total_delivered_low)[0];

    if (bestFit) {
      totalBuildCost += bestFit.home_price;
      totalSiteWork += bestFit.site_work_low;
      totalValue += bestFit.total_delivered_low * compMultiplier;
    }
  }

  const totalDevelopmentCost = acquisitionCost + totalBuildCost + totalSiteWork;
  const margin = totalValue - totalDevelopmentCost;
  const roiPct = totalDevelopmentCost > 0 ? (margin / totalDevelopmentCost) * 100 : 0;

  return {
    total_acquisition_cost: acquisitionCost,
    total_build_cost: totalBuildCost,
    total_site_work: totalSiteWork,
    total_development_cost: totalDevelopmentCost,
    estimated_total_value: Math.round(totalValue),
    estimated_margin: Math.round(margin),
    estimated_roi_pct: Math.round(roiPct * 10) / 10,
  };
}

/**
 * Quick check: can this lot potentially be divided?
 */
export function canDivide(totalFrontage: number, minLotWidth: number): boolean {
  return Math.floor(totalFrontage / minLotWidth) > 1;
}
