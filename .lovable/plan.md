
# Communities Flow UX Improvements

## Overview
This plan addresses 5 fixes to bring the Communities flow (/developments/[slug]/build) up to the quality of the 8-step configurator. Fix #1 is already implemented; this plan covers Fixes #2-5.

---

## FIX #2: Add Price Range to Community Cards

### Problem
The `/communities` page shows community cards without any pricing information (mobile or desktop).

### Solution
Add lot count and price range calculation to `CommunityCard` component using the lots database.

### Files to Modify

**src/pages/Communities.tsx**
- Import `useLotsBySlug` hook to fetch lots for each community
- Calculate min/max all-in prices from lot premiums + base home package
- Display price range in card: "{lotsCount} lots - From ${min} - ${max}"

### Implementation Details

```text
CommunityCard component changes:
1. Fetch lots: const { lots } = useLotsBySlug(development.slug)
2. Calculate price range:
   - Base price = ~$253,000 (default Hawthorne XMOD all-in)
   - Min = base + min(lot.premium)
   - Max = base + max(lot.premium)
3. Add to card content:
   <p className="text-sm text-muted-foreground">
     {availableLots.length} lots - From ${min.toLocaleString()} - ${max.toLocaleString()}
   </p>
```

---

## FIX #3: Keep Pricing Bar Visible on Step 4 (Design Exterior)

### Problem
`Step3Design` component (Design Exterior step) does not receive pricing props and doesn't render the `InlineMobilePricing` component.

### Solution
Pass pricing props from `BuildWizard` to `Step3Design` and render `InlineMobilePricing` on mobile.

### Files to Modify

**src/pages/BuildWizard.tsx** (lines 402-413)
- Add `buyerFacingBreakdown` and `pricingFlags` props to `Step3Design`

**src/components/wizard/Step3Design.tsx**
- Add props interface: `buyerFacingBreakdown?: BuyerFacingBreakdown` and `pricingFlags?: BuyerPricingFlags`
- Import `InlineMobilePricing` from `@/components/pricing/BuyerPricingDisplay`
- Render `InlineMobilePricing` when `isMobile && buyerFacingBreakdown && pricingFlags`

### Implementation Details

```text
BuildWizard.tsx - Step 4 render:
<Step3Design
  selectedPackageId={selection.packageId}
  selectedGarageDoorId={selection.garageDoorId}
  onSelectPackage={setPackage}
  onSelectGarageDoor={setGarageDoor}
  onNext={() => setCurrentStep(5)}
  onBack={() => setCurrentStep(3)}
  isMobile={isMobile}
  developmentSlug={slug}
  lotId={selection.lotId}
  modelSlug={selection.modelSlug}
  buyerFacingBreakdown={pricing.breakdown}   // ADD
  pricingFlags={pricing.flags}                // ADD
/>

Step3Design.tsx - Add before closing div:
{isMobile && buyerFacingBreakdown && pricingFlags && (
  <InlineMobilePricing
    breakdown={buyerFacingBreakdown}
    flags={pricingFlags}
  />
)}
```

---

## FIX #4: Improve Mobile Lot Selection Layout

### Problem
On mobile, Step 1 (Lot Selection) shows a full-screen map with a "Browse" button that opens a drawer covering the entire map. Users cannot see map and lot list simultaneously.

### Solution
Redesign mobile layout to show:
1. Site plan map at ~45% viewport height
2. Horizontal scrolling lot pill selector below map
3. Keep detailed drawer accessible via "Browse All" button

### Files to Modify

**src/components/wizard/Step1Lot.tsx**

### Implementation Details

