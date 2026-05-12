# Replace the polygon-overlay site plan with a Mapbox parcel picker

> **For Lovable's chat agent:** This plan describes a single coherent change — swap the static-image-with-SVG-overlay site plan for a real interactive Mapbox map. Execute the steps in order; each step is independently testable.
>
> **Prerequisites the human must complete before Lovable starts:**
> 1. Create a Mapbox account and generate a public access token at https://account.mapbox.com/access-tokens/. Restrict it to `basemodhomes.com`, `*.lovable.app`, and `localhost`.
> 2. Set `VITE_MAPBOX_TOKEN=<token>` in Lovable's environment variables UI (not in `.env.local` — Lovable doesn't read the repo's `.env.local` for preview/production).

## Why

The community detail pages need to drive SEO traffic, qualify users, and feel like first-class marketing destinations. The current site plan is a static photographic image with SVG polygon overlays — it's not really interactive, doesn't match the brand, and lot data is hardcoded per development. The polygon-overlay approach is the bottleneck. Replace it with Mapbox so users get real pan/zoom on actual aerial imagery, lots are geographic polygons at their real-world coordinates, and the foundation supports future features (driving directions, "what's nearby," tour scheduling).

SEO content rewrite and built-in financing qualification on these pages are also priorities, but they're a separate plan (see "Deferred" at the bottom). This plan is the map swap only — keep the surrounding page structure, the wizard flow, and the existing prequal flow exactly as they are.

## Visual direction (locked from brainstorming)

Bold / contrast: charcoal `#1A1A1A` base map style, brass `#A17345` lot fills, brighter brass `#D6A866` + white stroke on selected, gentle glow on hover/select. Filter chips on top with brass active state. Detail panel on right (desktop) or bottom sheet (mobile) with "Homes that fit on this lot" mini-cards.

## What changes

| Today | New |
|---|---|
| Static photographic site plan image | Mapbox GL JS map with satellite-streets base + custom dark overlay style |
| SVG polygons positioned in image space | GeoJSON polygons at real-world lat/lng |
| `react-zoom-pan-pinch` (not yet added) | `mapbox-gl` library + a Mapbox public access token |
| Hardcoded lot data per development | Supabase `lots` table with `polygon_coordinates` as proper GeoJSON |
| `/developments/:slug/site-plan` separate route | In-place modal expand with `?fullscreen=1` URL param |
| No filters | Status / fits-model / price / size filter chips, URL-backed |
| No "what fits" preview | Detail panel shows conforming models with starting prices |

Everything else on the community page stays as-is for this plan.

## Critical context — single state owner for `?lot=` URL param

**Today, the live `setSearchParams` writers in `src/` are**:

Actual `grep -rn "setSearchParams" src/` result (call sites only, excluding `useSearchParams` declarations):

```
src/hooks/useBuildSelection.ts:105   setSearchParams(newParams, { replace: true })
src/hooks/useConfiguratorState.ts:361 setSearchParams({})    ← inside resetBuild, imperative empty-object wipe
```

So there are **two** live writers in the repo, but only one is in scope for this Mapbox plan:

1. **In-scope live writer for the community build flow** — `useBuildSelection`'s sync effect ([src/hooks/useBuildSelection.ts:93-106](src/hooks/useBuildSelection.ts)) calls `setSearchParams(newParams, { replace: true })` with the lot id converted via `.toString()`, where `lotId: number | null`. This is the only writer that writes the build-flow keys (`lot`, `model`, `buildType`, `package`, `garage`) on community detail pages — the surface this plan modifies.
2. **Out-of-scope live writer for the legacy `/build` configurator** — `useConfiguratorState.resetBuild` ([src/hooks/useConfiguratorState.ts:361](src/hooks/useConfiguratorState.ts)) calls `setSearchParams({})` (imperative empty-object form) to nuke every URL param when the user clicks "Start over." This is on a separate configurator flow rooted at `/build`, not the community detail pages. **Do not modify `useConfiguratorState.resetBuild` as part of this plan** — its callers and behavior contract aren't audited here. The only thing to verify is that Step 5's new filter UI is not mounted on any route that can fire `resetBuild`. If a follow-up plan ever shares URL state between `/build` and `/developments/:slug`, `resetBuild` must be reworked to delete only its owned keys, not wipe everything.
3. **Shareable-URL serializer (not a live writer)** — `useConfiguratorStore.getShareableUrl` ([src/state/useConfiguratorStore.ts:399-418](src/state/useConfiguratorStore.ts)) builds a `URLSearchParams` object locally and returns a concatenated URL *string* for copy-to-clipboard / share UIs. It does NOT mutate the browser URL.
4. **State owner (no URL effect)** — `useConfiguratorStore` ([src/state/useConfiguratorStore.ts:52,241](src/state/useConfiguratorStore.ts)) holds `lotId: string | null` (UUID) as in-memory state via `setLotId`. No URL effect.

