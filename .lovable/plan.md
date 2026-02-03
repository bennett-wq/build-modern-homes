
# Mobile UX Fixes for Build Configurator Flows

## Overview
This plan addresses four critical mobile UX issues across the 8-step `/build` flow and 5-step Community flow (`/developments/*/build`). The desktop experiences work well - these fixes target mobile-specific problems.

---

## Issue Analysis

### Issue #1: Live Preview Not Rendering on Mobile (8-Step Flow)
**Root Cause:** In the 8-step flow (`Configurator.tsx`), Step 7 renders `Step3Design` inside a motion.div with `AnimatePresence`. The photo preview components (HawthornePhotoPreview, AspenPhotoPreview, etc.) use `flex-1` and `h-full` to fill their containers, but the parent chain doesn't have explicit height on mobile. The preview container sets `min-h-[45vh]` which should work, but the issue is that the preview components themselves use `w-full h-full flex flex-col` with `flex-1` on the image wrapper - and when the parent doesn't have explicit height, `flex-1` collapses to zero.

**Why Step 8 (Review) Works:** The `ExteriorPreviewCard` in Step4Review uses `aspect-video` on the image container, which provides intrinsic height regardless of parent dimensions.

**Fix:** Add explicit `aspect-[16/10]` to the preview image container within the photo preview components, matching what works in the Review step.

### Issue #2: Pricing Drawer Hidden on Mobile (8-Step Flow)
**Root Cause:** In `Configurator.tsx`, the mobile pricing bar (`BuyerPricingDisplay` with `variant="mobile"`) is rendered at lines 565-579, but it uses `fixed bottom-0` positioning which conflicts with the `WizardStickyFooter` (also `fixed bottom-0 z-50`). The pricing bar has `z-30` while the footer has `z-50`, so the footer covers the pricing bar.

**Recommended Fix (Option A - Collapsible Price Summary):** Integrate pricing into the `WizardStickyFooter` component on mobile, showing a compact price summary that expands to show full breakdown. This is the cleanest solution as it keeps everything in one place.

### Issue #3: Scroll Stuck on Mobile (Community Flow)
**Root Cause:** In `BuildWizard.tsx` (Community flow), the main content wrapper has `overflow-hidden` on the parent (line 310: `<main className="flex-1 overflow-hidden relative">`). The step content uses `absolute inset-0` positioning inside AnimatePresence, which traps scroll. On mobile, the Step3Design component's layout has the preview at `min-h-[45vh]` and the tabs panel at `flex-1`, but the `overflow-hidden` on the parent prevents scrolling through both.

**Fix:** Change the layout to allow natural scrolling on mobile - remove `absolute inset-0` and `overflow-hidden` for the design step container, and ensure the content flows naturally.

### Issue #4: No Validation Feedback (Both Flows)
**Root Cause:** The `WizardStickyFooter` component disables the Continue button when `canProceed` is false, but provides no visual feedback about WHY it's disabled. Users clicking a disabled button see nothing.

**Fix:** Add inline validation feedback when user attempts to proceed without required selections. Show which selection is missing (Package and/or Garage).

---

## Implementation Plan

### File: `src/components/wizard/Step3Design.tsx`

#### Fix #1: Explicit aspect ratio for preview containers

Update the HawthornePhotoPreview, AspenPhotoPreview, BelmontPhotoPreview, and KeenelandPhotoPreview components to use explicit aspect ratio instead of flex-1:

```tsx
// Current:
<div className="relative flex-1 w-full bg-muted rounded-xl overflow-hidden shadow-lg">

// Fixed:
<div className="relative w-full aspect-[16/10] bg-muted rounded-xl overflow-hidden shadow-lg">
```

This ensures the image container has intrinsic dimensions on mobile.

#### Fix #4: Add validation state and feedback

Add state to track validation attempts:
```tsx
const [validationError, setValidationError] = useState<string | null>(null);
```

Update the Continue handler to show feedback:
```tsx
const handleContinue = useCallback(() => {
  if (!canProceed) {
    if (!selectedPackageId) {
      setValidationError('Please select an exterior package');
      setActiveTab('package');
    } else if (!selectedGarageDoorId) {
      setValidationError('Please select a garage door style');
      setActiveTab('garage');
    }
    return;
  }
  setValidationError(null);
  onNext();
}, [canProceed, selectedPackageId, selectedGarageDoorId, onNext]);
```

