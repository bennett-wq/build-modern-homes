// ============================================================================
// Exterior Packages Data Loader Hook
// Fetches exterior packages from Supabase, with static fallback
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ExteriorPackage } from '@/types/database';
import { exteriorPackages as staticPackages } from '@/data/packages';

// ============================================================================
// Query Keys
// ============================================================================

export const EXTERIOR_PACKAGES_QUERY_KEY = ['exterior-packages'] as const;

// ============================================================================
// Fetcher
// ============================================================================

async function fetchExteriorPackages(): Promise<ExteriorPackage[]> {
  const { data, error } = await supabase
    .from('exterior_packages')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[useExteriorPackages] Error fetching packages:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.info('[useExteriorPackages] No packages in database, using static fallback');
    return mapStaticPackagesToDbShape();
  }

  return data;
}

// ============================================================================
// Static Fallback Mapper
// ============================================================================

function mapStaticPackagesToDbShape(): ExteriorPackage[] {
  return staticPackages.map((sp, index) => ({
    id: sp.id,
    slug: sp.id,
    name: sp.name,
    description: sp.description,
    siding_color_hex: sp.sidingColor,
    trim_color_hex: sp.trimColor,
    accent_color_hex: sp.accentColor,
    roof_color_hex: sp.roofColor,
    upgrade_price: 0,
    is_active: true,
    display_order: index,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

// ============================================================================
// Hook
// ============================================================================

export interface UseExteriorPackagesResult {
  packages: ExteriorPackage[];
  isLoading: boolean;
  error: Error | null;
  getPackageById: (id: string) => ExteriorPackage | undefined;
  getPackageBySlug: (slug: string) => ExteriorPackage | undefined;
}

export function useExteriorPackages(): UseExteriorPackagesResult {
  const { data, isLoading, error } = useQuery({
    queryKey: EXTERIOR_PACKAGES_QUERY_KEY,
    queryFn: fetchExteriorPackages,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    placeholderData: mapStaticPackagesToDbShape,
  });

  const packages = data || [];

  const getPackageById = (id: string): ExteriorPackage | undefined => {
    return packages.find((p) => p.id === id);
  };

  const getPackageBySlug = (slug: string): ExteriorPackage | undefined => {
    return packages.find((p) => p.slug === slug);
  };

  return {
    packages,
    isLoading,
    error: error as Error | null,
    getPackageById,
    getPackageBySlug,
  };
}

// ============================================================================
// ARB-Filtered Hook (for development-specific restrictions)
// ============================================================================

export interface UseArbExteriorPackagesResult extends UseExteriorPackagesResult {
  arbReadyPackages: ExteriorPackage[];
  isArbRestricted: boolean;
}

export function useArbExteriorPackages(
  arbPackageIds?: string[]
): UseArbExteriorPackagesResult {
  const base = useExteriorPackages();

  const isArbRestricted = !!arbPackageIds && arbPackageIds.length > 0;

  const arbReadyPackages = isArbRestricted
    ? base.packages.filter((p) => arbPackageIds.includes(p.id) || arbPackageIds.includes(p.slug))
    : base.packages;

  return {
    ...base,
    arbReadyPackages,
    isArbRestricted,
  };
}

export default useExteriorPackages;
