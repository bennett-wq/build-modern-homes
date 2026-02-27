// ============================================================================
// useAcquisitionData — React Query hooks for Tab 3 Acquisition Intelligence
// Queries Supabase tables (mls_listings, acquisition_scores, model_fits)
// Falls back to mock data if tables are empty or not yet created.
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  mockListings,
  mockAcquisitionScores,
  mockModelFits,
  mockZoningDistricts,
  type MockMlsListing,
  type MockAcquisitionScore,
  type MockModelFit,
  type MockZoningDistrict,
} from '@/data/homematch/mock-acquisition-data';

// Re-export types for convenience
export type { MockMlsListing, MockAcquisitionScore, MockModelFit, MockZoningDistrict };

export type DataSource = 'live' | 'mock';

export interface AcquisitionDataResult {
  listings: MockMlsListing[];
  scores: MockAcquisitionScore[];
  modelFits: MockModelFit[];
  zoningDistricts: MockZoningDistrict[];
  dataSource: DataSource;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Map a Supabase mls_listings row to our MockMlsListing shape.
 */
function mapSupabaseListing(row: Record<string, unknown>): MockMlsListing {
  return {
    id: row.id as string,
    mls_number: row.mls_number as string,
    status: row.status as MockMlsListing['status'],
    address: row.address as string,
    city: (row.city as string) || '',
    state: (row.state as string) || 'MI',
    zip_code: (row.zip_code as string) || '',
    county: (row.county as string) || '',
    municipality: (row.municipality as string) || '',
    latitude: (row.latitude as number) || 0,
    longitude: (row.longitude as number) || 0,
    lot_acres: Number(row.lot_acres) || 0,
    lot_sqft: Number(row.lot_sqft) || 0,
    frontage_ft: Number(row.frontage_ft) || 0,
    depth_ft: Number(row.depth_ft) || 0,
    list_price: Number(row.list_price) || 0,
    original_list_price: Number(row.original_list_price) || 0,
    days_on_market: (row.days_on_market as number) || 0,
    list_date: (row.list_date as string) || '',
    expiration_date: (row.expiration_date as string) || '',
    listing_agent_name: (row.listing_agent_name as string) || '',
    listing_office: (row.listing_office as string) || '',
    coop_commission: (row.coop_commission as string) || '',
    water: (row.water as string) || 'unknown',
    sewer: (row.sewer as string) || 'unknown',
    electric: (row.electric as boolean) ?? true,
    gas: (row.gas as string) || 'unknown',
    topography: (row.topography as string) || 'flat',
    description: (row.description as string) || '',
  };
}

/**
 * Map a Supabase acquisition_scores row to our MockAcquisitionScore shape.
 */
function mapSupabaseScore(row: Record<string, unknown>): MockAcquisitionScore {
  const factors = (row.score_factors || {}) as Record<string, Record<string, unknown>>;
  return {
    listing_id: row.mls_listing_id as string,
    total_score: (row.total_score as number) || 0,
    seller_motivation_score: (row.seller_motivation_score as number) || 0,
    lot_viability_score: (row.lot_viability_score as number) || 0,
    margin_potential_score: (row.margin_potential_score as number) || 0,
    market_strength_score: (row.market_strength_score as number) || 0,
    score_factors: {
      seller_motivation: factors.seller_motivation || {},
      lot_viability: factors.lot_viability || {},
      margin_potential: factors.margin_potential || {},
      market_strength: factors.market_strength || {},
    },
    recommended_action: (row.recommended_action as MockAcquisitionScore['recommended_action']) || 'pass',
    recommended_offer: (row.recommended_offer as number) || null,
    review_status: (row.review_status as MockAcquisitionScore['review_status']) || 'unreviewed',
    notes: (row.notes as string) || '',
  };
}

/**
 * Map a Supabase model_fits row to our MockModelFit shape.
 */
function mapSupabaseModelFit(row: Record<string, unknown>): MockModelFit {
  return {
    listing_id: row.mls_listing_id as string,
    model_slug: row.model_slug as string,
    model_name: row.model_slug as string, // Will be enriched from model_dimensions
    build_type: row.build_type as string,
    fit_status: row.fit_status as MockModelFit['fit_status'],
    fit_reason: (row.fit_reason as string) || null,
    width_margin_ft: Number(row.width_margin_ft) || 0,
    depth_margin_ft: Number(row.depth_margin_ft) || 0,
    coverage_pct: Number(row.coverage_pct) || 0,
    lot_price: Number(row.lot_price) || 0,
    home_price: Number(row.home_price) || 0,
    site_work_low: Number(row.site_work_low) || 0,
    site_work_high: Number(row.site_work_high) || 0,
    total_delivered_low: Number(row.total_delivered_low) || 0,
    total_delivered_high: Number(row.total_delivered_high) || 0,
    zoning_confidence: (row.zoning_confidence as string) || 'not_started',
  };
}

// --- Hooks ---

/**
 * Fetch all acquisition data — tries Supabase first, falls back to mock.
 */
export function useAcquisitionData(): AcquisitionDataResult {
  const {
    data: liveListings,
    isLoading: listingsLoading,
    error: listingsError,
  } = useQuery({
    queryKey: ['acquisition-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mls_listings' as string)
        .select('*')
        .in('status', ['expired', 'withdrawn', 'canceled'])
        .order('list_price', { ascending: false });

      if (error) throw error;
      return (data || []).map((row: Record<string, unknown>) => mapSupabaseListing(row));
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: liveScores,
    isLoading: scoresLoading,
    error: scoresError,
  } = useQuery({
    queryKey: ['acquisition-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acquisition_scores' as string)
        .select('*')
        .order('total_score', { ascending: false });

      if (error) throw error;
      return (data || []).map((row: Record<string, unknown>) => mapSupabaseScore(row));
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: liveFits,
    isLoading: fitsLoading,
    error: fitsError,
  } = useQuery({
    queryKey: ['acquisition-model-fits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_fits' as string)
        .select('*');

      if (error) throw error;
      return (data || []).map((row: Record<string, unknown>) => mapSupabaseModelFit(row));
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = listingsLoading || scoresLoading || fitsLoading;
  const error = listingsError || scoresError || fitsError;

  // Determine if we should use live or mock data
  const hasLiveData = !error && liveListings && liveListings.length > 0;

  return {
    listings: hasLiveData ? liveListings! : mockListings,
    scores: hasLiveData ? (liveScores || []) : mockAcquisitionScores,
    modelFits: hasLiveData ? (liveFits || []) : mockModelFits,
    zoningDistricts: mockZoningDistricts, // Always from mock until zoning sync is built
    dataSource: hasLiveData ? 'live' : 'mock',
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Get model fits for a specific listing.
 */
export function getModelFitsForListingFromData(
  modelFits: MockModelFit[],
  listingId: string
): MockModelFit[] {
  return modelFits.filter(f => f.listing_id === listingId);
}

/**
 * Get fitting model count for a listing.
 */
export function getFittingModelsCountFromData(
  modelFits: MockModelFit[],
  listingId: string
): number {
  return modelFits.filter(f => f.listing_id === listingId && f.fit_status !== 'no_fit').length;
}

/**
 * Get acquisition score for a specific listing.
 */
export function getScoreForListing(
  scores: MockAcquisitionScore[],
  listingId: string
): MockAcquisitionScore | undefined {
  return scores.find(s => s.listing_id === listingId);
}

/**
 * Get zoning district for a municipality.
 */
export function getZoningForMunicipalityFromData(
  zoningDistricts: MockZoningDistrict[],
  municipality: string
): MockZoningDistrict | undefined {
  return zoningDistricts.find(z => z.municipality === municipality && z.district_code === 'R-1')
    || zoningDistricts.find(z => z.municipality === municipality);
}

/**
 * Get listing by ID from data array.
 */
export function getListingByIdFromData(
  listings: MockMlsListing[],
  id: string
): MockMlsListing | undefined {
  return listings.find(l => l.id === id);
}