So the conflict relevant to this plan isn't "two URL writers." It's "the in-scope URL writer (`useBuildSelection`) writes numeric IDs while the canonical state owner (`useConfiguratorStore`) holds UUIDs." The legacy `resetBuild` writer exists but is on a separate flow and is explicitly out of scope. **As part of this plan**, pick `useConfiguratorStore` as the canonical source of truth for `lotId`. The change to `useBuildSelection` is NOT a one-line wrapper — it has to retire numeric URL handling end-to-end. Three coordinated edits in [src/hooks/useBuildSelection.ts](src/hooks/useBuildSelection.ts):

**A. Widen the `lotId` type.** The interface at line 9-16 declares `lotId: number | null`. Change to `lotId: string | null`. This will cascade type errors through call sites — fix each by accepting the UUID string and removing any numeric arithmetic on lot IDs.

**B. Retire `parseInt` in the URL hydration (line 62).** Current:
```ts
lotId: lotParam ? parseInt(lotParam, 10) : (hasUrlParams ? storedSelection.lotId ?? null : null),
```
A UUID like `7f1b9e35-f415-48a6-bad0-d738ae598d79` returns `7` from `parseInt`, then later `parseInt('lovable')` returns `NaN`, and downstream comparisons silently fail. Replace with a UUID-shape guard so legacy numeric URLs (`?lot=42`) are ignored rather than silently corrupted:

```ts
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const lotId =
  lotParam && UUID_RE.test(lotParam)
    ? lotParam
    : (hasUrlParams ? storedSelection.lotId ?? null : null);
```

Legacy `?lot=42` URLs in users' bookmarks or shared links will silently degrade to "no lot selected" — that's the right behavior since there's no numeric → UUID map. Don't try to migrate them.

**C. Fix the URL writer (lines 99, 152, 164).** Current writes `selection.lotId.toString()` — for `lotId: string | null` that becomes `selection.lotId` directly. Replace each occurrence:
```ts
if (selection.lotId !== null) newParams.set('lot', selection.lotId);
```

**D. The `setLot` wrapper (line 108-110).** Conservative dual-write — update **both** local `selection` state (so the existing URL-sync effect at line 93-106 fires with the new value) AND `useConfiguratorStore` (so the store is the canonical source of truth for downstream consumers). Use an explicit ternary because `String(null)` returns the literal string `"null"`, which would corrupt the URL:

```ts
const setLot = useCallback((lotId: string | null) => {
  setSelectionState(prev => ({ ...prev, lotId }));            // local; drives URL effect
  useConfiguratorStore.getState().setLotId(
    lotId === null ? null : lotId                              // canonical store; pass-through
  );
  triggerSaveIndicator();
}, [triggerSaveIndicator]);
```

Do not drop the local `setSelectionState` write unless a follow-up plan refactors `useBuildSelection` to derive `lotId` from the store via `useConfiguratorStore(state => state.lotId)` AND introduces a dedicated URL-sync hook to replace the existing effect. Until that refactor lands, the existing local-state-drives-URL flow stays intact — dual-write is the safe path.

**E. URL writer coordination — explicit ownership model.**

**Today (current repo):** the repo has **two** live `setSearchParams` writers: `useBuildSelection` ([src/hooks/useBuildSelection.ts:105](src/hooks/useBuildSelection.ts)) and `useConfiguratorState.resetBuild` ([src/hooks/useConfiguratorState.ts:361](src/hooks/useConfiguratorState.ts)). Only `useBuildSelection` is in scope for this Mapbox/community build-flow plan — see the ownership matrix below for the full picture and `resetBuild`'s out-of-scope status.

**After Step 5 lands:** there may be **multiple** live URL writers. That is allowed only if every writer obeys both of these rules:

1. **Functional update form.** Every `setSearchParams` call uses `setSearchParams(prev => next)` (where `next` is built from `new URLSearchParams(prev)`), never the imperative `setSearchParams(newParams)`. The imperative form silently wipes every param the writer doesn't re-emit.
2. **Clearly named key ownership.** Each writer owns a disjoint set of query-string keys. A writer must `set` / `delete` keys it owns, and must NOT read or modify any key it does not own.

**Ownership matrix:**

