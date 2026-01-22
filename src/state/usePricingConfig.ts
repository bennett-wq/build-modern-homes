// ============================================================================
// Pricing Configuration Store
// Runtime state for dynamic pricing with localStorage caching (stale-while-revalidate)
// ============================================================================

import { create } from 'zustand';
import type { PricingConfigData } from '@/data/pricing/types';
import { loadPublishedPricing } from '@/data/pricing/loadPublishedPricing';
import { getLocalPricingConfig } from '@/data/pricing/localConfig';

const CACHE_KEY = 'basemod_pricing_cache';
const CACHE_VERSION_KEY = 'basemod_pricing_cache_version';
const CACHE_TIMESTAMP_KEY = 'basemod_pricing_cache_timestamp';
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface PricingConfigState {
  /** The active pricing configuration */
  pricingConfig: PricingConfigData;
  /** Source of the current config */
  pricingSource: 'local' | 'remote' | 'cached';
  /** Label/version from the remote config if available */
  pricingVersionLabel: string;
  /** Whether a refresh is in progress */
  isLoading: boolean;
  /** Error message if refresh failed */
  error: string | null;
  /** Timestamp of last refresh */
  lastRefreshed: Date | null;
  /** Timestamp of the config effective date */
  effectiveDate: Date | null;
  /** Fetch and apply the latest published pricing (stale-while-revalidate) */
  refreshPricing: () => Promise<void>;
}

// Load cached config from localStorage
function loadCachedConfig(): PricingConfigData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;
    
    // Check if cache is stale (older than 24 hours)
    const cacheAge = Date.now() - parseInt(timestamp, 10);
    if (cacheAge > CACHE_MAX_AGE_MS) {
      // Cache is too old, clear it
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_VERSION_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    return JSON.parse(cached) as PricingConfigData;
  } catch {
    return null;
  }
}

// Save config to localStorage cache
function saveCacheConfig(config: PricingConfigData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(config));
    localStorage.setItem(CACHE_VERSION_KEY, config.version || 'unknown');
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[usePricingConfig] Failed to cache config:', err);
    }
  }
}

// Get initial config: cached -> local fallback
function getInitialConfig(): { config: PricingConfigData; source: 'local' | 'cached' } {
  const cached = loadCachedConfig();
  if (cached) {
    return { config: cached, source: 'cached' };
  }
  return { config: getLocalPricingConfig(), source: 'local' };
}

const initial = getInitialConfig();

export const usePricingConfig = create<PricingConfigState>((set, get) => ({
  // Start with cached or local config for instant display
  pricingConfig: initial.config,
  pricingSource: initial.source,
  pricingVersionLabel: initial.config.version,
  isLoading: false,
  error: null,
  lastRefreshed: null,
  effectiveDate: null,

  refreshPricing: async () => {
    // Don't refresh if already loading
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const remoteConfig = await loadPublishedPricing();

      if (remoteConfig) {
        // Save to cache for next page load
        saveCacheConfig(remoteConfig);
        
        set({
          pricingConfig: remoteConfig,
          pricingSource: 'remote',
          pricingVersionLabel: remoteConfig.version || 'Remote',
          isLoading: false,
          lastRefreshed: new Date(),
          effectiveDate: remoteConfig.effectiveAt ? new Date(remoteConfig.effectiveAt) : null,
        });

        if (import.meta.env.DEV) {
          console.log('[usePricingConfig] Loaded remote config:', remoteConfig.version);
        }
      } else {
        // No remote config available, use cached or local
        const fallback = getInitialConfig();
        set({
          pricingConfig: fallback.config,
          pricingSource: fallback.source,
          pricingVersionLabel: fallback.config.version,
          isLoading: false,
          lastRefreshed: new Date(),
        });

        if (import.meta.env.DEV) {
          console.log('[usePricingConfig] Using fallback config:', fallback.source);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pricing';
      
      // On error, keep current config (stale-while-revalidate)
      set({
        isLoading: false,
        error: errorMessage,
        lastRefreshed: new Date(),
      });

      if (import.meta.env.DEV) {
        console.error('[usePricingConfig] Refresh error:', err);
      }
    }
  },
}));

/**
 * Hook to get just the pricing config (most common use case)
 */
export function useActivePricingConfig(): PricingConfigData {
  return usePricingConfig((state) => state.pricingConfig);
}

/**
 * Non-reactive getter for the current pricing config
 * Use this in pure functions that shouldn't trigger re-renders
 */
export function getActivePricingConfig(): PricingConfigData {
  return usePricingConfig.getState().pricingConfig;
}

/**
 * Get formatted pricing update date for UI display
 */
export function usePricingUpdateInfo(): { date: string | null; source: string } {
  const lastRefreshed = usePricingConfig((state) => state.lastRefreshed);
  const effectiveDate = usePricingConfig((state) => state.effectiveDate);
  const source = usePricingConfig((state) => state.pricingSource);
  
  const displayDate = effectiveDate || lastRefreshed;
  
  return {
    date: displayDate ? displayDate.toLocaleDateString() : null,
    source: source === 'remote' ? 'Live' : source === 'cached' ? 'Cached' : 'Default',
  };
}
