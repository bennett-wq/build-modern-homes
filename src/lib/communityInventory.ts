// Canonical community / lot inventory metric helpers.
//
// READY NOW RULE (PM-approved, do not loosen):
//   A lot is "Ready Now" only with explicit timing evidence:
//     - DB-shape:    restrictions.availability === 'Now'
//     - Static-shape: availability === 'Now'
//     - Either:      notes (case-insensitive) contains "available now"
//   Status === 'available' alone is NEVER sufficient.
//
// Every Communities surface (rail, inspector, site-plan header) MUST consume
// these helpers so the rule lives in exactly one place.

import type { Lot as DbLot } from '@/types/database';
import type { Lot as StaticLot } from '@/data/lots/grand-haven';

export interface CommunityInventory {
  totalCount: number;
  availableCount: number;
  readyNowCount: number;
  /** Minimum homesite premium across available lots, or null when none. */
  startingPremium: number | null;
  /**
   * Minimum homesite premium across Ready-Now lots specifically, or null when
   * none are Ready Now. Buyer-facing "From $X / starting price" surfaces should
   * prefer this over startingPremium so the entry price reflects what's buyable
   * today, not cheaper future-phase inventory.
   */
  startingReadyNowPremium: number | null;
}

const NOTE_READY_NOW = /available now/i;

export function isReadyNowDbLot(lot: DbLot): boolean {
  const r = lot.restrictions as { availability?: string } | undefined;
  if (r?.availability === 'Now') return true;
  return NOTE_READY_NOW.test(lot.notes ?? '');
}

export function isReadyNowStaticLot(lot: StaticLot): boolean {
  if (lot.availability === 'Now') return true;
  return NOTE_READY_NOW.test(lot.notes ?? '');
}

export function deriveDbInventory(lots: DbLot[]): CommunityInventory {
  const available = lots.filter((l) => l.status === 'available');
  const readyNow = available.filter(isReadyNowDbLot);
  const premiums = available.map((l) => l.premium ?? 0);
  const readyNowPremiums = readyNow.map((l) => l.premium ?? 0);
  return {
    totalCount: lots.length,
    availableCount: available.length,
    readyNowCount: readyNow.length,
    startingPremium: premiums.length > 0 ? Math.min(...premiums) : null,
    startingReadyNowPremium:
      readyNowPremiums.length > 0 ? Math.min(...readyNowPremiums) : null,
  };
}

export function deriveStaticInventory(lots: StaticLot[]): CommunityInventory {
  const available = lots.filter((l) => l.status === 'available');
  const readyNow = available.filter(isReadyNowStaticLot);
  const premiums = available.map((l) => l.premium ?? 0);
  const readyNowPremiums = readyNow.map((l) => l.premium ?? 0);
  return {
    totalCount: lots.length,
    availableCount: available.length,
    readyNowCount: readyNow.length,
    startingPremium: premiums.length > 0 ? Math.min(...premiums) : null,
    startingReadyNowPremium:
      readyNowPremiums.length > 0 ? Math.min(...readyNowPremiums) : null,
  };
}

/** Empty inventory used for coming-soon / no-data communities. */
export const EMPTY_INVENTORY: CommunityInventory = {
  totalCount: 0,
  availableCount: 0,
  readyNowCount: 0,
  startingPremium: null,
  startingReadyNowPremium: null,
};
