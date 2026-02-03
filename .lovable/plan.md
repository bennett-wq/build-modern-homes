
# Fix: Mobile Pricing Visibility (Steps 4-8 in 8-Step Flow)

## Status: IMPLEMENTED ✅

## Summary

Updated `InlineMobilePricing` to use `createPortal` with fixed positioning (`bottom-[80px] z-40`) so it remains visible above `WizardStickyFooter` on mobile during Steps 4-8.

## Changes Made

### `src/components/pricing/BuyerPricingDisplay.tsx`
- Added `createPortal` import from `react-dom`
- Added `cn` import from `@/lib/utils`
- Updated `InlineMobilePricing` to render via portal to `document.body`
- Applied fixed positioning: `fixed left-0 right-0 bottom-[80px] sm:bottom-[88px] z-40`
- Added shadow for visual separation: `shadow-[0_-2px_10px_rgba(0,0,0,0.05)]`

### `src/pages/Configurator.tsx`
- Increased mobile content padding from `pb-24` to `pb-40` to account for pricing bar + footer
- Removed `className="mb-20"` from InlineMobilePricing (no longer needed with portal)

## Visual Stack (Mobile)

```text
| Step Content (scrollable, pb-40)  |
|-----------------------------------|
| InlineMobilePricing (z-40)        |  <-- Fixed, collapsible
|-----------------------------------|
| WizardStickyFooter (z-50)         |  <-- Fixed, Back/Continue
-------------------------------------
```
