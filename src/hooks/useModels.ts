// ============================================================================
// Models Data Loader Hook
// Fetches models with pricing from Supabase, with static fallback
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Model, ModelRow, ModelPricingRow, BuildType } from '@/types/database';
import { models as staticModels } from '@/data/pricing-config';

// ============================================================================
// Query Key
// ============================================================================

export const MODELS_QUERY_KEY = ['models'] as const;

// ============================================================================
// Fetcher
// ============================================================================

async function fetchModels(): Promise<Model[]> {
  // Fetch models
  const { data: modelRows, error: modelsError } = await supabase
    .from('models')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (modelsError) {
    console.error('[useModels] Error fetching models:', modelsError);
    throw modelsError;
  }

  if (!modelRows || modelRows.length === 0) {
    console.info('[useModels] No models in database, using static fallback');
    return mapStaticModelsToDbShape();
  }

  // Fetch current pricing for all models
  const { data: pricingRows, error: pricingError } = await supabase
    .from('model_pricing')
    .select('*')
    .eq('is_current', true);

  if (pricingError) {
    console.warn('[useModels] Error fetching pricing, models will have no pricing:', pricingError);
  }

  // Join pricing to models
  const models: Model[] = modelRows.map((model) => {
    const modelPricing = (pricingRows || []).filter((p) => p.model_id === model.id);
    const pricingByType: Model['pricing'] = {};

    modelPricing.forEach((p) => {
      if (p.build_type === 'xmod') {
        pricingByType.xmod = p;
      } else if (p.build_type === 'mod') {
        pricingByType.mod = p;
      }
    });

    return {
      ...model,
      pricing: Object.keys(pricingByType).length > 0 ? pricingByType : undefined,
    };
  });

  return models;
}

// ============================================================================
// Static Fallback Mapper
// ============================================================================

function mapStaticModelsToDbShape(): Model[] {
  return staticModels.map((sm, index) => ({
    id: sm.slug, // Use slug as ID for fallback
    slug: sm.slug,
    name: sm.name,
    beds: sm.beds,
    baths: sm.baths,
    sqft: sm.sqft,
    length: sm.length,
    description: null,
    tagline: null,
    badge: null,
    hero_image_url: sm.heroImage || null,
    floorplan_image_url: null,
    floorplan_pdf_url: sm.floorPlanPdf || null,
    is_active: true,
    display_order: index,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pricing: sm.pricing
      ? {
          ...(sm.pricing.xmod && {
            xmod: mapStaticPricingToRow(sm.slug, 'xmod', sm.pricing.xmod),
          }),
          ...(sm.pricing.mod && {
            mod: mapStaticPricingToRow(sm.slug, 'mod', sm.pricing.mod),
          }),
        }
      : undefined,
  }));
}

function mapStaticPricingToRow(
  modelId: string,
  buildType: BuildType,
  pricing: {
    base_cost: number;
    options_adjustment: number;
    freight: number;
    mhi_dues: number;
    factory_quote_total: number;
    freightPending?: boolean;
  }
): ModelPricingRow {
  return {
    id: `${modelId}-${buildType}`,
    model_id: modelId,
    build_type: buildType,
    foundation_type: 'slab',
    base_home_price: pricing.factory_quote_total,
    freight_allowance: pricing.freight,
    freight_pending: pricing.freightPending || false,
    pricing_source: 'static-fallback',
    is_current: true,
    effective_from: new Date().toISOString(),
    created_at: new Date().toISOString(),
    created_by: null,
  };
}

// ============================================================================
// Hook
// ============================================================================

export interface UseModelsResult {
  models: Model[];
  isLoading: boolean;
  error: Error | null;
  getModelBySlug: (slug: string) => Model | undefined;
  getModelById: (id: string) => Model | undefined;
  getAvailableBuildTypes: (model: Model) => BuildType[];
}

export function useModels(): UseModelsResult {
  const { data, isLoading, error } = useQuery({
    queryKey: MODELS_QUERY_KEY,
    queryFn: fetchModels,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 2,
    // Fallback to static data on error
    placeholderData: mapStaticModelsToDbShape,
  });

  const models = data || [];

  const getModelBySlug = (slug: string): Model | undefined => {
    // Normalize "hawthorn" to "hawthorne" for backward compatibility
    const normalizedSlug = slug === 'hawthorn' ? 'hawthorne' : slug;
    return models.find((m) => m.slug === normalizedSlug);
  };

  const getModelById = (id: string): Model | undefined => {
    return models.find((m) => m.id === id);
  };

  const getAvailableBuildTypes = (model: Model): BuildType[] => {
    const types: BuildType[] = [];
    if (model.pricing?.xmod) types.push('xmod');
    if (model.pricing?.mod) types.push('mod');
    // If no pricing data, check static models for build types
    if (types.length === 0) {
      const staticModel = staticModels.find((sm) => sm.slug === model.slug);
      if (staticModel) {
        return staticModel.buildTypes;
      }
    }
    return types;
  };

  return {
    models,
    isLoading,
    error: error as Error | null,
    getModelBySlug,
    getModelById,
    getAvailableBuildTypes,
  };
}

export default useModels;
