
# Phase 0 — BaseMod Communities Buyer Cockpit: Audit & Plan

No code will change in Phase 0. SHOW_COMMUNITIES stays false. All work continues to live under `/preview/*`. No publish, deploy, migrations, secrets, env edits, Mapbox token, MapboxLotPicker, fabricated geometry, or fabricated incentives.

---

## 1. Current UX Diagnosis

`/preview/communities` and `/preview/developments/:slug/site-plan` already work end-to-end after Phases 4–5.6, but they read as a brochure with a static schematic next to a card list, not a buyer cockpit:

- **Visual hierarchy is brochure-grade.** Hero band + 12-col split + map/list/detail look fine, but density is low, the map panel is a schematic that does not respond to selection in a "decision" way (no halo/zoom, no clustering), and there is no global "decision summary" giving the buyer a one-glance read of inventory across all communities.
- **Selection feels disconnected from the map.** The map is decorative; selection is driven by the rail. There's no map-to-list-to-detail directional flow, no hover sync into the map, no compare across communities.
- **Lot Studio is a generic site-plan + list.** Header metrics live above the canvas, but the canvas is fixed-aspect, the right rail is a flat list with no filters (status, ready-now, phase, premium band), and there is no persistent "selected lot inspector + price/action bar" docked at the bottom. The selected lot panel currently floats over the canvas.
- **Handoff is implicit, not orchestrated.** "Start your build" is a single button; there's no breadcrumb-style cockpit chrome (Community → Lot → Build), no carry-through of `lotId` into the build URL, no pre-build summary card.
- **Coming-soon states are correct but bland.** Ann Arbor / Chicago land on a friendly unavailable page, but it doesn't reinforce the cockpit metaphor (e.g., timeline, market-watch CTA).
- **Ready-now signal is correct but underplayed.** After 5.6, the metric is honest (4 in Grand Haven), but it's a small badge — not a top-of-funnel filter.
- **Mobile is functional but stacked.** Sticky CTA exists, but the canvas is 60vh with the lot list pushed below; there is no bottom-sheet inspector and no map/list toggle.

Net: it works; it doesn't yet *feel* like a billion-dollar prop-tech decision tool.

---

## 2. Proposed Route Structure (Preview Only)

All routes remain under `/preview/*`. Public `/communities` and `/developments` continue to redirect home while `SHOW_COMMUNITIES=false`.

```text
/preview/communities                                  → Communities Command Center
/preview/communities?slug=:slug                       → Deep-link a selected community (URL-driven)
/preview/developments/:slug                           → Existing community detail (unchanged)
/preview/developments/:slug/site-plan                 → Lot Studio (enhanced)
/preview/developments/:slug/site-plan?lot=:label      → Deep-link a selected lot (URL-driven)
/preview/developments/:slug/build                     → Existing build entry (unchanged)
/preview/developments/:slug/build?lot=:label          → Pre-selected lot carry-through (Phase 4)
```

New helpers (single source of truth, no scattered string concats):

- `src/lib/communityRoutes.ts` exporting `communityHref`, `sitePlanHref(slug, { lot? })`, `buildHref(slug, { lot? })`, `isPreviewPath(pathname)`. Replaces the ad-hoc `COMMUNITY_ROUTE_PREFIX` constants in `Communities.tsx` and `SitePlanFullScreen.tsx`.

No new public routes. No nav exposure. No redirects added.

---

## 3. Component Reuse Plan

