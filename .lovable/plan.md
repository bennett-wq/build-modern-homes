

# Ypsilanti Lots Not Loading - Bug Fix Plan

## Root Cause Analysis

After examining the codebase, I found two files that need to be updated to support Ypsilanti lots:

### BUG #1: Lot List Shows Zero Lots

**Location:** `src/components/siteplan/InteractiveSitePlan.tsx` (lines 33-41)

**Problem:** The `lots` useMemo only handles `grand-haven` and `st-james-bay` slugs. Ypsilanti returns an empty array:

```tsx
const lots = useMemo(() => {
  if (developmentSlug === 'grand-haven') {
    return grandHavenLots;
  }
  if (developmentSlug === 'st-james-bay') {
    return stJamesBayLots;
  }
  return [];  // Ypsilanti gets empty array!
}, [developmentSlug]);
```

### BUG #2: Full Screen Mode Layout Issues

**Location:** `src/pages/GrandHavenSitePlan.tsx` (lines 24-29)

**Problem:** Similar issue - the full screen page defaults to `grandHavenLots` for any unknown slug:

```tsx
const initialLots = useMemo(() => {
  if (slug === 'st-james-bay') {
    return stJamesBayLots;
  }
  return grandHavenLots;  // Ypsilanti gets wrong lots!
}, [slug]);
```

### Data Verification

The `ypsilantiLots` data file (`src/data/lots/ypsilanti.ts`) contains 30 lots with proper data, but it's not being used by these components.

---

## Implementation Plan

### Step 1: Fix InteractiveSitePlan.tsx

**File:** `src/components/siteplan/InteractiveSitePlan.tsx`

1. Add import for ypsilantiLots (line 11):
```tsx
import { ypsilantiLots } from '@/data/lots/ypsilanti';
```

2. Update the `lots` useMemo (lines 33-41):
```tsx
const lots = useMemo(() => {
  if (developmentSlug === 'grand-haven') {
    return grandHavenLots;
  }
  if (developmentSlug === 'st-james-bay') {
    return stJamesBayLots;
  }
  if (developmentSlug === 'ypsilanti') {
    return ypsilantiLots;
  }
  return [];
}, [developmentSlug]);
```

### Step 2: Fix GrandHavenSitePlan.tsx (Full Screen Page)

**File:** `src/pages/GrandHavenSitePlan.tsx`

1. Add import for ypsilantiLots (line 12):
```tsx
import { ypsilantiLots } from '@/data/lots/ypsilanti';
```

2. Update the `initialLots` useMemo (lines 24-29):
```tsx
const initialLots = useMemo(() => {
  if (slug === 'st-james-bay') {
    return stJamesBayLots;
  }
  if (slug === 'ypsilanti') {
    return ypsilantiLots;
  }
  return grandHavenLots;
}, [slug]);
```

---

## Summary of Changes

| File | Change | Lines |
|------|--------|-------|
| `src/components/siteplan/InteractiveSitePlan.tsx` | Add ypsilantiLots import and slug case | 11, 33-41 |
| `src/pages/GrandHavenSitePlan.tsx` | Add ypsilantiLots import and slug case | 12, 24-29 |

---

## Technical Note

The console warning about `forwardRef` is unrelated to the lots issue - it's a React ref forwarding warning in `PremiumLotCard` that doesn't affect functionality but could be addressed in a separate task.

---

## Verification Steps

After implementation:

1. Go to `/developments/ypsilanti`
2. Click "Lot List" - should show 30 lots with correct counts
3. Filter tabs should work: All (30), Available (30), etc.
4. Click "Full Screen" - should show Ypsilanti site plan with 30 lots
5. Select a lot - details panel should appear
6. Confirm Grand Haven and St. James Bay still work correctly

