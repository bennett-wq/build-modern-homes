
# Mobile UX Fixes for Build Configurator Flows

## Status: ✅ COMPLETE

## Overview
This plan addresses four critical mobile UX issues across the 8-step `/build` flow and 5-step Community flow (`/developments/*/build`). The desktop experiences work well - these fixes target mobile-specific problems.

---

## Implemented Fixes

### ✅ Fix #1: Live Preview Not Rendering on Mobile (8-Step Flow)
**Solution:** Changed preview containers from `flex-1` to explicit `aspect-[16/10]` in all photo preview components:
- HawthornePhotoPreview (line 722)
- AspenPhotoPreview (line 831)
- BelmontPhotoPreview (line 1353)
- KeenelandPhotoPreview (line 1555)

### ✅ Fix #2: Pricing Drawer Hidden on Mobile (8-Step Flow)
**Solution:** Created new `InlineMobilePricing` component that renders above the sticky footer (not fixed position), avoiding z-index conflicts. Features:
- Collapsible price summary with expand/collapse
- Monthly payment estimate visible when collapsed
- Financing CTAs (Explore Payments / Get Pre-Qualified) in expanded view

### ✅ Fix #3: Scroll Stuck on Mobile (Community Flow)
**Solution:** Updated `BuildWizard.tsx`:
- Main container uses conditional overflow: `overflow-y-auto` for Step 4 on mobile
- Step 4 motion.div uses `min-h-full` instead of `absolute inset-0` on mobile

### ✅ Fix #4: No Validation Feedback (Both Flows)
**Solution:** Added validation state and error display to `Step3Design.tsx`:
- `validationError` state tracks missing selections
- `handleContinue` callback shows error and switches to relevant tab
- Error message displays in footer with AlertCircle icon
- Error clears automatically when user makes selection

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/wizard/Step3Design.tsx` | Added aspect-[16/10] to 4 preview components, added validation state/feedback |
| `src/pages/BuildWizard.tsx` | Fixed scroll containment for Step 4 on mobile |
| `src/pages/Configurator.tsx` | Replaced fixed MobilePricingBar with InlineMobilePricing |
| `src/components/pricing/BuyerPricingDisplay.tsx` | Added InlineMobilePricing component |

---

## Testing Checklist

### 8-Step Flow (`/build`) - Mobile
| Step | Test | Expected |
|------|------|----------|
| 4-6 | Price visible | Dynamic price shown in collapsible bar ✅ |
| 7 | Preview renders | Home image visible with aspect-[16/10] ✅ |
| 7 | Can select Package | Color options accessible via tabs ✅ |
| 7 | Can select Garage | Garage options accessible via tabs ✅ |
| 7 | Validation works | Error message if Continue clicked without selections ✅ |

### 5-Step Community Flow (`/developments/grand-haven/build`) - Mobile
| Step | Test | Expected |
|------|------|----------|
| 4 | Can scroll to tabs | Package/Garage tabs reachable ✅ |
| 4 | Can select Package | Color options accessible ✅ |
| 4 | Can select Garage | Garage options accessible ✅ |
| 4 | Preview updates | Image changes with selections ✅ |
| 4 | Validation works | Error message if Review clicked without selections ✅ |

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
