
# Fix: Sitework Contingency Buffer Not Included in Pricing

## Problem Analysis
The 10% contingency buffer ($8,677) from the `pricing_zones` table is not being included in the displayed sitework allowance on Step 5+ of the `/build` wizard.

**Current behavior:**
- Sitework displays as $104,120
- Formula used: $86,767 (baseline) × 1.20 (markup) = $104,120

**Expected behavior:**
- Sitework should display as $114,533
- Correct formula: ($86,767 baseline + $8,677 buffer) × 1.20 = $114,532.80 ≈ $114,533

## Root Cause
The `useConfiguratorPricing` adapter hook does not explicitly pass the `includeSiteworkContingency` parameter when calling `engine.calculatePrice()`. While the unified pricing engine has a default of `true` for this parameter, the adapter is not passing it through, and the parameter may not be defaulting correctly due to how the object is constructed.

**Location:** `src/hooks/useConfiguratorPricing.ts` lines 97-104

```typescript
return engine.calculatePrice({
  modelSlug: input.modelSlug,
  buildType: input.buildType,
  foundationType: 'crawl',
  servicePackage: unifiedServicePackage,
  selectedOptionIds: input.selectedOptionIds || [],
  includeFeesAllowance: input.includeUtilityFees || input.includePermitsCosts,
  // Missing: includeSiteworkContingency: true
  // Missing: includeSitework: true
});
```

## Solution

### File to Modify
`src/hooks/useConfiguratorPricing.ts`

### Changes Required

1. **Add explicit `includeSitework` and `includeSiteworkContingency` parameters** to the `calculatePrice()` call to ensure the contingency buffer is always included in sitework calculations:

```typescript
return engine.calculatePrice({
  modelSlug: input.modelSlug,
  buildType: input.buildType,
  foundationType: 'crawl',
  servicePackage: unifiedServicePackage,
  selectedOptionIds: input.selectedOptionIds || [],
  includeFeesAllowance: input.includeUtilityFees || input.includePermitsCosts,
  includeSitework: unifiedServicePackage === 'installed',
  includeSiteworkContingency: true,
});
```

### Technical Details

The fix ensures that:
- `includeSitework` is explicitly set based on the service package (true for installed, false for home_only)
- `includeSiteworkContingency` is always `true` to include the 10% buffer in sitework calculations
- The sitework retail total will now correctly calculate as: `(baseline + buffer) × markup`

### Expected Result After Fix

| Component | Before | After |
|-----------|--------|-------|
| Baseline | $86,767 | $86,767 |
| Buffer (10%) | Not included | $8,677 |
| Base Total | $86,767 | $95,444 |
| Retail (×1.20) | $104,120 | $114,533 |

### Verification Steps
1. Navigate to `/build`
2. Progress to Step 5 (Service Package) with a model selected
3. Select "Delivered & Installed" service package
4. Verify the Sitework Allowance displays as **$114,533** (not $104,120)
5. Expand the price breakdown to confirm line items sum correctly
