## Mapbox MVP Readiness — scope-locked

Goal: make the Mapbox path *available* in `/preview/developments/:slug/site-plan` when (and only when) all three preconditions are satisfied, and keep today's static preview behavior (including the verified `?lot=15` handoff) byte-identical when they aren't. No filters, no fullscreen modal, no UUID refactor, no static-lot deletions, no token commits.

### Current state (verified)

- `mapbox-gl ^3.23.1` and `@types/mapbox-gl ^3.5.0` are already in `package.json`.
- `src/components/siteplan/MapboxLotPicker.tsx` exists and already gates internally on `VITE_MAPBOX_TOKEN` and `development.map_center_*`.
- `src/components/siteplan/InteractiveSitePlan.tsx` (the embedded community-detail map) **already** implements the exact gate the user asked for:
  ```
  hasToken && hasCenter && hasGeoJsonLots  →  MapboxLotPicker
  else                                     →  FixedSitePlanViewer
  ```
  via `useLotsBySlug` + `useDevelopments` + `adaptDbLots`.
- `src/pages/SitePlanFullScreen.tsx` (the route the PM has been verifying — `/preview/developments/grand-haven/site-plan`) does **not** yet have the gate. It always renders `FixedSitePlanViewer` against the static `grandHavenLots` array, which is why `?lot=15` works there today.
- `supabase/_pending_migrations/20260512214014_mapbox_lot_geometry.sql` adds `map_center_lng/lat`, `map_zoom`, `models.width` but is **not yet applied**. So in the live preview today: no DB columns → `dbDevelopment.map_center_lng` is undefined → gate is false → fallback. That is the desired MVP state.
- `VITE_MAPBOX_TOKEN` is not set (`.env` only has the Supabase trio). So even after the migration lands, the gate stays false until the token is added — also the desired MVP state.

### What to change

Exactly one file: `src/pages/SitePlanFullScreen.tsx`. Mirror the `InteractiveSitePlan` gate so the full-screen route gains the same conditional Mapbox mount, with the static path preserved bit-for-bit when any precondition is missing.

1. Import `MapboxLotPicker`, `adaptDbLots`, `useLotsBySlug`, `useDevelopments`, and the DB `Lot`/`Development` types.
2. Compute `dbLots`, `dbDevelopment`, and `canUseMapbox` exactly as in `InteractiveSitePlan` (token + numeric `map_center_lng`/`lat` + at least one lot whose `polygon_coordinates?.type === 'Polygon'`).
3. When `canUseMapbox === false`: render today's `FixedSitePlanViewer` block unchanged. Static `grandHavenLots` (numeric ids) continue to drive `selectedLot`, `LotDetailsPanel`, `LotListPanel`, and the three CTAs (`<a href={selectedBuildPath}>`). The verified `?lot=15` handoff is untouched.
4. When `canUseMapbox === true`: render `MapboxLotPicker` in place of `FixedSitePlanViewer` only. The `lots` array driving the list/details/CTAs becomes `adapted.displayLots` (DB-backed). All other layout, headers, and the three `<a href={selectedBuildPath}>` CTAs stay where they are.
5. Translate Mapbox UUID selections back to the display lot via `adapter.uuidToNumericId`, the same way `InteractiveSitePlan` does. `selectedBuildPath` continues to flow through `buildHref(...)` with `String(selectedLot.id)` — no UUID-aware URL writer in this tranche.
6. Editor mode (`?edit=1`) and the "unavailable" branch are not touched.

Nothing else changes. Specifically out of scope per the user's directive:
- No filter chips, no fullscreen-modal toggle, no `useLotFit`, no drawers.
- No deletion of `src/data/lots/*.ts`.
- No retrofit of `useBuildSelection` to UUIDs.
- No applying the pending migration in this tranche (the gate is safe whether or not it's applied; without the columns, `canUseMapbox` is just always false).
- No commit/edit of `VITE_MAPBOX_TOKEN`.

### Verification

1. `bunx tsc --noEmit`.
2. Hard reload `https://id-preview-bd3f288f--b6311393-fa2b-46a4-a734-59db659ebfc9.lovable.app/preview/developments/grand-haven/site-plan`.
3. Expected: fallback path renders (no token / no GeoJSON lots in DB yet), `FixedSitePlanViewer` is visible, clicking Lot 15 yields header + overlay + bottom hrefs all equal to `/preview/developments/grand-haven/build?lot=15`.
4. Report whether the rendered surface was Mapbox or fallback (will be fallback under current env).

### Files touched

- `src/pages/SitePlanFullScreen.tsx` (only)

### Risks

- Adapter path on Mapbox mode uses hashed numeric ids, so once the token + geometry land, `?lot=15` will become a hashed integer. That URL-shape migration is explicitly out of scope per the user's tranche rules and is tracked in `docs/plans/mapbox-parcel-picker.md` Step 0/critical-context. Today, with the gate false in preview, this risk is not exercised.