| Writer | Owns these query-string keys | In scope for this plan? |
|---|---|---|
| `useBuildSelection` (existing, retrofitted to functional form in step C above) | `lot`, `model`, `buildType`, `package`, `garage` | Yes — modified by this plan |
| `useSitePlanFilters` (new) | `status`, `fits`, `priceMin`, `priceMax`, `sizeMin`, `sizeMax` | Yes — created by this plan |
| `FullscreenSitePlan` open/close handler (new) | `fullscreen` | Yes — created by this plan |
| `useConfiguratorStore.getShareableUrl` | **none** — pure serializer, never calls `setSearchParams` | Not a URL writer |
| `useConfiguratorState.resetBuild` ([src/hooks/useConfiguratorState.ts:361](src/hooks/useConfiguratorState.ts)) | wipes all keys via `setSearchParams({})` | **No — legacy `/build` flow only.** Do not modify. Step 5's new filter UI must not be mounted on any route that mounts `useConfiguratorState`. |

`useSitePlanFilters` **does** call `setSearchParams`, but only via the functional form and only on its six owned keys. The earlier draft of this plan that said "useSitePlanFilters does not call setSearchParams itself" was wrong — it contradicted Step 5's own description of the hook. Treat the ownership matrix above as canonical; ignore any phrasing elsewhere that implies a single-writer model. **The repo as a whole has more than one URL writer today** (`useBuildSelection` plus `useConfiguratorState.resetBuild`); this plan only governs the writers it creates or modifies, listed in the "In scope" column above.

**Required transformation for `useBuildSelection.ts:105`** (replace the imperative call with a functional updater that only touches its owned keys):

```ts
// Replace line 105:
setSearchParams(prev => {
  const next = new URLSearchParams(prev);
  // Only mutate keys this hook owns: lot, model, buildType, package, garage.
  // Leave every other key (status, fits, priceMin, priceMax, sizeMin, sizeMax,
  // fullscreen, anything else) untouched.
  if (selection.lotId !== null) next.set('lot', selection.lotId);
  else next.delete('lot');
  if (selection.modelSlug) next.set('model', selection.modelSlug);
  else next.delete('model');
  if (selection.buildType) next.set('buildType', selection.buildType);
  else next.delete('buildType');
  if (selection.packageId) next.set('package', selection.packageId);
  else next.delete('package');
  if (selection.garageDoorId) next.set('garage', selection.garageDoorId);
  else next.delete('garage');
  return next;
}, { replace: true });
```

`useSitePlanFilters` writers follow the same pattern but `set`/`delete` only the six filter keys, and the fullscreen toggle `set`/`delete`s only `fullscreen`. None of them reads or modifies a key it doesn't own.

**F. Shareable URL serializer.** If `useConfiguratorStore.getShareableUrl` ([src/state/useConfiguratorStore.ts:399-418](src/state/useConfiguratorStore.ts)) needs to emit new filter params (`status`, `fits`, `priceMin`, etc.) in the shareable string, update its body to include them. It still does not call `setSearchParams`; it remains a pure serializer.

**G. Legacy data check.** Verify that no Supabase rows use numeric lot IDs anywhere — `quotes.lot_id`, `financing_applications.quote_id` chains. If any do, they're already broken because `lots.id` is `uuid`. Spot-check before flipping the type.

## Step 1 — Add Mapbox dependency and access token

```bash
npm install mapbox-gl @types/mapbox-gl
```

Add a public Mapbox access token to env:

- Get a token from https://account.mapbox.com/access-tokens/ (free tier: 50k loads/month, plenty for this site)
- Add to `.env.local` (local dev) AND set via Lovable's env-var UI (production):
  ```
  VITE_MAPBOX_TOKEN=pk.eyJ...
  ```
- Reference in code: `import.meta.env.VITE_MAPBOX_TOKEN`

Mapbox public tokens (prefix `pk.`) are safe to expose in client-side code, but should be URL-restricted in the Mapbox dashboard to `basemodhomes.com` + `*.lovable.app` + `localhost` to prevent quota theft.

## Step 2 — Schema changes

Migration filename: `<timestamp>_mapbox_lot_geometry.sql` (replace `<timestamp>` with `date +%Y%m%d%H%M%S`).

