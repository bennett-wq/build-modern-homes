// ============================================================================
// Developments Data Loader Hook
// Fetches developments from Supabase, with static fallback
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Development, DevelopmentRow, PricingZoneRow } from '@/types/database';
import { developments as staticDevelopments } from '@/data/developments';

// ============================================================================
// Query Keys
// ============================================================================

export const DEVELOPMENTS_QUERY_KEY = ['developments'] as const;

// ============================================================================
// Fetcher
// ============================================================================

async function fetchDevelopments(): Promise<Development[]> {
  // Fetch developments with pricing zone
  const { data: devRows, error: devsError } = await supabase
    .from('developments')
    .select(`
      *,
      pricing_zones (*)
    `)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (devsError) {
    console.error('[useDevelopments] Error fetching developments:', devsError);
    throw devsError;
  }

  if (!devRows || devRows.length === 0) {
    console.info('[useDevelopments] No developments in database, using static fallback');
    return mapStaticDevelopmentsToDbShape();
  }

  // Fetch conforming models junction
  const { data: conformingModels } = await supabase
    .from('development_conforming_models')
    .select('development_id, model_id');

  // Fetch ARB packages junction
  const { data: arbPackages } = await supabase
    .from('development_arb_packages')
    .select('development_id, exterior_package_id');

  // Map to Development type
  const developments: Development[] = devRows.map((dev) => {
    const conformingModelIds = (conformingModels || [])
      .filter((cm) => cm.development_id === dev.id)
      .map((cm) => cm.model_id);

    const arbPackageIds = (arbPackages || [])
      .filter((ap) => ap.development_id === dev.id)
      .map((ap) => ap.exterior_package_id);

    return {
      ...dev,
      pricingZone: dev.pricing_zones as PricingZoneRow | undefined,
      conformingModelIds: conformingModelIds.length > 0 ? conformingModelIds : undefined,
      arbPackageIds: arbPackageIds.length > 0 ? arbPackageIds : undefined,
    };
  });

  return developments;
}

// ============================================================================
// Static Fallback Mapper
// ============================================================================

function mapStaticDevelopmentsToDbShape(): Development[] {
  return staticDevelopments.map((sd) => ({
    id: sd.slug, // Use slug as ID for fallback
    slug: sd.slug,
    name: sd.name,
    city: sd.city,
    state: sd.state,
    description: sd.description || null,
    status: sd.status,
    site_plan_image_url: sd.sitePlanImagePath || null,
    arb_guidelines_url: sd.arbGuidelinesUrl || null,
    pricing_zone_id: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Map conforming models from slugs (static uses slugs, DB uses IDs)
    conformingModelIds: sd.conformingModels,
    arbPackageIds: sd.arbReadyPackages,
  }));
}

// ============================================================================
// Hook
// ============================================================================

export interface UseDevelopmentsResult {
  developments: Development[];
  isLoading: boolean;
  error: Error | null;
  getDevelopmentBySlug: (slug: string) => Development | undefined;
  getDevelopmentById: (id: string) => Development | undefined;
  activeDevelopments: Development[];
}

export function useDevelopments(): UseDevelopmentsResult {
  const { data, isLoading, error } = useQuery({
    queryKey: DEVELOPMENTS_QUERY_KEY,
    queryFn: fetchDevelopments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    placeholderData: mapStaticDevelopmentsToDbShape,
  });

  const developments = data || [];

  const getDevelopmentBySlug = (slug: string): Development | undefined => {
    return developments.find((d) => d.slug === slug);
  };

  const getDevelopmentById = (id: string): Development | undefined => {
    return developments.find((d) => d.id === id);
  };

  const activeDevelopments = developments.filter((d) => d.status === 'active');

  return {
    developments,
    isLoading,
    error: error as Error | null,
    getDevelopmentBySlug,
    getDevelopmentById,
    activeDevelopments,
  };
}

export default useDevelopments;
