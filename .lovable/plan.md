
# Phase 2: Unified State Store & Data Loaders
## Extreme Product-Led Detail Plan

---

## Executive Summary

Phase 2 establishes the **single source of truth** for all configurator flows by creating:
1. A unified Zustand store (`useConfiguratorStore`) that replaces both `useConfiguratorState` and `useBuildSelection`
2. Database-backed data loader hooks that fetch from the new normalized Supabase tables
3. A migration path that ensures zero downtime and backward compatibility

This phase is the foundation for flow unification - without it, the "Communities" and "Get a Quote" flows will continue to diverge.

---

## Current State Analysis

### State Management Fragmentation

| Hook | Used By | Storage | Fields |
|------|---------|---------|--------|
| `useConfiguratorState` | `/build` (Configurator) | localStorage (`basemod-configurator-state`) | intent, modelSlug, buildType, zoneId, servicePackage, packageId, garageDoorId, floorPlanSelections, exteriorSelection, zipCode, address, locationKnown, includeUtilityFees, includePermitsCosts |
| `useBuildSelection` | `/developments/:slug/build` (BuildWizard) | localStorage (`basemod-build-selection`) + URL params | developmentSlug, lotId, modelSlug, packageId, garageDoorId |
| `usePricingConfig` | Both flows | localStorage cache + Supabase | pricingConfig (JSONB blob) |

### Critical Issues Identified

1. **Overlapping fields stored differently** - Both hooks store `modelSlug`, `packageId`, `garageDoorId` but in incompatible formats
2. **No shared persistence** - User cannot switch between flows and retain selections
3. **Hardcoded data sources** - `homeModels`, `developments`, `exteriorPackages` come from TypeScript files, not the new DB tables
4. **Step tracking divergence** - `/build` tracks 8 steps, BuildWizard tracks 4 steps with different semantics
5. **Pricing mode derivation scattered** - Logic spread across `derivePricingMode()` utility and individual components

---

## Phase 2 Architecture

### 2.1 Unified Zustand Store Schema

```typescript
// src/state/useConfiguratorStore.ts

interface ConfiguratorState {
  // ═══════════════════════════════════════════════════════════════
  // FLOW CONTEXT (determines which UI path and pricing mode)
  // ═══════════════════════════════════════════════════════════════
  flowType: 'communities' | 'direct';  // 'direct' = /build, 'communities' = /developments/:slug/build
  developmentSlug: string | null;      // Set when flowType === 'communities'
  
  // ═══════════════════════════════════════════════════════════════
  // PROGRESS TRACKING (NOT persisted - always starts fresh)
  // ═══════════════════════════════════════════════════════════════
  currentStep: number;
  completedSteps: number[];
  
  // ═══════════════════════════════════════════════════════════════
  // USER SELECTIONS (persisted to localStorage)
  // ═══════════════════════════════════════════════════════════════
  
  // Step: Intent (direct flow only)
  intent: 'own-land' | 'find-land' | 'basemod-community' | null;
  
  // Step: Location (direct flow) / Lot (communities flow)
  location: {
    zipCode: string;
    address: string;
    known: boolean | null;  // null = not answered, true/false = explicit choice
  };
  lotId: string | null;  // UUID from lots table (communities flow)
  
  // Step: Model Selection
  modelId: string | null;  // UUID from models table (new)
  modelSlug: string | null;  // Slug for backward compatibility during migration
  
  // Step: Build Type
  buildType: 'xmod' | 'mod' | null;
  foundationType: 'slab' | 'basement';
  
  // Step: Service Package (determines pricing mode)
  servicePackage: 'delivered_installed' | 'supply_only' | 'community_all_in';
  
  // Step: Floor Plan Options
  selectedOptionIds: string[];  // UUIDs from upgrade_options table
  
  // Step: Exterior Design
  exteriorPackageId: string | null;  // UUID from exterior_packages table
  garageDoorId: string | null;        // UUID from garage_door_options table
  
  // Step: Summary Toggles
  includeUtilityFees: boolean;
  includePermitsCosts: boolean;
  
  // ═══════════════════════════════════════════════════════════════
  // COMPUTED PROPERTIES (derived, not stored)
  // ═══════════════════════════════════════════════════════════════
  
  // Derived from flowType + lotId + servicePackage
  get pricingMode(): 'delivered_installed' | 'supply_only' | 'community_all_in';
  
  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════
  
  // Flow initialization
  initDirectFlow: () => void;
  initCommunityFlow: (developmentSlug: string) => void;
  
  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  markStepComplete: (step: number) => void;
  
  // Selection setters (individual)
  setIntent: (intent: ConfiguratorState['intent']) => void;
  setLocation: (location: Partial<ConfiguratorState['location']>) => void;
  setLotId: (lotId: string | null) => void;
  setModel: (modelId: string, modelSlug: string) => void;
  setBuildType: (buildType: ConfiguratorState['buildType']) => void;
  setFoundationType: (type: ConfiguratorState['foundationType']) => void;
  setServicePackage: (pkg: ConfiguratorState['servicePackage']) => void;
  toggleOption: (optionId: string) => void;
  setExteriorPackage: (id: string | null) => void;
  setGarageDoor: (id: string | null) => void;
  setFeeToggles: (fees: { utility?: boolean; permits?: boolean }) => void;
  
  // Bulk operations
  resetSelections: () => void;
  hydrateFromLegacy: () => boolean;  // Returns true if legacy data was found
  
  // Persistence helpers
  getShareableUrl: () => string;
  getQuotePayload: () => QuoteInsertPayload;
}
```

