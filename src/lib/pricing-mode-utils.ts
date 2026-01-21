// ============================================================================
// Pricing Mode Derivation Utility
// Derives correct pricing mode from user intent and selection state
// ============================================================================

import type { PricingMode } from '@/data/pricing-layers';
import type { BuildIntent } from '@/data/pricing-config';

export interface PricingModeContext {
  buildIntent: BuildIntent | null;
  hasLotSelected: boolean;
  servicePackage?: 'delivered_installed' | 'supply_only';
}

/**
 * Derives the correct pricing mode based on user intent and selection
 * 
 * Rules:
 * - If buildIntent == "basemod-community" AND a lot is selected => "community_all_in"
 * - Else if user selected "Delivered & Installed" service package (default) => "delivered_installed"
 * - Else => "supply_only"
 */
export function derivePricingMode(context: PricingModeContext): PricingMode {
  const { buildIntent, hasLotSelected, servicePackage = 'delivered_installed' } = context;
  
  // Community flow with lot selected = all-in pricing
  if (buildIntent === 'basemod-community' && hasLotSelected) {
    return 'community_all_in';
  }
  
  // User chose supply only
  if (servicePackage === 'supply_only') {
    return 'supply_only';
  }
  
  // Default to delivered & installed
  return 'delivered_installed';
}

/**
 * Get display label for pricing mode (shown next to totals)
 * These are the CANONICAL buyer-facing labels
 */
export function getPricingModeLabel(mode: PricingMode): string {
  switch (mode) {
    case 'community_all_in':
      return 'All-in Price (Includes Lot)';
    case 'delivered_installed':
      return 'Delivered & Installed Estimate';
    case 'supply_only':
      return 'Home Package Only';
    default:
      return 'Estimate';
  }
}

/**
 * Get short label for compact displays
 */
export function getPricingModeShortLabel(mode: PricingMode): string {
  switch (mode) {
    case 'community_all_in':
      return 'All-in';
    case 'delivered_installed':
      return 'Installed';
    case 'supply_only':
      return 'Home only';
    default:
      return 'Est.';
  }
}

/**
 * Get secondary description for pricing mode
 */
export function getPricingModeDescription(mode: PricingMode): string {
  switch (mode) {
    case 'community_all_in':
      return 'Turnkey pricing in a BaseMod community';
    case 'delivered_installed':
      return 'Factory home delivered and installed on your land';
    case 'supply_only':
      return 'Factory home only, excludes delivery and installation';
    default:
      return '';
  }
}
