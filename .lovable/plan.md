
# Fix: Mobile Pricing Visibility (Steps 4-8 in 8-Step Flow)

## Problem Analysis

The `InlineMobilePricing` component already exists and is rendered in `Configurator.tsx` (lines 565-571), but it's positioned incorrectly:

**Current State:**
- Rendered after `</main>` at the bottom of the page
- Uses `mb-20` for margin but has NO fixed/sticky positioning
- Scrolls away as users interact with step content
- Users cannot see pricing while making selections

**Desired State:**
- Sticky pricing bar visible at all times on mobile during Steps 4-8
- Positioned directly above the `WizardStickyFooter`
- Collapsible to show/hide breakdown details

## Technical Approach

### Option: Portal-based Sticky Pricing Bar

Since `WizardStickyFooter` uses `createPortal` to render at `document.body` with `fixed bottom-0 z-50`, the cleanest fix is to:

1. **Upgrade `InlineMobilePricing`** to use the same portal approach
2. **Position it** with `fixed bottom-[height-of-footer]` so it stacks above the footer
3. **Use lower z-index** (z-40) to layer properly under the footer

### File Changes

#### File: `src/components/pricing/BuyerPricingDisplay.tsx`

Update the `InlineMobilePricing` component to use portal rendering:

```tsx
function InlineMobilePricing({
  breakdown,
  flags,
  className = '',
}: {
  breakdown: BuyerFacingBreakdown;
  flags: BuyerPricingFlags;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFinancingCalculator, setShowFinancingCalculator] = useState(false);
  const [showPreQualFlow, setShowPreQualFlow] = useState(false);

  const pricingContent = (
    <>
      <div className={cn(
        // Fixed positioning above footer
        'fixed left-0 right-0 z-40',
        // Position above WizardStickyFooter (approx 80px on mobile)
        'bottom-[80px] sm:bottom-[88px]',
        // Styling
        'bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]',
        className
      )}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          {/* ... existing content ... */}
        </Collapsible>
      </div>
      
      {/* Dialogs remain the same */}
    </>
  );

  // Use portal to escape transform contexts
  return createPortal(pricingContent, document.body);
}
```

#### File: `src/pages/Configurator.tsx`

Adjust the main content padding to account for both the footer AND the pricing bar:

```tsx
// Line 378 - Update mobile padding
<div className={isMobile ? 'pb-40' : ''}>
  {/* Step content - now has extra padding for pricing bar */}
```

Also update the InlineMobilePricing render location (already outside main, which is correct for portal):
```tsx
// Lines 563-571 remain the same, component handles its own positioning
{isMobile && showPricingRail && (
  <InlineMobilePricing
    breakdown={displayPricing.breakdown}
    flags={pricingFlags}
  />
)}
```

### Visual Stack (Mobile)

```text
| Step Content (scrollable)     |
|-------------------------------|
| InlineMobilePricing (z-40)    |  <-- Fixed, collapsible
|-------------------------------|
| WizardStickyFooter (z-50)     |  <-- Fixed, Back/Continue
---------------------------------
```

## Acceptance Criteria

| Criteria | Expected |
|----------|----------|
| Price bar visible on Steps 4-8 | Dynamic price shown in sticky bar |
| Position | Fixed above the sticky footer |
| Collapsible | Tap to expand/collapse breakdown |
| Monthly payment | Shows `~$X,XXX/mo` badge |
| Financing CTAs | "Explore Payments" and "Get Pre-Qualified" buttons visible when expanded |
| Price updates | Animates when selections change |
| No overlap | Footer and pricing bar don't overlap |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/pricing/BuyerPricingDisplay.tsx` | Update `InlineMobilePricing` to use portal with fixed positioning |
| `src/pages/Configurator.tsx` | Increase mobile content padding to `pb-40` |

## What Will NOT Change

- Desktop layout (pricing rail on right side works correctly)
- Pricing calculation logic
- The `WizardStickyFooter` component
- Step navigation flow
- Any copy or messaging
