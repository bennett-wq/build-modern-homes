// ============================================================================
// Garage Doors Data Loader Hook
// Fetches garage door options from Supabase, with static fallback
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GarageDoorOption } from '@/types/database';
import { garageDoors as staticGarageDoors } from '@/data/packages';

// ============================================================================
// Query Keys
// ============================================================================

export const GARAGE_DOORS_QUERY_KEY = ['garage-doors'] as const;

// ============================================================================
// Fetcher
// ============================================================================

async function fetchGarageDoors(): Promise<GarageDoorOption[]> {
  const { data, error } = await supabase
    .from('garage_door_options')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[useGarageDoors] Error fetching garage doors:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.info('[useGarageDoors] No garage doors in database, using static fallback');
    return mapStaticGarageDoorsToDbShape();
  }

  return data;
}

// ============================================================================
// Static Fallback Mapper
// ============================================================================

function mapStaticGarageDoorsToDbShape(): GarageDoorOption[] {
  return staticGarageDoors.map((sg, index) => ({
    id: sg.id,
    slug: sg.id,
    name: sg.name,
    description: sg.description,
    style: sg.style,
    color_hex: sg.color,
    price: 0,
    is_active: true,
    display_order: index,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

// ============================================================================
// Hook
// ============================================================================

export interface UseGarageDoorsResult {
  doors: GarageDoorOption[];
  isLoading: boolean;
  error: Error | null;
  getDoorById: (id: string) => GarageDoorOption | undefined;
  getDoorBySlug: (slug: string) => GarageDoorOption | undefined;
  getDoorsByStyle: (style: GarageDoorOption['style']) => GarageDoorOption[];
}

export function useGarageDoors(): UseGarageDoorsResult {
  const { data, isLoading, error } = useQuery({
    queryKey: GARAGE_DOORS_QUERY_KEY,
    queryFn: fetchGarageDoors,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    placeholderData: mapStaticGarageDoorsToDbShape,
  });

  const doors = data || [];

  const getDoorById = (id: string): GarageDoorOption | undefined => {
    return doors.find((d) => d.id === id);
  };

  const getDoorBySlug = (slug: string): GarageDoorOption | undefined => {
    return doors.find((d) => d.slug === slug);
  };

  const getDoorsByStyle = (style: GarageDoorOption['style']): GarageDoorOption[] => {
    return doors.filter((d) => d.style === style);
  };

  return {
    doors,
    isLoading,
    error: error as Error | null,
    getDoorById,
    getDoorBySlug,
    getDoorsByStyle,
  };
}

export default useGarageDoors;
