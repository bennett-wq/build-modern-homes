// ============================================================================
// Lot Fit Engine
// ----------------------------------------------------------------------------
// Conservative acreage/footprint pre-screen. Checks whether a model's
// rectangular footprint (length × width) fits within a lot's usable square
// footage (net acreage × 43,560), while respecting optional lot restrictions.
//
// IMPORTANT ASSUMPTION: This is an acreage/footprint pre-screen, not a
// zoning/civil approval or setbacks proof. It does not model setbacks,
// easements, or local ordinance minimums.
// ============================================================================

import { useMemo } from 'react';
import type { Lot, Model } from '@/types/database';

const SQFT_PER_ACRE = 43_560;

export function getLotUsableSqft(lot: Lot): number | null {
  const raw = lot.net_acreage ?? lot.acreage;
  if (raw == null) return null;
  const acreage = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(acreage) || acreage <= 0) return null;
  return acreage * SQFT_PER_ACRE;
}

export function getModelFootprintSqft(model: Model): number | null {
  const length = model.length ?? null;
  const width = model.width ?? null;
  if (length == null || width == null) return null;
  if (!Number.isFinite(length) || length <= 0) return null;
  if (!Number.isFinite(width) || width <= 0) return null;
  return length * width;
}

export function doesModelFitLot(lot: Lot, model: Model): boolean {
  const usableSqft = getLotUsableSqft(lot);
  if (usableSqft == null) return false;

  const footprint = getModelFootprintSqft(model);
  if (footprint == null) return false;

  const r = lot.restrictions;

  if (r.allowedModels && Array.isArray(r.allowedModels) && r.allowedModels.length > 0) {
    const allowed = r.allowedModels;
    const modelId = model.id;
    const modelSlug = model.slug;
    if (!allowed.includes(modelId) && !allowed.includes(modelSlug)) {
      return false;
    }
  }

  if (r.minSqft != null && Number.isFinite(r.minSqft)) {
    if (model.sqft < r.minSqft) return false;
  }

  if (r.maxSqft != null && Number.isFinite(r.maxSqft)) {
    if (model.sqft > r.maxSqft) return false;
  }

  return footprint <= usableSqft;
}

export function getFittingModels(lot: Lot, conformingModels: Model[]): Model[] {
  return conformingModels.filter((model) => {
    if (model.is_active === false) return false;
    return doesModelFitLot(lot, model);
  });
}

function buildModelKey(models: Model[]): string {
  return models
    .map((m) => `${m.id},${m.slug},${m.sqft},${m.length ?? ''},${m.width ?? ''},${m.is_active}`)
    .join('|');
}

export function useLotFit(lot: Lot, conformingModels: Model[]): Model[] {
  const modelKey = useMemo(
    () => buildModelKey(conformingModels),
    [conformingModels],
  );

  return useMemo(
    () => getFittingModels(lot, conformingModels),
    [
      lot.id,
      lot.acreage,
      lot.net_acreage,
      lot.restrictions.minSqft,
      lot.restrictions.maxSqft,
      lot.restrictions.allowedModels?.join(','),
      modelKey,
    ],
  );
}