```sql
-- ============================================================================
-- Mapbox parcel picker — geographic coordinates for lots and developments
-- ============================================================================

-- 1. Developments get a map center + initial zoom (for the Mapbox view defaults)
ALTER TABLE public.developments
  ADD COLUMN IF NOT EXISTS map_center_lng NUMERIC(11, 8),
  ADD COLUMN IF NOT EXISTS map_center_lat NUMERIC(10, 8),
  ADD COLUMN IF NOT EXISTS map_zoom NUMERIC(4, 2) DEFAULT 16.5;

COMMENT ON COLUMN public.developments.map_center_lng IS
  'Initial longitude for the Mapbox view of this development. Use the centroid of the development''s parcel.';
COMMENT ON COLUMN public.developments.map_center_lat IS
  'Initial latitude for the Mapbox view of this development.';
COMMENT ON COLUMN public.developments.map_zoom IS
  'Initial zoom level (typical: 16-18 for community-scale, where individual lots are clearly visible).';

-- 2. Lots get a width column on models (for "what fits" logic — see Step 5)
ALTER TABLE public.models
  ADD COLUMN IF NOT EXISTS width INTEGER;

COMMENT ON COLUMN public.models.width IS
  'Home width in feet, used by the useLotFit hook to determine which models fit on a given lot.';

-- 3. lot.polygon_coordinates stays as JSONB at the DB level, but the *shape*
--    must change. Today src/types/database.ts defines:
--      interface LotPolygonPoint { x: number; y: number; }
--      Lot.polygon_coordinates: LotPolygonPoint[];
--    These are image-space (relative to the site plan PNG).
--    New shape: GeoJSON Polygon:
--      { type: "Polygon", coordinates: [[[lng, lat], ...]] }
--    The DB column doesn't need to change (still JSONB), but the TypeScript
--    types and `mapRowToLot` parser in src/hooks/useLots.ts MUST change to
--    accept the new shape. See Step 2.5.
```

## Step 2.5 — Update Lot polygon TypeScript types and parser

Before writing Mapbox code, update the type system so `Lot.polygon_coordinates` can carry GeoJSON.

Edit `src/types/database.ts`:

```ts
// REPLACE the legacy LotPolygonPoint interface with a GeoJSON Polygon type.
// Keep the old shape behind a union for backward-compat during the data migration.

export interface LegacyImagePolygon {
  type: 'image-xy';
  points: { x: number; y: number }[];
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];   // [[[lng, lat], ...]]
}

export type LotPolygon = LegacyImagePolygon | GeoJSONPolygon | null;

export interface Lot extends Omit<LotRow, 'polygon_coordinates' | 'restrictions'> {
  polygon_coordinates: LotPolygon;
  restrictions: LotRestrictions;
}
```

Edit `src/hooks/useLots.ts` — update `mapRowToLot` to detect the shape:

```ts
function parseLotPolygon(raw: unknown): LotPolygon {
  if (!raw) return null;
  if (typeof raw === 'object' && (raw as any).type === 'Polygon') {
    return raw as GeoJSONPolygon;            // already GeoJSON
  }
  if (Array.isArray(raw)) {
    return { type: 'image-xy', points: raw as { x: number; y: number }[] };
  }
  return null;
}
```

**Also update `mapStaticLotsToDbFormat`** ([src/hooks/useLots.ts](src/hooks/useLots.ts)) — currently emits `polygon_coordinates: lot.polygon || []` (raw array). After the union lands, the new `MapboxLotPicker` filter checks `polygon_coordinates?.type === 'Polygon'` and will silently skip these. Wrap the static fallback in the discriminated shape:

```ts
// In mapStaticLotsToDbFormat:
polygon_coordinates: lot.polygon
  ? { type: 'image-xy', points: lot.polygon }
  : null,
```

This way the static fallback's lots show in the sidebar list (with the "Setting up map for this lot" placeholder in the map area) instead of disappearing entirely.

`MapboxLotPicker` (Step 3) only renders lots where `polygon_coordinates?.type === 'Polygon'`. Lots still in legacy `image-xy` shape are listed in the sidebar but not drawn on the map — with a "Setting up map for this lot" indicator. After backfill (Step 6) this dual-mode handling can be deleted.

