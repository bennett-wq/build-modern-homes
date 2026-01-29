// ============================================================================
// Pricing Markups Data Loader Hook
// Fetches retail markup percentages from Supabase
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export interface PricingMarkup {
  id: string;
  name: string;
  dealer_markup_pct: number;
  installer_markup_pct: number;
  developer_markup_pct: number;
  is_default: boolean;
  effective_from: string;
  created_at: string;
  created_by: string | null;
}

// Computed markup config for use in pricing engine
export interface MarkupConfig {
  dealerMarkupPct: number;
  installerMarkupPct: number;
  developerMarkupPct: number;
}

// Multipliers for convenience
export interface MarkupMultipliers {
  home: number; // 1 + dealerMarkupPct
  sitework: number; // 1 + installerMarkupPct
  options: number; // 1 + dealerMarkupPct (same as home)
  developer: number; // 1 + developerMarkupPct
}

// ============================================================================
// Query Key
// ============================================================================

export const PRICING_MARKUPS_QUERY_KEY = ['pricing-markups'] as const;

// ============================================================================
// Static Fallback (20% default)
// ============================================================================

const FALLBACK_MARKUP: PricingMarkup = {
  id: 'fallback-markup',
  name: 'Standard Retail Markup',
  dealer_markup_pct: 0.20,
  installer_markup_pct: 0.20,
  developer_markup_pct: 0.05,
  is_default: true,
  effective_from: new Date().toISOString(),
  created_at: new Date().toISOString(),
  created_by: null,
};

// ============================================================================
// Fetcher
// ============================================================================

async function fetchPricingMarkups(): Promise<PricingMarkup[]> {
  const { data, error } = await supabase
    .from('pricing_markups')
    .select('*')
    .order('is_default', { ascending: false })
    .order('effective_from', { ascending: false });

  if (error) {
    console.error('[usePricingMarkups] Error fetching pricing markups:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.info('[usePricingMarkups] No pricing markups in database, using fallback');
    return [FALLBACK_MARKUP];
  }

  return data;
}

// ============================================================================
// Hook
// ============================================================================

export interface UsePricingMarkupsResult {
  markups: PricingMarkup[];
  isLoading: boolean;
  error: Error | null;
  getDefaultMarkup: () => PricingMarkup;
  getMarkupConfig: () => MarkupConfig;
  getMultipliers: () => MarkupMultipliers;
  applyMarkup: (baseAmount: number, markupPct: number) => number;
  getMarkupAmount: (baseAmount: number, markupPct: number) => number;
}

export function usePricingMarkups(): UsePricingMarkupsResult {
  const { data, isLoading, error } = useQuery({
    queryKey: PRICING_MARKUPS_QUERY_KEY,
    queryFn: fetchPricingMarkups,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    placeholderData: [FALLBACK_MARKUP],
  });

  const markups = data || [FALLBACK_MARKUP];

  const getDefaultMarkup = (): PricingMarkup => {
    const defaultMarkup = markups.find((m) => m.is_default);
    return defaultMarkup || markups[0] || FALLBACK_MARKUP;
  };

  const getMarkupConfig = (): MarkupConfig => {
    const m = getDefaultMarkup();
    return {
      dealerMarkupPct: m.dealer_markup_pct,
      installerMarkupPct: m.installer_markup_pct,
      developerMarkupPct: m.developer_markup_pct,
    };
  };

  const getMultipliers = (): MarkupMultipliers => {
    const m = getDefaultMarkup();
    return {
      home: 1 + m.dealer_markup_pct,
      sitework: 1 + m.installer_markup_pct,
      options: 1 + m.dealer_markup_pct,
      developer: 1 + m.developer_markup_pct,
    };
  };

  const applyMarkup = (baseAmount: number, markupPct: number): number => {
    return Math.round(baseAmount * (1 + markupPct));
  };

  const getMarkupAmount = (baseAmount: number, markupPct: number): number => {
    return Math.round(baseAmount * markupPct);
  };

  return {
    markups,
    isLoading,
    error: error as Error | null,
    getDefaultMarkup,
    getMarkupConfig,
    getMultipliers,
    applyMarkup,
    getMarkupAmount,
  };
}

export default usePricingMarkups;
