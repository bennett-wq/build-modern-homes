// ============================================================================
// Lots Data Loader Hook
// Fetches lots for a specific development from Supabase
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Lot, LotRow, LotPolygonPoint, LotRestrictions } from '@/types/database';
import { grandHavenLots } from '@/data/lots/grand-haven';

// ============================================================================
// Query Key Factory
// ============================================================================

export const LOTS_QUERY_KEY = (developmentId: string) => ['lots', developmentId] as const;

// ============================================================================
// Fetcher
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
  // For now, only grand-haven has static data
  if (developmentId === 'grand-haven' || developmentId.includes('grand')) {
    return grandHavenLots.map((lot) => ({
      id: lot.id.toString(),
      development_id: developmentId,
      lot_number: lot.label,
      status: lot.status,
      acreage: lot.acreage || null,
      net_acreage: lot.netAcreage || null,
      premium: lot.premium || 0,
      polygon_coordinates: lot.polygon,
      restrictions: {},
      notes: lot.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  return [];
}

// ============================================================================
// Hook
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

export default useLots;
