// ============================================================================
// Deal Scoring Engine — Pure TypeScript Engine
// Takes listing data + model fit results + municipality data → returns
// composite 0-100 score with sub-scores and recommended action.
// Reference: docs/homematch/PLATFORM-ARCHITECTURE.md Section 3.4
// ============================================================================

import type { ModelFitWithPricing } from './modelFit';

// --- Interfaces ---

export interface DealScoringListing {
  id: string;
  list_price: number;
  original_list_price: number;
  days_on_market: number;
  water: string;
  sewer: string;
  topography: string;
  municipality: string;
}

export interface DealScoringMunicipality {
  intel_score: number;             // 0-100
  new_construction_activity: string; // high | medium | low | none
  market_strength: string;         // strong | moderate | weak
  subsection_6_adopted: string;    // yes | partial | no | unknown
}

export interface ScoreFactors {
  seller_motivation: {
    days_on_market: number;
    price_reductions: number;
    original_price: number;
    current_price: number;
    discount_pct: string;
  };
  lot_viability: {
    models_that_fit: number;
    zoning_confidence: string;
    utilities: string;
    topography: string;
    land_division_possible: boolean;
  };
  margin_potential: {
    best_total_delivered: number;
    est_margin_pct: number;
    comp_support: string;
  };
  market_strength: {
    municipality: string;
    intel_score: number;
    activity: string;
    subsection_6: string;
  };
}

export type RecommendedAction = 'acquire_direct' | 'contact_seller' | 'monitor' | 'pass';
export type ReviewStatus = 'unreviewed' | 'reviewing' | 'approved' | 'passed' | 'acquired';

export interface DealScore {
  listing_id: string;
  total_score: number;
  seller_motivation_score: number;
  lot_viability_score: number;
  margin_potential_score: number;
  market_strength_score: number;
  score_factors: ScoreFactors;
  recommended_action: RecommendedAction;
  recommended_offer: number | null;
}

export interface DealScoringInput {
  listing: DealScoringListing;
  modelFits: ModelFitWithPricing[];
  municipality: DealScoringMunicipality;
  zoningConfidence: string;
  landDivisionPossible: boolean;
  compMultiplier?: number; // estimated value as multiplier of delivered cost
}

// --- Scoring Functions ---

/**
 * Score seller motivation (0-25).
 *
 * Factors:
 * - Days since expiration/withdrawal: 30-90 (+5), 90-180 (+10), 180+ (+15)
 * - Price reductions during listing: +5 per reduction (max +10)
 * - Listed multiple times: +5 (approximated from price reductions)
 * - Below-market asking price: +5
 */
function scoreSellerMotivation(listing: DealScoringListing): {
  score: number;
  factors: ScoreFactors['seller_motivation'];
} {
  let score = 0;

  // Days on market / since expiration
  if (listing.days_on_market > 180) score += 15;
  else if (listing.days_on_market > 90) score += 10;
  else if (listing.days_on_market > 30) score += 5;

  // Price reductions
  const priceReductions = listing.original_list_price > listing.list_price
    ? Math.ceil((listing.original_list_price - listing.list_price) / 5000)
    : 0;
  score += Math.min(10, priceReductions * 5);

  score = Math.min(25, score);

  const discountPct = listing.original_list_price > 0
    ? ((listing.original_list_price - listing.list_price) / listing.original_list_price * 100).toFixed(1)
    : '0.0';

  return {
    score,
    factors: {
      days_on_market: listing.days_on_market,
      price_reductions: priceReductions,
      original_price: listing.original_list_price,
      current_price: listing.list_price,
      discount_pct: discountPct,
    },
  };
}

/**
 * Score lot viability (0-25).
 *
 * Factors:
 * - Models that fit: 3+ (+10), 1-2 (+5)
 * - Zoning confidence: verified (+10), ai_parsed (+5)
 * - Utilities at street: both municipal (+5), one (+2)
 * - Flat topography: +5
 * - Land division possible: +5
 */
