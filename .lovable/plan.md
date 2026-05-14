# Communities Discovery — Phases 3.5 → 5

PM-ready sequencing for the `/preview/communities` track. Each phase has a single goal, hard boundaries, exit criteria, and a re-verification protocol so we stop closing phases on unverified claims.

---

## Phase 3.5 — Verify the sticky CTA fix end-to-end

**Goal:** Confirm Phase 3.4's dynamic-binding fix actually produces correct DOM `href` values for every community on the internal preview, then formally close the 3.x track.

**Why this is its own phase:** Phase 3.4 shipped the code fix but explicitly noted DOM-level href confirmation was never captured. We've already burned 3.3 → 3.4 on "I thought it was fixed." No further Communities work happens until this is verified with literal href strings.

### Scope

1. Open `/preview/communities` in the browser tool at the mobile viewport that triggers the sticky CTA (≤768px, e.g. 390×844).
2. For each of the 5 communities, in order:
   - Grand Haven
   - St. James Bay
   - Ypsilanti
   - Ann Arbor
   - Chicago Suburbs
   Select the community via the rail (and via the map marker, separately) and extract the literal `href` of the sticky bottom CTA, plus whether the CTA is present at all.
3. Record results in a table: `community → expected href → actual rail-selection href → actual map-selection href → presence for coming-soon`.
4. Repeat the same extraction for the desktop primary CTA on the `CommunityDetail` card (same `getCommunityBuildPath` helper, but worth confirming both call sites).
5. If any href is wrong: fix the binding inside `src/pages/Communities.tsx` only, then re-run steps 2–4 from scratch. No partial verification.

### Hard boundaries

- `SHOW_COMMUNITIES` stays `false`.
- No nav entry for `/preview/communities`.
- No publish, no PR, no migration, no `.env`, no secrets.
- No copy or layout changes beyond what's required to fix a wrong href.
- No new components.

### Exit criteria

- Verification table posted with all 10 href values (5 rail + 5 map) plus 5 desktop hrefs.
- All 3 active communities resolve to `/developments/{slug}/build` with the correct slug.
- Both coming-soon communities show no build CTA (sticky absent, desktop replaced by "Join interest list").
- `bunx tsc --noEmit` clean.
- `bun run build` clean.

### Re-verification trigger

If any later phase touches `Communities.tsx` or `getCommunityBuildPath`, re-run the full 15-row table before claiming that later phase complete.

---

## Phase 4 — Lot-level connective tissue for one community

**Goal:** Make `/preview/communities` reviewable as a buyer journey, not just a regional map. Today PM clicks "Get all-in price" and lands cold in the wizard. Add a single connective surface so PM can preview the lot-picking experience for the one community that has real lot polygons (Grand Haven), without enabling Mapbox or touching data.

**Why now:** Phase 3.x answered "which community"; nothing answers "and then what." Without this, every future Communities polish phase is decorating a dead-end.

### Scope

1. **Active community card — "Preview lots" affordance (Grand Haven only).**
   - On the `CommunityDetail` card, when `selected.slug === 'grand-haven'` and `selected.active === true`, add a secondary link "Preview {N} available lots →" beneath the existing primary CTA.
   - `N` comes from the existing static `src/data/lots/grand-haven.ts` count of `status === 'available'`. No DB call, no new hook.
   - Link target: `/developments/grand-haven/site-plan` (the existing `SitePlanFullScreen` route — already shipped, already image-mode safe).
   - For St. James Bay and Ypsilanti: same affordance pattern, also pointing at their existing site-plan routes, gated on `lots/{slug}.ts` existing.
   - For coming-soon communities: do not render.

2. **Sticky mobile CTA — secondary line.**
   - Below the existing "Get all-in price" sticky CTA, add a single muted secondary link "View site plan" pointing at the same `/developments/{slug}/site-plan` route, only when a static lots file exists for the slug.
   - Same `key={selected.slug}` discipline as the primary CTA to avoid the stale-href class of bug from Phase 3.3/3.4.

3. **No new data, no Mapbox, no flag flips.** Reuse the existing `FixedSitePlanViewer` route exactly as it renders today.

### Hard boundaries

- `SHOW_COMMUNITIES` stays `false`.
- No edits to `InteractiveSitePlan`, `FixedSitePlanViewer`, `MapboxLotPicker`, `useLots`, or any wizard step.
- No new lot data, no polygon edits, no centroid changes.
- No deep-link into `/build` Step 1 — that's a Phase 4.5 candidate, not this scope.
- No interest-list capture for coming-soon communities (separate backend convo).
- No analytics events added — that's a separate instrumentation phase.

### Exit criteria

- For Grand Haven, St. James Bay, Ypsilanti: rail/map selection shows both the existing build CTA and the new "Preview lots" / "View site plan" affordance, and both links resolve to the correct slug.
- For Ann Arbor, Chicago Suburbs: neither affordance renders.
- Re-run Phase 3.5's 15-row href verification table to prove no regression on the primary CTA bindings.
- `bunx tsc --noEmit` clean.
- `bun run build` clean.
- DOM `href` evidence captured for the new secondary affordance on all 3 active communities.

