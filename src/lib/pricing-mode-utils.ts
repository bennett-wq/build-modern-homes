// ============================================================================
// Pricing Mode Derivation Utility
// Derives correct pricing mode from user intent and selection state
// Includes ZIP-to-Zone mapping for location-based estimates
// ============================================================================

import type { PricingMode } from '@/data/pricing-layers';
import type { BuildIntent } from '@/data/pricing-config';

// Canonical service package types
export type ServicePackageType = 'delivered_installed' | 'supply_only' | 'community_all_in';

export interface PricingModeContext {
  buildIntent: BuildIntent | null;
  hasLotSelected: boolean;
  servicePackage?: ServicePackageType;
}

// ============================================================================
// ZIP → Zone Mapping
// ============================================================================

export interface ZipZoneResult {
  zoneId: string;
  isKnownZip: boolean;
  regionLabel: string | null; // e.g., "481xx" for display
}

/**
 * Maps a ZIP code to a pricing zone.
 * Currently all ZIPs map to zone-3 (baseline).
 * Future: Add actual ZIP prefix → zone mappings.
 */
export function getZoneForZip(zip: string): ZipZoneResult {
  const cleanZip = zip.replace(/\D/g, '').slice(0, 5);
  
  // No ZIP provided
  if (!cleanZip || cleanZip.length < 5) {
    return {
      zoneId: 'zone-3',
      isKnownZip: false,
      regionLabel: null,
    };
  }
  
  // Extract ZIP prefix for display (e.g., "48103" → "481xx")
  const zipPrefix = cleanZip.slice(0, 3);
  const regionLabel = `${zipPrefix}xx`;
  
  // Future: Add actual zone mappings here
  // const zipPrefixMappings: Record<string, string> = {
  //   '481': 'zone-3', // Washtenaw
  //   '482': 'zone-3', // Detroit area
  //   '483': 'zone-2', // ...etc
  // };
  
  // For now, all valid ZIPs map to zone-3
  return {
    zoneId: 'zone-3',
    isKnownZip: true,
    regionLabel,
  };
}

/**
 * Determines estimate confidence based on location knowledge
 */
export function getLocationConfidence(
  zipCode: string,
  locationKnown: boolean | null
): 'high' | 'medium' | 'low' {
  // User explicitly said they don't know their location
  if (locationKnown === false) {
    return 'low';
  }
  
  // Valid ZIP entered
  const { isKnownZip } = getZoneForZip(zipCode);
  if (isKnownZip) {
    return 'high';
  }
  
  // No location info yet
  return 'low';
}

/**
 * Derives the correct pricing mode based on user intent and selection
 * 
 * Rules:
 * - If servicePackage == "community_all_in" AND a lot is selected => "community_all_in"
 * - If buildIntent == "basemod-community" AND a lot is selected => "community_all_in"
 * - Else if user selected "supply_only" service package => "supply_only"
 * - Else => "delivered_installed" (default)
 */
export function derivePricingMode(context: PricingModeContext): PricingMode {
  const { buildIntent, hasLotSelected, servicePackage = 'delivered_installed' } = context;
  
  // User explicitly chose community all-in (requires lot)
  if (servicePackage === 'community_all_in' && hasLotSelected) {
    return 'community_all_in';
  }
  
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