function scoreLotViability(
  listing: DealScoringListing,
  modelFits: ModelFitWithPricing[],
  zoningConfidence: string,
  landDivisionPossible: boolean
): {
  score: number;
  factors: ScoreFactors['lot_viability'];
} {
  let score = 0;
  const fittingCount = modelFits.filter(f => f.fit_status !== 'no_fit').length;

  // Model fit count
  if (fittingCount >= 5) score += 10;
  else if (fittingCount >= 3) score += 8;
  else if (fittingCount >= 1) score += 5;

  // Zoning confidence
  if (zoningConfidence === 'verified') score += 10;
  else if (zoningConfidence === 'ai_parsed') score += 5;

  // Utilities
  const hasMunicipalWater = listing.water === 'municipal';
  const hasMunicipalSewer = listing.sewer === 'municipal';
  if (hasMunicipalWater && hasMunicipalSewer) score += 5;
  else if (hasMunicipalWater || hasMunicipalSewer) score += 2;

  // Topography
  if (listing.topography === 'flat') score += 5;

  // Land division
  if (landDivisionPossible) score += 5;

  score = Math.min(25, score);

  return {
    score,
    factors: {
      models_that_fit: fittingCount,
      zoning_confidence: zoningConfidence,
      utilities: hasMunicipalWater && hasMunicipalSewer ? 'municipal' : 'mixed/well-septic',
      topography: listing.topography,
      land_division_possible: landDivisionPossible,
    },
  };
}

/**
 * Score margin potential (0-25).
 *
 * Factors:
 * - Estimated margin > 25% (+15), 15-25% (+10), 5-15% (+5)
 * - Comp support: strong (+10), moderate (+5)
 */
function scoreMarginPotential(
  modelFits: ModelFitWithPricing[],
  compMultiplier: number
): {
  score: number;
  factors: ScoreFactors['margin_potential'];
} {
  let score = 0;

  const fittingModels = modelFits.filter(f => f.fit_status !== 'no_fit');
  const bestFit = fittingModels.sort((a, b) => a.total_delivered_low - b.total_delivered_low)[0];

  let estMarginPct = 0;
  let compSupport: string = 'none';

  if (bestFit) {
    const estValue = bestFit.total_delivered_low * compMultiplier;
    estMarginPct = ((estValue - bestFit.total_delivered_low) / bestFit.total_delivered_low) * 100;

    if (estMarginPct > 25) score += 15;
    else if (estMarginPct > 15) score += 10;
    else if (estMarginPct > 5) score += 5;

    // Comp support based on multiplier
    if (compMultiplier >= 1.20) {
      compSupport = 'strong';
      score += 10;
    } else if (compMultiplier >= 1.10) {
      compSupport = 'moderate';
      score += 5;
    } else {
      compSupport = 'weak';
    }
  }

  score = Math.min(25, score);

  return {
    score,
    factors: {
      best_total_delivered: bestFit?.total_delivered_low || 0,
      est_margin_pct: Math.round(estMarginPct * 10) / 10,
      comp_support: compSupport,
    },
  };
}

/**
 * Score market strength (0-25).
 *
 * Factors:
 * - Municipality intel score > 70 (+10), 40-70 (+5)
 * - New construction activity: high (+10), medium (+5)
 * - Price trend (captured in market_strength): strong (+5)
 * - Absorption rate (approximated from intel score)
 * - Subsection 6 adopted: +5
 */
function scoreMarketStrength(
  listing: DealScoringListing,
  municipality: DealScoringMunicipality
): {
  score: number;
  factors: ScoreFactors['market_strength'];
} {
  let score = 0;

  // Intel score
  if (municipality.intel_score > 70) score += 10;
  else if (municipality.intel_score > 40) score += 5;

  // Construction activity
  if (municipality.new_construction_activity === 'high') score += 10;
  else if (municipality.new_construction_activity === 'medium') score += 5;

  // Market strength / price trend
  if (municipality.market_strength === 'strong') score += 5;

  // Subsection 6
  if (municipality.subsection_6_adopted === 'yes') score += 5;
  else if (municipality.subsection_6_adopted === 'partial') score += 2;

  score = Math.min(25, score);

  return {
    score,
    factors: {
      municipality: listing.municipality,
      intel_score: municipality.intel_score,
      activity: municipality.new_construction_activity,
      subsection_6: municipality.subsection_6_adopted,
    },
  };
}

