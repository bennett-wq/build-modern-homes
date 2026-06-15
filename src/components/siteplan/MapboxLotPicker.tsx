// ============================================================================
// MapboxLotPicker
// ----------------------------------------------------------------------------
// Phase 2 scaffold. NOT YET MOUNTED into InteractiveSitePlan. Renders lots
// whose polygon_coordinates are GeoJSON Polygons on a Mapbox map. Legacy
// image-xy lots are intentionally ignored here and continue to render via
// the existing FixedSitePlanViewer.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import type { Development, Lot, LotStatus } from '@/types/database';
import { isValidMapboxLotPolygon } from '@/lib/mapGeometryGate';
import { cn } from '@/lib/utils';

export interface MapboxLotPickerProps {
  development: Development;
  lots: Lot[];
  selectedLotId: string | null;
  filteredLotIds: Set<string>;
  onSelectLot: (lot: Lot | null) => void;
  onHoverLot: (id: string | null) => void;
  fullscreen?: boolean;
  className?: string;
}

// Status → fill color (hex; mapbox-gl paint props don't accept HSL vars).
// Cartographic visual hierarchy: AVAILABLE is the only saturated brand fill, so
// buyable parcels are the clear focus; reserved/sold/pending recede into a
// neutral warm-gray scale by "doneness". Keeps the calm charcoal/wood premium
// palette while making status distinguishable (available pops, the rest mute) —
// instead of three near-identical golds where reserved out-popped available.
const STATUS_FILL: Record<LotStatus, string> = {
  available: '#9A7B4F', // brand wood/gold — the actionable, buyable state
  reserved: '#9C968C',  // warm gray — on hold, recedes
  sold: '#5F5F5F',      // dark gray — gone, recedes most
  pending: '#B6B0A6',   // light warm gray — in process
};

// Human labels for the on-map status legend (data must not be decodable by
// color alone — pairs the STATUS_FILL palette with text).
const STATUS_LABEL: Record<LotStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  pending: 'Pending',
};

const SOURCE_ID = 'lots-source';
const FILL_LAYER_ID = 'lots-fill';
const OUTLINE_LAYER_ID = 'lots-outline';
const LABEL_LAYER_ID = 'lots-label';

interface LotFeatureProps {
  lotId: string;
  status: LotStatus;
  label: string; // lot_number, rendered as the parcel label
  filtered: number; // 0/1 — mapbox feature-state friendly
}

function lotsToFeatureCollection(
  lots: Lot[],
): GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, LotFeatureProps> {
  const features: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, LotFeatureProps>[] = [];
  for (const lot of lots) {
    const poly = lot.polygon_coordinates;
    // Share the gate's validity definition so the renderer never disagrees with
    // the activation gate. Only complete Polygon/MultiPolygon geometry renders.
    if (!isValidMapboxLotPolygon(poly)) continue;
    features.push({
      type: 'Feature',
      id: lot.id,
      geometry:
        poly.type === 'Polygon'
          ? { type: 'Polygon', coordinates: poly.coordinates }
          : { type: 'MultiPolygon', coordinates: poly.coordinates },
      properties: {
        lotId: lot.id,
        status: lot.status,
        label: lot.lot_number,
        filtered: 1,
      },
    });
  }
  return { type: 'FeatureCollection', features };
}

function Placeholder({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-md border border-border bg-muted/40 p-6 text-sm text-muted-foreground',
        className,
      )}
      role="status"
    >
      {message}
    </div>
  );
}

