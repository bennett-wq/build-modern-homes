

# Upgrade Options Seeding - Tasteful UX Approach

## Current State Analysis

The `upgrade_options` table already has ~14 seeded options including:
- **Floor Plan**: eBuilt Plus, CrossMod Inspection, 9' Walls, Half Bath, Office Conversion, Carrier Furnace, Garbage Disposal, R-38 Insulation, Reverse Layout
- **Exterior**: Black Fascia, Black Doors, Storm Doors, PlyGem Siding tiers

However, `applies_to_models` is mostly empty (meaning "all models"), which doesn't match the local config where options are model-specific.

## UX Problem: Option Overload

If all 14+ options display for every model, users face decision fatigue. The local `pricing-config.ts` carefully curates options per model:
- **Hawthorne**: Office conversion, half bath, 9' walls (MOD only), basement (MOD only)
- **Aspen**: Half bath, basement (MOD only)
- **Belmont**: Basement only (MOD only)
- **Laurel**: 9' walls, basement, garage variants
- **Keeneland**: None (single-box simplicity)
- **Cypress**: Flex room labeling only

## Proposed Solution: Model-Specific Filtering

### Strategy 1: Database-Level Curation

Update `applies_to_models` arrays to restrict which options appear per model. This keeps the database as source of truth and prevents UI changes.

**Benefits:**
- Options only show when relevant
- Cleaner user experience (3-5 options max per model)
- No code changes needed to `StepFloorPlan.tsx`

### Strategy 2: Category Sub-Grouping

Organize options into logical groups with `display_order` ranges:
- **10-19**: Certifications (eBuilt, CrossMod)
- **20-29**: Structural (9' walls, basement)
- **30-39**: Layout Changes (office, half bath, reverse)
- **40-49**: Mechanical (furnace, garbage disposal)
- **50-59**: Exterior (fascia, doors, siding)

**Benefits:**
- Visual hierarchy in the UI
- Users can skip entire categories
- Future-proof for accordion/collapsible grouping

---

## Implementation Plan

### Phase 1: Update Model Restrictions

**Task**: Map existing options to specific models using their UUIDs.

| Option | Models | Build Types |
|--------|--------|-------------|
| 9' Ceiling Height | Hawthorne, Laurel | MOD only |
| Half Bath Addition | Hawthorne, Aspen | All |
| Office/Den Conversion | Hawthorne | All |
| Full Basement | Hawthorne, Aspen, Belmont, Laurel | MOD only |
| eBuilt Plus (DOE) | All | All |
| CrossMod Inspection | All | XMOD only |
| Flex Room as Office | Cypress | All |
| Carrier Furnace | All | All |
| Garbage Disposal | All | All |

### Phase 2: Add Missing Options

**Task**: Seed options from local config not yet in database.

| New Option | Price | Models | Category |
|------------|-------|--------|----------|
| Full Basement Upgrade | $17,907 | Hawthorne, Aspen, Belmont, Laurel | floor_plan |
| Reverse Side to Side | $500 | All | floor_plan |

### Phase 3: Deactivate Irrelevant Options

**Task**: Set `is_active = false` for options that shouldn't appear in buyer flow.

- PlyGem Siding Tier 2 (already inactive)
- Any "coming soon" items

---

## Technical Details

### Model UUIDs Reference
```text
Hawthorne: 8b16ae67-6b2a-47c6-a3b8-dd4f23f358a5
Aspen:     b899dbbf-30e9-4c8d-9215-ae25a8a45efe
Belmont:   2a027ac9-3d2b-42a1-a297-e98e0476a5b1
Keeneland: 27f8808b-16c9-45b7-bddd-2e0c206053bc
Laurel:    ba333dd0-431a-49f1-8c57-7b6db8ccaf44
Cypress:   9e0788e8-6228-4676-b94e-59b59aadc340
```

### SQL Updates Required

1. **Update 9' Ceiling Height** - already restricted to Hawthorne/Laurel (verified)
2. **Update Half Bath** - restrict to Hawthorne, Aspen
3. **Update Office Conversion** - restrict to Hawthorne only
4. **Add Basement Upgrade** - $17,907, MOD only, Hawthorne/Aspen/Belmont/Laurel
5. **Add Flex Room Office** - $0, Cypress only

### Hook Integration

The `useUpgradeOptions` hook already filters by model and build type. Once database is seeded correctly, `StepFloorPlan` will automatically show curated options.

---

## Expected User Experience

After implementation, users see **only relevant options**:

| Model | Options Shown | Build Type Filter |
|-------|---------------|-------------------|
| Hawthorne | 4-5 options | +9' walls, +basement for MOD |
| Aspen | 2-3 options | +basement for MOD |
| Belmont | 1-2 options | +basement for MOD |
| Laurel | 3-4 options | Always MOD |
| Keeneland | 2 options | CrossMod fee, basic upgrades |
| Cypress | 1-2 options | Flex room labeling |

This matches the local config behavior and prevents option overload.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing quotes | Options use UUIDs; no ID changes |
| Missing options in UI | Verify `useUpgradeOptions` filter logic |
| Admin confusion | Update admin pricing tab to show model filters |

---

## Success Criteria

1. Each model shows 2-5 relevant floor plan options (not 14+)
2. Build type restrictions filter correctly (9' walls only for MOD)
3. Pricing matches local config values
4. No regression in existing wizard flows

