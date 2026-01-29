
# Unified Pricing Architecture & Admin Experience Plan

## Executive Summary

BaseMod currently has two separate user flows with divergent data structures and pricing representations:
1. **Communities Flow** (`/developments/:slug/build`) - Uses `BuildWizard` with community-specific data
2. **Get a Quote Flow** (`/build`) - Uses `Configurator` with general lead-gen data

This plan consolidates these into a unified architecture with a world-class admin experience worthy of a $1B VC-backed proptech company.

---

## Current State Assessment

### Database Structure (Current)
```text
+-------------------+     +------------------+     +--------------+
| pricing_configs   |     | admin_users      |     | user_roles   |
+-------------------+     +------------------+     +--------------+
| id (uuid)         |     | user_id (uuid)   |     | id (uuid)    |
| created_at        |     | created_at       |     | user_id      |
| created_by        |     +------------------+     | role         |
| status            |                              | created_at   |
| label             |                              +--------------+
| effective_at      |
| config (JSONB)    |<-- All pricing in one blob
+-------------------+
```

### Data Architecture Issues Identified

| Issue | Impact | Severity |
|-------|--------|----------|
| **Dual state systems** | `useConfiguratorState` + `useBuildSelection` store overlapping data differently | High |
| **Pricing in TypeScript files** | Models/pricing in `src/data/*.ts` duplicates what could be in DB | High |
| **JSONB blob architecture** | Single `config` column stores models, options, fees, markups - no relational integrity | Medium |
| **No development-specific pricing** | Communities cannot have custom lot premiums, ARB packages, or site conditions | High |
| **Hardcoded lots** | `grand-haven.ts` and `st-james-bay.ts` are static files | Medium |
| **No exterior package pricing** | Exterior packages in `packages.ts` lack pricing data | Medium |

### Flow Divergence

| Aspect | Communities Flow | Quote Flow |
|--------|-----------------|------------|
| Entry point | `/developments/:slug/build` | `/build` |
| State hook | `useBuildSelection` | `useConfiguratorState` |
| Steps | 4 (Lot → Model → Exterior → Review) | 8 (Intent → Location → Model → BuildType → Service → FloorPlan → Exterior → Summary) |
| Pricing mode | Always `community_all_in` | Dynamic (supply_only, delivered_installed, community_all_in) |
| Lot selection | Required (from development) | Not available |
| ARB restrictions | Enforced via `conformingModels` | Not enforced |

---

## Proposed Database Schema

### Core Entities

```text
developments
├── id (uuid, PK)
├── slug (text, unique)
├── name, city, state
├── status (active/coming-soon/sold-out)
├── site_plan_image_url
├── arb_guidelines_url
├── pricing_zone_id (FK → pricing_zones)
└── created_at, updated_at

lots
├── id (uuid, PK)
├── development_id (FK → developments)
├── lot_number (text)
├── status (available/reserved/sold/pending)
├── acreage, net_acreage
├── premium (money)
├── polygon_coordinates (jsonb)
├── restrictions (jsonb)
└── created_at, updated_at

models
├── id (uuid, PK)
├── slug (text, unique)
├── name
├── beds, baths, sqft, length
├── hero_image_url
├── floorplan_pdf_url
├── is_active (boolean)
└── created_at, updated_at

model_pricing
├── id (uuid, PK)
├── model_id (FK → models)
├── build_type (xmod/mod)
├── foundation_type (slab/basement)
├── base_home_price (money)
├── freight_allowance (money)
├── freight_pending (boolean)
├── effective_from (timestamp)
└── created_at, created_by

development_conforming_models (junction)
├── development_id (FK)
├── model_id (FK)
└── PRIMARY KEY (development_id, model_id)

upgrade_options
├── id (uuid, PK)
├── slug (text, unique)
├── category (floor_plan/exterior/garage)
├── label (text)
├── base_price (money)
├── applies_to_models (uuid[] or all)
├── applies_to_build_types (text[])
├── is_active (boolean)
└── created_at, updated_at

exterior_packages
├── id (uuid, PK)
├── slug (text, unique)
├── name, description
├── siding_color_hex, trim_color_hex
├── accent_color_hex, roof_color_hex
├── upgrade_price (money)
├── is_active (boolean)
└── created_at, updated_at

development_arb_packages (junction)
├── development_id (FK)
├── exterior_package_id (FK)
└── PRIMARY KEY (development_id, exterior_package_id)

garage_door_options
├── id (uuid, PK)
├── slug (text, unique)
├── name, description
├── style (traditional/carriage/modern/craftsman)
├── color_hex
├── price (money)
└── is_active (boolean)

pricing_zones
├── id (uuid, PK)
├── slug (text, unique)
├── name
├── crane_cost, home_set_cost
├── on_site_portion, baseline_total
├── contingency_buffer
├── utility_authority_fees
├── permits_soft_costs
└── created_at, updated_at

pricing_markups
├── id (uuid, PK)
├── name
├── dealer_markup_pct
├── installer_markup_pct  
├── developer_markup_pct
├── is_default (boolean)
├── effective_from (timestamp)
└── created_at, updated_at

quotes (lead capture)
├── id (uuid, PK)
├── development_id (FK, nullable)
├── lot_id (FK, nullable)
├── model_id (FK)
├── build_type
├── pricing_mode
├── service_package
├── exterior_package_id (FK)
├── garage_door_id (FK)
├── selected_options (uuid[])
├── total_estimate (money)
├── contact_name, email, phone
├── status (draft/submitted/contacted/converted)
└── created_at, updated_at
```