Add error display in the footer:
```tsx
{validationError && (
  <div className="text-xs text-destructive flex items-center gap-1">
    <AlertCircle className="h-3 w-3" />
    {validationError}
  </div>
)}
```

---

### File: `src/pages/BuildWizard.tsx` (Community Flow)

#### Fix #3: Enable scrolling on mobile for Step 4

Update the main content wrapper to allow scrolling:
```tsx
// Current (line 310):
<main className="flex-1 overflow-hidden relative">

// Fixed - conditional overflow based on step:
<main className={cn(
  "flex-1 relative",
  currentStep === 4 && isMobile ? "overflow-y-auto" : "overflow-hidden"
)}>
```

Also update the step container to flow naturally on mobile:
```tsx
// For Step 4 (Design), remove absolute positioning on mobile:
<motion.div
  key="step4"
  variants={stepVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={stepTransition}
  className={cn(
    isMobile ? "min-h-full" : "absolute inset-0"
  )}
>
```

---

### File: `src/pages/Configurator.tsx` (8-Step Flow)

#### Fix #2: Mobile pricing visibility

Option A implementation - Add a collapsible pricing bar in the footer area:

Update the mobile rendering to show pricing above the step content footer:
```tsx
{/* Mobile Pricing Summary - inline with content */}
{isMobile && showPricingRail && (
  <div className="bg-card border-t border-border px-4 py-3 mb-20">
    <MobilePricingSummary
      breakdown={displayPricing.breakdown}
      flags={pricingFlags}
    />
  </div>
)}
```

Create a new `MobilePricingSummary` component that shows:
- All-in price (or "Starting from" based on mode)
- Monthly payment estimate (collapsible)
- "Explore Payments" / "Get Pre-Qualified" CTAs

This avoids z-index conflicts by placing pricing inline with content rather than fixed.

---

### File: `src/components/pricing/BuyerPricingDisplay.tsx`

Create a new inline mobile variant for the 8-step flow:
```tsx
function InlineMobilePricing({
  breakdown,
  flags,
}: {
  breakdown: BuyerFacingBreakdown;
  flags: BuyerPricingFlags;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-xs text-muted-foreground">
              {getPricingModeHeadline(flags.pricingMode)}
            </span>
            <p className="text-lg font-semibold text-foreground">
              {formatPrice(breakdown.startingFromPrice)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MonthlyPaymentBadge purchasePrice={breakdown.startingFromPrice} />
            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {/* Compact breakdown + financing CTAs */}
      </CollapsibleContent>
    </Collapsible>
  );
}
```

---

## Testing Checklist

### 8-Step Flow (`/build`) - Mobile
| Step | Test | Expected |
|------|------|----------|
| 4-6 | Price visible | Dynamic price shown in collapsible bar |
| 7 | Preview renders | Home image visible with aspect-[16/10] |
| 7 | Can select Package | Color options accessible via tabs |
| 7 | Can select Garage | Garage options accessible via tabs |
| 7 | Validation works | Error message if Continue clicked without selections |

### 5-Step Community Flow (`/developments/grand-haven/build`) - Mobile
| Step | Test | Expected |
|------|------|----------|
| 4 | Can scroll to tabs | Package/Garage tabs reachable |
| 4 | Can select Package | Color options accessible |
| 4 | Can select Garage | Garage options accessible |
| 4 | Preview updates | Image changes with selections |
| 4 | Validation works | Error message if Review clicked without selections |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/wizard/Step3Design.tsx` | Fix preview aspect ratio, add validation feedback |
| `src/pages/BuildWizard.tsx` | Fix scroll containment on mobile |
| `src/pages/Configurator.tsx` | Add inline mobile pricing |
| `src/components/pricing/BuyerPricingDisplay.tsx` | Add InlineMobilePricing component |

---

## What Will NOT Change
- Desktop layouts (they work well)
- Pricing calculation logic
- Color/garage options available
- Overall step flow structure
- Any copy or messaging
