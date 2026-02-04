
# Fix: Community Flow Review Step CTAs

## Problem
The `NextStepCards` component in `Step4Review` shows the same CTAs for all flows:
- "Build on My Land" - Get Quote
- "Find Land to Build" - Start Search  
- "BaseMod Community" - View Communities

When users are in the community flow (`/developments/[slug]/build`), they've **already selected a lot**. These CTAs are confusing and don't match the user's journey.

## Solution
Detect when the user is in a community flow and show contextually appropriate CTAs instead.

### Detection Logic
The `selectionSummary` prop passed to `Step4Review` already contains:
- `developmentSlug` - set when in a community
- `lotId` - set when a lot is selected

If both are present, the user is in a community flow.

### Community Flow CTAs (New)
| Card | Icon | Title | Description | CTA |
|------|------|-------|-------------|-----|
| 1 | Calendar | Schedule Consultation | Meet with an advisor to finalize your home plan and discuss next steps. | Book a Call |
| 2 | DollarSign | Get Pre-Qualified | Check your financing eligibility and see estimated monthly payments. | Check Eligibility |
| 3 | FileText | Request Final Quote | Lock in your pricing and receive a detailed breakdown. | Get Quote |

---

## File Changes

### File: `src/components/quote/QuoteRequestForms.tsx`

**Update `NextStepCardsProps` interface (line 608-614):**
```tsx
interface NextStepCardsProps {
  selection: SelectionSummary;
  buyerFacingBreakdown?: BuyerFacingBreakdown;
  pricingFlags?: BuyerPricingFlags;
  pricingMode: PricingMode;
  className?: string;
  onScheduleCall?: () => void;        // NEW: callback for schedule modal
  onGetPreQualified?: () => void;     // NEW: callback for pre-qual flow
}
```

**Update `NextStepCards` component (lines 616-704):**
```tsx
export function NextStepCards({
  selection,
  buyerFacingBreakdown,
  pricingFlags,
  pricingMode,
  className = '',
  onScheduleCall,
  onGetPreQualified,
}: NextStepCardsProps) {
  const [showBuildOnMyLand, setShowBuildOnMyLand] = useState(false);
  const [showFindLand, setShowFindLand] = useState(false);
  const [showCommunityQuote, setShowCommunityQuote] = useState(false);

  // Detect community flow: has both development and lot selected
  const isCommunityFlow = !!(selection.developmentSlug && selection.lotId);

  // Community-specific cards
  const communityCards = [
    {
      id: 'schedule-call',
      icon: Calendar,
      title: 'Schedule Consultation',
      description: 'Meet with an advisor to finalize your home plan and discuss next steps.',
      cta: 'Book a Call',
      onClick: onScheduleCall,
    },
    {
      id: 'get-prequalified',
      icon: DollarSign,
      title: 'Get Pre-Qualified',
      description: 'Check your financing eligibility and see estimated monthly payments.',
      cta: 'Check Eligibility',
      onClick: onGetPreQualified,
    },
    {
      id: 'request-quote',
      icon: FileText,
      title: 'Request Final Quote',
      description: 'Lock in your pricing and receive a detailed breakdown for your selected lot.',
      cta: 'Get Quote',
      onClick: () => setShowCommunityQuote(true),
    },
  ];

  // Standard cards (existing)
  const standardCards = [
    {
      id: 'build-on-my-land',
      icon: Home,
      title: 'Build on My Land',
      description: 'Already have property? We will prepare a site-specific quote for your lot.',
      cta: 'Get Quote',
      onClick: () => setShowBuildOnMyLand(true),
    },
    {
      id: 'find-land',
      icon: Search,
      title: 'Find Land to Build',
      description: 'Need help finding the right lot? We will match you with available land.',
      cta: 'Start Search',
      onClick: () => setShowFindLand(true),
    },
    {
      id: 'basemod-community',
      icon: Building2,
      title: 'BaseMod Community',
      description: 'Explore turnkey lots in our planned communities with streamlined builds.',
      cta: 'View Communities',
      href: '/developments',
    },
  ];

  const cards = isCommunityFlow ? communityCards : standardCards;
  
  // ... rest of component with conditional form rendering
}
```

### File: `src/components/wizard/Step4Review.tsx`

**Pass callbacks to NextStepCards (around line 324-329):**
```tsx
<NextStepCards
  selection={selectionSummary || {}}
  buyerFacingBreakdown={buyerFacingBreakdown}
  pricingFlags={flags}
  pricingMode={flags.pricingMode}
  onScheduleCall={() => setShowScheduleModal(true)}
  onGetPreQualified={() => setShowPreQualFlow(true)}
/>
```

---

## New Component: Community Quote Form

Add a new form for community-specific quote requests that includes the lot/development context:

```tsx
// In QuoteRequestForms.tsx

interface CommunityQuoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selection: SelectionSummary;
  buyerFacingBreakdown?: BuyerFacingBreakdown;
  pricingFlags?: BuyerPricingFlags;
  pricingMode: PricingMode;
}

export function CommunityQuoteForm({ ... }: CommunityQuoteFormProps) {
  // Simplified form since lot/development are already known
  // Focus on contact info + timeline + financing interest
}
```

---

## Visual Comparison

**Before (Community Flow - Confusing):**
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Build on My Land│ │ Find Land       │ │ BaseMod         │
│                 │ │                 │ │ Community       │
│ Get Quote       │ │ Start Search    │ │ View Communities│
└─────────────────┘ └─────────────────┘ └─────────────────┘
        ↑                   ↑                   ↑
   User already        User already         User is already
   has a lot!          has a lot!           in a community!
```

**After (Community Flow - Contextual):**
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Schedule        │ │ Get             │ │ Request Final   │
│ Consultation    │ │ Pre-Qualified   │ │ Quote           │
│                 │ │                 │ │                 │
│ Book a Call     │ │ Check Eligibility│ │ Get Quote      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
        ↑                   ↑                   ↑
   Talk to advisor    Financing CTA       Lock in pricing
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/quote/QuoteRequestForms.tsx` | Add community flow detection, new cards array, CommunityQuoteForm |
| `src/components/wizard/Step4Review.tsx` | Pass `onScheduleCall` and `onGetPreQualified` callbacks to NextStepCards |

---

## Acceptance Criteria

| Criteria | Expected |
|----------|----------|
| Community detection | Automatically detect when `developmentSlug` AND `lotId` are present |
| Community CTAs | Show consultation, pre-qual, and quote cards |
| Standard CTAs | Continue showing existing cards for non-community flows |
| Callbacks | Schedule and pre-qual buttons open existing modals |
| Quote form | New simplified form for community-specific quotes |
