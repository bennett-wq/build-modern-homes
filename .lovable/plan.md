

# Communities Mobile - Precision Fix Plan

## Analysis Summary

After reviewing the codebase, here's the status of each fix:

| Fix | Status | Action Needed |
|-----|--------|---------------|
| #1 Step 1 Pricing Bar | Needs Work | Create lot-specific pricing layout |
| #2 Lot Pills with Prices | ALREADY DONE | LotPill already shows $XXK format |
| #3 Browse Drawer Close | ALREADY DONE | X button and drag handle exist |
| #4 Review Share URL | Needs Work | Replace raw URL with styled button |

---

## FIX #1: Step 1 Pricing Bar (Needs Work)

### Current Issue
Step 1 uses `InlineMobilePricing` component, but it shows "Select a model" when `flags.hasPricing` is false. Since no model is selected on Step 1, users see a confusing message instead of lot pricing.

### Solution
Replace the `InlineMobilePricing` usage on Step 1 with a custom lot-specific pricing bar that matches Step 4's styling but shows:
- Left side: Lot Premium with "Selected" badge
- Right side: Estimated All-In price in the blue card styling

### File: src/components/wizard/Step1Lot.tsx

**Changes:**

1. Replace lines 397-403 (current InlineMobilePricing) with a custom lot-specific pricing bar:

```tsx
{/* Mobile Lot Pricing Bar - custom layout for Step 1 */}
{isMobile && selectedLot && (
  <div className={cn(
    'fixed left-0 right-0 z-40 bottom-[64px]',
    'bg-card border-t border-border',
    'shadow-[0_-4px_20px_rgba(0,0,0,0.1)]',
    'px-4 py-4'
  )}>
    <div className="flex items-center justify-between">
      {/* Left: Lot Premium */}
      <div className="text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">Lot Premium</span>
          <Badge variant="secondary" className="text-xs">Selected</Badge>
        </div>
        <p className="text-2xl font-semibold text-foreground tracking-tight">
          ${(selectedLot.premium || 0).toLocaleString()}
        </p>
      </div>
      
      {/* Right: Est. All-In in blue card */}
      {allInPrice && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg px-4 py-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Est. All-in from</span>
            <p className="font-semibold text-blue-700 dark:text-blue-300">
              ${allInPrice.toLocaleString()}*
            </p>
          </div>
        </div>
      )}
    </div>
    <p className="text-[10px] text-muted-foreground mt-2">
      *Final price varies by model selection
    </p>
  </div>
)}
```

2. Remove the InlineMobilePricing import usage for Step 1 (keep it for Steps 2-4)

### Result
- Step 1 pricing bar matches Step 4's "gold standard" layout
- Shows lot premium on left, estimated all-in on right in blue card
- Includes disclaimer about model variation

---

## FIX #2: Lot Pills with Prices - ALREADY DONE

The `LotPill` component (lines 32-59 in Step1Lot.tsx) already displays prices:

```tsx
function LotPill({ lot, isSelected, onClick, allInPrice }: LotPillProps) {
  return (
    <button ...>
      <span className="font-bold text-foreground text-sm">{lot.label}</span>
      <span className="text-xs text-muted-foreground mt-0.5">
        ${(allInPrice / 1000).toFixed(0)}K  // <-- Price already shown!
      </span>
      ...
    </button>
  );
}
```

**No changes needed.**

---

## FIX #3: Browse Drawer Close Button - ALREADY DONE

The mobile bottom sheet (lines 284-358) already has:
- X close button (lines 324-332)
- Drag handle at top (lines 307-309)
- Backdrop click to dismiss (line 295)

**No changes needed.**

---

## FIX #4: Review Step Share URL Cleanup

### Current Issue
Lines 266-316 in Step4Review.tsx show the raw share URL in an input field:
```tsx
<input
  type="text"
  value={shareableUrl}
  readOnly
  className="... truncate"
/>
```

This displays messy URLs like `https://b6311393-fa2b-46a4-a734...`

### Solution
Replace with a styled "Share Your Build" button that copies the link on click.

### File: src/components/wizard/Step4Review.tsx

**Changes (lines 266-316):**

Replace the share card with a cleaner button-only version:

```tsx
{/* Share Your Build - Button Only */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.05, duration: 0.2 }}
>
  <Button
    variant="outline"
    className="w-full flex items-center justify-center gap-2 h-12"
    onClick={handleCopyLink}
  >
    <AnimatePresence mode="wait">
      {copied ? (
        <motion.div
          key="check"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-medium">Link Copied!</span>
        </motion.div>
      ) : (
        <motion.div
          key="share"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Your Build</span>
        </motion.div>
      )}
    </AnimatePresence>
  </Button>
</motion.div>
```

### Result
- No raw URLs visible on the page
- Clean, styled button that shows "Share Your Build"
- Changes to "Link Copied!" with green checkmark on click
- Toast notification still fires for confirmation

---

## Summary of Changes

| File | Change | Lines |
|------|--------|-------|
| `src/components/wizard/Step1Lot.tsx` | Replace InlineMobilePricing with custom lot pricing bar | ~397-403 |
| `src/components/wizard/Step4Review.tsx` | Replace raw URL card with styled share button | ~266-316 |

---

## Testing Checklist

### Step 1 - Lot Selection (Mobile 390x844):
- [ ] Select a lot - pricing bar shows lot premium on left
- [ ] Est. All-in shows in blue card on right
- [ ] Disclaimer "*Final price varies by model" visible
- [ ] Quick Select pills already show prices ($314K format)
- [ ] "Browse" button opens drawer with X close button
- [ ] Drag handle dismisses drawer

### Step 5 - Review:
- [ ] No raw URLs visible on page
- [ ] "Share Your Build" button displays cleanly
- [ ] Click shows "Link Copied!" with green checkmark
- [ ] Toast notification confirms copy action

### Regression Tests:
- [ ] Steps 2, 3, 4 pricing bars unchanged
- [ ] Full wizard flow completes successfully
- [ ] Desktop layouts unaffected

