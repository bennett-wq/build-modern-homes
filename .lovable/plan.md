
# Communities Mobile Optimization - Implementation Plan

## Overview

This plan addresses 7 priorities to optimize the Communities page and flow for mobile (390x844 viewport). Based on codebase analysis, several changes are straightforward while others require more significant restructuring.

---

## PRIORITY 1: Compress Landing Page Hero (CRITICAL)

### Current State
The hero section in `src/pages/Communities.tsx` (lines 197-227) has:
- Large padding: `py-24 lg:py-32`
- "OUR COMMUNITIES" label with icon
- Multi-line heading: "BaseMod Communities"
- Long description paragraph
- Two trust badges (FinancingBadge, AppraisalBadge)

### Changes Required

**File: src/pages/Communities.tsx**

1. **Reduce padding** (line 199):
```tsx
// Change from:
<section className="relative py-24 lg:py-32 bg-secondary">
// To:
<section className="relative py-6 sm:py-12 lg:py-24 bg-secondary">
```

2. **Remove "OUR COMMUNITIES" label** (lines 207-210):
```tsx
// DELETE these lines on mobile, keep for desktop
{!isMobile && (
  <div className="flex items-center gap-2 text-accent mb-4">
    <Building2 size={20} />
    <span className="text-sm font-medium uppercase tracking-wider">Our Communities</span>
  </div>
)}
```

3. **Simplify heading** (lines 211-214):
```tsx
// Change from multi-line to single line with count badge
<div className="flex items-center gap-3 flex-wrap">
  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
    Communities
  </h1>
  <Badge className="bg-accent/10 text-accent border-accent/20">
    {activeDevelopments.length} Active
  </Badge>
</div>
```

4. **Replace description with one-liner** (lines 214-217):
```tsx
// Change from paragraph to single line
<p className="text-sm sm:text-base text-muted-foreground mt-2">
  All-in pricing on available lots
</p>
```

5. **Move trust badges to collapsible or remove on mobile** (lines 219-224):
```tsx
// Only show on sm+ screens
<div className="hidden sm:flex flex-col sm:flex-row gap-3 mt-4">
  <FinancingBadge variant="inline" className="text-muted-foreground" />
  <span className="hidden sm:inline text-muted-foreground/50">•</span>
  <AppraisalBadge variant="inline" className="text-muted-foreground" />
</div>
```

6. **Add `useIsMobile` hook** (line 2):
```tsx
import { useIsMobile } from '@/hooks/use-mobile';
// Then in component:
const isMobile = useIsMobile();
```

### Result
Hero height reduced from ~400px to ~120px on mobile, making first community card visible on load.

---

## PRIORITY 2: Single CTA Per Community Card (CRITICAL)

### Current State
`CommunityCard` (lines 162-183) shows TWO buttons for active communities:
- "Get All-In Price" (primary)
- "View Community" (outline)

### Changes Required

**File: src/pages/Communities.tsx**

Replace the dual-button section (lines 162-183):

```tsx
<div className="pt-2">
  {isActive ? (
    <Button onClick={handleGetAllInPrice} className="w-full">
      <Home className="mr-2 h-4 w-4" />
      Explore Available Lots
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  ) : (
    <Button asChild variant="outline" className="w-full">
      <Link to={`/developments/${development.slug}`}>
        <Bell className="mr-2 h-4 w-4" />
        Join Interest List
      </Link>
    </Button>
  )}
</div>
```

### Result
- Active communities: Single "Explore Available Lots" CTA
- Coming Soon: "Join Interest List" (unchanged)
- No more "View Community" button

---

## PRIORITY 3: Fix Progress Bar Truncation (HIGH)

### Current State
`BuildWizard.tsx` (lines 32-38) defines steps with `shortName` property:
```tsx
const STEPS = [
  { id: 1, name: 'Pick a Lot', shortName: 'Lot', icon: MapPin },
  { id: 2, name: 'Pick a Model', shortName: 'Model', icon: Home },
  { id: 3, name: 'Build Type', shortName: 'Type', icon: Layers },
  { id: 4, name: 'Design Exterior', shortName: 'Design', icon: Palette },
  { id: 5, name: 'Review', shortName: 'Review', icon: ClipboardCheck },
];
```