### 2.2 Persistence Strategy

```text
┌─────────────────────────────────────────────────────────────────┐
│                    PERSISTENCE STRATEGY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PERSISTED (zustand persist middleware)                        │
│  ───────────────────────────────────────                        │
│  • flowType, developmentSlug                                    │
│  • intent, location, lotId                                      │
│  • modelId, modelSlug, buildType, foundationType                │
│  • servicePackage                                               │
│  • selectedOptionIds                                            │
│  • exteriorPackageId, garageDoorId                              │
│  • includeUtilityFees, includePermitsCosts                      │
│                                                                 │
│  NOT PERSISTED (fresh on every page load)                       │
│  ─────────────────────────────────────────                      │
│  • currentStep (always starts at 1)                             │
│  • completedSteps (always empty)                                │
│                                                                 │
│  This ensures users see their SELECTIONS but must               │
│  re-walk the wizard for validation.                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Step Unification Matrix

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                        UNIFIED STEP STRUCTURE                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step    │ Direct Flow (/build)     │ Communities Flow                   │
│  ─────────────────────────────────────────────────────────────────────── │
│    1     │ Intent                   │ Lot Selection                      │
│    2     │ Location                 │ Model Selection                    │
│    3     │ Model Selection          │ Exterior Design                    │
│    4     │ Build Type               │ Review & Contact                   │
│    5     │ Service Package          │ (flow complete)                    │
│    6     │ Floor Plan Options       │                                    │
│    7     │ Exterior Design          │                                    │
│    8     │ Summary & Contact        │                                    │
│                                                                          │
│  The store tracks steps 1-8, but UI conditionally renders                │
│  based on flowType.                                                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2.4 Data Loader Hooks

### Database-First Architecture

All data will flow from Supabase → React Query cache → Components:

```text
┌─────────────────────────────────────────────────────────────────┐
│                     DATA FLOW ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐     ┌─────────────┐     ┌─────────────┐          │
│  │ Supabase │────▶│ React Query │────▶│ Components  │          │
│  │  Tables  │     │   Cache     │     │             │          │
│  └──────────┘     └─────────────┘     └─────────────┘          │
│       │                 │                    │                  │
│       │                 │                    │                  │
│       ▼                 ▼                    ▼                  │
│  models            5 min stale         useModels()              │
│  model_pricing     time with           useDevelopments()        │
│  developments      background          useLots(devId)           │
│  lots              revalidate          useExteriorPackages()    │
│  exterior_packages                     useGarageDoors()         │
│  garage_door_options                   useUpgradeOptions()      │
│  pricing_zones                         usePricingZone(id)       │
│  pricing_markups                       usePricingMarkups()      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Hook Specifications

#### `useModels()`
```typescript
// src/hooks/useModels.ts
interface UseModelsResult {
  models: Model[];
  isLoading: boolean;
  error: Error | null;
  getModelBySlug: (slug: string) => Model | undefined;
  getModelById: (id: string) => Model | undefined;
}

// Fetches: models JOIN model_pricing WHERE is_active = true AND is_current = true
// Caches: 5 minute stale time
// Fallback: Static data during migration period
```

#### `useDevelopments()`
```typescript
// src/hooks/useDevelopments.ts
interface UseDevelopmentsResult {
  developments: Development[];
  isLoading: boolean;
  error: Error | null;
  getDevelopmentBySlug: (slug: string) => Development | undefined;
}

// Fetches: developments WHERE is_active = true
// Includes: pricing_zone relation
// Caches: 5 minute stale time
```

