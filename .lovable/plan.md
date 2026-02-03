

# Community Flow Enhancements - Mobile Pricing, Loading States & Micro-interactions

## Overview
This plan implements four key enhancements to elevate the 5-step Community build flow (`/developments/*/build`) to exceptional product quality. These changes focus on mobile UX, visual polish, and micro-interactions.

---

## Current State Analysis

### What's Already Working
- **Step 4 Review**: Already shows `BuyerPricingDisplay` with full breakdown (lines 227-255 in Step4Review.tsx)
- **Model Cards**: Already have skeleton loading while images load (lines 185-186 in Step2Model.tsx)
- **Selection Feedback**: Basic selection states exist with checkmark indicators

### What's Missing
- No mobile pricing visibility on Steps 2-4 (Model, Build Type, Design)
- Micro-interactions lack polish (no selection pulse, no price animation)
- Progress step completion needs animated checkmark

---

## Enhancement #1: Mobile Pricing Visibility

**Files to Modify:**
- `src/pages/BuildWizard.tsx`
- `src/components/wizard/Step2Model.tsx`
- `src/components/configurator/steps/StepBuildType.tsx`
- `src/components/wizard/Step3Design.tsx`

**Implementation Approach:**

Add `InlineMobilePricing` component (already exists in BuyerPricingDisplay.tsx) to the mobile layout of Steps 2-4.

**Step2Model.tsx changes:**
```tsx
import { InlineMobilePricing } from '@/components/pricing/BuyerPricingDisplay';

// Add props for pricing
interface Step2ModelProps {
  // ... existing props
  buyerFacingBreakdown?: BuyerFacingBreakdown;
  pricingFlags?: BuyerPricingFlags;
}

// Add above WizardFooterSpacer (mobile only)
{isMobile && buyerFacingBreakdown && pricingFlags && (
  <div className="mt-4">
    <InlineMobilePricing
      breakdown={buyerFacingBreakdown}
      flags={pricingFlags}
    />
  </div>
)}
```

**BuildWizard.tsx changes:**
Pass pricing props to Step2Model, StepBuildType, and Step3Design:
```tsx
<Step2Model
  // ... existing props
  buyerFacingBreakdown={pricing.breakdown}
  pricingFlags={pricing.flags}
/>
```

---

## Enhancement #2: Enhanced Skeleton Loading

**Current State:** Step2Model already implements skeleton loading (lines 185-186)

**Enhancement:** Add shimmer effect and consistent skeleton UI across all image containers.

**Files to Modify:**
- `src/components/wizard/Step2Model.tsx`

**Changes:**
```tsx
// Update skeleton to use shimmer animation
{!imageLoaded && (
  <div className="absolute inset-0 bg-muted overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/5 to-muted animate-shimmer" />
  </div>
)}
```

**Add CSS keyframe in index.css:**
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
```

---

## Enhancement #3: Review Page Pricing Card (Already Implemented)

**Current State:** Step4Review.tsx already displays `BuyerPricingDisplay` prominently (lines 227-234).

**Verification:** The pricing card is positioned:
1. After the "Your Home Plan" summary card
2. After the exterior preview
3. Before the Next Step CTAs

**No changes needed** - this acceptance criteria is already met.

---

## Enhancement #4: Micro-interactions

### 4a. Selection Feedback Animation

**Files to Modify:**
- `src/components/wizard/Step2Model.tsx` (ModelCard)
- `src/components/wizard/Step3Design.tsx` (package/garage selection)
- `src/index.css`

**Add CSS animation:**
```css
@keyframes selectPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.animate-select {
  animation: selectPulse 200ms ease-out;
}
```

**ModelCard enhancement:**
```tsx
<Card 
  className={cn(
    // ... existing classes
    isSelected && 'animate-select'
  )}
>
```

### 4b. Progress Bar Checkmark Animation

**Files to Modify:**
- `src/pages/BuildWizard.tsx`

**Wrap checkmark in motion.div:**
```tsx
{isComplete ? (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 500, damping: 25 }}
    className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
  >
    <Check className="h-3 w-3 text-white" />
  </motion.div>
) : (
  <StepIcon className={cn(...)} />
)}
```

### 4c. Price Update Animation

**Current State:** `BuyerPricingDisplay` already animates price changes using `AnimatePresence` and `motion.div` (lines 355-367).

**Enhancement:** Use `AnimatedPrice` component for smoother odometer-style animation.

**Files to Modify:**
- `src/components/pricing/BuyerPricingDisplay.tsx`

**Changes:**
```tsx
import { AnimatedPrice } from '@/components/ui/animated-price';

// Replace static price display with AnimatedPrice
{flags.hasPricing ? (
  <AnimatedPrice
    value={breakdown.startingFromPrice}
    className="text-3xl font-semibold text-foreground"
  />
) : (
  // ... fallback
)}
```

### 4d. Button Hover States

**Files to Modify:**
- `src/index.css`

**Add global button micro-interaction:**
```css
.btn-micro {
  transition: transform 200ms ease-out;
}

.btn-micro:hover:not(:disabled) {
  transform: scale(1.02);
}

.btn-micro:active:not(:disabled) {
  transform: scale(0.98);
}
```

Apply to primary action buttons in WizardStickyFooter.

---

## Testing Checklist

### Mobile (390x844)
| Test | Expected |
|------|----------|
| Step 2 (Model) | Price bar visible below model grid |
| Step 3 (Build Type) | Price bar visible |
| Step 4 (Design) | Price bar visible |
| Price updates | Animated odometer effect when model changes |
| Model selection | Card pulses briefly on selection |
| Progress bar | Checkmark animates in when step completes |

### Desktop (1440x900)
| Test | Expected |
|------|----------|
| No duplicate pricing | Existing sidebar/inline pricing only |
| Review page | Pricing card prominent before CTAs |
| Selection feedback | Cards scale subtly on selection |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/BuildWizard.tsx` | Pass pricing to steps, animate progress checkmarks |
| `src/components/wizard/Step2Model.tsx` | Add InlineMobilePricing, selection animation |
| `src/components/configurator/steps/StepBuildType.tsx` | Add InlineMobilePricing |
| `src/components/wizard/Step3Design.tsx` | Add InlineMobilePricing |
| `src/components/pricing/BuyerPricingDisplay.tsx` | Use AnimatedPrice component |
| `src/index.css` | Add shimmer, selectPulse, btn-micro animations |

---

## What Will NOT Change
- Current lot selection experience
- Progress bar design and navigation structure
- Package/Garage tab functionality
- Validation feedback system
- Form state persistence (URL parameters)
- CTA button placements and copy
- Trust indicators (Financing, Appraisals badges)
- Desktop layouts and existing pricing sidebar