The issue is in the step button rendering (lines 289-297) where both full name and short name show on mobile.

### Changes Required

**File: src/pages/BuildWizard.tsx**

1. **Shorten step labels** (lines 32-38):
```tsx
const STEPS = [
  { id: 1, name: 'Pick a Lot', shortName: 'Lot', icon: MapPin },
  { id: 2, name: 'Pick a Model', shortName: 'Model', icon: Home },
  { id: 3, name: 'Build Type', shortName: 'Type', icon: Layers },
  { id: 4, name: 'Design Exterior', shortName: 'Style', icon: Palette },  // Changed
  { id: 5, name: 'Review', shortName: 'Done', icon: ClipboardCheck },    // Changed
];
```

2. **Fix mobile label rendering** (lines 289-297):
```tsx
{/* Only show label on current step for mobile */}
{isMobile ? (
  isActive && <span className="text-xs">{step.shortName}</span>
) : (
  <span className="hidden sm:inline">{step.name}</span>
)}
```

3. **Reduce step button padding on mobile** (line 266):
```tsx
'flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200',
```

### Result
All 5 steps visible on 390px without truncation, with only active step showing label.

---

## PRIORITY 4: Show Lot Price in Pricing Bar Earlier

### Current State
`InlineMobilePricing` (lines 743-884 of BuyerPricingDisplay.tsx) shows "Select a model" when `flags.hasPricing` is false.

The issue is that before model selection, even with a lot selected, the pricing engine doesn't generate a price.

### Changes Required

**File: src/components/wizard/Step1Lot.tsx**

The component already calculates `allInPrice` with `calculateAllIn(lot)`. We need to show this in the pricing bar when no model is selected yet.

1. **Create a "lot-only" pricing display** in Step1Lot:

```tsx
// Add after line 396 (InlineMobilePricing section)
{isMobile && selectedLot && !buyerFacingBreakdown?.startingFromPrice && (
  <div className={cn(
    'fixed left-0 right-0 z-40 bottom-[64px]',
    'bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]',
    'px-4 py-4'
  )}>
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">Starting from</span>
          <Badge variant="secondary" className="text-xs">Preliminary</Badge>
        </div>
        <p className="text-2xl font-semibold text-foreground tracking-tight">
          ${allInPrice?.toLocaleString()}*
        </p>
      </div>
      <div className="text-right">
        <span className="text-xs text-muted-foreground">*Final varies by model</span>
      </div>
    </div>
  </div>
)}
```

### Result
Price visible immediately when lot is selected, with asterisk noting model variation.

---

## PRIORITY 5: Add Base Prices to Model Cards

### Current State
Model data in `src/data/models.ts` already has `price` property:
- Aspen: $285,000
- Belmont: $325,000
- Keeneland: $265,000
- Hawthorne: $245,000
- Laurel: $225,000
- Cypress: $185,000

`ModelCard` in `Step2Model.tsx` (lines 172-327) shows specs but NOT price.

### Changes Required

**File: src/components/wizard/Step2Model.tsx**

Add price display to ModelCard (around line 275, after specs):

```tsx
{/* Add after the specs row (line 275) */}
<div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
  <span className="text-xs text-muted-foreground">Base price</span>
  <span className="font-semibold text-accent">
    From ${model.price.toLocaleString()}
  </span>
</div>
```

### Result
Every model card shows base price for easy comparison shopping.

---

## PRIORITY 6: Clarify Lot Availability Numbers

### Current State
`Step1Lot.tsx` shows:
- Header: `${phase1Count} lots available now` (line 163-165)
- Quick Select: `${availableLots.length} available` (line 234)

These can show different numbers (e.g., "4 available now" vs "30 available").

### Changes Required

**File: src/components/wizard/Step1Lot.tsx**

