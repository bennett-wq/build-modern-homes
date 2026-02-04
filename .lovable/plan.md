
# Lot Selection Premium Redesign - Implementation Plan

## Executive Summary

After analyzing the codebase, I found that several fixes are **already partially implemented** but there's one **critical bug** that causes the issues the user is experiencing. This plan addresses all 6 fixes with priority on the root cause.

---

## Analysis Findings

| Fix | Status | Root Cause |
|-----|--------|------------|
| #1 Entry Points | **CRITICAL BUG** | `useBuildSelection` loads from localStorage, not just URL |
| #2 Mobile Split-Screen | Partially Done | Missing pricing bar on Step 1 |
| #3 Desktop Lot List | Done | Cards already show all-in prices |
| #4 Map-Sidebar Sync | Done | Single source of truth exists |
| #5 Pricing Bar All Steps | Partial | Missing on Step 1 only |
| #6 Review Step CTAs | Done | Community flow detection exists |

---

## FIX #1: Entry Points Pre-Selection Bug (CRITICAL)

### Root Cause
`useBuildSelection.ts` (lines 37-59) loads saved selections from `localStorage` even when navigating fresh:

```typescript
// Current behavior - problematic
const stored = localStorage.getItem(STORAGE_KEY);
// ...merges with URL params
```

When a user clicks "Get All-In Price" with a clean URL (`/developments/slug/build`), the hook loads their **previous session's selections** and `BuildWizard.tsx` auto-advances to Review.

### Solution
Modify `useBuildSelection.ts` to ONLY use localStorage when URL has explicit params:

```text
File: src/hooks/useBuildSelection.ts

Changes:
1. Check if ANY URL params exist before loading localStorage
2. If URL is clean (no params), start fresh with empty selection
3. Only merge localStorage when URL has explicit params (shareable link scenario)
```

### Implementation

```typescript
// New logic (lines 30-60)
const hasUrlParams = 
  searchParams.has('lot') || 
  searchParams.has('model') || 
  searchParams.has('buildType') ||
  searchParams.has('package') ||
  searchParams.has('garage');

// Only load localStorage if URL has params (resuming from shared link)
let storedSelection: Partial<BuildSelection> = {};
if (hasUrlParams) {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      storedSelection = JSON.parse(stored);
    } catch {
      // Invalid JSON, ignore
    }
  }
}

// Fresh start when no URL params
return {
  developmentSlug,
  lotId: lotParam ? parseInt(lotParam, 10) : (hasUrlParams ? storedSelection.lotId ?? null : null),
  modelSlug: normalizeModelSlug(modelParam || (hasUrlParams ? storedSelection.modelSlug : null)),
  buildType: hasUrlParams ? ((rawBuildType === 'xmod' || rawBuildType === 'mod') ? rawBuildType : null) : null,
  packageId: packageParam || (hasUrlParams ? storedSelection.packageId : null) || null,
  garageDoorId: garageParam || (hasUrlParams ? storedSelection.garageDoorId : null) || null,
};
```

### Acceptance Criteria
- Clicking "Get All-In Price" lands on Step 1 with nothing selected
- Shared links with params still work (resume from shared state)
- User selections persist during active session

---

## FIX #2: Mobile Pricing Bar on Step 1

### Current State
Step 1 (`Step1Lot.tsx`) has the split-screen layout but no persistent pricing bar. It only shows a temporary "celebration overlay" on selection.

### Solution
Add `InlineMobilePricing` component to Step 1, similar to Steps 2-4.

### Implementation

```text
File: src/components/wizard/Step1Lot.tsx

1. Add new props to interface:
   - buyerFacingBreakdown?: BuyerFacingBreakdown
   - pricingFlags?: BuyerPricingFlags

2. Import InlineMobilePricing from BuyerPricingDisplay

3. Add pricing bar rendering before WizardStickyFooter (around line 386):
   {isMobile && selectedLot && buyerFacingBreakdown && pricingFlags && (
     <InlineMobilePricing
       breakdown={buyerFacingBreakdown}
       flags={pricingFlags}
     />
   )}

File: src/pages/BuildWizard.tsx

4. Pass pricing props to Step1Lot:
   <Step1Lot
     lots={lots}
     selectedLotId={selection.lotId}
     sitePlanImagePath={development.sitePlanImagePath}
     onSelectLot={setLot}
     onNext={() => setCurrentStep(2)}
     isMobile={isMobile}
     buyerFacingBreakdown={pricing.breakdown}  // ADD
     pricingFlags={pricing.flags}               // ADD
   />
```

### Mobile Layout Result

```text
+----------------------------------+
| < Back    [Progress 1 of 5]      |
| Choose Your Homesite             |
+----------------------------------+
|                                  |
|      [SITE PLAN - 45vh]          |
|                                  |
+----------------------------------+
| Quick Select           Browse All|
| [Lot 1] [Lot 10] [Lot 15] →      |  <- Horizontal scroll
+----------------------------------+
| Starting from $315,399  $2,546/mo|  <- NEW: Pricing bar
+----------------------------------+
|         [Continue →]             |
+----------------------------------+
```

