
# Mobile Pricing Drawer Fix Plan

## Problem Identified
On mobile (steps 4-8 of the /build wizard), the pricing display is extremely minimal:
- Only shows "Starting from" + price
- Missing: Monthly payment estimate ($X,XXX/mo)
- Missing: "Explore Payments" button
- Missing: "Get Pre-Qualified" CTA (critical conversion point)
- Missing: Price breakdown and "What's included"
- Potential z-index conflict with WizardStickyFooter (both use `fixed bottom-0 z-50`)

Desktop users see the full pricing rail with all financing options, but mobile users are missing critical CTAs.

---

## Solution: Mobile Pricing Drawer

Create an enhanced mobile pricing experience using a bottom drawer pattern (using the existing `vaul` Drawer component) that:

1. **Compact Bar (Always Visible)**: Shows price + monthly payment + tap-to-expand indicator
2. **Expandable Drawer**: Full pricing breakdown, financing options, and CTAs when tapped
3. **Properly Stacks**: Works with or replaces WizardStickyFooter on pricing steps

---

## Implementation

### Phase 1: Enhance MobilePricingBar Component

Update `src/components/pricing/BuyerPricingDisplay.tsx` to replace the minimal `MobilePricingBar` with an enhanced version:

**New Features:**
- Add MonthlyPaymentBadge inline (compact format)
- Add tap indicator ("Tap for details" or chevron up icon)
- Add Drawer that opens to show:
  - Full price breakdown (collapsible sections)
  - "What's included" modal trigger
  - BaseMod Financial section with monthly payment
  - "Explore Payments" and "Get Pre-Qualified" buttons
  - Disclaimers

**Structure:**
```text
[Collapsed State - Fixed Bottom Bar]
┌─────────────────────────────────────────────┐
│ Starting from         │ Est. $1,145/mo  [↑] │
│ $197,350  Preliminary │                     │
└─────────────────────────────────────────────┘

[Expanded State - Drawer]
┌─────────────────────────────────────────────┐
│ ─────────────────  (drag handle)            │
│                                             │
│ Starting from              [Preliminary]    │
│ $197,350                                    │
│ Typical Installed Allowance                 │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ BaseMod Financial           6.875% APR  │ │
│ │ Est. Monthly  $1,145/mo             (i) │ │
│ │ [Explore Payments] [Get Pre-Qualified]  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [▼ View price breakdown]                    │
│ [▼ What's included]                         │
│ [▼ Not included / site dependent]           │
│                                             │
│ Estimates exclude land unless selected.     │
│ Final pricing confirmed via formal quote.   │
└─────────────────────────────────────────────┘
```

### Phase 2: Handle Footer Conflict

On steps 4-8, when `showPricingRail` is true:
- The enhanced mobile pricing bar should replace the navigation footer
- Add back/continue navigation buttons INTO the mobile pricing drawer
- Or: Stack the pricing bar above the footer with proper spacing

**Approach chosen**: Integrate navigation into the mobile pricing drawer footer area, eliminating the need for separate WizardStickyFooter on steps 4+.

### Phase 3: Update Configurator.tsx Integration

Modify how the mobile pricing is rendered:
- Pass `onBack` and `onContinue` props to mobile pricing component
- Include navigation in the mobile drawer
- Ensure proper safe-area padding

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/pricing/BuyerPricingDisplay.tsx` | Replace MobilePricingBar with EnhancedMobilePricingDrawer including financing CTAs and drawer expansion |
| `src/pages/Configurator.tsx` | Update mobile pricing render to pass navigation callbacks; hide WizardStickyFooter when mobile pricing is shown |

---

## Technical Details

### New MobilePricingBar Component Structure

```typescript
// Key imports needed
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { MonthlyPaymentBadge } from '@/components/financing/MonthlyPaymentBadge';
import { FinancingCalculator } from '@/components/financing/FinancingCalculator';
import { PreQualificationFlow } from '@/components/financing/PreQualificationFlow';

// Props to add
interface MobilePricingBarProps {
  breakdown: BuyerFacingBreakdown;
  flags: BuyerPricingFlags;
  onAction?: () => void;
  actionLabel?: string;
  // New props for navigation integration
  onBack?: () => void;
  onContinue?: () => void;
  canContinue?: boolean;
  backLabel?: string;
  continueLabel?: string;
  showNavigation?: boolean;
}
```

### Configurator Integration

```typescript
// In mobile render section (around line 560)
{isMobile && showPricingRail && (
  <BuyerPricingDisplay
    breakdown={displayPricing.breakdown}
    flags={pricingFlags}
    variant="mobile"
    showPlaceholder={false}
    // New: Pass navigation props
    onBack={prevStep}
    onContinue={nextStep}
    canContinue={/* step-specific logic */}
    showNavigation={true}
    // ... existing props
  />
)}

// Conditionally hide WizardStickyFooter when mobile pricing handles navigation
// This is handled within each step component
```

---

## Safe Area Handling

The drawer must properly handle:
- `pb-[env(safe-area-inset-bottom)]` for devices with home indicators
- Proper z-index stacking (z-50 for bar, z-60 for drawer overlay)
- Backdrop blur for premium feel

---

## Acceptance Criteria

- [ ] Mobile users see price + monthly payment estimate in collapsed bar
- [ ] Tapping the bar opens a drawer with full pricing breakdown
- [ ] "Explore Payments" button opens financing calculator
- [ ] "Get Pre-Qualified" button opens pre-qualification flow
- [ ] Navigation (Back/Continue) is accessible on mobile
- [ ] Safe area padding works on iPhone with home indicator
- [ ] No visual conflicts between pricing bar and navigation
- [ ] Drawer has smooth open/close animations
- [ ] All existing pricing logic unchanged

---

## Testing Plan

1. Test on mobile viewport (390x844) - iPhone 14 size
2. Test on smaller mobile (320x568) - iPhone SE size
3. Verify drawer opens and closes smoothly
4. Verify "Get Pre-Qualified" flow works from drawer
5. Verify back/continue navigation works on all steps 4-8
6. Test on tablet viewport to ensure proper responsive behavior
