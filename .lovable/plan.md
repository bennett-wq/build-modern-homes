## Mount the Mapbox Lot Picker (Phase 2.3)

Goal: render `MapboxLotPicker` inside the existing site plan UX, behind a safe auto-gate so the legacy `FixedSitePlanViewer` stays the fallback. No data is fabricated; if a community has no map metadata or no GeoJSON lots, we render the existing image-overlay site plan exactly as today.

### Honest blockers (do not block this phase, but block visible Mapbox)

1. **Mapbox token** — `VITE_MAPBOX_TOKEN` not yet set in Lovable env-var UI.
2. **Pending migration** — `developments.map_center_lng/lat/zoom` + `models.width` staged in `_pending_migrations/` but not applied.
3. **No GeoJSON lot polygons in DB** for any community (Grand Haven PDFs need digitizing).

Until all three are satisfied for a given community, that community auto-renders image mode. Zero regression.

### Step 1 — Source of truth for lots in `InteractiveSitePlan`

Today `InteractiveSitePlan` reads from `src/data/lots/*.ts` (numeric IDs, image-xy polygons). Mapbox needs DB rows (UUIDs + GeoJSON). Wire a dual-source read:

- Add `useLots(developmentSlug)` next to the existing static lookup.
- Build `dbLots` (from `useLots`) and `staticLots` (existing arrays).
- Pick `dbLots` when it has rows, otherwise fall back to `staticLots`.

### Step 2 — Mode selector

```ts
const canUseMapbox =
  Boolean(import.meta.env.VITE_MAPBOX_TOKEN) &&
  typeof development.map_center_lng === 'number' &&
  typeof development.map_center_lat === 'number' &&
  dbLots.some(l => l.polygon_coordinates?.type === 'Polygon');
const mode: 'mapbox' | 'image' = canUseMapbox ? 'mapbox' : 'image';
```

`image` mode → existing `FixedSitePlanViewer` (unchanged). `mapbox` mode → `MapboxLotPicker` in the same slot, same parent height/`flex-1` constraints.

### Step 3 — Adapter at the selection boundary

`MapboxLotPicker` emits DB `Lot` (UUID id). `LotDetailsPanel` / `LotListPanel` are typed against the static `Lot` (numeric id). To avoid a viral type rewrite:

- Local `toDisplayLot(dbLot)` adapter inside `InteractiveSitePlan` (or sibling `lot-adapter.ts`) maps UUID → stable numeric hash, copies status/acreage/lot_number/premium.
- `LotListPanel` in mapbox mode is fed the adapted list.
- Round-trip selection through a `Map<number, DbLot>` so click handlers can hand the original DB row back to Mapbox feature-state.

Constraint: no edits to `LotDetailsPanel`, `LotListPanel`, `FixedSitePlanViewer`, `MapboxLotPicker`, `useLots`, or any other shared component. All glue lives in `InteractiveSitePlan` (+ optional adapter file).

### Step 4 — Filter set wiring

`MapboxLotPicker` requires `filteredLotIds: Set<string>`. No filter UI yet → pass `new Set(dbLots.map(l => l.id))`. Memoize with a primitive key (sorted joined ids) so feature-state updates don't churn.

### Step 5 — Preserve every today-behavior in image mode

- Stats bar (Available / Reserved / Sold) reads the displayed list.
- "Full Screen" link still points at `/developments/:slug/site-plan`.
- Mobile lot-list sheet behavior unchanged.

### Step 6 — Verification

- `bunx tsc --noEmit`
- `bun run build`
- Smoke: with no token + no DB rows → image mode, identical to today.
- Read the `mode === 'mapbox'` branch to confirm wiring.

### Out of scope

- No filter chips UI.
- No `?fullscreen=1` URL handling rewrite.
- No data backfill, no migration apply, no `.env` edits, no publish.
- No changes to `useBuildSelection` URL writer or `lotId` numeric→UUID retirement (separate phase, lands when wizard actually consumes a UUID-backed lot).

### Files this phase touches

- `src/components/siteplan/InteractiveSitePlan.tsx` — `useLots`, mode derivation, adapter usage, mount branch.
- (optional) `src/components/siteplan/lot-adapter.ts` — `toDisplayLot` helper.

### Result

- Every community today: zero visible change (image mode).
- The moment a community has `map_center_*` set + ≥1 lot row with a GeoJSON polygon + `VITE_MAPBOX_TOKEN` is present, that community auto-upgrades to live Mapbox. No code change, no flag flip.
