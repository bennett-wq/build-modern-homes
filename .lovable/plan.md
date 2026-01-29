

# Unified Pricing Architecture Plan
## Establishing a Single Source of Truth for BaseMod

---

## Executive Summary

This plan establishes a **single source of pricing truth** that powers every cost figure in the platform—from the model cards, through the 8-step configurator, to the final quote summary. It eliminates the current data fragmentation and provides a non-technical admin interface for pricing updates.

---

## Current State Analysis

### The Problem: Three Competing Data Sources

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CURRENT ARCHITECTURE (FRAGMENTED)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────────┐                                                  │
│   │ 1. LOCAL TypeScript  │ ◄─── pricingConfig.ts, localConfig.ts           │
│   │    (Hardcoded)       │      Static files checked into code             │
│   └──────────────────────┘                                                  │
│            │                                                                │
│            ▼                                                                │
│   ┌──────────────────────┐                                                  │
│   │ 2. RELATIONAL DB     │ ◄─── models, model_pricing, upgrade_options     │
│   │    (Newly Seeded)    │      Audit-ready with CMH quote numbers         │
│   └──────────────────────┘                                                  │
│            │                                                                │
│            ▼                                                                │
│   ┌──────────────────────┐                                                  │
│   │ 3. JSONB Config      │ ◄─── pricing_configs table (EMPTY!)             │
│   │    (Admin System)    │      What the pricing engine actually reads     │
│   └──────────────────────┘                                                  │
│                                                                             │
│   RESULT: Engine falls back to local files, database data is ignored       │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Impact**: The pricing engine (`usePricingConfig`) reads from `pricing_configs` which is empty, so it always falls back to local TypeScript files. The relational data we just seeded (models, model_pricing, upgrade_options) is never used for calculations.

---

## Target Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                     TARGET ARCHITECTURE (UNIFIED)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    ┌──────────────────────────────────────┐                 │
│                    │     ADMIN PRICING CONSOLE            │                 │
│                    │     (Non-Technical Interface)        │                 │
│                    │  • Edit model base prices            │                 │
│                    │  • Manage upgrade options            │                 │
│                    │  • Adjust sitework allowances        │                 │
│                    │  • Toggle markup percentages         │                 │
│                    │  • Publish → Goes live instantly     │                 │
│                    └───────────────┬──────────────────────┘                 │
│                                    │                                        │
│                                    ▼                                        │
│                    ┌──────────────────────────────────────┐                 │
│                    │     RELATIONAL DATABASE              │                 │
│                    │     (Single Source of Truth)         │                 │
│                    ├──────────────────────────────────────┤                 │
│                    │  • models (active portfolio)         │                 │
│                    │  • model_pricing (audit trail)       │                 │
│                    │  • upgrade_options (add-ons)         │                 │
│                    │  • pricing_zones (sitework)          │                 │
│                    │  • pricing_markups (retail layer)    │                 │
│                    └───────────────┬──────────────────────┘                 │
│                                    │                                        │
│                                    ▼                                        │
│                    ┌──────────────────────────────────────┐                 │
│                    │     UNIFIED PRICING ENGINE           │                 │
│                    │     (Reads from DB via React Query)  │                 │
│                    └───────────────┬──────────────────────┘                 │
│                                    │                                        │
│          ┌─────────────────────────┼─────────────────────────┐              │
│          ▼                         ▼                         ▼              │
│   ┌────────────┐           ┌────────────────┐        ┌────────────┐         │
│   │ Model      │           │ 8-Step Quote   │        │ Quote      │         │
│   │ Cards      │           │ Wizard         │        │ Summary    │         │
│   └────────────┘           └────────────────┘        └────────────┘         │
│                                                                             │
│   ALL PRICES ARE IDENTICAL BECAUSE THEY COME FROM THE SAME SOURCE          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Seed Missing Database Tables (Immediate)

**Goal**: Complete the relational schema so all pricing data exists in the database.

| Table | Current Status | Action Required |
|-------|----------------|-----------------|
| `models` | Populated | No change |
| `model_pricing` | Populated (9 records with crawl foundation) | No change |
| `upgrade_options` | Populated (14 options) | No change |
| `pricing_zones` | **EMPTY** | Seed Zone 3 (Michigan baseline) |
| `pricing_markups` | **EMPTY** | Seed default markup config (20%) |

**Data to Seed**:

**pricing_zones** (Zone 3 Michigan):
- baseline_total: $86,767
- crane_cost: $8,750
- home_set_cost: $13,750
- on_site_portion: $64,267
- contingency_buffer: 10% ($5,000)
- permits_soft_costs: $2,085
- utility_authority_fees: $7,546

**pricing_markups**:
- dealer_markup_pct: 20%
- installer_markup_pct: 20%
- developer_markup_pct: 5%

---

### Phase 2: Rewire the Pricing Engine

**Goal**: Make the pricing engine read from relational database tables instead of JSONB configs.

**Current Flow**:
```text
usePricingConfig → pricing_configs (JSONB, empty) → Falls back to local files
```

**New Flow**:
```text
usePricingEngine → useModels (relational) + usePricingZones + usePricingMarkups + useUpgradeOptions
                                    ↓
                   All data from normalized database tables
```

**Changes Required**:

1. **Create new data hooks**:
   - `usePricingZones()` - Fetches sitework costs from `pricing_zones` table
   - `usePricingMarkups()` - Fetches markup percentages from `pricing_markups` table
   - Enhance existing `useUpgradeOptions()` to filter by model/build type

2. **Refactor `calculatePriceBreakdown()`**:
   - Accept data from hooks instead of static imports
   - Use relational model pricing (`base_home_price` from `model_pricing`)
   - Use database upgrade option prices
   - Use database sitework costs and markups

