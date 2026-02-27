// ============================================================================
// Model Fit Calculator — Pure TypeScript Engine
// Takes lot dimensions + zoning requirements + model specs → returns fit status
// Reference: docs/homematch/PLATFORM-ARCHITECTURE.md Section 3.1
// ============================================================================

// --- Interfaces ---

export interface ModelFitLot {
  frontage_ft: number;
  depth_ft: number;
  area_sqft: number;
}

export interface ModelFitZoning {
  front_setback_ft: number;
  side_setback_ft: number;
  rear_setback_ft: number;
  max_lot_coverage_pct: number;
  max_height_ft: number;
}

export interface ModelFitModel {
  model_slug: string;
  model_name: string;
  build_type: string;
  width_ft: number;
  depth_ft: number;
  height_ft: number;
  footprint_sqft: number;
  home_price: number;
}

export interface ModelFitInput {
  lot: ModelFitLot;
  zoning: ModelFitZoning;
  model: ModelFitModel;
}

export interface BuildableEnvelope {
  width_ft: number;
  depth_ft: number;
}

export interface ModelFitResult {
  model_slug: string;
  model_name: string;
  build_type: string;
  fit_status: 'fits' | 'tight_fit' | 'no_fit';
  fit_reason: string | null;
  width_margin_ft: number;
  depth_margin_ft: number;
  coverage_pct: number;
  buildable_envelope: BuildableEnvelope;
}

export interface ModelFitWithPricing extends ModelFitResult {
  lot_price: number;
  home_price: number;
  site_work_low: number;
  site_work_high: number;
  total_delivered_low: number;
  total_delivered_high: number;
  zoning_confidence: string;
}

// --- Constants ---

const CLEARANCE_BUFFER_FT = 2; // Required clearance on each side
const TIGHT_FIT_THRESHOLD_FT = 4; // Below this margin = tight fit

// Site work tiers from architecture doc Section 3.3
const SITE_WORK = {
  standard: { low: 35000, high: 42000 },  // Flat lot, utilities at street
  moderate: { low: 42000, high: 55000 },   // Some grading, utilities within 100ft
  complex: { low: 55000, high: 75000 },    // Significant grading, long utility runs
} as const;

// --- Default model library (from architecture doc Section 2.2) ---

export const DEFAULT_MODEL_SPECS: ModelFitModel[] = [
  { model_slug: 'hawthorne', model_name: 'Hawthorne', build_type: 'xmod', width_ft: 32, depth_ft: 64, height_ft: 15, footprint_sqft: 2048, home_price: 97087 },
  { model_slug: 'hawthorne', model_name: 'Hawthorne (MOD)', build_type: 'mod', width_ft: 32, depth_ft: 64, height_ft: 15, footprint_sqft: 2048, home_price: 107904 },
  { model_slug: 'aspen', model_name: 'Aspen', build_type: 'xmod', width_ft: 32, depth_ft: 64, height_ft: 15, footprint_sqft: 2048, home_price: 98246 },
  { model_slug: 'belmont', model_name: 'Belmont', build_type: 'xmod', width_ft: 32, depth_ft: 64, height_ft: 15, footprint_sqft: 2048, home_price: 97182 },
  { model_slug: 'keeneland', model_name: 'Keeneland', build_type: 'xmod', width_ft: 32, depth_ft: 58, height_ft: 15, footprint_sqft: 1856, home_price: 106227 },
  { model_slug: 'laurel', model_name: 'Laurel', build_type: 'mod', width_ft: 24, depth_ft: 48, height_ft: 15, footprint_sqft: 1152, home_price: 95245 },
  { model_slug: 'cypress', model_name: 'Cypress', build_type: 'xmod', width_ft: 16, depth_ft: 66, height_ft: 15, footprint_sqft: 1056, home_price: 62213 },
];

// --- Core Calculator ---

/**
 * Calculate the buildable envelope for a lot given zoning setbacks.
 */
export function calculateBuildableEnvelope(
  lot: ModelFitLot,
  zoning: ModelFitZoning
): BuildableEnvelope {
  return {
    width_ft: lot.frontage_ft - (zoning.side_setback_ft * 2),
    depth_ft: lot.depth_ft - zoning.front_setback_ft - zoning.rear_setback_ft,
  };
}

/**
 * Calculate whether a single model fits on a given lot with zoning constraints.
 *
 * Logic (from architecture doc):
 * 1. buildable_width = frontage - (side_setback × 2)
 * 2. buildable_depth = depth - front_setback - rear_setback
 * 3. Width check: model.width + 2 (clearance) <= buildable_width
 * 4. Depth check: model.depth <= buildable_depth
 * 5. Coverage check: model.footprint / lot.area_sqft <= max_lot_coverage_pct
 * 6. Height check: model.height <= max_height_ft
 * 7. Tight fit: passes all checks but any margin < 4 ft
 * 8. No fit: fails any check (reason captured)
 */
