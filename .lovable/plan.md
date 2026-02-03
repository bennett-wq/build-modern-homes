
# Fix: Standardize Mobile Pricing Bar (Steps 5-7 to Match Step 8)

## Problem Analysis

**Current State:**
- `InlineMobilePricing` is rendered for Steps 4-8 on mobile via `Configurator.tsx` (line 566-570)
- The component uses `fixed bottom-[80px] z-40` positioning above the footer
- On Steps 5-7, this creates a cramped, visually competing experience because:
  1. Small font size (text-lg = 18px for price)
  2. Tight padding (px-4 py-3)
  3. Competes with `WizardStickyFooter` children (selection chips/summary text)
  4. Collapsible content adds visual complexity

**Step 8's "Gold Standard":**
Step 8 (`StepSummary`) has its own embedded pricing that looks cleaner because:
- Larger, prominent price typography
- More whitespace/breathing room
- Clear visual hierarchy with "Starting from" label
- Monthly payment badge integrated cleanly
- No collapsible complexity in the primary view

## Solution: Redesign `InlineMobilePricing`

Update the component to match Step 8's cleaner aesthetic:

### Visual Changes

| Element | Current | New |
|---------|---------|-----|
| Price font | `text-lg` (18px) | `text-2xl` (24px) |
| Label | `text-xs` | `text-sm` with improved contrast |
| Padding | `px-4 py-3` | `px-4 py-4` |
| Monthly badge | Inline with chevron | Below price, more prominent |
| Collapsible | Show chevron always | Hide chevron, keep content on tap |
| Shadow | Subtle | Stronger for better separation |

### File Changes

**File: `src/components/pricing/BuyerPricingDisplay.tsx`**

Update the `InlineMobilePricing` component (lines 743-877):

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
        'bottom-[80px] sm:bottom-[88px]',
        // Enhanced styling - cleaner, more prominent
        'bg-card border-t border-border',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.1)]',
        className
      )}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="w-full px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Price info - larger, cleaner */}
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {getPricingModeHeadline(flags.pricingMode)}
                  </span>
                  <PreliminaryBadge />
                </div>
                {flags.hasPricing ? (
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={breakdown.startingFromPrice}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="text-2xl font-semibold text-foreground tracking-tight"
                    >
                      {formatPrice(breakdown.startingFromPrice)}
                    </motion.p>
                  </AnimatePresence>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a model</p>
                )}
              </div>
              
              {/* Right: Monthly estimate + expand */}
              <div className="flex items-center gap-3">
                {flags.hasPricing && (
                  <div className="text-right">
                    <MonthlyPaymentBadge
                      purchasePrice={breakdown.startingFromPrice}
                      downPaymentPercent={5}
                      className="text-sm font-medium"
                    />
                  </div>
                )}
                <ChevronDown className={cn(
                  'w-5 h-5 text-muted-foreground transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )} />
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            {/* Expanded content: financing CTAs + disclaimer */}
            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
              {flags.hasPricing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-9"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFinancingCalculator(true);
                    }}
                  >
                    <Calculator className="h-3.5 w-3.5 mr-1.5" />
                    Explore Payments
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs h-9 bg-gradient-to-r from-blue-600 to-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPreQualFlow(true);
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Get Pre-Qualified
                  </Button>
                </div>
              )}
              
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Preliminary estimate. Final pricing confirmed via formal quote.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Dialogs remain unchanged */}
    </>
  );

  return createPortal(pricingContent, document.body);
}
```

### Key Improvements

1. **Larger price** - `text-2xl` (24px) vs current `text-lg` (18px)
2. **More padding** - `py-4` vs `py-3` for better tap targets and breathing room
3. **Stronger shadow** - `shadow-[0_-4px_20px_rgba(0,0,0,0.1)]` for clearer separation
4. **Improved label** - `text-sm font-medium` for better hierarchy
5. **Larger chevron** - `w-5 h-5` for better touch feedback
6. **Expanded separator** - `border-t border-border/50 pt-3` for cleaner collapsed/expanded transition
7. **Consistent CTA heights** - `h-9` for uniform button sizing

## Visual Comparison

```text
BEFORE (Steps 5-7):
┌────────────────────────────────┐
│ Starting from    Preliminary   │  ← Small, cramped
│ $207,749  ~$1,230/mo  ▼       │
└────────────────────────────────┘

AFTER (Matching Step 8):
┌────────────────────────────────┐
│ Starting from  [Preliminary]   │  ← Clearer label
│                                │
│ $207,749                       │  ← Larger, prominent
│              ~$1,230/mo    ▼   │  ← Right-aligned
└────────────────────────────────┘
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/pricing/BuyerPricingDisplay.tsx` | Update `InlineMobilePricing` styling and layout |

## Acceptance Criteria

| Criteria | Expected |
|----------|----------|
| Price size | 24px (text-2xl), matching Step 8's prominence |
| Layout | Clear hierarchy with label above price |
| Monthly estimate | Visible on collapsed state |
| Shadow | Stronger separation from content below |
| Expand/collapse | Smooth transition with border separator |
| Consistency | Steps 5-7 visually match Step 8's pricing display |
