// ============================================================================
// Pricing Configuration Store
// Runtime state for dynamic pricing with local fallback
// ============================================================================

import { create } from 'zustand';
import type { PricingConfigData } from '@/data/pricing/types';
import { loadPublishedPricing } from '@/data/pricing/loadPublishedPricing';
import { getLocalPricingConfig } from '@/data/pricing/localConfig';

interface PricingConfigState {
  /** The active pricing configuration */
  pricingConfig: PricingConfigData;
  /** Source of the current config */
  pricingSource: 'local' | 'remote';
  /** Label/version from the remote config if available */
  pricingVersionLabel: string;
  /** Whether a refresh is in progress */
  isLoading: boolean;
  /** Error message if refresh failed */
  error: string | null;
  /** Timestamp of last refresh */
  lastRefreshed: Date | null;
  /** Fetch and apply the latest published pricing */
  refreshPricing: () => Promise<void>;
}

export const usePricingConfig = create<PricingConfigState>((set, get) => ({
  // Default to local config on initial load
  pricingConfig: getLocalPricingConfig(),
  pricingSource: 'local',
  pricingVersionLabel: getLocalPricingConfig().version,
  isLoading: false,
  error: null,
  lastRefreshed: null,

  refreshPricing: async () => {
    // Don't refresh if already loading
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const remoteConfig = await loadPublishedPricing();

      if (remoteConfig) {
        set({
          pricingConfig: remoteConfig,
          pricingSource: 'remote',
          pricingVersionLabel: remoteConfig.version || 'Remote',
          isLoading: false,
          lastRefreshed: new Date(),
        });

        if (import.meta.env.DEV) {
          console.log('[usePricingConfig] Loaded remote config:', remoteConfig.version);
        }
      } else {
        // Keep local config if remote is unavailable
        const localConfig = getLocalPricingConfig();
        set({
          pricingConfig: localConfig,
          pricingSource: 'local',
          pricingVersionLabel: localConfig.version,
          isLoading: false,
          lastRefreshed: new Date(),
        });

        if (import.meta.env.DEV) {
          console.log('[usePricingConfig] Using local fallback config');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pricing';
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
