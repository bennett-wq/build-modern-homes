

# Mobile Pricing Drawer Fix: Show Pricing Before Build Type Selection

## Problem Identified

On Step 4 of the /build wizard, the mobile pricing drawer shows empty content because:

1. **`hasPricing` evaluates to `false`** when `buildType` is null
2. This hides all pricing content and financing CTAs in the drawer
3. Users see only "Home Package Estimate" title with Back/Continue buttons - no actual price or payment info

**Code location**: `src/hooks/useConfiguratorPricing.ts` line 178:
```typescript
hasPricing: Boolean(input.modelSlug && input.buildType && unifiedPricing.home.factoryQuoteTotal > 0)
```

## Solution

Modify the `hasPricing` logic to allow pricing display when a model is selected, even if buildType hasn't been chosen yet. For Step 4, we should show a "preview" price based on a default buildType (e.g., 'xmod' since it's the more common choice).

### Option A (Recommended): Fix at the Hook Level

Update `useConfiguratorPricing.ts` to calculate pricing with a fallback buildType when none is selected, while still indicating the estimate is preliminary.

**Changes to `src/hooks/useConfiguratorPricing.ts`:**

1. **Line 91-101**: When `buildType` is null but `modelSlug` exists, use a default buildType ('xmod') for calculation instead of returning empty pricing

2. **Line 178**: Update `hasPricing` condition:
   ```typescript
   // Before:
   hasPricing: Boolean(input.modelSlug && input.buildType && unifiedPricing.home.factoryQuoteTotal > 0)
   
   // After:
   hasPricing: Boolean(input.modelSlug && unifiedPricing.home.factoryQuoteTotal > 0)
   ```

### Implementation Details

```typescript
// src/hooks/useConfiguratorPricing.ts

// Line 91-116: Update the calculation to use fallback buildType
const unifiedPricing = useMemo(() => {
  if (!input.modelSlug) {
    // No model selected - return empty pricing
    return engine.calculatePrice({
      modelSlug: 'hawthorne',
      buildType: 'xmod',
      servicePackage: unifiedServicePackage,
      selectedOptionIds: [],
      lotPremium: 0,
    });
  }
  
  // Use selected buildType, or fallback to 'xmod' for preview pricing
  const effectiveBuildType = input.buildType || 'xmod';
  
  return engine.calculatePrice({
    modelSlug: input.modelSlug,
    buildType: effectiveBuildType,
    foundationType: 'crawl',
    servicePackage: unifiedServicePackage,
    selectedOptionIds: input.selectedOptionIds || [],
    includeFeesAllowance: input.includeUtilityFees || input.includePermitsCosts,
    includeSitework: unifiedServicePackage === 'installed',
    includeSiteworkContingency: true,
    lotPremium: input.lotPremium || 0,
    lotNumber: input.lotNumber,
    developmentName: input.developmentName,
  });
}, [/* deps */]);

// Line 178: Update hasPricing to only require modelSlug
const flags: BuyerPricingFlags = useMemo(() => ({
  freightPending: unifiedPricing.freightPending,
  basementSelectedRequiresQuote: false,
  estimateConfidence,
  hasPricing: Boolean(input.modelSlug && unifiedPricing.home.factoryQuoteTotal > 0),
  pricingMode,
}), [/* deps */]);
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useConfiguratorPricing.ts` | Update pricing calculation to use fallback buildType; update hasPricing condition to not require buildType |

## UX Impact

After this fix, on Step 4 (Build Type selection):

**Before:**
- Mobile drawer shows: "Home Package Estimate" + disclaimers + Back/Continue
- No price, no monthly payment, no financing CTAs

**After:**
- Mobile drawer shows: Full price (e.g., "$197,350")
- Monthly payment estimate (e.g., "Est. $1,145/mo")
- "BaseMod Financial" section with:
  - "Explore Payments" button
  - "Get Pre-Qualified" CTA
- Price breakdown (collapsible)
- Back/Continue navigation

## Acceptance Criteria

- [ ] Price displays in mobile drawer on Step 4 before buildType is selected
- [ ] Monthly payment estimate is visible
- [ ] "Explore Payments" button works
- [ ] "Get Pre-Qualified" CTA works
- [ ] Price updates when buildType changes (MOD vs XMOD)
- [ ] Navigation (Back/Continue) continues to work
- [ ] No regressions on Steps 5-8
- [ ] Desktop pricing rail still works correctly

## Testing Plan

1. Navigate to /build
2. Select intent (Build on My Land)
3. Select location (I don't know yet)
4. Select model (Hawthorne)
5. **Verify Step 4**: Mobile drawer should show price and financing CTAs
6. Select build type (XMOD)
7. **Verify Step 5**: Price should update, financing still visible
8. Continue through remaining steps to verify no regressions