---

## FIX #3: Desktop Lot Cards (Already Implemented)

### Status: DONE

After analysis, the desktop lot list already implements all requirements:

1. `LotListPanel.tsx` (line 276-288) passes `estimatedAllIn` to every card
2. `PremiumLotCard.tsx` (lines 246-261) always shows all-in for available lots (no hover required)
3. Cards include search, filter, and price range summary

**No changes required** - this was fixed in a previous update.

---

## FIX #4: Map-Sidebar State Sync (Already Implemented)

### Status: DONE

The codebase uses a single source of truth:

1. `Step1Lot.tsx` maintains single `selectedLotId` state
2. Both `FixedSitePlanViewer` and `LotListPanel` receive same `selectedLotId` prop
3. Both call same `onSelectLot` handler which updates state
4. Footer receives same `selectedLot` derived from state

**No changes required** - state sync is working correctly.

---

## FIX #5: Pricing Bar Visibility (Partial - Step 1 Only)

### Current Coverage

| Step | Pricing Bar | Status |
|------|-------------|--------|
| 1 - Lot Selection | Missing | FIX NEEDED |
| 2 - Model Selection | Present | Done |
| 3 - Build Type | Present | Done |
| 4 - Design Exterior | Present | Done (previous fix) |
| 5 - Review | Present | Done |

### Solution
Covered by FIX #2 above - adding `InlineMobilePricing` to Step 1.

---

## FIX #6: Review Step CTAs (Already Implemented)

### Status: DONE

`QuoteRequestForms.tsx` (lines 634-693) already detects community flow and shows appropriate CTAs:

```typescript
// Already implemented
const isCommunityFlow = !!(selection.developmentSlug && selection.lotId);

const communityCards = [
  { id: 'schedule-call', title: 'Schedule Consultation', ... },
  { id: 'get-prequalified', title: 'Get Pre-Qualified', ... },
  { id: 'request-quote', title: 'Request Final Quote', ... },
];

const cards = isCommunityFlow ? communityCards : standardCards;
```

**No changes required** - this was implemented in a previous update.

---

## Summary of Required Changes

| File | Change | Effort |
|------|--------|--------|
| `src/hooks/useBuildSelection.ts` | Prevent localStorage loading on fresh entry | Medium |
| `src/components/wizard/Step1Lot.tsx` | Add pricing bar props and render | Small |
| `src/pages/BuildWizard.tsx` | Pass pricing props to Step1Lot | Small |

---

## Technical Details

### File: src/hooks/useBuildSelection.ts

```text
Lines 30-60: Update initialSelection logic

Before:
- Always loads localStorage and merges with URL params

After:
- Check if URL has any params using searchParams.has()
- If no params (fresh entry), return empty selection
- If params exist (shared link), merge with localStorage
```

### File: src/components/wizard/Step1Lot.tsx

```text
Line 63-75: Update props interface
- Add buyerFacingBreakdown?: BuyerFacingBreakdown
- Add pricingFlags?: BuyerPricingFlags

Line 13: Add import
- import { InlineMobilePricing } from '@/components/pricing/BuyerPricingDisplay'

Line 386 (before WizardStickyFooter): Add render
- Conditional InlineMobilePricing for mobile when lot selected
```

### File: src/pages/BuildWizard.tsx

```text
Lines 330-338: Update Step1Lot props
- Add buyerFacingBreakdown={pricing.breakdown}
- Add pricingFlags={pricing.flags}
```

---

## Testing Checklist

### Entry Points (Critical)
- [ ] Clear browser localStorage before testing
- [ ] Click "Get All-In Price" on /communities card
- [ ] Verify lands on Step 1 with NO selections
- [ ] Verify URL is `/developments/slug/build` (no params)
- [ ] Make selections through to Review
- [ ] Refresh page - verify returns to Step 1 (not Review)
- [ ] Share link works - opens with saved selections

### Mobile (390x844)
- [ ] Step 1 shows map (45vh) + horizontal lot pills
- [ ] Pricing bar visible after selecting lot
- [ ] Pricing updates when selecting different lots
- [ ] Continue button enabled after lot selection

### Desktop (1440x900)
- [ ] All lot cards show all-in price (no hover needed)
- [ ] Selecting lot in sidebar updates map
- [ ] Selecting lot on map scrolls to card in sidebar
- [ ] 3-4 cards visible without scrolling

---

## Priority Order

1. **FIX #1** - Entry points (CRITICAL - root cause of user confusion)
2. **FIX #2 + #5** - Step 1 pricing bar (high impact, quick implementation)
3. Verify #3, #4, #6 are working (already implemented)
