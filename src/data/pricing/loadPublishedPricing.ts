// ============================================================================
// Load Published Pricing from Database
// Falls back gracefully to local config if unavailable
// ============================================================================

import { supabase } from '@/integrations/supabase/client';
import type { PricingConfigData } from './types';

/**
 * Fetches the latest published pricing config from the database.
 * Returns null if:
 * - Supabase is not configured
 * - No published config exists
 * - Query fails
 * 
 * The app should fall back to local pricingConfig.ts in these cases.
 */
export async function loadPublishedPricing(): Promise<PricingConfigData | null> {
  try {
    // Query the latest published config
    const { data, error } = await supabase
      .from('pricing_configs')
      .select('id, config, label, effective_at, created_at')
      .eq('status', 'published')
      .order('effective_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.warn('[loadPublishedPricing] Query error:', error.message);
      }
      return null;
    }

    if (!data || !data.config) {
      if (import.meta.env.DEV) {
        console.log('[loadPublishedPricing] No published config found, using local fallback');
      }
      return null;
    }

    // The config is stored as JSONB, so it comes back as an object
    const rawConfig = data.config as unknown;
    
    // Basic validation - ensure required keys exist
    if (!validatePricingConfig(rawConfig)) {
      if (import.meta.env.DEV) {
        console.warn('[loadPublishedPricing] Remote config failed validation, using local fallback');
      }
      return null;
    }

    // Add effective_at to the config for display purposes
    return {
      ...rawConfig,
      effectiveAt: data.effective_at || data.created_at,
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[loadPublishedPricing] Exception:', err);
    }
    return null;
  }
}

/**
 * Minimal runtime validation to ensure the config has required structure.
 * This prevents crashes if remote config is malformed.
 */
function validatePricingConfig(config: unknown): config is PricingConfigData {
  if (!config || typeof config !== 'object') return false;
  
  const c = config as Record<string, unknown>;
  
  // Check for required top-level keys
  if (!Array.isArray(c.models)) return false;
  if (!Array.isArray(c.options)) return false;
  if (typeof c.siteCosts !== 'object') return false;
  if (typeof c.fees !== 'object') return false;
  if (typeof c.markups !== 'object') return false;
  
  // Check that models array has at least one entry with required fields
  if (c.models.length > 0) {
    const firstModel = c.models[0] as Record<string, unknown>;
    if (typeof firstModel.slug !== 'string') return false;
    if (!Array.isArray(firstModel.pricing)) return false;
  }
  
  return true;
}
