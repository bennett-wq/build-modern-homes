// ============================================================================
// mapGeometryGate
// ----------------------------------------------------------------------------
// Source-bound decision for whether a community's site plan may render in
// Mapbox mode. This intentionally replaces the old permissive gate (token +
// map_center + ANY Polygon) with an all-or-nothing, source-honest gate:
//
//   1. a Mapbox token exists,
//   2. the development has a usable (finite) map center,
//   3. EVERY displayed lot has complete Polygon/MultiPolygon geometry
//      (>=1 ring, >=4 positions per ring, finite coords, closed ring), and
//   4. the development AND every lot carry medium/high/verified source
//      confidence ('low' or null/absent blocks Mapbox).
//
// If any check fails, the caller falls back to the static image site plan —
// never a half-populated map. This is the fail-safe behavior the recovery
// requires: no fabricated map authority.
// ============================================================================

import type { Development, GeometrySourceConfidence, Lot, LotPolygon } from '@/types/database';

const ACCEPTABLE_CONFIDENCE: GeometrySourceConfidence[] = ['medium', 'high', 'verified'];
type MapboxRenderableLotPolygon = Extract<LotPolygon, { type: 'Polygon' | 'MultiPolygon' }>;

export interface MapGeometryDecision {
  canRenderMapbox: boolean;
  /** Machine-readable reason for the negative decision (telemetry/debugging). */
  reason: string | null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPosition(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    isFiniteNumber(value[0]) &&
    isFiniteNumber(value[1])
  );
}

function isClosedRing(ring: unknown): ring is number[][] {
  if (!Array.isArray(ring) || ring.length < 4 || !ring.every(isPosition)) {
    return false;
  }
  const first = ring[0];
  const last = ring[ring.length - 1];
  return first[0] === last[0] && first[1] === last[1];
}

function isValidPolygonCoordinates(coordinates: unknown): coordinates is number[][][] {
  return Array.isArray(coordinates) && coordinates.length > 0 && coordinates.every(isClosedRing);
}

export function isValidMapboxLotPolygon(polygon: LotPolygon): polygon is MapboxRenderableLotPolygon {
  if (!polygon) return false;
  if (polygon.type === 'Polygon') {
    return isValidPolygonCoordinates(polygon.coordinates);
  }
  if (polygon.type === 'MultiPolygon') {
    return (
      Array.isArray(polygon.coordinates) &&
      polygon.coordinates.length > 0 &&
      polygon.coordinates.every(isValidPolygonCoordinates)
    );
  }
  return false;
}

export function hasUsableMapCenter(development: Development): boolean {
  return isFiniteNumber(development.map_center_lng) && isFiniteNumber(development.map_center_lat);
}

export function hasCompleteMapboxLotGeometry(lots: Lot[]): boolean {
  return lots.length > 0 && lots.every((lot) => isValidMapboxLotPolygon(lot.polygon_coordinates));
}

export function hasAcceptableSourceConfidence(development: Development, lots: Lot[]): boolean {
  if (
    !ACCEPTABLE_CONFIDENCE.includes(
      development.map_geometry_source_confidence as GeometrySourceConfidence,
    )
  ) {
    return false;
  }
  return lots.every((lot) =>
    ACCEPTABLE_CONFIDENCE.includes(lot.polygon_source_confidence as GeometrySourceConfidence),
  );
}

export function getMapboxRenderDecision({
  token,
  development,
  lots,
}: {
  token: string | undefined;
  development: Development;
  lots: Lot[];
}): MapGeometryDecision {
  if (!token) {
    return { canRenderMapbox: false, reason: 'missing-mapbox-token' };
  }
  if (!hasUsableMapCenter(development)) {
    return { canRenderMapbox: false, reason: 'missing-map-center' };
  }
  if (!hasCompleteMapboxLotGeometry(lots)) {
    return { canRenderMapbox: false, reason: 'incomplete-lot-geometry' };
  }
  if (!hasAcceptableSourceConfidence(development, lots)) {
    return { canRenderMapbox: false, reason: 'low-or-missing-source-confidence' };
  }
  return { canRenderMapbox: true, reason: null };
}

/** Boolean convenience wrapper for call sites that only need the decision. */
export function canRenderMapbox(args: {
  token: string | undefined;
  development: Development | undefined;
  lots: Lot[];
}): boolean {
  if (!args.development) return false;
  return getMapboxRenderDecision({
    token: args.token,
    development: args.development,
    lots: args.lots,
  }).canRenderMapbox;
}