Also: `FixedSitePlanEditor.tsx` consumes the legacy `{x, y}[]` shape. Either delete it (it's an internal admin tool) or update it to handle the union. The plan recommends deleting after backfill verification (already in the file diff).

## Step 3 — Create the `MapboxLotPicker` component

Create `src/components/siteplan/MapboxLotPicker.tsx`:

- Uses `mapbox-gl` directly (not a React wrapper — the wrapper libraries add weight and lag behind the core).
- Initializes a map centered on `development.map_center_*` at `development.map_zoom`.
- Map style: start with `mapbox://styles/mapbox/satellite-streets-v12` for v1. Custom-brand-styled URL goes in a follow-up.
- Adds a `lots` source from a GeoJSON FeatureCollection assembled from the lots query result.
- Adds two layers:
  - `lots-fill` (type `fill`) — colors per status, with `fill-opacity` driven by feature-state `'filtered'` for the dim-on-filter effect.
  - `lots-outline` (type `line`) — brass stroke, thicker when selected.
- Click handler on `lots-fill` sets `feature-state` `'selected'` and calls `props.onSelectLot(lot)`.
- Hover handler sets `feature-state` `'hovered'` for the glow effect; cursor goes to `pointer`.
- Disable Mapbox's default attribution to a compact "Map © Mapbox" line at bottom (don't remove entirely — required by ToS).

Component prop shape:

```ts
interface MapboxLotPickerProps {
  development: Development;     // for map_center, map_zoom
  lots: Lot[];                  // from useLotsBySlug
  selectedLotId: string | null; // Lot.id is UUID string (src/types/database.ts: LotRow = Tables<'lots'>)
  filteredLotIds: Set<string>;  // for dimming; UUIDs
  onSelectLot: (lot: Lot | null) => void;
  onHoverLot: (id: string | null) => void;
  fullscreen?: boolean;         // affects map padding
}
```

**Critical: import Mapbox CSS** at the top of the component file:
```ts
import 'mapbox-gl/dist/mapbox-gl.css';
```
Without this, Mapbox's zoom buttons, scale bar, and attribution control render unstyled.

**Critical: StrictMode-safe init pattern.** Vite + React 18 dev mode runs effects twice under `<StrictMode>`. Mapbox's `new mapboxgl.Map({ container, ... })` throws *"Map container is already initialized"* on the second run. Use this exact pattern:

```ts
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

export function MapboxLotPicker(props: MapboxLotPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;   // StrictMode guard

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [props.development.map_center_lng, props.development.map_center_lat],
      zoom: props.development.map_zoom,
    });

    // ... add sources/layers/handlers once the map fires 'load'

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init only once; updates via separate effects
  }, []);

  // Separate effects sync prop changes (selectedLotId, filteredLotIds, etc.)
  // via mapRef.current.setFeatureState(...) — do NOT recreate the map.

  return <div ref={containerRef} className="absolute inset-0" />;
}
```

Key rules: init runs ONCE (empty dep array, guarded by ref). Prop changes flow through separate effects that mutate the existing map via `setFeatureState`, `flyTo`, `setData`, etc. — never recreate the instance.

## Step 4 — Wire `MapboxLotPicker` into `InteractiveSitePlan`

Edit `src/components/siteplan/InteractiveSitePlan.tsx`:

1. Delete the hardcoded lot imports (lines 11-13). Replace with `const { lots, isLoading } = useLotsBySlug(developmentSlug);` from `src/hooks/useLots.ts` (already exists).
2. Replace `<FixedSitePlanViewer …>` with `<MapboxLotPicker …>`. Pass the new props.
3. Add a `<SitePlanFilters>` row above the map (new component — see Step 5).
4. When `?fullscreen=1` is in the URL, render the same `<MapboxLotPicker>` inside `<FullscreenSitePlan>` (a shadcn `Dialog` filling 100vw × 100vh). Same component, different chrome.
5. Loading state: render a charcoal `<Skeleton>` at the map's intended size while `isLoading` is true.

Delete after backfill is verified:
- `src/components/siteplan/FixedSitePlanViewer.tsx`
- `src/data/lots/grand-haven.ts`
- `src/data/lots/st-james-bay.ts`
- `src/data/lots/ypsilanti.ts`

Keep but rewrite:
- `src/pages/SitePlanFullScreen.tsx` — **Read the current file first** before rewriting. Specifically: preserve the `useParams()` → `developmentSlug` extraction, preserve any `useEffect(() => trackEvent(...), [])` calls, preserve the scroll-restore behavior, and preserve any redirect logic for missing developments. After preserving those, render `<FullscreenSitePlan developmentSlug={slug} />` for the body. Do NOT change the route path; users who deep-link to `/developments/:slug/site-plan` should still land here.

**Initial-mount behavior for `?fullscreen=1`:** If a user lands directly on `/developments/ypsilanti?fullscreen=1`, the dialog should open AFTER `useLotsBySlug` resolves (i.e., gate the `<Dialog open={fullscreen && !isLoading}>`). Otherwise the dialog opens against an empty map and Mapbox throws during init. The embedded view shows the skeleton; the dialog mounts when data is ready.

## Step 5 — Filters + "what fits" + fullscreen