#### `useLots(developmentId: string)`
```typescript
// src/hooks/useLots.ts
interface UseLotsResult {
  lots: Lot[];
  isLoading: boolean;
  error: Error | null;
  getLotById: (id: string) => Lot | undefined;
  availableLots: Lot[];  // Filtered to status = 'available'
}

// Fetches: lots WHERE development_id = ? ORDER BY lot_number
// Caches: 1 minute stale time (lots can change more frequently)
```

#### `useExteriorPackages(developmentSlug?: string)`
```typescript
// src/hooks/useExteriorPackages.ts
interface UseExteriorPackagesResult {
  packages: ExteriorPackage[];
  isLoading: boolean;
  error: Error | null;
  getPackageById: (id: string) => ExteriorPackage | undefined;
  arbReadyPackages: ExteriorPackage[];  // Filtered for development if provided
}

// Fetches: exterior_packages WHERE is_active = true
// If developmentSlug provided, filters via development_arb_packages junction
// Caches: 5 minute stale time
```

#### `useGarageDoors()`
```typescript
// src/hooks/useGarageDoors.ts
interface UseGarageDoorsResult {
  doors: GarageDoorOption[];
  isLoading: boolean;
  error: Error | null;
  getDoorById: (id: string) => GarageDoorOption | undefined;
}

// Fetches: garage_door_options WHERE is_active = true ORDER BY display_order
// Caches: 5 minute stale time
```

#### `useUpgradeOptions(modelId?: string, buildType?: string)`
```typescript
// src/hooks/useUpgradeOptions.ts
interface UseUpgradeOptionsResult {
  options: UpgradeOption[];
  isLoading: boolean;
  error: Error | null;
  floorPlanOptions: UpgradeOption[];  // category = 'floor_plan'
  exteriorOptions: UpgradeOption[];   // category = 'exterior'
  garageOptions: UpgradeOption[];     // category = 'garage'
}

// Fetches: upgrade_options WHERE is_active = true
// Filters by model and build type if provided (using applies_to_* arrays)
// Caches: 5 minute stale time
```

---

## 2.5 Migration Path

### Dual-Mode Operation Period

During migration, both systems will coexist:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    MIGRATION TIMELINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Week 1: PARALLEL OPERATION                                     │
│  ──────────────────────────                                     │
│  • useConfiguratorStore created with full schema                │
│  • Data loader hooks implemented with DB fallback               │
│  • Legacy hooks remain active                                   │
│  • hydrateFromLegacy() pulls from old localStorage keys         │
│                                                                 │
│  Week 2: COMPONENT MIGRATION                                    │
│  ────────────────────────────                                   │
│  • BuildWizard migrated to useConfiguratorStore                 │
│  • Configurator migrated to useConfiguratorStore                │
│  • Step components updated to use new selectors                 │
│  • Legacy hooks marked @deprecated                              │
│                                                                 │
│  Week 3: CLEANUP                                                │
│  ────────────────                                               │
│  • Legacy hooks removed                                         │
│  • Old localStorage keys cleaned on first load                  │
│  • TypeScript files marked for deprecation                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Legacy Data Hydration

```typescript
// Called on store initialization
hydrateFromLegacy(): boolean {
  // Check for old localStorage keys
  const oldBuildSelection = localStorage.getItem('basemod-build-selection');
  const oldConfiguratorState = localStorage.getItem('basemod-configurator-state');
  
  if (oldBuildSelection) {
    const parsed = JSON.parse(oldBuildSelection);
    // Map old format to new store shape
    this.setModel(null, parsed.modelSlug);  // ID will be null, slug for lookup
    this.setExteriorPackage(parsed.packageId);
    this.setGarageDoor(parsed.garageDoorId);
    if (parsed.lotId) this.setLotId(parsed.lotId.toString());
    if (parsed.developmentSlug) this.initCommunityFlow(parsed.developmentSlug);
    
    // Clear old key
    localStorage.removeItem('basemod-build-selection');
    return true;
  }
  
  if (oldConfiguratorState) {
    // Similar migration logic for Configurator state
    // ...
    localStorage.removeItem('basemod-configurator-state');
    localStorage.removeItem('basemod-configurator-step');
    return true;
  }
  
  return false;
}
```

---

## 2.6 Implementation Checklist

### Files to Create