export function calculateModelFit(input: ModelFitInput): ModelFitResult {
  const { lot, zoning, model } = input;

  const envelope = calculateBuildableEnvelope(lot, zoning);

  const widthMargin = envelope.width_ft - model.width_ft - CLEARANCE_BUFFER_FT;
  const depthMargin = envelope.depth_ft - model.depth_ft;
  const coveragePct = (model.footprint_sqft / lot.area_sqft) * 100;

  // Check failures in priority order
  if (widthMargin < 0) {
    return {
      model_slug: model.model_slug,
      model_name: model.model_name,
      build_type: model.build_type,
      fit_status: 'no_fit',
      fit_reason: `Requires ${model.width_ft + CLEARANCE_BUFFER_FT}ft width, only ${envelope.width_ft.toFixed(0)}ft available after setbacks`,
      width_margin_ft: 0,
      depth_margin_ft: Math.max(0, depthMargin),
      coverage_pct: coveragePct,
      buildable_envelope: envelope,
    };
  }

  if (depthMargin < 0) {
    return {
      model_slug: model.model_slug,
      model_name: model.model_name,
      build_type: model.build_type,
      fit_status: 'no_fit',
      fit_reason: `Requires ${model.depth_ft}ft depth, only ${envelope.depth_ft.toFixed(0)}ft available after setbacks`,
      width_margin_ft: widthMargin,
      depth_margin_ft: 0,
      coverage_pct: coveragePct,
      buildable_envelope: envelope,
    };
  }

  if (coveragePct > zoning.max_lot_coverage_pct) {
    return {
      model_slug: model.model_slug,
      model_name: model.model_name,
      build_type: model.build_type,
      fit_status: 'no_fit',
      fit_reason: `Coverage ${coveragePct.toFixed(1)}% exceeds max ${zoning.max_lot_coverage_pct}%`,
      width_margin_ft: widthMargin,
      depth_margin_ft: depthMargin,
      coverage_pct: coveragePct,
      buildable_envelope: envelope,
    };
  }

  if (model.height_ft > zoning.max_height_ft) {
    return {
      model_slug: model.model_slug,
      model_name: model.model_name,
      build_type: model.build_type,
      fit_status: 'no_fit',
      fit_reason: `Height ${model.height_ft}ft exceeds max ${zoning.max_height_ft}ft`,
      width_margin_ft: widthMargin,
      depth_margin_ft: depthMargin,
      coverage_pct: coveragePct,
      buildable_envelope: envelope,
    };
  }

  // Passes all checks — determine fit vs tight fit
  const isTight = widthMargin < TIGHT_FIT_THRESHOLD_FT || depthMargin < TIGHT_FIT_THRESHOLD_FT;

  return {
    model_slug: model.model_slug,
    model_name: model.model_name,
    build_type: model.build_type,
    fit_status: isTight ? 'tight_fit' : 'fits',
    fit_reason: null,
    width_margin_ft: widthMargin,
    depth_margin_ft: depthMargin,
    coverage_pct: coveragePct,
    buildable_envelope: envelope,
  };
}

/**
 * Determine site work tier based on lot utilities and topography.
 */
export function getSiteWorkEstimate(
  water: string,
  sewer: string,
  topography: string
): { low: number; high: number } {
  const hasMunicipalWater = water === 'municipal';
  const hasMunicipalSewer = sewer === 'municipal';
  const isFlat = topography === 'flat';

  if (hasMunicipalWater && hasMunicipalSewer && isFlat) {
    return SITE_WORK.standard;
  }
  if (!hasMunicipalWater && !hasMunicipalSewer) {
    return SITE_WORK.complex;
  }
  if (topography === 'steep' || topography === 'wooded') {
    return SITE_WORK.complex;
  }
  return SITE_WORK.moderate;
}

/**
 * Calculate model fit with full pricing for a listing.
 * This is the main entry point used by Tab 3.
 */
export function calculateModelFitWithPricing(
  lot: ModelFitLot,
  zoning: ModelFitZoning,
  model: ModelFitModel,
  listPrice: number,
  zoningConfidence: string,
  water: string,
  sewer: string,
  topography: string
): ModelFitWithPricing {
  const fitResult = calculateModelFit({ lot, zoning, model });
  const siteWork = getSiteWorkEstimate(water, sewer, topography);

  return {
    ...fitResult,
    lot_price: listPrice,
    home_price: model.home_price,
    site_work_low: siteWork.low,
    site_work_high: siteWork.high,
    total_delivered_low: listPrice + model.home_price + siteWork.low,
    total_delivered_high: listPrice + model.home_price + siteWork.high,
    zoning_confidence: zoningConfidence,
  };
}

/**
 * Batch calculate model fits for a single lot against all models.
 */
export function calculateAllModelFits(
  lot: ModelFitLot,
  zoning: ModelFitZoning,
  listPrice: number,
  zoningConfidence: string,
  water: string,
  sewer: string,
  topography: string,
  models: ModelFitModel[] = DEFAULT_MODEL_SPECS
): ModelFitWithPricing[] {
  return models.map(model =>
    calculateModelFitWithPricing(lot, zoning, model, listPrice, zoningConfidence, water, sewer, topography)
  );
}

/**
 * Count how many models fit (fits or tight_fit) on a lot.
 */
export function countFittingModels(results: ModelFitResult[]): number {
  return results.filter(r => r.fit_status !== 'no_fit').length;
}