Create:

| File | Purpose |
|---|---|
| `src/components/siteplan/SitePlanFilters.tsx` | Chip row: status multi-toggle, fits-model dropdown, price range slider, lot size range slider. State synced to URL via `useSearchParams`. |
| `src/components/siteplan/FullscreenSitePlan.tsx` | shadcn `Dialog` that fills the viewport. Renders the same `MapboxLotPicker` + `LotListPanel` + `LotDetailsPanel` as the embedded view. Triggered by `?fullscreen=1`. Close via Esc / X / outside-click. **Important: shadcn `DialogContent` defaults to `max-w-lg` centered. Override with `className="max-w-none w-screen h-screen rounded-none p-0 gap-0"` to actually fill the viewport. Mapbox also requires its container to have an explicit pixel height — wrap the map in a flex parent with `flex-1` + `min-h-0`.** |
| `src/hooks/useLotFit.ts` | `(lot, conformingModels) => Model[]`. Computes which models fit based on lot acreage + restrictions vs. model footprint (length × width + setbacks). **Memoize via `useMemo` keyed on stable IDs, not array identity** — callers (especially TanStack Query) return new array references every render, which would defeat a naive memo. Use a key like `[lot.id, conformingModels.map(m => m.id).join(',')]`. **NULL-dimension rule: if either `model.length` OR `model.width` is NULL on the model row, EXCLUDE that model from the fit set (don't silently approve). Show a "More homes coming soon" note in `LotDetailsPanel` when the fit set is empty so users aren't confused.** |
| `src/hooks/useSitePlanFilters.ts` | URL-param-backed filter state. Wraps `useSearchParams`. **Owns exactly six query-string keys: `status`, `fits`, `priceMin`, `priceMax`, `sizeMin`, `sizeMax`.** Every setter calls `setSearchParams(prev => next)` (functional form), reads/mutates only those six keys, and leaves all other params (`lot`, `model`, `buildType`, `package`, `garage`, `fullscreen`, anything else) untouched. See the ownership matrix in section E for the full multi-writer coordination model. Computes `filteredLotIds` set from the parsed values. |

Update:

- `src/components/siteplan/LotListPanel.tsx` — restyle for charcoal theme, sync with `filteredLotIds` (dim non-matching rows). **Accessibility:** put `aria-current="true"` on the row whose lot is selected; the list root gets `role="listbox"` with each row `role="option"`. The list is the keyboard-accessible alternative to the map for screen-reader users (Mapbox is not keyboard-navigable).
- `src/components/siteplan/LotDetailsPanel.tsx` — wrap the panel in `<div role="region" aria-live="polite" aria-atomic="true">` so screen-reader users hear "Lot 14, 0.32 acres, from $268,400" when selection changes via either the map OR the keyboard list.
- **Mobile bottom sheets**: use `Drawer` from `vaul` ([vaul v0.9.9 is already in package.json](package.json)), not hand-rolled `framer-motion` slide-up. Apply to both the lot-list bottom sheet and the lot-detail bottom drawer. `vaul`'s `Drawer.Root` + `Drawer.Content` handles dismiss gestures, focus trap, and accessibility correctly out of the box.
- `src/components/siteplan/LotDetailsPanel.tsx` — add "Homes that fit on this lot" section. For each model from `useLotFit(lot, conformingModels)`, render a mini-card with thumbnail, name, starting price (from `model_pricing.base_home_price + lot.premium`), and a "Build on this lot →" CTA. The CTA calls `useConfiguratorStore.getState().setLotId(lot.id)` (note: method is `setLotId`, not `setLot`; defined at `src/state/useConfiguratorStore.ts:241`) plus `setModel(model.slug)`, then navigates to `/developments/:slug/build` via `useNavigate`.
- **Conforming models source** — add `src/hooks/useConformingModels.ts`: query `development_conforming_models` junction (already in DB, [migration line 132](supabase/migrations/20260129043607_262937e4-311a-47f4-b6f0-71be85e38de1.sql)) joined to `models` filtered by `is_active = true`. Returns `Model[]`. Used by both `LotDetailsPanel` and the "Fits [model]" filter dropdown.

## Step 6 — Backfill lot polygon coordinates

The current `polygon_coordinates` JSONB values in `src/data/lots/*.ts` are image-space (relative to the site plan image). Mapbox needs real-world GeoJSON. **This is a one-time data task, not code.**

Recommended path:

1. **Try county GIS first.** Most Michigan counties publish parcel boundaries as open GeoJSON / Shapefile.
   - Washtenaw County (Ypsilanti): https://gis-washtenaw.opendata.arcgis.com/ — search for "parcels"
   - Ottawa County (Grand Haven): https://miottawa.org/gis/ — likewise
   - St. Joseph County (St. James Bay, if applicable): same pattern
   - Search by the development's parent parcel APN to get the polygon, then sub-divide if needed.
2. **Fallback: manual digitization.** For developments not in open GIS data, use https://geojson.io with a Mapbox satellite base and trace each lot polygon by hand. Export as a FeatureCollection.
3. **Save to Supabase.** For each lot, set `polygon_coordinates` to the GeoJSON Polygon object: `{ "type": "Polygon", "coordinates": [[[lng, lat], ...]] }`. The shape is what Mapbox expects directly.

Also during backfill:
- Set `developments.map_center_lng`, `map_center_lat`, `map_zoom` for each development. Use the centroid of all lots and zoom 16.5 as a starting point.
- Populate `models.width` (in feet) for each home model. Look up from the existing model spec sheets in `public/floorplans/` PDFs or `src/data/models.ts`.

**Until backfill is complete**, the Mapbox component should detect missing geometry and render a clear "Setting up community map" placeholder rather than failing silently.

## Step 7 — Verify

Local dev:

1. `npm run dev`, open `http://localhost:8080/developments/ypsilanti`. Should see the Mapbox map centered on Ypsilanti at zoom 16.5.
2. Lots render as brass-fill polygons. Hover scales them slightly and shows a tooltip. Click selects the lot and opens the detail panel.
3. Detail panel shows "Homes that fit on this lot" with at least the Hawthorne model (assuming `models.width` is populated).
4. Filter chip "Fits Hawthorne" dims all lots where the Hawthorne doesn't fit (don't unmount, just opacity 0.15).
5. Click "Expand" — URL gains `?fullscreen=1`, modal opens with the same selected lot and filters intact.
6. Press Esc — modal closes, URL drops the param, selected lot persists.
7. Mobile (Chrome devtools responsive mode + a real iPhone): pinch-zoom works, lot list is a bottom sheet, detail panel is a bottom drawer.
8. Deep-link test: paste `/developments/ypsilanti?fits=hawthorne&fullscreen=1` in a fresh tab — opens fullscreen with the filter active.
9. Loading state: throttle network to "Slow 3G" in devtools — verify the charcoal skeleton renders before the map appears.
10. Mapbox token leak check: the network panel should show requests to `api.mapbox.com` and `events.mapbox.com` with `?access_token=pk....`; that's normal and safe. The token should NOT appear in any non-Mapbox request.

