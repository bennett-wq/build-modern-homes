
# Fix: Remove Extra Text from Mobile Footer

## Problem
The `WizardStickyFooter` displays additional content on mobile that makes it taller than necessary:
- Selection summary chips (e.g., "CrossMod®", "Home Only", "Options are optional")
- "You can change this later" reassurance text

This creates a cramped experience where the pricing bar and footer compete for space.

## Solution
Hide these elements on mobile only, keeping them visible on desktop where there's more room.

---

## File Changes

**File: `src/components/wizard/WizardStickyFooter.tsx`**

### Change 1: Hide children (selection chips) on mobile
Remove the mobile-only children section entirely (lines 94-108). The selection context is already visible in the step content above.

### Change 2: Hide reassurance text on mobile
Add `hidden sm:block` to the reassurance text (lines 188-191) so it only shows on larger screens.

---

## Code Changes

```tsx
// Line 94-108: REMOVE the mobile children section entirely
// DELETE:
{/* Mobile: Show selection summary above buttons */}
<div className="md:hidden mb-3">
  <AnimatePresence mode="wait">
    {children && (
      <motion.div>
        {children}
      </motion.div>
    )}
  </AnimatePresence>
</div>

// Line 188-191: Add hidden sm:block to reassurance
{showReassurance && (
  <span className="hidden sm:block text-[10px] sm:text-[11px] text-muted-foreground/70">
    You can change this later.
  </span>
)}
```

---

## Visual Impact

**Before (Mobile):**
```
┌─────────────────────────────────┐
│ ✓ CrossMod®                     │  ← Remove
├─────────────────────────────────┤
│ ← Back         Continue →       │
│            "You can change..."  │  ← Remove
└─────────────────────────────────┘
  Height: ~120px
```

**After (Mobile):**
```
┌─────────────────────────────────┐
│ ← Back         Continue →       │
└─────────────────────────────────┘
  Height: ~64px
```

---

## Result
- Footer height reduced from ~120px to ~64px on mobile
- Pricing bar (`InlineMobilePricing`) will have more breathing room
- Desktop experience unchanged (selection chips still shown)
- Consistent, clean mobile footer across all steps
