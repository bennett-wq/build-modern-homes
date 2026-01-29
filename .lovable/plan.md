
# Epic Lot Selection & Purchase Experience
## Tier-1 VC-Backed Proptech-Grade Implementation

---

## Vision

Transform the lot selection flow into a world-class, "butter-smooth" experience where buyers can:
1. **Explore lots visually** with instant pricing updates
2. **See their complete all-in price** the moment they select a lot
3. **Get pre-approved and download a detailed PDF quote**
4. **Seamlessly access financing options** integrated into the flow

This will position BaseMod as the gold standard in modern homebuilding UX.

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EPIC LOT SELECTION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│   │   Step 1    │───▶│   Step 2    │───▶│   Step 3    │───▶│   Step 4    │ │
│   │  Pick Lot   │    │ Pick Model  │    │   Design    │    │   Review    │ │
│   │             │    │             │    │             │    │ + CHECKOUT  │ │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘ │
│         │                   │                 │                   │         │
│         ▼                   ▼                 ▼                   ▼         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │              LIVE PRICING RAIL (Always Visible)                     │   │
│   │  • Lot Premium: $61,750                                             │   │
│   │  • Home Package: $129,485                                           │   │
│   │  • Sitework: $114,533                                               │   │
│   │  ─────────────────────────────                                      │   │
│   │  ALL-IN PRICE: $305,768                                             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │           NEW: PRE-APPROVAL & DOWNLOADABLE QUOTE                     │   │
│   │  • Integrated financing pre-qualification                           │   │
│   │  • Professional PDF quote generation                                │   │
│   │  • One-click reserve with pre-approval                              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Enhanced Lot Selection UI

### 1.1 Immersive Lot Card Design
Create a new `PremiumLotCard` component featuring:
- **Lot premium price** displayed prominently
- **Phase and availability badges** (Available Now / Fall 2026 / Spring 2027)
- **Acreage and utilities info** at a glance
- **Hover animations** with subtle scale and shadow
- **Quick-view tooltip** on hover showing key details

### 1.2 Real-Time All-In Price Preview
- When user hovers or selects a lot, immediately show:
  - Lot Premium (e.g., $61,750)
  - Estimated Home + Install (calculated from model selection or placeholder)
  - **All-In Total** with clear breakdown
- Animate price updates with smooth number transitions

### 1.3 Visual Lot Status Enhancement
- **Available Now**: Pulsing green glow, "Reserve Today" badge
- **Coming Soon**: Countdown or phase indicator (Fall 2026)
- **Reserved**: Amber with "Join Waitlist" option
- **Sold**: Muted with "Similar lots available" prompt

---

## Phase 2: Integrated Pricing Rail with Lot Context

### 2.1 Lot-Aware Pricing Engine Updates
Extend `useUnifiedPricingEngine` to include:
- **lotPremium** as a dedicated line item
- **allInTotal** calculation: `retailHomeTotal + siteworkRetailTotal + feesAllowance + lotPremium`
- New pricing mode: `community_all_in` fully implemented with lot integration

### 2.2 Enhanced BuyerPricingDisplay
Add lot-specific sections to the pricing breakdown:
- "Your Lot: Lot 15 at Grand Haven" - $61,750
- Clear visual hierarchy showing Home + Land = All-In

### 2.3 Sticky Price Summary
On Step 1 (Lot Selection), show a floating price summary:
- Selected lot premium
- "Starting from $XXX,XXX all-in" (with model TBD placeholder)
- Incentive copy: "Lock in today's pricing"

---

## Phase 3: Pre-Approval & Financing Integration

### 3.1 New Pre-Approval Flow Component
Create `PreApprovalFlow.tsx`:
- **Soft credit check integration** (partnership with lending API)
- **Estimated monthly payment calculator**
- **Pre-qualification in under 2 minutes**
- Display: "Pre-approved up to $XXX,XXX"

### 3.2 Pre-Approval Status Badge
Once pre-approved, show throughout wizard:
- Green checkmark with "Pre-Approved" status
- Monthly payment estimate based on actual all-in price
- "Locked rate" indicator

### 3.3 Financing Calculator Component
Create `FinancingCalculator.tsx` for Step 4:
- Down payment slider (3%, 5%, 10%, 20%)
- Interest rate display
- Monthly payment breakdown (Principal, Interest, Taxes, Insurance)
- Side-by-side comparison with typical rent

---

## Phase 4: Professional Downloadable Quote System

### 4.1 PDF Quote Generator Edge Function
Create `supabase/functions/generate-quote-pdf/index.ts`:
- Use a PDF generation library to create professional documents
- Include BaseMod branding, lot details, model specs, pricing breakdown
- Add QR code linking back to the live quote page
- Include pre-approval status if available