| File | Purpose | Priority |
|------|---------|----------|
| `src/state/useConfiguratorStore.ts` | Unified Zustand store | P0 |
| `src/hooks/useModels.ts` | Models + pricing loader | P0 |
| `src/hooks/useDevelopments.ts` | Developments loader | P0 |
| `src/hooks/useLots.ts` | Lots loader (per development) | P0 |
| `src/hooks/useExteriorPackages.ts` | Exterior packages loader | P1 |
| `src/hooks/useGarageDoors.ts` | Garage doors loader | P1 |
| `src/hooks/useUpgradeOptions.ts` | Upgrade options loader | P1 |
| `src/hooks/usePricingZones.ts` | Pricing zones loader | P1 |
| `src/types/database.ts` | Type mappings from Supabase types | P0 |

### Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `src/pages/BuildWizard.tsx` | Replace `useBuildSelection` with store | P0 |
| `src/pages/Configurator.tsx` | Replace `useConfiguratorState` with store | P0 |
| `src/components/wizard/Step1Lot.tsx` | Use `useLots()` hook | P1 |
| `src/components/wizard/Step2Model.tsx` | Use `useModels()` hook | P1 |
| `src/components/wizard/Step3Design.tsx` | Use exterior hooks | P1 |
| `src/components/configurator/steps/*.tsx` | Use store selectors | P1 |
| `src/hooks/usePricingEngine.ts` | Accept DB-sourced model data | P2 |

### Files to Deprecate (Week 3)

| File | Replacement |
|------|-------------|
| `src/hooks/useConfiguratorState.ts` | `useConfiguratorStore` |
| `src/hooks/useBuildSelection.ts` | `useConfiguratorStore` |
| `src/data/models.ts` | `useModels()` hook |
| `src/data/developments.ts` | `useDevelopments()` hook |
| `src/data/packages.ts` | `useExteriorPackages()` + `useGarageDoors()` |
| `src/data/lots/*.ts` | `useLots()` hook |

---

## 2.7 Data Seeding Requirements

Before Phase 2 code can function, the new tables need data:

### Seed Priority Order

1. **pricing_zones** - Required for any pricing calculation
2. **pricing_markups** - Required for buyer-facing prices  
3. **models** - Core entity, all flows depend on this
4. **model_pricing** - Prices for each model/buildType/foundation combo
5. **developments** - Required for communities flow
6. **lots** - Required for communities flow lot selection
7. **exterior_packages** - Required for Step 3 Design
8. **garage_door_options** - Required for Step 3 Design
9. **development_conforming_models** - Junction for ARB model restrictions
10. **development_arb_packages** - Junction for ARB package restrictions
11. **upgrade_options** - Floor plan and exterior add-ons

### Data Sources for Seeding

| Table | Source File |
|-------|-------------|
| models | `src/data/models.ts` + `src/data/pricing-config.ts` |
| model_pricing | `src/data/pricing-config.ts` (pricing object per model) |
| developments | `src/data/developments.ts` |
| lots | `src/data/lots/grand-haven.ts` + `src/data/lots/st-james-bay.ts` |
| exterior_packages | `src/data/packages.ts` |
| garage_door_options | `src/data/packages.ts` |
| pricing_zones | `src/data/pricing-config.ts` (zones array) |
| pricing_markups | `src/data/pricing-layers.ts` (defaults) |
| upgrade_options | `src/data/pricing-config.ts` (floorPlanOptions per model) |

---

## 2.8 Testing Strategy

### Unit Tests

```typescript
// src/state/__tests__/useConfiguratorStore.test.ts

describe('useConfiguratorStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useConfiguratorStore.getState().resetSelections();
  });

  describe('flow initialization', () => {
    it('initializes direct flow with correct defaults', () => {
      const { initDirectFlow, flowType, currentStep } = useConfiguratorStore.getState();
      initDirectFlow();
      expect(flowType).toBe('direct');
      expect(currentStep).toBe(1);
    });

    it('initializes community flow with development slug', () => {
      const { initCommunityFlow, flowType, developmentSlug } = useConfiguratorStore.getState();
      initCommunityFlow('grand-haven');
      expect(flowType).toBe('communities');
      expect(developmentSlug).toBe('grand-haven');
    });
  });

  describe('pricing mode derivation', () => {
    it('returns community_all_in when lot selected in community flow', () => {
      const store = useConfiguratorStore.getState();
      store.initCommunityFlow('grand-haven');
      store.setLotId('lot-uuid-123');
      expect(store.pricingMode).toBe('community_all_in');
    });

    it('returns supply_only when service package is supply_only', () => {
      const store = useConfiguratorStore.getState();
      store.initDirectFlow();
      store.setServicePackage('supply_only');
      expect(store.pricingMode).toBe('supply_only');
    });

    it('returns delivered_installed by default', () => {
      const store = useConfiguratorStore.getState();
      store.initDirectFlow();
      expect(store.pricingMode).toBe('delivered_installed');
    });
  });

  describe('persistence', () => {
    it('persists selections but not step progress', () => {
      const store = useConfiguratorStore.getState();
      store.setModel('uuid-123', 'hawthorne');
      store.goToStep(5);
      
      // Simulate page reload
      const newStore = useConfiguratorStore.getState();
      expect(newStore.modelSlug).toBe('hawthorne');
      expect(newStore.currentStep).toBe(1);  // Reset to 1
    });

    it('migrates from legacy localStorage keys', () => {
      localStorage.setItem('basemod-build-selection', JSON.stringify({
        modelSlug: 'hawthorne',
        packageId: 'coastal-white',
        garageDoorId: 'modern-black',
      }));
      
      const store = useConfiguratorStore.getState();
      const migrated = store.hydrateFromLegacy();
      
      expect(migrated).toBe(true);
      expect(store.modelSlug).toBe('hawthorne');
      expect(localStorage.getItem('basemod-build-selection')).toBeNull();
    });
  });
});
```

