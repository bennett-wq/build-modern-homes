// ============================================================================
// Upgrade Options Data Loader Hook
// Fetches upgrade options from Supabase, with static fallback
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UpgradeOption, BuildType, UpgradeCategory } from '@/types/database';
import { models as staticModels } from '@/data/pricing-config';

// ============================================================================
// Query Keys
// ============================================================================

export const UPGRADE_OPTIONS_QUERY_KEY = ['upgrade-options'] as const;

// ============================================================================
// Fetcher
// ============================================================================

async function fetchUpgradeOptions(): Promise<UpgradeOption[]> {
  const { data, error } = await supabase
    .from('upgrade_options')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[useUpgradeOptions] Error fetching upgrade options:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.info('[useUpgradeOptions] No upgrade options in database, using static fallback');
    return mapStaticOptionsToDbShape();
  }

  return data;
}

// ============================================================================
// Static Fallback Mapper
// ============================================================================

function mapStaticOptionsToDbShape(): UpgradeOption[] {
  const options: UpgradeOption[] = [];
  let orderIndex = 0;

  // Extract floor plan options from each static model
  staticModels.forEach((model) => {
    model.floorPlanOptions.forEach((opt) => {
      // Check if we already have this option (by ID)
      const existing = options.find((o) => o.slug === opt.id);
      if (existing) {
        // Add model to applies_to_models if not already there
        if (existing.applies_to_models && !existing.applies_to_models.includes(model.slug)) {
          existing.applies_to_models.push(model.slug);
        }
        return;
      }

      options.push({
        id: opt.id,
        slug: opt.id,
        label: opt.name,
        description: opt.description,
        category: 'floor_plan' as UpgradeCategory,
        base_price: opt.price,
        applies_to_models: [model.slug],
        applies_to_build_types: opt.buildTypes || null,
        is_active: opt.available,
        display_order: orderIndex++,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
  });

  return options;
}

// ============================================================================
// Hook
// ============================================================================

export interface UseUpgradeOptionsResult {
  options: UpgradeOption[];
  isLoading: boolean;
  error: Error | null;
  getOptionById: (id: string) => UpgradeOption | undefined;
  getOptionBySlug: (slug: string) => UpgradeOption | undefined;
  floorPlanOptions: UpgradeOption[];
  exteriorOptions: UpgradeOption[];
  garageOptions: UpgradeOption[];
}

export function useUpgradeOptions(): UseUpgradeOptionsResult {
  const { data, isLoading, error } = useQuery({
    queryKey: UPGRADE_OPTIONS_QUERY_KEY,
    queryFn: fetchUpgradeOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    placeholderData: mapStaticOptionsToDbShape,
  });

  const options = data || [];

  const getOptionById = (id: string): UpgradeOption | undefined => {
    return options.find((o) => o.id === id);
  };

  const getOptionBySlug = (slug: string): UpgradeOption | undefined => {
    return options.find((o) => o.slug === slug);
  };

  const floorPlanOptions = options.filter((o) => o.category === 'floor_plan');
  const exteriorOptions = options.filter((o) => o.category === 'exterior');
  const garageOptions = options.filter((o) => o.category === 'garage');

  return {
    options,
    isLoading,
    error: error as Error | null,
    getOptionById,
    getOptionBySlug,
    floorPlanOptions,
    exteriorOptions,
    garageOptions,
  };
}

// ============================================================================
// Filtered Hook (for model/build type specific options)
// ============================================================================

export interface UseFilteredUpgradeOptionsResult extends UseUpgradeOptionsResult {
  filteredOptions: UpgradeOption[];
  filteredFloorPlanOptions: UpgradeOption[];
}

export function useFilteredUpgradeOptions(
  modelId?: string | null,
  buildType?: BuildType | null
): UseFilteredUpgradeOptionsResult {
  const base = useUpgradeOptions();

  const filterOption = (opt: UpgradeOption): boolean => {
    // Check model filter
    if (modelId && opt.applies_to_models && opt.applies_to_models.length > 0) {
      if (!opt.applies_to_models.includes(modelId)) {
        return false;
      }
    }

    // Check build type filter
    if (buildType && opt.applies_to_build_types && opt.applies_to_build_types.length > 0) {
      if (!opt.applies_to_build_types.includes(buildType)) {
        return false;
      }
    }

    return true;
  };

  const filteredOptions = base.options.filter(filterOption);
  const filteredFloorPlanOptions = base.floorPlanOptions.filter(filterOption);

  return {
    ...base,
    filteredOptions,
    filteredFloorPlanOptions,
  };
}

export default useUpgradeOptions;