### Re-verification trigger

Any subsequent change to `CommunityDetail` card or sticky CTA region requires re-running the Phase 3.5 table plus the new "secondary affordance present/absent" check across all 5 communities.

---

## Phase 5 — Mapbox migration gate: decide and document

**Goal:** Resolve the standing ambiguity around `supabase/_pending_migrations/20260512214014_mapbox_lot_geometry.sql`. It has been deferred across Phases 2.3, 3.1, 3.2, 3.3, 3.4. Every map-real future phase (live Mapbox, parcel digitization, per-lot map premiums, lot-level pricing rail surfacing on map) is blocked behind it. We either schedule it or we formally park it — we stop planning around a phantom.

**This is a decision phase, not an implementation phase.** No migration is applied in this phase without explicit PM greenlight on the decision deliverable.

### Scope

1. **Audit deliverable** (read-only, no code changes):
   - Read `supabase/_pending_migrations/20260512214014_mapbox_lot_geometry.sql` and document exactly what it adds: columns on `developments`, columns on `models`, columns on `lots`, any new tables, any RLS changes.
   - Cross-reference each addition against current consumers in code (`MapboxLotPicker`, `InteractiveSitePlan` mode-derivation gate, `useLots`, `useDevelopments`).
   - Identify which additions are required for *any* map-real work vs. which are speculative.
   - Identify any additions that conflict with current `src/integrations/supabase/types.ts` (which is auto-managed).

2. **Risk + dependency note:**
   - List what gets unblocked the moment the migration is applied (still gated by `VITE_MAPBOX_TOKEN` absence, so zero visible change).
   - List what is still blocked even after the migration: Mapbox token in env, GeoJSON polygon authoring for at least one community, parcel digitization workflow, any per-lot map premium surfacing.
   - Confirm the auto-gate in `InteractiveSitePlan` (`canUseMapbox` boolean) still falls back to image mode when GeoJSON is absent — so applying the migration alone is non-visible.

3. **Decision options presented to PM** (this phase ends with PM picking one; no code in this phase executes the choice):
   - **A. Apply now.** Schedule the migration apply as Phase 5.1, with rollback plan, types-regeneration step, and post-apply smoke (every community still renders image mode, no console errors, `useDevelopments` still types correctly).
   - **B. Park formally.** Move the file out of `_pending_migrations/` into `_parked_migrations/` with a README explaining the parking reason and the trigger condition that would un-park it (e.g. "first community with authored GeoJSON polygons + Mapbox token provisioned"). Update `.lovable/plan.md` to remove the "pending migration" framing.
   - **C. Split the migration.** If the audit shows the file mixes truly-needed columns (e.g. `developments.map_center_*`) with speculative ones (e.g. `models.width`), draft a smaller migration for option A and park the rest under option B.

### Hard boundaries

- No migration applied in Phase 5 itself. Phase 5 produces a written audit + recommendation only.
- No `.env` edits, no Mapbox token provisioning, no secrets touched.
- No edits to `src/integrations/supabase/*`.
- `SHOW_COMMUNITIES` stays `false`.
- No code changes outside (optionally) moving the SQL file between `_pending_migrations/` and `_parked_migrations/` if PM picks option B during this phase. If they don't pick during this phase, the file stays where it is.

### Exit criteria

- Audit document delivered (chat reply or `docs/plans/mapbox-migration-decision.md`) covering: what the migration adds, current consumers, what unblocks, what remains blocked, conflict surface with auto-generated types.
- Three options (A / B / C) presented with concrete next-phase scoping for each.
- PM selects an option in the same review pass. If A or C: spawn Phase 5.1 with the apply + types regen + smoke plan. If B: execute the file move and the `.lovable/plan.md` update inside Phase 5 itself.

### Re-verification trigger

If option A or C is chosen, Phase 5.1 must include:
- Pre-apply: capture `useDevelopments` type signature.
- Post-apply: regenerate types, confirm signature delta is additive only, smoke-test every existing community page renders identically (Grand Haven, St. James Bay, Ypsilanti, Ann Arbor, Chicago Suburbs preview cards + Grand Haven `/developments/grand-haven/site-plan` image-mode render).
- Re-run Phase 3.5's 15-row href table to prove no Communities regression.

---

## What is explicitly NOT in this plan

- Live Mapbox rendering for any community.
- Parcel digitization / GeoJSON authoring.
- Incentive stacking or per-program eligibility on community cards.
- "From $X/mo" financing surfacing on community cards (good idea, separate phase, depends on PM appetite).
- Interest-list lead capture for coming-soon communities (needs backend + routing decision).
- Enabling `SHOW_COMMUNITIES` publicly.
- Any publish, PR, or deployment.

## Phase ordering rationale

3.5 must precede 4 because 4 touches the same CTA region and would inherit any unverified binding bug. 4 must precede 5 because 4 proves the buyer journey is reviewable without map-real data, which is the input PM needs to weigh option A vs. B in 5. 5 is a gate, not a build — it determines whether any subsequent phase can be map-real or has to stay schematic.