1. **Update header to show both counts** (lines 162-166):
```tsx
<p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
  {phase1Count > 0 
    ? `${phase1Count} ready now of ${availableLots.length} total`
    : `${availableLots.length} lots available`}
</p>
```

2. **Update Quick Select header** (lines 231-235):
```tsx
<div>
  <h3 className="text-sm font-semibold text-foreground">Quick Select</h3>
  <p className="text-xs text-muted-foreground">
    {phase1Count > 0 
      ? `${phase1Count} ready now`
      : `${availableLots.length} available`}
  </p>
</div>
```

3. **Add filter toggle for Phase 1 vs All** (optional enhancement):
```tsx
<div className="flex items-center gap-2">
  <Button 
    variant={showPhase1Only ? "default" : "outline"} 
    size="sm" 
    onClick={() => setShowPhase1Only(true)}
    className="text-xs h-7"
  >
    Ready Now ({phase1Count})
  </Button>
  <Button 
    variant={!showPhase1Only ? "default" : "outline"} 
    size="sm" 
    onClick={() => setShowPhase1Only(false)}
    className="text-xs h-7"
  >
    All Lots ({availableLots.length})
  </Button>
</div>
```

### Result
Clear distinction between "ready to build" and "total inventory".

---

## PRIORITY 7: Rename "Conforming" Badge

### Current State
`ModelCard` in `Step2Model.tsx` (lines 243-249) shows:
```tsx
<Badge className="bg-green-600 text-white border-0 text-xs font-medium shadow-md">
  <ShieldCheck className="h-3 w-3 mr-1" />
  Conforming
</Badge>
```

### Changes Required

**File: src/components/wizard/Step2Model.tsx**

1. **Import Tooltip components** (add to line 6):
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle } from 'lucide-react';
```

2. **Replace badge with tooltip-enabled version** (lines 243-249):
```tsx
{isConforming && (
  <div className="absolute top-3 left-3 pointer-events-auto">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="bg-green-600 text-white border-0 text-xs font-medium shadow-md cursor-help">
            <CheckCircle className="h-3 w-3 mr-1" />
            FHA/VA Eligible
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px]">
          <p className="text-xs">
            Qualifies for FHA, VA, and conventional financing with lower down payments
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)}
```

### Result
Badge text changed to user-friendly "FHA/VA Eligible" with explanatory tooltip.

---

## Summary of File Changes

| File | Changes | Effort |
|------|---------|--------|
| `src/pages/Communities.tsx` | Hero compression, single CTA, add isMobile hook | Medium |
| `src/pages/BuildWizard.tsx` | Shorter step labels, mobile-only active label | Small |
| `src/components/wizard/Step1Lot.tsx` | Lot-only pricing bar, clarified lot counts | Medium |
| `src/components/wizard/Step2Model.tsx` | Base price on cards, FHA/VA badge with tooltip | Small |

---

## Implementation Order

1. **PRIORITY 1**: Hero compression (biggest bounce rate impact)
2. **PRIORITY 2**: Single CTA (removes confusion)
3. **PRIORITY 3**: Progress bar fix (quick win)
4. **PRIORITY 5**: Model prices (enables comparison)
5. **PRIORITY 7**: Badge rename (quick polish)
6. **PRIORITY 4**: Early lot pricing (medium effort)
7. **PRIORITY 6**: Lot count clarity (optional enhancement)

---

## Testing Checklist

### Mobile (390x844)
- [ ] Landing page: Community card 50%+ visible on load
- [ ] Hero: "Communities" title + count badge visible
- [ ] Community cards: Single "Explore Available Lots" CTA
- [ ] Progress bar: All 5 steps visible, no truncation
- [ ] Model cards: Base price visible on each card
- [ ] Model cards: "FHA/VA Eligible" badge with tooltip
- [ ] Step 1: Price shows after lot selection (before model)
- [ ] Lot counts: Clear "X ready now of Y total" language

### Regression Tests
- [ ] Entry from community card goes to Step 1
- [ ] Full wizard flow completes successfully
- [ ] Pricing updates correctly through all steps
- [ ] Desktop experience unchanged
