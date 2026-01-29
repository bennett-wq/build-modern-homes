
# BaseMod Platform Audit: Pricing Engine & User Flow Review
## Executive Summary for VC-Ready Architecture

This audit evaluates the BaseMod pricing system and user flows across both the **Community Lot Sales** (4-step) and **Get a Quote** (8-step) wizards, with recommendations to ensure a robust, scalable foundation.

---

## 1. DATABASE SCHEMA AUDIT

### 1.1 Strengths - VC-Grade Architecture
Your relational schema is solid with excellent audit trails:

| Table | Records | Assessment |
|-------|---------|------------|
| models | 6 active | Complete with proper metadata |
| model_pricing | 9 entries | Excellent - includes quote_number, quote_date audit trail |
| developments | 3 active | Properly structured |
| lots | 78 total (78 available) | Well-organized with premiums |
| upgrade_options | 53 active | Comprehensive catalog |
| pricing_zones | 1 | **Gap: Need regional expansion** |
| pricing_markups | 1 | Single default is appropriate |

**Key Audit Win:** The `model_pricing` table correctly stores `quote_number` and `quote_date` fields mapping every price to CMH Manufacturing spreadsheets - this is due diligence ready.

### 1.2 Critical Gaps Identified

**GAP 1: Empty Exterior/Garage Tables**
- `exterior_packages`: 0 active records
- `garage_door_options`: 0 active records

The UI falls back to static TypeScript files (`src/data/hawthorne-exteriors.ts`, etc.) when these are empty. This creates a dual-data-source risk where changes to static files diverge from the database.

**RECOMMENDATION:** Seed exterior packages and garage door options into the database to achieve single source of truth.

**GAP 2: Model-Specific Pricing Availability**
| Model | XMOD | MOD | Issue |
|-------|------|-----|-------|
| Hawthorne | YES | YES | Complete |
| Aspen | YES | YES | Complete |
| Belmont | YES | YES | Complete |
| Keeneland | YES | NO | Missing MOD |
| Laurel | NO | YES | Missing XMOD |
| Cypress | YES | NO | Missing MOD |

**RECOMMENDATION:** Implement "Coming Soon" UI treatment for missing build types rather than hiding them.

**GAP 3: Single Pricing Zone**
Currently only Zone 3 Michigan is configured. The `pricing_zones` table supports regional cost variations but isn't being utilized.

**RECOMMENDATION:** Add Zone 4 (Florida) data for St. James Bay with region-specific sitework baselines.

---

## 2. PRICING ENGINE ARCHITECTURE AUDIT

### 2.1 Strengths - Single Source of Truth

Your architecture correctly implements a **canonical pricing calculation** pattern:

```text
Database Tables                    React Query Hooks                 Unified Engine
----------------------             ---------------------             ----------------
models + model_pricing     -->     useModels()            -->
pricing_zones              -->     usePricingZones()      -->       useUnifiedPricingEngine()
pricing_markups            -->     usePricingMarkups()    -->          |
upgrade_options            -->     useUpgradeOptions()    -->          v
                                                           useConfiguratorPricing() (adapter)
                                                                       |
                                                                       v
                                                           BuyerPricingDisplay (UI)
```

**Verified Calculation Formula:**
- Home Retail = Factory Quote x 1.20 (Dealer Markup)
- Sitework Retail = (Baseline + 10% Buffer) x 1.20 (Installer Markup)
- Options Retail = Option Base Price x 1.20 (same markup)
- Lot Premium = Pass-through (no markup)

**DEV ASSERTION:** The engine includes a reconciliation check (`import.meta.env.DEV`) that verifies line items sum to displayed total - excellent.

### 2.2 Pricing Display Modes

| Mode | Label | When Used |
|------|-------|-----------|
| `supply_only` | "Home Package Estimate" | Step 4 display override, explicit user selection |
| `delivered_installed` | "Typical Installed Allowance (Preliminary)" | Default for most flows |
| `community_all_in` | "All-in Price (Includes Lot)" | Community wizard with lot selected |

**Verified:** Step 4 (Build Type) correctly forces `supply_only` display for MOD/XMOD comparison, then reverts to user's actual selection from Step 5 onward.

### 2.3 Issues Found

**ISSUE 1: Duplicate State Management Systems**

Two parallel state systems exist:
1. **Legacy:** `useConfiguratorState.ts` + `useBuildSelection.ts` (localStorage-based)
2. **New:** `useConfiguratorStore.ts` (Zustand with persistence)

The 8-step `/build` wizard uses `useConfiguratorState`.
The 4-step community wizard uses `useBuildSelection`.
Neither consistently uses the newer `useConfiguratorStore`.

**RISK:** Data inconsistency between flows if user switches contexts.

**RECOMMENDATION:** Complete migration to `useConfiguratorStore` as the single source of truth for all flows.

**ISSUE 2: Static Fallback Risk**

The `useModels` hook has `placeholderData: mapStaticModelsToDbShape()` which falls back to static TypeScript data. If database fetch fails silently, users may see stale pricing.

**RECOMMENDATION:** Add explicit error UI when database fetch fails rather than silent fallback.

---

## 3. USER FLOW AUDIT

### 3.1 Community Flow (4-Step Wizard)
Route: `/developments/:slug/build`