Automated tests:
- `src/hooks/__tests__/useLotFit.test.ts` — unit test the fit algorithm with known lot/model pairs.
- `e2e/siteplan-filters.spec.ts` (Playwright) — deep-link state restoration + filter interaction. **Do not put test-only branches in production code.** Stub the Mapbox SDK before navigation using Playwright's `page.addInitScript()`:
  ```ts
  await page.addInitScript(() => {
    // Replace mapboxgl with a no-op stub before the bundle loads
    (window as any).__MAPBOX_TEST_STUB__ = true;
  });
  ```
  Then in `MapboxLotPicker`, the only test concession is one line at the top that already exists for other reasons:
  ```ts
  if (typeof window !== 'undefined' && (window as any).__MAPBOX_TEST_STUB__) return <div data-testid="map-stub" />;
  ```
  This pattern keeps the production bundle clean and lets the test assert filter UI and lot detail behavior without hitting Mapbox's network calls. Alternative: use `import.meta.env.MODE === 'test'` if Vite is configured with a `test` mode.

## Step 8 — Commit and deploy

Per the standing git workflow rule: state the commit message + branch, wait for explicit approval, then push. Commit pattern:

- One commit for Steps 1-2 (deps + schema migration) — Lovable agent applies the migration via its chat after push lands.
- One commit for Steps 3-4 (MapboxLotPicker + InteractiveSitePlan rewire).
- One commit for Step 5 (filters, fit, fullscreen).
- One commit for Step 6 data work — Supabase row updates only (no code).