**Reuse as-is (do not modify behavior):**
- `developments` registry, `useLots` / `useLotsBySlug`, static lot files under `src/data/lots/*`.
- `FixedSitePlanViewer`, `LotDetailsPanel`, `LotListPanel` (visual tweaks via props/className only — no behavior changes per the standing guardrail).
- `Layout`, `Header`, `Footer`, `Badge`, `Button`, `Card`, `FinancingBadge`, `AppraisalBadge`.
- `CommunityMapPanel` (kept as the schematic; we wrap it, don't replace it; no Mapbox).

**New components (cockpit chrome only, presentation layer):**
- `src/components/communities/CockpitHeader.tsx` — slim breadcrumb + global inventory summary (active communities, total available, total ready now). Read-only metrics derived from existing data.
- `src/components/communities/CommunityRail.tsx` — extracted, denser version of the current list; adds optional filter chips (Active / Ready now / Coming soon) driving local state only.
- `src/components/communities/CommunityInspector.tsx` — extracted, restyled `CommunityDetail` panel.
- `src/components/communities/InventoryStat.tsx` — shared metric tile.
- `src/components/siteplan/LotStudioHeader.tsx` — restyled header used inside `SitePlanFullScreen` (community name, breadcrumb, metrics, CTAs).
- `src/components/siteplan/LotStudioActionBar.tsx` — docked bottom action bar with selected-lot summary and "Build on Lot X" CTA (desktop + mobile variants).
- `src/components/siteplan/LotFilterChips.tsx` — status / ready-now / phase chips that filter the existing `LotListPanel` via a wrapper, without touching the panel's internals.

**New hook:**
- `src/hooks/useCommunityInventory.ts` — single source of `{ availableCount, readyNowCount, totalCount, startingPremium }` per slug + an aggregate across slugs. Wraps `useLotsBySlug` and centralizes the Phase 5.6 ready-now rule.

---

## 4. Data / Metric Plan

One canonical derivation, one place: `useCommunityInventory`.

Per slug (active communities only):
- `totalCount` = `lots.length`.
- `availableCount` = `lots.filter(l => l.status === 'available').length`.
- `readyNowCount` = subset of available where **explicit timing evidence** is present:
  - `restrictions.availability === 'Now'` (DB shape) **OR**
  - `availability === 'Now'` (static `Lot` shape) **OR**
  - `notes` contains `"available now"` (case-insensitive).
  - Never inferred from `status: 'available'` alone (Phase 5.6 rule, locked in).
- `startingPremium` = `min(premium ?? 0)` across available lots; **null** when no available lots.
- `priceFromAllIn` = existing `BASE_ALL_IN_PRICE + startingPremium` formula already used in `Communities.tsx`. We do **not** invent a new pricing math; we just relocate the existing constant alongside the hook so it stops being duplicated. No new pricing claims, no incentives, no monthly-payment math.

Aggregate (for cockpit header):
- `activeCommunities` = `developments.filter(d => d.status === 'active').length`.
- `totalAvailable` / `totalReadyNow` = sum across active slugs.
- Coming-soon count is shown as a separate stat — never mixed into "available".

Coming-soon (`ann-arbor`, `chicago`):
- All count fields are `null`/hidden.
- No build CTA, no site-plan CTA, no fabricated lots — enforced in helpers (`buildHref`/`sitePlanHref` return `null` for non-active slugs, mirroring today's behavior).

---

## 5. Design System Direction

Target: a calm, dense, decision-oriented cockpit — closer to Compass / Cadre / Opendoor Pro than a marketing site.

- **Layout.** Three-zone shell on desktop: 16-col grid → left rail (communities), center canvas (map for Communities; site-plan for Lot Studio), right inspector (selected community / selected lot). On mobile: top filter chips → canvas → bottom sheet inspector + sticky action bar.
- **Density.** Tighter vertical rhythm (`py-3` rail rows, 12–13px metadata, 14px primary), generous whitespace inside panels but compact between rows. Numbers up front, labels secondary.
- **Typography.** Existing semantic tokens. H1 28–36px tracking-tight. Stat numerals tabular (`tabular-nums`), labels `text-xs uppercase tracking-wider text-muted-foreground`.
- **Panels.** `rounded-xl border border-border bg-background` with subtle `shadow-sm`. Selected state uses accent border + 4–6% accent tint, not a heavy fill.
- **Map / canvas anatomy.** Canvas is the visual anchor (60–70% of viewport on desktop). Persistent "selected" halo + label callout. Hovered list row pulses the matching map node and vice versa (presentation-only sync; no Mapbox).
- **Mobile.** Map/list segmented toggle at top; sticky bottom action bar (64px) with selected-lot summary on the left and primary CTA on the right. Inspector becomes a bottom sheet.
- **Color & motion.** Existing Charcoal/Wood-Gold tokens only. Framer Motion fades + 8–12px translate on selection change. No parallax, no marquee.

This builds on the visual identity memory (warm-neutral paper UI, tight H1 tracking) and the design-reference gold-standard memory.

---

## 6. Implementation Phases

- **Phase 1 — Foundation (route helpers + inventory hook + cockpit chrome scaffolding).** Add `communityRoutes.ts` and `useCommunityInventory.ts`; introduce `CockpitHeader` and `InventoryStat`. Refactor `Communities.tsx` and `SitePlanFullScreen.tsx` to consume the helpers/hook with **zero behavior change**. Verification: existing Phase 5.6 metrics table reproduces exactly (Grand Haven 18/4/18, St. James Bay 30/4/30, Ypsilanti 30/4/30; Ann Arbor + Chicago unavailable).
- **Phase 2 — Communities Command Center.** Replace the current rail + detail with `CommunityRail`, `CommunityInspector`, restyled metrics, optional filter chips. Map panel stays schematic and gains hover/selection sync. Mobile gets a map/list segmented toggle.
- **Phase 3 — Lot Studio.** Add `LotStudioHeader`, `LotFilterChips`, and `LotStudioActionBar`. `FixedSitePlanViewer`, `MapboxLotPicker`, `LotListPanel`, `LotDetailsPanel` remain untouched internally — wrappers only.
- **Phase 4 — Build Handoff.** Carry `?lot=:label` from Lot Studio into the build URL. Pre-build mini-summary card (community + lot + premium) before entering the configurator. No pricing engine changes.
- **Phase 5 — Coming-Soon Polish.** Cockpit-styled unavailable state (timeline, "watch this market" CTA → existing `/contact?development=:slug`). No fabricated lots/dates beyond what `developments.ts` already states.
- **Phase 6 — Incentive Stack Preview.** Cautious eligibility surface with explicit source/confidence labels; no monthly payment, no guaranteed-incentive math. Plan-only reference to `useFinancingCalculator`; **scoped out of Phase 1–2**.
- **Phase 7 — QA.** DOM table (CTAs + hrefs + metrics) for all five communities, `bunx tsc --noEmit`, `bun run build`, mobile + desktop preview QA at 375 / 768 / 1280.

Each phase ships under `/preview/*` only, with PM verification gate before the next phase.

---

## 7. Exact File List — Phase 1 & Phase 2 Only

**Phase 1 (foundation, behavior-preserving):**
- `src/lib/communityRoutes.ts` — new.
- `src/hooks/useCommunityInventory.ts` — new.
- `src/components/communities/InventoryStat.tsx` — new.
- `src/components/communities/CockpitHeader.tsx` — new.
- `src/pages/Communities.tsx` — refactor to consume helpers/hook; remove duplicated `COMMUNITY_ROUTE_PREFIX` and inline metric derivation.
- `src/pages/SitePlanFullScreen.tsx` — refactor to consume helpers/hook; keep all existing CTA hrefs and unavailable-state logic.

**Phase 2 (Communities Command Center):**
- `src/components/communities/CommunityRail.tsx` — new (extracted + restyled list).
- `src/components/communities/CommunityInspector.tsx` — new (extracted + restyled detail).
- `src/components/communities/CommunityFilterChips.tsx` — new.
- `src/components/communities/CommunityMapPanel.tsx` — minor: accept `hoveredSlug` prop for hover sync; no Mapbox, no geometry changes.
- `src/pages/Communities.tsx` — recompose using the new components; mobile map/list toggle; preserves all existing routes and CTAs.

No edits in Phase 1–2 to: `InteractiveSitePlan`, `MapboxLotPicker`, `FixedSitePlanViewer`, `LotListPanel`, `LotDetailsPanel`, `developments.ts`, any `src/data/lots/*`, any pricing/build/configurator code, `featureFlags.ts`, `.env`, `Header`, `Footer`, Supabase, edge functions.

---

## 8. Acceptance Criteria

- `SHOW_COMMUNITIES` remains `false`; public `/communities` and `/developments` redirect to `/`; header/footer nav unchanged.
- `/preview/communities`, `/preview/developments/:slug/site-plan`, `/preview/developments/:slug/build` continue to render for Grand Haven, St. James Bay, Ypsilanti.
- Ann Arbor + Chicago: no fake lots, no build CTA, no site-plan CTA — friendly unavailable + interest-list path only.
- Phase 5.6 ready-now rule preserved exactly: Grand Haven 4, St. James Bay 4, Ypsilanti 4 (or whatever explicit timing evidence in static data yields), never inferred from `available` status.
- All community/site-plan/build URLs go through `communityRoutes.ts` helpers — no string-concatenated `/preview/...` hrefs left in `Communities.tsx` or `SitePlanFullScreen.tsx`.
- `bunx tsc --noEmit` and `bun run build` pass.
- No Mapbox token usage, no `MapboxLotPicker` mount, no migrations, no secrets, no env edits, no publish/deploy/PR, no pricing/incentive/financing math added.
- DOM verification table reproduced at the end of each phase.

---

## 9. Risks / Questions

- **Route helper drift.** If any consumer outside `Communities.tsx` / `SitePlanFullScreen.tsx` builds preview hrefs by hand (e.g., a future card on `Index.tsx`), the helper won't catch it. Mitigation: keep `/preview/*` strictly internal and grep for `'/preview/developments'` after Phase 1.
- **Inventory aggregation perf.** `useCommunityInventory` aggregate would call `useLotsBySlug` for every active slug on `/preview/communities`. Today the page already does this implicitly per `CommunityListItem`; aggregating shouldn't add net calls. Will confirm with React Query devtools in Phase 1.
- **`LotListPanel` filtering.** Standing guardrail forbids editing `LotListPanel`. Filter chips will live in a wrapper that filters the `lots` array passed in — verify this is acceptable, or descope filters to Phase 3.
- **`CommunityMapPanel` hover-sync prop.** Adding a `hoveredSlug` prop is presentation-only, but the panel sits in the no-edit list of "site-plan" components (Mapbox/Interactive). It is a *communities* map, not a site-plan map, so I read it as in-scope — please confirm.
- **Coming-soon timeline content.** `developments.ts` doesn't carry a launch date for Ann Arbor / Chicago. Phase 5 polish will not invent dates; it will only restate existing copy ("upcoming community…") in cockpit chrome.
- **Phase 6 incentive layer.** Highest fabrication risk. Plan keeps it last and behind explicit PM approval; Phases 1–5 will not surface any monthly payment, APR, or incentive value.

Stopping here for PM approval before any Phase 1 code lands.
