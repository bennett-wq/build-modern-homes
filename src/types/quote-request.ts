// ============================================================================
// Quote Request Types
// Data structures for capturing buyer quote requests
// ============================================================================

import type { PricingMode } from '@/data/pricing-layers';
import type { BuyerFacingBreakdown } from '@/hooks/usePricingEngine';
import type { BuyerPricingFlags } from '@/components/pricing/BuyerPricingDisplay';

export type QuoteRequestType = 'build-on-my-land' | 'find-land' | 'basemod-community';

export type UtilityType = 'public' | 'well' | 'septic' | 'unknown';
export type FoundationType = 'crawl' | 'basement' | 'unknown';
export type SlopeType = 'flat' | 'moderate' | 'steep' | 'unknown';
export type TimelineType = 'asap' | '3-6-months' | '6-12-months' | '12-plus-months' | 'unknown';
export type BudgetRange = 'under-300k' | '300k-400k' | '400k-500k' | '500k-plus' | 'unknown';

// Contact info common to all quote types
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

// Build on My Land specific fields
export interface BuildOnMyLandDetails {
  hasLand: boolean;
  address?: string;
  city?: string;
  state?: string;
  waterType: UtilityType;
  sewerType: UtilityType;
  foundationPreference: FoundationType;
  slopeType: SlopeType;
  notes?: string;
}

// Find Land specific fields
export interface FindLandDetails {
  targetArea: string;
  budgetRange: BudgetRange;
  timeline: TimelineType;
  notes?: string;
}

// BaseMod Community specific fields
export interface CommunityInterestDetails {
  preferredCommunity?: string;
  preferredLotId?: number;
  timeline: TimelineType;
  notes?: string;
}

// Selection summary for the quote
export interface SelectionSummary {
  developmentSlug?: string;
  developmentName?: string;
  lotId?: number;
  lotLabel?: string;
  modelSlug?: string;
  modelName?: string;
  buildType?: string;
  packageId?: string;
  packageName?: string;
  garageDoorId?: string;
  garageDoorName?: string;
}

// Main QuoteRequest interface
export interface QuoteRequest {
  id: string;
  type: QuoteRequestType;
  createdAt: string;
  
  // Contact information
  contact: ContactInfo;
  
  // Type-specific details
  buildOnMyLandDetails?: BuildOnMyLandDetails;
  findLandDetails?: FindLandDetails;
  communityInterestDetails?: CommunityInterestDetails;
  
  // Selection summary
  selection: SelectionSummary;
  
  // Pricing snapshot (buyer-facing only, no cost-plus)
  buyerFacingBreakdown?: BuyerFacingBreakdown;
  pricingFlags?: BuyerPricingFlags;
  pricingMode: PricingMode;
  
  // Status
  status: 'pending' | 'contacted' | 'quoted' | 'converted' | 'closed';
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const QUOTE_STORAGE_KEY = 'basemod-quote-requests';

/**
 * Generate a unique quote ID
 */
export function generateQuoteId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `Q${timestamp}${random}`.toUpperCase();
}

/**
 * Save a quote request to localStorage
 */
export function saveQuoteRequest(quote: QuoteRequest): void {
  try {
    const existing = getQuoteRequests();
    const updated = [quote, ...existing.filter(q => q.id !== quote.id)];
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save quote request:', e);
  }
}

/**
 * Get all quote requests from localStorage
 */
export function getQuoteRequests(): QuoteRequest[] {
  try {
    const stored = localStorage.getItem(QUOTE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as QuoteRequest[];
    }
  } catch (e) {
    console.error('Failed to load quote requests:', e);
  }
  return [];
}

/**
 * Get a single quote request by ID
 */
export function getQuoteRequestById(id: string): QuoteRequest | null {
  const quotes = getQuoteRequests();
  return quotes.find(q => q.id === id) || null;
}

/**
 * Generate a shareable quote URL
 */
export function getQuoteShareableUrl(quoteId: string): string {
  const base = window.location.origin;
  return `${base}/quote/${quoteId}`;
}