```text
Mobile Layout Structure (lines 130-165):
<div className={cn(
  'flex-1 overflow-hidden relative',
  isMobile ? 'flex flex-col' : 'flex'
)}>
  {/* Site Plan - reduced height on mobile */}
  <div className={cn(
    'relative bg-muted',
    isMobile ? 'h-[45vh] shrink-0' : 'flex-1'  // CHANGE: was flex-1
  )}>
    <FixedSitePlanViewer ... />
  </div>

  {/* NEW: Horizontal Lot Scroll - Mobile only */}
  {isMobile && (
    <div className="shrink-0 border-t border-border bg-card">
      <div className="px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Quick Select</h3>
        <Button variant="ghost" size="sm" onClick={() => setMobileListOpen(true)}>
          Browse All
        </Button>
      </div>
      <div className="px-4 pb-4 overflow-x-auto">
        <div className="flex gap-2" style={{ width: 'max-content' }}>
          {lots.filter(l => l.status === 'available').map(lot => (
            <LotPill 
              key={lot.id}
              lot={lot}
              isSelected={lot.id === selectedLotId}
              onClick={() => handleLotClick(lot)}
              allInPrice={calculateAllIn(lot)}
            />
          ))}
        </div>
      </div>
    </div>
  )}

  {/* Existing desktop sidebar unchanged */}
  {!isMobile && (
    <div className="w-96 border-l ...">
      <LotListPanel ... />
    </div>
  )}
</div>
```

**New LotPill subcomponent:**
```text
function LotPill({ lot, isSelected, onClick, allInPrice }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center px-4 py-3 rounded-xl border min-w-[100px]',
        'transition-all duration-150',
        isSelected 
          ? 'bg-accent/20 border-accent shadow-md' 
          : 'bg-card border-border hover:border-accent/50'
      )}
    >
      <span className="font-bold text-foreground">{lot.label}</span>
      <span className="text-xs text-muted-foreground">${(allInPrice/1000).toFixed(0)}K</span>
      {isSelected && <Check className="h-4 w-4 text-accent mt-1" />}
    </button>
  );
}
```

---

## FIX #5: Show All-In Estimate on ALL Lot Cards

### Problem
`PremiumLotCard` only shows the all-in estimate on hover or when selected. Users can't compare prices without hovering each lot.

### Solution
Always show the all-in estimate section on available lots (remove conditional animation).

### Files to Modify

**src/components/wizard/PremiumLotCard.tsx** (lines 247-268)

### Implementation Details

```text
Current (line 249-250):
initial={isSelected ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
animate={isSelected || isHovered ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}

Change to:
// Always visible for available lots
{estimatedAllIn !== undefined && isAvailable && (
  <div className="pt-3 border-t border-border/50">
    <div className="flex items-center justify-between bg-accent/5 rounded-lg p-2.5">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Est. all-in from</span>
      </div>
      <span className="text-base font-bold text-foreground">
        <AnimatedPriceCompact value={estimatedAllIn} />
      </span>
    </div>
  </div>
)}
```

---

## Summary of Changes

| Fix | File | Change Type | Effort |
|-----|------|-------------|--------|
| #2 | Communities.tsx | Add price range calculation and display | Medium |
| #3 | BuildWizard.tsx | Pass pricing props to Step3Design | Small |
| #3 | Step3Design.tsx | Add InlineMobilePricing render | Small |
| #4 | Step1Lot.tsx | Redesign mobile layout with lot pills | Large |
| #5 | PremiumLotCard.tsx | Always show all-in estimate | Small |

---

## Testing Checklist

### Mobile (390x844):
- [ ] /communities shows price range on all community cards
- [ ] Lot selection shows map AND horizontal lot pills together
- [ ] Pricing bar visible on Design Exterior step (Step 4)
- [ ] All lot cards show all-in estimate without hover

### Desktop (1440x900):
- [ ] No regressions to existing desktop experience
- [ ] Price range visible on community cards
- [ ] Pricing bar visible on all steps
- [ ] All lot cards show all-in estimate

---

## Implementation Order

1. **FIX #3** - Pricing bar on Design step (quick, high impact)
2. **FIX #5** - All-in on all lot cards (quick, high impact)
3. **FIX #2** - Price range on community cards (medium effort)
4. **FIX #4** - Mobile lot selection redesign (larger effort)
