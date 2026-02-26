# Session 2 — Connect Tab 3 to Live Data
## Paste This Into Claude Code

---

## CONTEXT

You're continuing work on the BaseMod HomeMatch platform for BaseModHomes.

**What was built in Session 1:**
- `docs/homematch/PLATFORM-ARCHITECTURE.md` — Full technical blueprint (database schema, engine specs, component architecture)
- `docs/homematch/PRODUCT-SPEC-V2.md` — Complete product specification
- Tab 3 prototype (Acquisition Intelligence) with mock data at `/admin/acquisition`
  - 50 mock expired/withdrawn listings across 5 Michigan municipalities
  - Pre-computed model fit results for all 7 BaseMod models
  - Deal scoring engine (4 dimensions: seller motivation, lot viability, margin potential, market strength)
  - Full admin dashboard: stats cards, filters, sortable table, detail drawer with zoning verification, model fit cards, and pricing breakdown
  - Wired into existing admin auth + AdminShell + AdminNav

**What the prototype proved:**
- The model fit calculator logic works (width/depth checks against buildable envelope with setbacks)
- The deal scoring algorithm produces useful rankings
- The zoning verification table + confidence badges display correctly
- The detail drawer UX surfaces all relevant deal data in a scannable format

**Existing tech stack:** Vite + React 18 + TypeScript + Supabase + Tailwind/shadcn-ui + React Query

---

## SESSION 2 GOALS

Replace mock data with live data sources. Build the real engines.

### Deliverable 1: Model Fit Calculator (`src/lib/engines/modelFit.ts`)

Pure TypeScript function. Takes lot dimensions + zoning requirements + model specs → returns fit status, margins, and coverage.

Reference the architecture doc Section 3.1 for the interface spec. The mock data in `src/data/homematch/mock-acquisition-data.ts` has a working `generateModelFits()` function that implements the core logic — extract and formalize it.

### Deliverable 2: Land Division Calculator (`src/lib/engines/landDivision.ts`)

Pure TypeScript. Takes total frontage + min lot width → calculates feasible lot divisions, then runs model fit on each resulting lot.

Reference architecture doc Section 3.2.

### Deliverable 3: Deal Scoring Engine (`src/lib/engines/dealScoring.ts`)

Pure TypeScript. Takes listing data + model fit results + municipality data → returns composite 0-100 score with sub-scores and recommended action.

Reference architecture doc Section 3.4. The mock data has a working `generateAcquisitionScore()` that implements the scoring — formalize it.

### Deliverable 4: Supabase Migration

Create a Supabase migration that adds the HomeMatch tables defined in the architecture doc Section 2.1:
- `mls_listings`
- `municipalities`
- `zoning_districts`
- `parcel_zoning`
- `model_dimensions`
- `model_fits`
- `land_divisions`
- `acquisition_scores`
- `homematch_inquiries`
- `search_analytics`

Include RLS policies from architecture doc Section 4.3.

### Deliverable 5: Spark API Integration (Edge Function)

Create a Supabase Edge Function `sync-mls-listings` that:
1. Calls Spark API / FlexMLS to pull vacant land listings
2. Filters to target municipalities
3. Upserts into `mls_listings` table
4. Triggers model fit recalculation

**Note:** If Spark API credentials aren't available yet, build the function with a clear interface and mock response handler so it can be plugged in when credentials are ready.

### Deliverable 6: Wire Tab 3 to Live Data

Update the Tab 3 components to query Supabase instead of mock data:
- Replace `mockListings` import with React Query hook querying `mls_listings`
- Replace `mockAcquisitionScores` with query on `acquisition_scores`
- Replace `mockModelFits` with query on `model_fits`
- Keep mock data as fallback if Supabase tables are empty

---

## KEY FILES TO REFERENCE

- `docs/homematch/PLATFORM-ARCHITECTURE.md` — Database schema, engine specs, API routes
- `src/data/homematch/mock-acquisition-data.ts` — Working mock logic to formalize
- `src/pages/admin/AdminAcquisition.tsx` — Tab 3 page
- `src/components/homematch/tab3/` — Tab 3 components
- `src/components/homematch/shared/` — Shared components (reused in Tab 1 later)
- `src/integrations/supabase/client.ts` — Existing Supabase client
- `src/integrations/supabase/types.ts` — Existing database types
- `supabase/migrations/` — Existing migration pattern
- `supabase/functions/` — Existing Edge Function pattern (see `prequal-engine/`)

---

## IMPORTANT NOTES

1. **Model dimensions need confirmation.** The architecture doc lists width estimates (32ft for Hawthorne/Aspen/Belmont/Keeneland, 24ft for Laurel, 16ft for Cypress). These are inferred — Bennett needs to confirm exact measurements.

2. **Spark API credentials.** BaseModHomes has broker access but the API integration may not have credentials configured yet. Build the Edge Function with clear interface so it works with real or mock data.

3. **Regrid API.** Same as Spark — build the enrichment function with a clear interface, handle the case where credentials aren't yet available.

4. **Don't break existing functionality.** All new tables and functions are additive. The existing pricing, configurator, and admin features must continue working.

5. **Existing Supabase RLS pattern.** Check `supabase/migrations/` for how RLS is currently set up. Follow the same `is_admin()` function pattern.