After each commit lands in Lovable's preview and is verified, hit Publish to push to production. Verify the live `basemodhomes.com/developments/ypsilanti` after Publish.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Mapbox token accidentally committed to git | `.env.local` is already in `.gitignore`. Set via Lovable's env-var UI for production, never in code. |
| Mapbox quota exceeded (50k loads/month free) | Compact attribution + lazy-init the map (only when section is in viewport). Set up Mapbox-side billing alerts. |
| County GIS data not available for a community | Manual digitization in geojson.io is the fallback. ~30 min per community. |
| `mapbox-gl` bundle size (~250KB gzip in v3+; includes the WebGL renderer and PMTiles support) | Dynamic-import the map component so it only loads on community detail pages: `const MapboxLotPicker = lazy(() => import('./MapboxLotPicker'))`. Render a Suspense fallback skeleton at the map's intended dimensions to avoid layout shift. **Preload the chunk on hover** of community cards on the `/communities` index page to eliminate cold-load flicker: `onMouseEnter={() => import('@/components/siteplan/MapboxLotPicker')}`. Vite handles the prefetch idempotently. |
| SEO regression — Mapbox canvas is opaque to crawlers | This plan does NOT address SEO. See "Deferred" below. As a stopgap, the existing page text content (community name, description, lot list) still indexes. Don't ship the Mapbox swap as the only content change. |
| Lovable's Supabase migration runner doesn't apply migrations on push | Known: Lovable's "Publish" doesn't auto-run migrations. After committing, ask Lovable's chat agent: "Read the SQL in `supabase/migrations/<filename>.sql` and run it against the database." (This is captured in your memory file `lovable_migration_workflow.md`.) |

## Out of scope — deferred to follow-up plans

The user's larger goal is to make community pages drive SEO + qualify users. Those are real, important, and bigger than this plan. Sketching the follow-ups:

1. **SEO content rewrite** — Each community page becomes a full marketing landing page: hero block, "Why this community" narrative, model lineup with prices, location amenities, FAQs, schema.org structured data (`Place`, `Residence`, `Offer`), per-community meta tags + OG image, and an XML sitemap entry per community. May also need to migrate Vite SPA → Vite + `vite-plugin-ssg` for prerendering, or to Next.js for proper SSR. **Plan separately — this is a 2-3 week project on its own with architectural decisions.**

2. **Inline qualification** — Wire the existing `PreQualificationFlow` component directly onto the community detail page (currently it's modal-only and behind the financing CTA). Show "Get pre-qualified for this lot" as a clear CTA on the lot detail panel with a saved-context drop-in to the financing flow. Smaller plan, ~1 week. Probably ships after the SEO work so qualification interactions are tracked properly.

3. **Save / compare / tour scheduling** — Future v3.

4. **Brand-aligned custom Mapbox style** — v1 uses Mapbox's `satellite-streets-v12` for context. If the bold/contrast direction feels diluted by satellite imagery in v1 testing, fall back to `mapbox://styles/mapbox/dark-v11` immediately (one-line change, no Studio work). v2: build a fully custom dark-mode style in Mapbox Studio with brass road colors and minimal labels. ~3 hours of design work in Mapbox Studio.

## Files touched summary

```
M  src/types/database.ts                                   (LotPolygon union type)
M  src/hooks/useLots.ts                                    (mapRowToLot parses both shapes)
M  src/components/siteplan/InteractiveSitePlan.tsx
A  src/components/siteplan/MapboxLotPicker.tsx
D  src/components/siteplan/FixedSitePlanViewer.tsx        (after backfill verified)
D  src/components/siteplan/FixedSitePlanEditor.tsx         (or update for new union; admin-only)
M  src/components/siteplan/LotListPanel.tsx
M  src/components/siteplan/LotDetailsPanel.tsx
A  src/components/siteplan/SitePlanFilters.tsx
A  src/components/siteplan/FullscreenSitePlan.tsx
A  src/hooks/useLotFit.ts
A  src/hooks/useConformingModels.ts
A  src/hooks/useSitePlanFilters.ts
M  src/pages/SitePlanFullScreen.tsx                        (thin wrapper, preserve routing contract)
D  src/data/lots/grand-haven.ts                            (after backfill verified)
D  src/data/lots/st-james-bay.ts                           (after backfill verified)
D  src/data/lots/ypsilanti.ts                              (after backfill verified)
A  supabase/migrations/<ts>_mapbox_lot_geometry.sql
M  package.json                                            (add mapbox-gl + @types/mapbox-gl)
A  src/hooks/__tests__/useLotFit.test.ts
A  e2e/siteplan-filters.spec.ts
```

~18 files touched in code, plus one one-time data-backfill task per community. Note: `VITE_MAPBOX_TOKEN` is set in Lovable's env-var UI for preview/production (not committed). For local dev, also add it to a gitignored `.env.local`. Lovable's chat agent should execute Steps 1-5 in order; Step 6 (data backfill) is the user's responsibility or a separate operations task.