### 4.2 Quote Document Contents
```text
┌─────────────────────────────────────────────────────────────┐
│                     BASEMOD HOMES                           │
│              Preliminary Quote Document                     │
├─────────────────────────────────────────────────────────────┤
│ Quote #: Q-2026-XXXX          Date: January 29, 2026        │
│ Valid for: 30 days                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ PROPERTY DETAILS                                            │
│ Development: Grand Haven                                    │
│ Lot: Lot 15 (2.47 acres)                                   │
│ Status: Available Now                                       │
│                                                             │
│ HOME CONFIGURATION                                          │
│ Model: The Hawthorne                                        │
│ Build Type: Factory-Built (XMOD)                            │
│ Exterior: Modern Charcoal                                   │
│ Sq Ft: 1,568 | Beds: 3 | Baths: 2                          │
│                                                             │
│ PRICING SUMMARY                                             │
│ ─────────────────────────────────────────────────          │
│ Lot Premium                          $61,750                │
│ BaseMod Home Package                $129,485                │
│ Typical Sitework Allowance          $114,533                │
│ Utility & Permit Allowance           $9,631                │
│ ─────────────────────────────────────────────────          │
│ ALL-IN ESTIMATE                     $315,399                │
│                                                             │
│ FINANCING ESTIMATE                                          │
│ Pre-Approved: Yes                                           │
│ Down Payment (5%): $15,770                                  │
│ Est. Monthly: $2,147/mo (30yr @ 6.5%)                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [QR CODE]  Scan to view your live quote online              │
│            build-modern-homes.lovable.app/quote/XXXX        │
├─────────────────────────────────────────────────────────────┤
│ NEXT STEPS                                                  │
│ 1. Schedule a call with our team                           │
│ 2. Complete financing application                          │
│ 3. Reserve your lot with $1,000 deposit                    │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Download Quote Button
Add to Step 4 Review:
- Primary CTA: "Download Your Quote (PDF)"
- Email quote option: "Send to my inbox"
- Share quote option: "Share with co-buyer"

---

## Phase 5: One-Click Reserve Flow

### 5.1 Reserve Lot Modal
For pre-approved buyers, enable instant reservation:
- $1,000 refundable deposit via Stripe
- Reserve lot for 7-14 days
- Automated email with next steps
- Lot status updates to "Reserved"

### 5.2 Reserve CTA
Replace "Request Quote" with conditional CTAs:
- Pre-approved: "Reserve This Lot - $1,000 deposit"
- Not pre-approved: "Get Pre-Approved to Reserve"
- Already reserved by user: "Your Lot is Reserved"

---

## Implementation Files

### New Components
| File | Purpose |
|------|---------|
| `src/components/wizard/PremiumLotCard.tsx` | Enhanced lot card with pricing preview |
| `src/components/wizard/LotPricingPreview.tsx` | Floating all-in price preview |
| `src/components/financing/PreApprovalFlow.tsx` | Pre-qualification wizard |
| `src/components/financing/FinancingCalculator.tsx` | Monthly payment calculator |
| `src/components/financing/MonthlyPaymentBadge.tsx` | Inline payment estimate |
| `src/components/quote/QuotePDFPreview.tsx` | PDF preview component |
| `src/components/wizard/ReserveLotModal.tsx` | Stripe-powered reservation |

### Modified Components
| File | Changes |
|------|---------|
| `src/components/wizard/Step1Lot.tsx` | Integrate PremiumLotCard, add pricing preview |
| `src/components/wizard/Step4Review.tsx` | Add PDF download, financing calc, reserve CTA |
| `src/components/siteplan/LotListPanel.tsx` | Add lot premium prices, availability badges |
| `src/components/siteplan/LotDetailsPanel.tsx` | Add all-in price preview, reserve option |
| `src/components/pricing/BuyerPricingDisplay.tsx` | Add lot premium line, financing estimate |

### Backend / Edge Functions
| File | Purpose |
|------|---------|
| `supabase/functions/generate-quote-pdf/index.ts` | PDF generation using template |
| `supabase/functions/send-quote-email/index.ts` | Email quote to buyer |

### Hooks
| File | Purpose |
|------|---------|
| `src/hooks/useQuotePDF.ts` | Trigger PDF generation and download |
| `src/hooks/usePreApproval.ts` | Manage pre-approval state |

### Database Migrations
| Migration | Purpose |
|-----------|---------|
| Add `pre_approval_status` column to `quotes` table | Track pre-approval |
| Add `reservation_deposit_id` column | Link Stripe payment |
| Add `reserved_until` timestamp | Manage reservation window |

---

## UX Polish Details

### Micro-interactions
- **Lot selection**: Gentle pulse animation on selected lot polygon
- **Price updates**: Counter animation (like a odometer) for price changes
- **CTA buttons**: Subtle gradient shift on hover with icon animation
- **Step transitions**: Crossfade with slight vertical movement

### Loading States
- Skeleton placeholders for lot cards during data fetch
- Optimistic UI updates for selections
- Progress indicator for PDF generation

### Accessibility
- Full keyboard navigation for lot selection
- Screen reader announcements for price updates
- High contrast mode support for all badges

---

## Success Metrics
| Metric | Target |
|--------|--------|
| Time to all-in price display | Under 100ms |
| Pre-approval completion rate | 40%+ of serious buyers |
| PDF quote download rate | 60%+ of Step 4 visitors |
| Lot reservation conversion | 15%+ of pre-approved buyers |

---

## Technical Details

### Pricing Engine Enhancement
The `useUnifiedPricingEngine` hook will be extended to accept a `lotPremium` parameter and include it in the all-in calculation. The `community_all_in` pricing mode will be fully activated to reflect Lot + Home + Sitework + Fees.

### PDF Generation Approach
Use a headless PDF generation library compatible with Deno (like `pdf-lib` or render HTML to PDF via a service). The edge function will:
1. Accept quote ID and selections
2. Fetch model, lot, and pricing data
3. Render a branded template
4. Return the PDF as a downloadable binary

### Pre-Approval Integration
Initially implement as a "soft" pre-qualification form that captures buyer intent and financial readiness. Future integration with lending partners (like Zillow Lending or Cross Country Mortgage) can be added via webhook.

---

## Delivery Sequence
1. **Phase 1**: Enhanced Lot UI components (2-3 sessions)
2. **Phase 2**: Pricing rail lot integration (1 session)
3. **Phase 3**: Financing calculator components (2 sessions)
4. **Phase 4**: PDF quote generation (2-3 sessions)
5. **Phase 5**: Reserve flow with Stripe (2-3 sessions)

Total estimated: 9-12 focused implementation sessions

