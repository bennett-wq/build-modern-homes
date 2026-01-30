// ============================================================================
// Lots Data Loader Hook
// Fetches lots for a specific development from Supabase
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Lot, LotRow, LotPolygonPoint, LotRestrictions } from '@/types/database';
import { grandHavenLots } from '@/data/lots/grand-haven';
import { stJamesBayLots } from '@/data/lots/st-james-bay';
import { ypsilantiLots } from '@/data/lots/ypsilanti';

// ============================================================================
// Query Key Factory
// ============================================================================

export const LOTS_QUERY_KEY = (developmentId: string) => ['lots', developmentId] as const;
export const LOTS_BY_SLUG_QUERY_KEY = (slug: string) => ['lots-by-slug', slug] as const;

// ============================================================================
// Fetcher by development ID
// ============================================================================

async function fetchLots(developmentId: string): Promise<Lot[]> {
  if (!developmentId) {
    return [];
  }

  const { data: lotRows, error } = await supabase
    .from('lots')
    .select('*')
    .eq('development_id', developmentId)
    .order('lot_number', { ascending: true });

  if (error) {
    console.error('[useLots] Error fetching lots:', error);
    throw error;
  }

  if (!lotRows || lotRows.length === 0) {
    console.info('[useLots] No lots in database for development, using static fallback');
    return getStaticFallbackLots(developmentId);
  }

  // Map to Lot type with typed JSON fields
  return lotRows.map(mapRowToLot);
}

// ============================================================================
// Fetcher by development slug
// ============================================================================

async function fetchLotsBySlug(slug: string): Promise<Lot[]> {
  if (!slug) {
    return [];
  }

  // First, get the development ID from the slug
  const { data: dev, error: devError } = await supabase
    .from('developments')
    .select('id')
    .eq('slug', slug)
    .single();

  if (devError || !dev) {
    console.info('[useLots] Development not found in database, using static fallback for slug:', slug);
    return getStaticFallbackLotsBySlug(slug);
  }

  // Fetch lots for this development
  const { data: lotRows, error } = await supabase
    .from('lots')
    .select('*')
    .eq('development_id', dev.id)
    .order('lot_number', { ascending: true });

  if (error) {
    console.error('[useLots] Error fetching lots by slug:', error);
    throw error;
  }

  if (!lotRows || lotRows.length === 0) {
    console.info('[useLots] No lots in database for slug, using static fallback:', slug);
    return getStaticFallbackLotsBySlug(slug);
  }

  return lotRows.map(mapRowToLot);
}

function mapRowToLot(row: LotRow): Lot {
  // Parse polygon coordinates from JSON
  let polygonCoordinates: LotPolygonPoint[] = [];
  if (Array.isArray(row.polygon_coordinates)) {
    polygonCoordinates = (row.polygon_coordinates as unknown) as LotPolygonPoint[];
  }

  // Parse restrictions from JSON
  let restrictions: LotRestrictions = {};
  if (row.restrictions && typeof row.restrictions === 'object') {
    restrictions = row.restrictions as LotRestrictions;
  }

  return {
    ...row,
    polygon_coordinates: polygonCoordinates,
    restrictions,
  };
}

// ============================================================================
// Static Fallback
// ============================================================================

function getStaticFallbackLots(developmentId: string): Lot[] {
  // Map static lot data based on development slug/id
  if (developmentId === 'grand-haven' || developmentId.includes('grand')) {
    return mapStaticLotsToDbFormat(grandHavenLots, developmentId);
  }
  if (developmentId === 'st-james-bay' || developmentId.includes('st-james')) {
    return mapStaticLotsToDbFormat(stJamesBayLots, developmentId);
  }
  if (developmentId === 'ypsilanti' || developmentId.includes('ypsi')) {
    return mapStaticLotsToDbFormat(ypsilantiLots, developmentId);
  }

  return [];
}

function getStaticFallbackLotsBySlug(slug: string): Lot[] {
  if (slug === 'grand-haven') {
    return mapStaticLotsToDbFormat(grandHavenLots, slug);
  }
  if (slug === 'st-james-bay') {
    return mapStaticLotsToDbFormat(stJamesBayLots, slug);
  }
  if (slug === 'ypsilanti') {
    return mapStaticLotsToDbFormat(ypsilantiLots, slug);
  }
  return [];
}

// Helper to map static lot format to database Lot format
function mapStaticLotsToDbFormat(staticLots: Array<{
  id: number;
  label: string;
  status: string;
  polygon?: Array<{ x: number; y: number }>;
  acreage?: number;
  netAcreage?: number;
  premium?: number;
  notes?: string;
  phase?: number;
}>, developmentId: string): Lot[] {
  return staticLots.map((lot) => ({
    id: lot.id.toString(),
    development_id: developmentId,
    lot_number: lot.label,
    status: lot.status as Lot['status'],
    acreage: lot.acreage || null,
    net_acreage: lot.netAcreage || null,
    premium: lot.premium || 0,
    polygon_coordinates: lot.polygon || [],
    restrictions: {},
    notes: lot.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

// ============================================================================
// Hook by Development ID
// ============================================================================

export interface UseLotsResult {
  lots: Lot[];
  isLoading: boolean;
  error: Error | null;
  getLotById: (id: string) => Lot | undefined;
  getLotByNumber: (number: string) => Lot | undefined;
  availableLots: Lot[];
  reservedLots: Lot[];
  soldLots: Lot[];
}

export function useLots(developmentId: string): UseLotsResult {
  const { data, isLoading, error } = useQuery({
    queryKey: LOTS_QUERY_KEY(developmentId),
    queryFn: () => fetchLots(developmentId),
    enabled: !!developmentId,
    staleTime: 1 * 60 * 1000, // 1 minute (lots change more frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const lots = data || [];

  const getLotById = (id: string): Lot | undefined => {
    return lots.find((l) => l.id === id);
  };

  const getLotByNumber = (number: string): Lot | undefined => {
    return lots.find((l) => l.lot_number === number);
  };

  const availableLots = lots.filter((l) => l.status === 'available');
  const reservedLots = lots.filter((l) => l.status === 'reserved');
  const soldLots = lots.filter((l) => l.status === 'sold');

  return {
    lots,
    isLoading,
    error: error as Error | null,
    getLotById,
    getLotByNumber,
    availableLots,
    reservedLots,
    soldLots,
  };
}

// ============================================================================
// Hook by Development Slug (convenience wrapper)
// ============================================================================

export function useLotsBySlug(slug: string): UseLotsResult {
  const { data, isLoading, error } = useQuery({
    queryKey: LOTS_BY_SLUG_QUERY_KEY(slug),
    queryFn: () => fetchLotsBySlug(slug),
    enabled: !!slug,
    staleTime: 1 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const lots = data || [];

  const getLotById = (id: string): Lot | undefined => {
    return lots.find((l) => l.id === id);
  };

  const getLotByNumber = (number: string): Lot | undefined => {
    return lots.find((l) => l.lot_number === number);
  };

  const availableLots = lots.filter((l) => l.status === 'available');
  const reservedLots = lots.filter((l) => l.status === 'reserved');
  const soldLots = lots.filter((l) => l.status === 'sold');

  return {
    lots,
    isLoading,
    error: error as Error | null,
    getLotById,
    getLotByNumber,
    availableLots,
    reservedLots,
    soldLots,
  };
}

export default useLots;
