// ============================================================================
// Pricing Zones Data Loader Hook
// Fetches sitework cost baselines from Supabase
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export interface PricingZone {
  id: string;
  slug: string;
  name: string;
  baseline_total: number;
  crane_cost: number;
  home_set_cost: number;
  on_site_portion: number;
  contingency_buffer: number; // Stored as decimal (e.g., 0.10 = 10%)
  permits_soft_costs: number;
  utility_authority_fees: number;
  created_at: string;
  updated_at: string;
}

// Computed sitework costs for use in pricing engine
export interface SiteworkCosts {
  baseline: number;
  buffer: number; // Actual dollar amount (baseline * contingency_buffer)
  crane: number;
  homeSet: number;
  onSitePortion: number;
  total: number; // baseline + buffer
  // Fees (separate from sitework)
  permitsSoftCosts: number;
  utilityAuthorityFees: number;
  feesTotal: number;
}

// ============================================================================
// Query Key
// ============================================================================

export const PRICING_ZONES_QUERY_KEY = ['pricing-zones'] as const;

// ============================================================================
// Static Fallback (Zone 3 Michigan)
// ============================================================================

const FALLBACK_ZONE: PricingZone = {
  id: 'fallback-zone-3',
  slug: 'zone-3-michigan',
  name: 'Zone 3 - Michigan (Standard)',
  baseline_total: 86767,
  crane_cost: 8750,
  home_set_cost: 13750,
  on_site_portion: 64267,
  contingency_buffer: 0.10,
  permits_soft_costs: 2085,
  utility_authority_fees: 7546,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ============================================================================
// Fetcher
// ============================================================================

async function fetchPricingZones(): Promise<PricingZone[]> {
  const { data, error } = await supabase
    .from('pricing_zones')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[usePricingZones] Error fetching pricing zones:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.info('[usePricingZones] No pricing zones in database, using fallback');
    return [FALLBACK_ZONE];
  }

  return data;
}

// ============================================================================
// Hook
// ============================================================================

export interface UsePricingZonesResult {
  zones: PricingZone[];
  isLoading: boolean;
  error: Error | null;
  getZoneBySlug: (slug: string) => PricingZone | undefined;
  getZoneById: (id: string) => PricingZone | undefined;
  getDefaultZone: () => PricingZone;
  getSiteworkCosts: (zoneSlug?: string) => SiteworkCosts;
}

export function usePricingZones(): UsePricingZonesResult {
  const { data, isLoading, error } = useQuery({
    queryKey: PRICING_ZONES_QUERY_KEY,
    queryFn: fetchPricingZones,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    placeholderData: [FALLBACK_ZONE],
  });

  const zones = data || [FALLBACK_ZONE];

  const getZoneBySlug = (slug: string): PricingZone | undefined => {
    return zones.find((z) => z.slug === slug);
  };

  const getZoneById = (id: string): PricingZone | undefined => {
    return zones.find((z) => z.id === id);
  };

  const getDefaultZone = (): PricingZone => {
    // Prefer Zone 3 Michigan as the default
    const zone3 = zones.find((z) => z.slug === 'zone-3-michigan');
    return zone3 || zones[0] || FALLBACK_ZONE;
  };

  const getSiteworkCosts = (zoneSlug?: string): SiteworkCosts => {
    const zone = zoneSlug ? getZoneBySlug(zoneSlug) : getDefaultZone();
    const z = zone || FALLBACK_ZONE;

    const buffer = Math.round(z.baseline_total * z.contingency_buffer);
    const feesTotal = z.permits_soft_costs + z.utility_authority_fees;

    return {
      baseline: z.baseline_total,
      buffer,
      crane: z.crane_cost,
      homeSet: z.home_set_cost,
      onSitePortion: z.on_site_portion,
      total: z.baseline_total + buffer,
      permitsSoftCosts: z.permits_soft_costs,
      utilityAuthorityFees: z.utility_authority_fees,
      feesTotal,
    };
  };

  return {
    zones,
    isLoading,
    error: error as Error | null,
    getZoneBySlug,
    getZoneById,
    getDefaultZone,
    getSiteworkCosts,
  };
}

export default usePricingZones;