---

## Unified State Architecture

### Single Zustand Store

```typescript
// src/state/useConfiguratorStore.ts
interface ConfiguratorState {
  // Flow context
  flowType: 'communities' | 'quote';
  developmentSlug: string | null;
  
  // Progress
  currentStep: number;
  completedSteps: Set<number>;
  
  // Selections (unified for both flows)
  intent: BuildIntent | null;
  location: { zipCode: string; address: string; known: boolean | null };
  lotId: string | null;
  modelSlug: string | null;
  buildType: BuildType | null;
  servicePackage: ServicePackage;
  floorPlanOptionIds: string[];
  exteriorPackageId: string | null;
  garageDoorId: string | null;
  
  // Fee toggles
  includeUtilityFees: boolean;
  includePermitsCosts: boolean;
  
  // Derived (computed, not stored)
  pricingMode: PricingMode; // Computed from flowType + servicePackage
}
```

### Pricing Derivation Logic
```text
if (flowType === 'communities' && lotId) → 'community_all_in'
else if (servicePackage === 'supply_only') → 'supply_only'  
else → 'delivered_installed'
```

---

## Admin Experience Vision

### Design Principles
1. **Zero technical jargon** - No "JSONB", "slug", or "FK" visible to users
2. **Visual hierarchy** - Dashboard → Drill-down → Edit pattern
3. **Real-time preview** - See pricing changes before publishing
4. **Audit trail** - Who changed what, when
5. **Role-appropriate views** - Admins see everything, Builders see pricing only

### Admin Dashboard Structure

```text
/admin
├── /pricing (existing, enhanced)
│   ├── Model Pricing
│   ├── Site Costs
│   ├── Markups & Fees
│   └── Version History
├── /models (NEW)
│   ├── Model Library
│   ├── Model Details + Floor Plan Options
│   └── Model Pricing Matrix
├── /developments (NEW)
│   ├── Community List
│   ├── Community Details
│   ├── Lot Management
│   └── ARB Configuration
├── /exteriors (NEW)
│   ├── Exterior Packages
│   └── Garage Door Options
├── /upgrades (NEW)
│   ├── Floor Plan Add-ons
│   └── Exterior Add-ons
└── /team (existing)
```

### Admin UI Mockup: Data Relationship Visualizer

The crown jewel - a visual tool that shows non-technical users how pricing flows:

```text
┌─────────────────────────────────────────────────────────────────────┐
│  HOW PRICING WORKS                                           [?]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   MODEL      │───▶│  BUILD TYPE  │───▶│   PRICING    │          │
│  │  Hawthorne   │    │    XMOD      │    │   $97,087    │          │
│  │  3 bed/2 ba  │    │  (Factory)   │    │  (base cost) │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                                       │                   │
│         ▼                                       ▼                   │
│  ┌──────────────┐                        ┌──────────────┐          │
│  │  ADD-ONS     │                        │   MARKUP     │          │
│  │  • 9' walls  │────────────────────────│    +20%      │          │
│  │  • Half bath │                        │   $116,504   │          │
│  └──────────────┘                        └──────────────┘          │
│         │                                       │                   │
│         ▼                                       ▼                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  SITEWORK    │───▶│   FEES       │───▶│  TOTAL       │          │
│  │   $86,767    │    │   $9,631     │    │  $230,000+   │          │
│  │  (zone 3)    │    │  (optional)  │    │  estimate    │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  For COMMUNITY builds, add:                                         │
│  ┌──────────────┐    ┌──────────────┐                              │
│  │  LOT PREMIUM │ +  │  DEV MARKUP  │ = All-in Community Price     │
│  │   $15,000    │    │     +5%      │                              │
│  └──────────────┘    └──────────────┘                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Database Foundation (Week 1)
1. Create new normalized tables with migrations
2. Seed data from existing TypeScript files
3. Create RLS policies for admin/builder access
4. Build data loader hooks (`useModels`, `useDevelopments`, `useLots`)

### Phase 2: Unified State Store (Week 1-2)
1. Create `useConfiguratorStore` Zustand store
2. Migrate `BuildWizard` to use new store
3. Migrate `Configurator` to use new store
4. Remove legacy hooks (`useBuildSelection`, `useConfiguratorState`)

### Phase 3: Admin Models & Developments (Week 2)
1. `/admin/models` - CRUD for models with pricing matrix
2. `/admin/developments` - CRUD for communities with lot management
3. `/admin/exteriors` - Package and garage door management

### Phase 4: Pricing Admin Enhancement (Week 3)
1. Refactor `/admin/pricing` to use relational data
2. Add visual pricing flow diagram
3. Add real-time preview calculator
4. Add comparison view (current vs. draft pricing)

### Phase 5: Flow Unification (Week 3-4)
1. Merge `BuildWizard` and `Configurator` into unified component
2. Conditional step rendering based on `flowType`
3. Single pricing engine consuming DB data
4. Unified quote submission flow

---

## Technical Implementation Details

### Migration Strategy
```sql
-- Phase 1: Create tables alongside existing JSONB
-- Phase 2: Dual-write (JSONB + relational)
-- Phase 3: Read from relational, maintain JSONB for rollback
-- Phase 4: Remove JSONB dependency
```

### Data Loading Pattern
```typescript
// Stale-while-revalidate with React Query
const { data: models, isLoading } = useQuery({
  queryKey: ['models'],
  queryFn: () => supabase.from('models').select('*, model_pricing(*)'),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Admin RBAC Matrix

| Action | Admin | Builder |
|--------|-------|---------|
| View models/pricing | Yes | Yes |
| Edit model pricing | Yes | Yes |
| Publish pricing | Yes | No |
| Manage developments | Yes | No |
| Manage lots | Yes | No |
| Manage team | Yes | No |

---

## Success Metrics

1. **Single source of truth** - All pricing flows from DB, zero TypeScript hardcoding
2. **Sub-100ms pricing calculations** - Cached data with instant updates
3. **Admin usability** - Non-technical users can update pricing without developer help
4. **Flow consistency** - Same model/pricing shown in Communities and Quote flows
5. **Audit completeness** - Every price change tracked with user and timestamp

---

## Files to Create/Modify

### New Files
- `supabase/migrations/XXXX_unified_pricing_schema.sql`
- `src/state/useConfiguratorStore.ts`
- `src/hooks/useModels.ts`
- `src/hooks/useDevelopments.ts`
- `src/hooks/useLots.ts`
- `src/hooks/useExteriorPackages.ts`
- `src/pages/admin/AdminModels.tsx`
- `src/pages/admin/AdminDevelopments.tsx`
- `src/pages/admin/AdminExteriors.tsx`
- `src/components/admin/PricingFlowVisualizer.tsx`
- `src/components/admin/ModelPricingMatrix.tsx`
- `src/components/admin/DevelopmentLotManager.tsx`

### Files to Refactor
- `src/pages/BuildWizard.tsx` → Use unified store
- `src/pages/Configurator.tsx` → Use unified store
- `src/pages/admin/AdminPricing.tsx` → Use relational data
- `src/hooks/usePricingEngine.ts` → Load from DB
- `src/lib/pricing/calculatePriceBreakdown.ts` → Accept DB-sourced data

### Files to Deprecate (eventually remove)
- `src/data/pricing-config.ts` → Moved to DB
- `src/data/models.ts` → Moved to DB
- `src/data/packages.ts` → Moved to DB
- `src/data/lots/*.ts` → Moved to DB
- `src/data/developments.ts` → Moved to DB
- `src/hooks/useConfiguratorState.ts` → Replaced by store
- `src/hooks/useBuildSelection.ts` → Replaced by store

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data migration errors | Run parallel systems, validate totals match |
| Admin breaks pricing | Draft/Publish workflow with preview |
| Performance regression | React Query caching, denormalized views |
| Rollback needed | Keep JSONB `pricing_configs` as backup for 60 days |

This plan establishes BaseMod as the technical leader in modular home configuration - with a data architecture and admin experience that can scale to hundreds of developments and thousands of customers.