// --- Main Entry Point ---

/**
 * Calculate the full deal score for an acquisition opportunity.
 *
 * Recommended Action Thresholds:
 * - 80-100: acquire_direct — Strong buy signal
 * - 60-79:  contact_seller — Worth pursuing
 * - 40-59:  monitor — Track for changes
 * - 0-39:   pass — Not viable currently
 */
export function calculateDealScore(input: DealScoringInput): DealScore {
  const {
    listing,
    modelFits,
    municipality,
    zoningConfidence,
    landDivisionPossible,
    compMultiplier = 1.15,
  } = input;

  const motivation = scoreSellerMotivation(listing);
  const viability = scoreLotViability(listing, modelFits, zoningConfidence, landDivisionPossible);
  const margin = scoreMarginPotential(modelFits, compMultiplier);
  const market = scoreMarketStrength(listing, municipality);

  const totalScore = motivation.score + viability.score + margin.score + market.score;

  let recommendedAction: RecommendedAction = 'pass';
  if (totalScore >= 80) recommendedAction = 'acquire_direct';
  else if (totalScore >= 60) recommendedAction = 'contact_seller';
  else if (totalScore >= 40) recommendedAction = 'monitor';

  const recommendedOffer = totalScore >= 60
    ? Math.round(listing.list_price * 0.85 / 1000) * 1000
    : null;

  return {
    listing_id: listing.id,
    total_score: totalScore,
    seller_motivation_score: motivation.score,
    lot_viability_score: viability.score,
    margin_potential_score: margin.score,
    market_strength_score: market.score,
    score_factors: {
      seller_motivation: motivation.factors,
      lot_viability: viability.factors,
      margin_potential: margin.factors,
      market_strength: market.factors,
    },
    recommended_action: recommendedAction,
    recommended_offer: recommendedOffer,
  };
}

/**
 * Get default municipality data when live data isn't available.
 * Matches the mock data scoring behavior.
 */
export function getDefaultMunicipalityData(municipalityName: string): DealScoringMunicipality {
  const defaults: Record<string, DealScoringMunicipality> = {
    'Ypsilanti Township': { intel_score: 55, new_construction_activity: 'medium', market_strength: 'moderate', subsection_6_adopted: 'unknown' },
    'Wyoming': { intel_score: 70, new_construction_activity: 'high', market_strength: 'strong', subsection_6_adopted: 'yes' },
    'Byron Township': { intel_score: 60, new_construction_activity: 'medium', market_strength: 'moderate', subsection_6_adopted: 'partial' },
    'Georgetown Township': { intel_score: 75, new_construction_activity: 'high', market_strength: 'strong', subsection_6_adopted: 'yes' },
    'Grand Haven': { intel_score: 80, new_construction_activity: 'high', market_strength: 'strong', subsection_6_adopted: 'yes' },
  };

  return defaults[municipalityName] || {
    intel_score: 40,
    new_construction_activity: 'low',
    market_strength: 'moderate',
    subsection_6_adopted: 'unknown',
  };
}

/**
 * Get a comp multiplier estimate for a municipality.
 * In production, this should come from actual comp data.
 */
export function getCompMultiplier(municipalityName: string): number {
  const multipliers: Record<string, number> = {
    'Grand Haven': 1.25,
    'Georgetown Township': 1.20,
    'Wyoming': 1.18,
    'Byron Township': 1.15,
    'Ypsilanti Township': 1.15,
  };
  return multipliers[municipalityName] || 1.15;
}