export function MapboxLotPicker({
  development,
  lots,
  selectedLotId,
  filteredLotIds,
  onSelectLot,
  onHoverLot,
  fullscreen = false,
  className,
}: MapboxLotPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleLoadedRef = useRef(false);
  const hoveredLotIdRef = useRef<string | null>(null);
  const [styleReady, setStyleReady] = useState(false);

  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
  const center = useMemo<[number, number] | null>(() => {
    const lng = development.map_center_lng;
    const lat = development.map_center_lat;
    if (typeof lng === 'number' && typeof lat === 'number') return [lng, lat];
    return null;
  }, [development.map_center_lng, development.map_center_lat]);
  const zoom =
    typeof development.map_zoom === 'number' ? development.map_zoom : 16.5;

  const featureCollection = useMemo(
    () => lotsToFeatureCollection(lots),
    [lots],
  );

  // Statuses actually present in this community, ordered, for the legend.
  const legendStatuses = useMemo<LotStatus[]>(() => {
    const order: LotStatus[] = ['available', 'reserved', 'pending', 'sold'];
    const present = new Set(featureCollection.features.map((f) => f.properties.status));
    return order.filter((s) => present.has(s));
  }, [featureCollection]);

  // ---------------------------------------------------------------------------
  // Init effect — runs once. StrictMode-safe via mapRef guard.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    if (!token || !center) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center,
      zoom,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      styleLoadedRef.current = true;
      setStyleReady(true);
    });

    mapRef.current = map;

    return () => {
      styleLoadedRef.current = false;
      setStyleReady(false);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Source + layers — depends on geometry payload.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady) return;

    const existing = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(featureCollection);
      return;
    }

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: featureCollection,
      promoteId: 'lotId',
    });

    map.addLayer({
      id: FILL_LAYER_ID,
      type: 'fill',
      source: SOURCE_ID,
      paint: {
        'fill-color': [
          'match',
          ['get', 'status'],
          'available', STATUS_FILL.available,
          'reserved', STATUS_FILL.reserved,
          'sold', STATUS_FILL.sold,
          'pending', STATUS_FILL.pending,
          '#9A7B4F',
        ],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false], 0.7,
          ['boolean', ['feature-state', 'hover'], false], 0.55,
          ['==', ['get', 'filtered'], 0], 0.1,
          0.35,
        ],
      },
    });

    map.addLayer({
      id: OUTLINE_LAYER_ID,
      type: 'line',
      source: SOURCE_ID,
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false], '#2E2E2E',
          '#FFFFFF',
        ],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false], 3,
          ['boolean', ['feature-state', 'hover'], false], 2,
          1.25,
        ],
      },
    });

    // Lot-number labels with a white halo for readability over parcel fills
    // (real-estate map pattern). Pre-ship: run a Mapbox DevKit validate_style_tool
    // + check_color_contrast_tool pass before this map is enabled in production.
    map.addLayer({
      id: LABEL_LAYER_ID,
      type: 'symbol',
      source: SOURCE_ID,
      layout: {
        'text-field': ['get', 'label'],
        // Hidden when zoomed out, scaling up for legibility as parcels grow.
        'text-size': ['interpolate', ['linear'], ['zoom'], 14, 0, 15.5, 11, 18, 15],
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#1A1A1A',
        'text-halo-color': '#FFFFFF',
        'text-halo-width': 1.5,
      },
    });

    // ---- interactions ----
    const handleMove = (e: mapboxgl.MapLayerMouseEvent) => {
      map.getCanvas().style.cursor = 'pointer';
      const f = e.features?.[0];
      if (!f) return;
      const id = f.id as string | undefined;
      if (!id || hoveredLotIdRef.current === id) return;

      if (hoveredLotIdRef.current) {
        map.setFeatureState(
          { source: SOURCE_ID, id: hoveredLotIdRef.current },
          { hover: false },
        );
      }
      hoveredLotIdRef.current = id;
      map.setFeatureState({ source: SOURCE_ID, id }, { hover: true });
      onHoverLot(id);
    };

    const handleLeave = () => {
      map.getCanvas().style.cursor = '';
      if (hoveredLotIdRef.current) {
        map.setFeatureState(
          { source: SOURCE_ID, id: hoveredLotIdRef.current },
          { hover: false },
        );
        hoveredLotIdRef.current = null;
      }
      onHoverLot(null);
    };

    const handleClick = (e: mapboxgl.MapLayerMouseEvent) => {
      const f = e.features?.[0];
      const id = f?.id as string | undefined;
      if (!id) {
        onSelectLot(null);
        return;
      }
      const lot = lots.find((l) => l.id === id) ?? null;
      onSelectLot(lot);
    };

    map.on('mousemove', FILL_LAYER_ID, handleMove);
    map.on('mouseleave', FILL_LAYER_ID, handleLeave);
    map.on('click', FILL_LAYER_ID, handleClick);

    return () => {
      map.off('mousemove', FILL_LAYER_ID, handleMove);
      map.off('mouseleave', FILL_LAYER_ID, handleLeave);
      map.off('click', FILL_LAYER_ID, handleClick);
    };
    // lots intentionally included for click handler closure
  }, [styleReady, featureCollection, lots, onHoverLot, onSelectLot]);

  // ---------------------------------------------------------------------------
  // Filtered feature state — toggle dimming on lots not in the filter set.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady || !map.getSource(SOURCE_ID)) return;

    for (const f of featureCollection.features) {
      const id = f.id as string;
      const filtered = filteredLotIds.has(id) ? 1 : 0;
      // Mutate the source feature property by re-pushing data is expensive;
      // instead set feature-state, which the paint expression also reads via
      // the boolean 'filtered' check above. We keep filtered in properties for
      // the initial paint; for live updates, we re-set the source data.
      f.properties.filtered = filtered;
    }
    const src = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
    src.setData(featureCollection);
  }, [styleReady, featureCollection, filteredLotIds]);

  // ---------------------------------------------------------------------------
  // Selected feature state.
  // ---------------------------------------------------------------------------
  const previousSelectedRef = useRef<string | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady || !map.getSource(SOURCE_ID)) return;

    const previous = previousSelectedRef.current;
    if (previous && previous !== selectedLotId) {
      map.setFeatureState({ source: SOURCE_ID, id: previous }, { selected: false });
    }
    if (selectedLotId) {
      map.setFeatureState(
        { source: SOURCE_ID, id: selectedLotId },
        { selected: true },
      );
    }
    previousSelectedRef.current = selectedLotId;
  }, [styleReady, selectedLotId]);

  // ---------------------------------------------------------------------------
  // Padding / fullscreen — recalc map size when layout flips.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const id = window.requestAnimationFrame(() => map.resize());
    return () => window.cancelAnimationFrame(id);
  }, [fullscreen]);

  // ---------------------------------------------------------------------------
  // Render — placeholder branches before any map work.
  // ---------------------------------------------------------------------------
  const wrapperClass = cn(
    'relative h-full w-full overflow-hidden rounded-md',
    fullscreen && 'rounded-none',
    className,
  );

  if (!token) {
    return (
      <div className={wrapperClass}>
        <Placeholder message="Map unavailable: missing Mapbox token." />
      </div>
    );
  }

  if (!center) {
    return (
      <div className={wrapperClass}>
        <Placeholder message="Map geometry is being prepared for this community." />
      </div>
    );
  }

  const hasGeoJsonLots = featureCollection.features.length > 0;

  return (
    <div className={wrapperClass}>
      <div ref={containerRef} className="absolute inset-0" aria-label="Site plan map" />
      {hasGeoJsonLots && legendStatuses.length > 0 && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-background/90 px-3 py-2 shadow ring-1 ring-border">
          <ul className="space-y-1">
            {legendStatuses.map((s) => (
              <li key={s} className="flex items-center gap-2 text-xs text-foreground">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: STATUS_FILL[s] }}
                  aria-hidden
                />
                {STATUS_LABEL[s]}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!hasGeoJsonLots && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-md bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow">
          Map geometry is being prepared.
        </div>
      )}
    </div>
  );
}

export default MapboxLotPicker;
