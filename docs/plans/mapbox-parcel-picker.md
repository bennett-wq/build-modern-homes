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
- `src/pages/SitePlanFullScreen.tsx` — **Read the current file first** before rewriting. It has its own URL-param handling and scroll behavior that must be preserved. Render `<FullscreenSitePlan>` directly so the standalone deep-link route still works, but keep the same `useParams()` -> developmentSlug contract and any analytics events the current page fires.

**Initial-mount behavior for `?fullscreen=1`:** If a user lands directly on `/developments/ypsilanti?fullscreen=1`, the dialog should open AFTER `useLotsBySlug` resolves (i.e., gate the `<Dialog open={fullscreen && !isLoading}>`). Otherwise the dialog opens against an empty map and Mapbox throws during init. The embedded view shows the skeleton; the dialog mounts when data is ready.

## Step 5 — Filters + "what fits" + fullscreen

Create:

| File | Purpose |
|---|---|
| `src/components/siteplan/SitePlanFilters.tsx` | Chip row: status multi-toggle, fits-model dropdown, price range slider, lot size range slider. State synced to URL via `useSearchParams`. |
| `src/components/siteplan/FullscreenSitePlan.tsx` | shadcn `Dialog` that fills the viewport. Renders the same `MapboxLotPicker` + `LotListPanel` + `LotDetailsPanel` as the embedded view. Triggered by `?fullscreen=1`. Close via Esc / X / outside-click. **Important: shadcn `DialogContent` defaults to `max-w-lg` centered. Override with `className="max-w-none w-screen h-screen rounded-none p-0 gap-0"` to actually fill the viewport. Mapbox also requires its container to have an explicit pixel height — wrap the map in a flex parent with `flex-1` + `min-h-0`.** |
| `src/hooks/useLotFit.ts` | `(lot, conformingModels) => Model[]`. Computes which models fit based on lot acreage + restrictions vs. model footprint (length × width + setbacks). Memoized. **NULL-dimension rule: if either `model.length` OR `model.width` is NULL on the model row, EXCLUDE that model from the fit set (don't silently approve). Show a "More homes coming soon" note in `LotDetailsPanel` when the fit set is empty so users aren't confused.** |
| `src/hooks/useSitePlanFilters.ts` | URL-param-backed filter state. Wraps `useSearchParams` with typed getters/setters. Computes `filteredLotIds` set. |

Update:

- `src/components/siteplan/LotListPanel.tsx` — restyle for charcoal theme, sync with `filteredLotIds` (dim non-matching rows).
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
- `e2e/siteplan-filters.spec.ts` (Playwright) — deep-link state restoration + filter interaction. **Do not mock the Mapbox token** — Mapbox SDK throws on invalid tokens before any UI mounts. Instead: support a `?nomap=1` URL param in `MapboxLotPicker` that short-circuits to a static "Map disabled in test mode" placeholder. The Playwright test uses this flag so it can assert filter UI and lot detail panel behavior independently of Mapbox network calls.

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
| `mapbox-gl` bundle size (~250KB gzip in v3+; includes the WebGL renderer and PMTiles support) | Dynamic-import the map component so it only loads on community detail pages: `const MapboxLotPicker = lazy(() => import('./MapboxLotPicker'))`. Render a Suspense fallback skeleton at the map's intended dimensions to avoid layout shift. |
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