```text
Step 1: Lot Selection
  |-- Interactive site plan with polygon selection
  |-- Premium lot pricing displayed (AnimatedPrice)
  |-- Database: lots table (78 records)
  
Step 2: Model Selection
  |-- Filtered by development's conforming models
  |-- "Starting from" prices from unified engine
  |-- Database: models + model_pricing

Step 3: Exterior Design
  |-- Package + Garage Door selection
  |-- ISSUE: Falls back to static data (no DB records)
  
Step 4: Review
  |-- Full pricing breakdown
  |-- BuyerPricingDisplay with community_all_in mode
  |-- CTA: Schedule Call, Explore Financing
```

**UX Assessment:** Clean, focused 4-step flow. Premium lot pricing with odometer animations is excellent. However, exterior selection is disconnected from database.

### 3.2 Direct Flow (8-Step Wizard)
Route: `/build`

```text
Step 1: Intent Selection
  |-- Own Land / Find Land / BaseMod Community
  |-- Single-column centered layout (no pricing rail)

Step 2: Location
  |-- ZIP code entry with validation
  |-- "I don't know yet" option
  |-- Single-column centered layout (no pricing rail)

Step 3: Model Selection
  |-- All 6 models displayed
  |-- Model change triggers inline feedback
  |-- Single-column centered layout (no pricing rail)

Step 4: Build Type (MOD/XMOD)
  |-- Two-column layout with pricing rail appears
  |-- DISPLAY OVERRIDE: Forces supply_only for comparison
  |-- Auto-selects if only one type available

Step 5: Service Package
  |-- Delivered & Installed (default)
  |-- Home Package Only (supply_only)
  |-- Community All-In (requires lot)
  |-- Pricing rail shows actual service package

Step 6: Floor Plan Options
  |-- 53 upgrade options from database
  |-- Filtered by model + build_type
  |-- Toggle selection updates pricing

Step 7: Exterior Design
  |-- Same as community Step 3
  |-- Package + Garage selection
  
Step 8: Summary
  |-- Full breakdown + disclaimers
  |-- Shareable URL generation
  |-- CTAs: Schedule Call, Financing, Pre-Qualification
```

**UX Assessment:** Well-designed progressive disclosure. Steps 1-3 hide pricing to focus on intent. Steps 4+ reveal full pricing context.

### 3.3 UX Issues Found

**ISSUE 1: Choice Overload on Floor Plan Options**
53 upgrade options displayed flat. Categories exist but aren't grouped in UI for the `/build` wizard.

**RECOMMENDATION:** Group options by category (Floor Plan, Exterior, Heating, Appliance, etc.) with collapsible sections.

**ISSUE 2: No Floor Plan Options in Community Wizard**
The 4-step community wizard skips upgrade options entirely - users can't add upgrades until after contacting sales.

**RECOMMENDATION:** Consider adding optional "Customize" step between Exterior and Review, or clearly indicate "upgrades available during consultation."

**ISSUE 3: Resume Prompt Complexity**
Two different resume mechanisms exist:
- `ResumePrompt` component in Configurator
- `hydrateFromLegacy` in useConfiguratorStore

This creates potential for conflicting restoration logic.

---

## 4. DATA INTEGRITY RECOMMENDATIONS

### 4.1 Database Seeding Required

Execute immediately:

| Table | Action | Records Needed |
|-------|--------|----------------|
| `exterior_packages` | Seed from static files | ~6-8 per model family |
| `garage_door_options` | Seed from static files | ~4-6 options |
| `pricing_zones` | Add Florida zone | 1 record for Zone 4 |

### 4.2 State Management Consolidation

Migrate to single store:
1. Update `BuildWizard.tsx` to use `useConfiguratorStore` instead of `useBuildSelection`
2. Update `Configurator.tsx` to use `useConfiguratorStore` instead of `useConfiguratorState`
3. Deprecate `useBuildSelection.ts` and `useConfiguratorState.ts`

### 4.3 Quote Persistence

Currently quotes save to localStorage only. Add database persistence:
1. On Step 8 completion, insert to `quotes` table
2. Generate UUID for shareable quote links
3. Enable quote retrieval via `/quote/:quoteId` route

---

## 5. TECHNICAL IMPLEMENTATION PLAN

### Phase 1: Data Integrity (Immediate)
1. Seed `exterior_packages` table with Hawthorne, Aspen, Belmont packages
2. Seed `garage_door_options` table with standard and upgrade options
3. Add Zone 4 Florida to `pricing_zones`

### Phase 2: State Consolidation (1-2 days)
1. Update `BuildWizard.tsx` to use Zustand store
2. Update `Configurator.tsx` to use Zustand store
3. Add migration helper for localStorage data
4. Remove legacy hooks after verification

### Phase 3: Quote Persistence (1 day)
1. Insert quotes to database on wizard completion
2. Add quote retrieval API
3. Generate shareable quote URLs

### Phase 4: UX Polish (Ongoing)
1. Group upgrade options by category
2. Add "Coming Soon" treatment for missing model configs
3. Consider adding upgrades to community wizard

---

## 6. SUMMARY

### What's Working Well
- Robust relational database schema with audit trails
- Single canonical pricing engine with reconciliation checks
- Clean progressive disclosure in 8-step wizard
- Premium UI with animated pricing transitions
- Proper markup calculations (20% dealer, 20% installer)

### Critical Fixes Required
1. **Database:** Seed exterior_packages and garage_door_options (currently empty)
2. **State:** Consolidate to single Zustand store (currently 3 parallel systems)
3. **Quotes:** Add database persistence (currently localStorage only)

### Optional Enhancements
- Regional pricing zones for Florida
- Grouped upgrade options UI
- Model availability constraints ("Coming Soon" for missing configs)

This foundation is solid for VC due diligence. The pricing audit trail, relational schema, and calculation integrity are all institutional-grade. The critical path items are data seeding and state consolidation.