3. **Update `usePricingEngine()`**:
   - Orchestrate all data hooks
   - Compute final pricing using relational data
   - Maintain same output interface for backward compatibility

---

### Phase 3: Unify All UI Components

**Goal**: Every dollar figure comes from the same calculation engine.

| Component | Current Source | New Source |
|-----------|---------------|------------|
| Model cards (`/models`) | Static MODELS array | `usePricingEngine()` |
| Step 3 - Model selection | Static models | `useModels()` + engine |
| Step 4 - Build Type | Static pricing | Engine with DB data |
| Step 5 - Service Package | Engine (local fallback) | Engine (DB data) |
| Step 6 - Floor Plan | Static OPTIONS | `useUpgradeOptions()` |
| Step 7 - Exterior | Static exterior config | `useUpgradeOptions()` |
| Step 8 - Summary | BuyerPricingDisplay | Engine (DB data) |
| Quote Summary page | Stored quote | Engine (DB data) |

**The BuyerPricingDisplay component already has the right interface**—it just needs to receive data from the unified engine.

---

### Phase 4: Enhance Admin Console

**Goal**: Allow non-technical admins to toggle pricing without code changes.

The admin console at `/admin/pricing` already has the structure for draft/publish/archive workflow. Enhancements needed:

1. **Model Pricing Editor**:
   - Table view of all models with editable base prices
   - Visual indicator for each build type (XMOD/MOD)
   - Foundation type selector
   - Audit trail display (CMH quote #, date)

2. **Upgrade Options Manager**:
   - Add/edit/remove upgrade options
   - Assign options to specific models or build types
   - Category organization (floor_plan, exterior, garage, foundation)

3. **Sitework Configuration**:
   - Edit zone-specific costs (crane, home set, on-site work)
   - Contingency buffer slider
   - Fee allowances (permits, utilities)

4. **Markup Controls**:
   - Dealer markup percentage (home package)
   - Installer markup percentage (sitework)
   - Developer markup percentage (community builds)

5. **Publish Workflow**:
   - Preview changes before publishing
   - One-click publish to make changes live
   - Version history with rollback capability

---

## Technical Details

### Database Schema Alignment

The existing tables are properly structured. Key relationships:

```text
models (1) ←──────────── (n) model_pricing
   │                            │
   │                            ├── build_type: xmod | mod
   │                            ├── foundation_type: crawl | slab | basement
   │                            ├── base_home_price: $XXX,XXX
   │                            └── quote_number: CMH audit trail
   │
   └──────────────────────────── upgrade_options
                                     │
                                     ├── applies_to_models: [model UUIDs]
                                     ├── applies_to_build_types: [xmod, mod]
                                     ├── category: floor_plan | exterior | garage | foundation
                                     └── base_price: $X,XXX
```

### Foundation Type Strategy

- **Default**: Crawl (8x8x16 CMU blocks on spread/trench footing)
- **Upgrade**: Full Basement (+$17,907, MOD only)
- **Alternative**: Slab (available but not default)

The `foundation_type` enum now includes `crawl` per the earlier migration.

### Pricing Calculation Formula

```text
RETAIL HOME PRICE = Base Home Price × (1 + dealer_markup_pct)
                  = $97,087 × 1.20 = $116,504

SITEWORK ALLOWANCE = (baseline + buffer) × (1 + installer_markup_pct)
                   = ($86,767 + $5,000) × 1.20 = $110,120

OPTIONS TOTAL = Σ(selected_option_prices) × (1 + dealer_markup_pct)

INSTALLED ESTIMATE = RETAIL HOME + SITEWORK + OPTIONS + FEES

All line items sum exactly to the displayed total (reconciliation check).
```

---

## User Experience Alignment

### The 8-Step Quote Flow

| Step | Purpose | Pricing Display |
|------|---------|-----------------|
| 1. Intent | "What brings you here?" | None |
| 2. Location | ZIP or "I don't know" | None |
| 3. Model | Pick a home | Sidebar hidden (focus on selection) |
| 4. Build Type | XMOD vs MOD | Home Package Only (factory costs) |
| 5. Service Package | Installed vs Supply-Only | Full pricing rail appears |
| 6. Floor Plan | Upgrade options | Options add to total in real-time |
| 7. Exterior | Colors, garage doors | Options add to total in real-time |
| 8. Summary | Final review | Complete breakdown with disclaimers |

**Key UX Principle**: Price only becomes visible once enough context exists for a meaningful estimate (Step 4+).

### Communities Flow

For `/developments/:slug/build`:
- Lot selection includes lot premium in total
- Pricing mode = `community_all_in` (includes developer markup)
- Same calculation engine, different mode flag

---

## Success Criteria

1. **Single Source of Truth**: All pricing originates from Supabase relational tables
2. **Zero Local Fallback**: Application errors if database is unavailable (fail-safe)
3. **Reconciliation**: Line items always sum exactly to displayed total
4. **Audit Trail**: Every price maps to a CMH quote number
5. **Admin Toggleable**: Non-technical users can update prices via UI
6. **Instant Updates**: Published changes reflect immediately (no code deploy)

---

## Implementation Order

1. Seed `pricing_zones` and `pricing_markups` tables
2. Create `usePricingZones` and `usePricingMarkups` hooks
3. Refactor `calculatePriceBreakdown` to accept database data
4. Update `usePricingEngine` to orchestrate all hooks
5. Test pricing flow end-to-end
6. Enhance Admin Console with visual editors
7. Add publish/preview workflow
8. Remove local TypeScript fallbacks (final cleanup)

