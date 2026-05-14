// ============================================================================
// lot-adapter
// ----------------------------------------------------------------------------
// Bridge between DB-backed Lot rows (UUID ids, GeoJSON polygons) and the
// legacy static `Lot` shape used by LotListPanel / LotDetailsPanel
// (numeric ids, image-xy polygons). Used only when InteractiveSitePlan
// upgrades to Mapbox mode. Image mode keeps reading static lots directly.
// ============================================================================

import type { Lot as DbLot } from '@/types/database';
import type { Lot as DisplayLot } from '@/data/lots/grand-haven';

/** Stable UUID → numeric hash so legacy panels keep working. */
function hashUuidToNumber(uuid: string): number {
  let h = 0;
  for (let i = 0; i < uuid.length; i++) {
    h = (h * 31 + uuid.charCodeAt(i)) | 0;
  }
  // Force positive 32-bit int, avoid 0 (reserved sentinel)
  return Math.abs(h) || 1;
}

export interface AdapterResult {
  displayLots: DisplayLot[];
  /** displayLot.id (number) → original DB lot */
  byNumericId: Map<number, DbLot>;
  /** DB lot.id (uuid) → numeric id used by display lots */
  uuidToNumericId: Map<string, number>;
}

export function adaptDbLots(dbLots: DbLot[]): AdapterResult {
  const displayLots: DisplayLot[] = [];
  const byNumericId = new Map<number, DbLot>();
  const uuidToNumericId = new Map<string, number>();

  for (const lot of dbLots) {
    const numericId = hashUuidToNumber(lot.id);
    uuidToNumericId.set(lot.id, numericId);
    byNumericId.set(numericId, lot);
    displayLots.push({
      id: numericId,
      label: lot.lot_number,
      // DB enum 'pending' has no static equivalent — collapse to 'reserved'.
      status: lot.status === 'pending' ? 'reserved' : (lot.status as DisplayLot['status']),
      polygon: [], // unused by panels in mapbox mode
      acreage: lot.acreage ?? undefined,
      netAcreage: lot.net_acreage ?? undefined,
      premium: lot.premium ?? undefined,
      notes: lot.notes ?? undefined,
    });
  }

  return { displayLots, byNumericId, uuidToNumericId };
}