### Integration Tests

```typescript
// e2e/configurator-flow.spec.ts

test('direct flow persists selections across page reload', async ({ page }) => {
  await page.goto('/build');
  
  // Complete step 1 (Intent)
  await page.click('[data-testid="intent-own-land"]');
  await page.click('[data-testid="next-step"]');
  
  // Complete step 2 (Location)
  await page.fill('[data-testid="zip-input"]', '48103');
  await page.click('[data-testid="next-step"]');
  
  // Select model
  await page.click('[data-testid="model-card-hawthorne"]');
  
  // Reload page
  await page.reload();
  
  // Verify selections persist but step resets
  expect(await page.locator('[data-testid="step-indicator"]').textContent()).toContain('Step 1');
  
  // Model should still be selected in store
  const modelSlug = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('basemod-configurator-store') || '{}').state?.modelSlug;
  });
  expect(modelSlug).toBe('hawthorne');
});
```

---

## 2.9 Success Criteria

| Metric | Target | Validation |
|--------|--------|------------|
| Single store | 1 Zustand store replaces 2 hooks | Code review |
| Data from DB | 100% of model/development data from Supabase | Network tab inspection |
| Zero data loss | Legacy selections migrate successfully | Manual QA |
| Step reset on reload | currentStep always 1 on fresh load | Automated test |
| Pricing mode accuracy | Matches expected for all flow/selection combos | Unit tests |
| Build passes | No TypeScript errors, no console warnings | CI pipeline |

---

## 2.10 Risk Mitigation

| Risk | Mitigation | Owner |
|------|------------|-------|
| Data not seeded before code deploys | Implement fallback to static files | Phase 2 |
| Legacy localStorage corrupted | Wrap hydration in try/catch, clear on error | Phase 2 |
| React Query cache stale | 5 min stale time + background revalidate | Phase 2 |
| Step component breaks during migration | Migrate one step at a time, keep old props as fallback | Phase 2 |

---

## Next Steps After Phase 2

1. **Phase 3**: Admin CRUD for models, developments, lots
2. **Phase 4**: Enhanced pricing admin with visual flow diagram
3. **Phase 5**: Merge BuildWizard and Configurator into single unified component

---

## Technical Implementation Order

```text
Day 1: ✅ COMPLETE
├── ✅ Create src/types/database.ts (map Supabase types)
├── ✅ Create src/state/useConfiguratorStore.ts (full schema)
├── ✅ Create src/hooks/useModels.ts (with static fallback)
├── ✅ Create src/hooks/useDevelopments.ts
├── ✅ Create src/hooks/useLots.ts
├── ✅ Create src/hooks/useExteriorPackages.ts
├── ✅ Create src/hooks/useGarageDoors.ts
└── ✅ Create src/hooks/useUpgradeOptions.ts

Day 2: 🔜 NEXT
├── Seed database tables with existing static data
├── Migrate BuildWizard.tsx to use store
├── Update Step1Lot to use useLots()
└── Update Step2Model to use useModels()

Day 3:
├── Migrate Configurator.tsx to use store
├── Update all StepXxx components to use store selectors
└── Update usePricingEngine to accept DB data

Day 4:
├── Add legacy hydration logic
├── Write unit tests for store
├── Write integration tests for flows
└── Mark legacy hooks @deprecated
```

This plan ensures a methodical, test-driven migration that maintains backward compatibility while establishing the unified architecture needed for a $1B proptech platform.
