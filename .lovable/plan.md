
# Fix: Remove Gap Between Pricing Bar and Footer

## Problem
The `InlineMobilePricing` component is positioned at `bottom-[80px]` but the footer is only ~64px tall (after removing the children section). This creates a visible ~16px gap between the pricing bar and the navigation footer.

## Root Cause
After removing the mobile children section from `WizardStickyFooter`, the footer height changed:
- **Before**: ~80px (padding + children + buttons)
- **After**: ~64px (padding + buttons only)

The pricing bar's `bottom` offset was not updated to match.

## Solution
Update the `bottom` positioning in `InlineMobilePricing` to match the actual footer height.

### File: `src/components/pricing/BuyerPricingDisplay.tsx`

**Current (line 762):**
```tsx
'bottom-[80px] sm:bottom-[88px]',
```

**Updated:**
```tsx
'bottom-[64px] sm:bottom-[72px]',
```

## Calculation
| Screen | Footer Padding | Button Height | Total | New Bottom Value |
|--------|---------------|---------------|-------|------------------|
| Mobile | py-3 (24px) | 40px | 64px | `bottom-[64px]` |
| sm+ | py-4 (32px) | 40px | 72px | `sm:bottom-[72px]` |

## Result
The pricing bar will sit flush against the footer with no visible gap, creating a seamless visual experience on Steps 4-8.
