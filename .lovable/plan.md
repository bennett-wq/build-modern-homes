
# Phase 3: BaseMod Financial - World-Class Financing Experience
## Tier-1 Proptech-Grade Loan Brokerage Platform

---

## Vision

Create **BaseMod Financial** - an integrated lending platform that:
1. Captures leads with rich financial qualification data
2. Provides instant monthly payment estimates with PITI breakdown
3. Generates pre-qualification decisions in real-time
4. Integrates seamlessly into the lot selection and purchase flow
5. Stores all documents, data, and communications for loan processing

This positions BaseMod as a vertically-integrated homebuilder with in-house financing capabilities.

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BASEMOD FINANCIAL PLATFORM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                    FINANCING CALCULATOR                               │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│   │  │ Down Payment│  │Interest Rate│  │   Loan      │  │   PITI      │  │  │
│   │  │   Slider    │  │  Display    │  │   Term      │  │  Breakdown  │  │  │
│   │  │ 3-20%       │  │  6.5%       │  │  30yr       │  │  P+I+T+I    │  │  │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│   │                                                                       │  │
│   │  ┌────────────────────────────────────────────────────────────────┐  │  │
│   │  │              MONTHLY PAYMENT DISPLAY                           │  │  │
│   │  │         $2,147/mo   vs   $2,200 avg rent                       │  │  │
│   │  │      "Build equity instead of paying rent"                     │  │  │
│   │  └────────────────────────────────────────────────────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                PRE-QUALIFICATION FLOW (3-Step Wizard)                 │  │
│   │                                                                       │  │
│   │  Step 1: Basic Info    Step 2: Financial    Step 3: Result           │  │
│   │  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐        │  │
│   │  │ Name, Email    │──▶│ Income Range   │──▶│ Pre-Qualified! │        │  │
│   │  │ Phone          │   │ Credit Score   │   │ Up to $XXX,XXX │        │  │
│   │  │ Employment     │   │ Down Payment   │   │ Download Quote │        │  │
│   │  └────────────────┘   └────────────────┘   └────────────────┘        │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                   DATABASE: financing_applications                    │  │
│   │  • Lead capture with financial data                                  │  │
│   │  • Pre-qualification status tracking                                 │  │
│   │  • Document upload references (future)                               │  │
│   │  • Quote linkage via quote_id                                        │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Table: `financing_applications`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `quote_id` | uuid (FK) | Link to quotes table |
| `contact_name` | text | Applicant name |
| `contact_email` | text | Applicant email |
| `contact_phone` | text | Applicant phone |
| `intended_use` | enum | primary, second_home, investment |
| `employment_status` | enum | employed, self_employed, retired, other |
| `annual_income_range` | enum | under_50k, 50k_75k, 75k_100k, 100k_150k, 150k_plus |
| `credit_score_range` | enum | excellent_750, good_700, fair_650, below_650, unsure |
| `down_payment_percent` | numeric | Intended down payment % |
| `down_payment_amount` | numeric | Calculated down payment $ |
| `loan_amount_requested` | numeric | All-in price minus down payment |
| `purchase_timeframe` | enum | 0_3_months, 3_6_months, 6_12_months, 12_plus |
| `pre_qualification_status` | enum | pending, pre_qualified, needs_review, declined |
| `pre_qualified_amount` | numeric | Maximum loan amount |
| `monthly_payment_estimate` | numeric | Calculated monthly PITI |
| `notes` | text | Additional applicant notes |
| `created_at` | timestamptz | Submission timestamp |
| `updated_at` | timestamptz | Last update |

### RLS Policies
- Anonymous users can INSERT (for lead capture)
- Authenticated users can read/update their own applications
- Admin/builder roles can read/update all applications

---

## Component Architecture

### 1. FinancingCalculator (`src/components/financing/FinancingCalculator.tsx`)

Interactive PITI calculator with:
- **Down Payment Slider**: 3%, 5%, 10%, 15%, 20% presets with custom input
- **Loan Term Toggle**: 30-year (default) vs 15-year comparison
- **Interest Rate Display**: Current market rate (configurable, default 6.5%)
- **PITI Breakdown Card**:
  - Principal & Interest
  - Property Taxes (estimated 1.5% annually)
  - Homeowner's Insurance (estimated $1,800/year)
  - PMI (if down payment < 20%)
- **Rent Comparison**: "vs $2,200 avg rent in [area]"
- **Affordability Check**: Quick income-to-payment ratio indicator

### 2. MonthlyPaymentBadge (`src/components/financing/MonthlyPaymentBadge.tsx`)

Compact inline badge showing:
- Est. $X,XXX/mo
- Tooltip with PITI breakdown
- Link to full calculator

### 3. PreQualificationFlow (`src/components/financing/PreQualificationFlow.tsx`)

3-step wizard inside InfoDrawer:
- **Step 1**: Contact info + intended use + employment
- **Step 2**: Income range + credit score + down payment intent
- **Step 3**: Result screen with pre-qualification status + next steps

### 4. FinancingHero (`src/components/financing/FinancingHero.tsx`)

Premium branded header for financing sections:
- BaseMod Financial logo/wordmark
- Trust badges (NMLS, Equal Housing)
- "Pre-qualify in 2 minutes" headline

### 5. AffordabilityChart (`src/components/financing/AffordabilityChart.tsx`)

Visual chart showing:
- Monthly payment breakdown (donut/pie)
- Income-to-debt ratio indicator
- Comparison to local rent prices

---

## Hook Architecture

### `useFinancingCalculator.ts`

```typescript
interface FinancingInput {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  propertyTaxRate?: number;
  insuranceAnnual?: number;
  zipCode?: string;
}

interface FinancingBreakdown {
  downPaymentAmount: number;
  loanAmount: number;
  monthlyPrincipalInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  totalMonthlyPayment: number;
  totalLoanCost: number;
  recommendedIncome: number;
}
```

### `usePreQualification.ts`

Manages pre-qualification state:
- Form step navigation
- Validation logic
- Database submission
- Status polling (for async decisioning)

---

## Integration Points

### Step 4 Review Enhancement
- Add `FinancingCalculator` component below pricing breakdown
- Show `MonthlyPaymentBadge` in the pricing rail
- Add "Get Pre-Qualified" CTA leading to `PreQualificationFlow`

### BuyerPricingDisplay Enhancement
- Add monthly payment estimate below total
- "Est. $X,XXX/mo with 5% down" helper text
- Link to full financing calculator

### LotPricingPreview Enhancement
- Show monthly payment estimate for each lot
- Help buyers understand affordability at lot selection stage

---

## UX Flow

```text
User selects Lot → Pricing updates → Sees "Est. $2,147/mo"
                                          │
                                          ▼
                          ┌─────────────────────────────┐
                          │  "Explore Financing"        │
                          │  Opens FinancingCalculator  │
                          └─────────────────────────────┘
                                          │
                                          ▼
                          ┌─────────────────────────────┐
                          │  Adjust down payment slider │
                          │  See PITI update in real-time│
                          └─────────────────────────────┘
                                          │
                                          ▼
                          ┌─────────────────────────────┐
                          │  "Get Pre-Qualified"         │
                          │  Opens PreQualificationFlow │
                          └─────────────────────────────┘
                                          │
                                          ▼
                          ┌─────────────────────────────┐
                          │  3-Step Form                │
                          │  Basic → Financial → Result │
                          └─────────────────────────────┘
                                          │
                                          ▼
                          ┌─────────────────────────────┐
                          │  "You're Pre-Qualified!"    │
                          │  Up to $350,000             │
                          │  Download Quote PDF         │
                          │  Schedule Consultation      │
                          └─────────────────────────────┘
```

---

## Implementation Files

### New Components
| File | Purpose |
|------|---------|
| `src/components/financing/FinancingCalculator.tsx` | Interactive PITI calculator |
| `src/components/financing/MonthlyPaymentBadge.tsx` | Compact payment estimate |
| `src/components/financing/PreQualificationFlow.tsx` | 3-step pre-qual wizard |
| `src/components/financing/FinancingHero.tsx` | Branded header section |
| `src/components/financing/AffordabilityChart.tsx` | Visual payment breakdown |
| `src/components/financing/PTIBreakdown.tsx` | Detailed PITI card |

### New Hooks
| File | Purpose |
|------|---------|
| `src/hooks/useFinancingCalculator.ts` | PITI calculation logic |
| `src/hooks/usePreQualification.ts` | Pre-qual flow state |

### Database Migration
- Create `financing_applications` table
- Add RLS policies for secure lead capture
- Create indexes for efficient querying

### Modified Components
| File | Changes |
|------|---------|
| `src/components/wizard/Step4Review.tsx` | Add financing calculator section |
| `src/components/pricing/BuyerPricingDisplay.tsx` | Add monthly payment estimate |
| `src/components/wizard/LotPricingPreview.tsx` | Add monthly payment for lot selection |

---

## Micro-Animations & Polish

### Slider Interactions
- Smooth thumb drag with haptic-style snapping at preset values
- Live counter animation as payment updates
- Gradient fill showing "paid" portion of slider

### Pre-Qualification Flow
- Step progress indicator with checkmark animations
- Confetti/celebration animation on approval
- Smooth content transitions between steps

### Payment Display
- Odometer-style number transitions (using AnimatedPrice)
- Pulse animation on significant changes
- Subtle glow effect on "Pre-Qualified" badge

---

## Brand Identity: BaseMod Financial

### Visual Elements
- Logo: "BaseMod Financial" wordmark or "BMF" monogram
- Color accent: Deep blue (#1e40af) for trust/stability
- Trust badges: NMLS placeholder, Equal Housing Lender
- Tagline: "Financing made simple for modern homes"

### Copy Tone
- Reassuring and professional
- Emphasis on speed and convenience
- Clear disclaimers (not a commitment to lend)

---

## Technical Details

### PITI Calculation Logic

```typescript
// Monthly Principal & Interest (standard amortization)
const monthlyPI = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n))) 
                  / (Math.pow(1 + monthlyRate, n) - 1);

// Monthly Property Tax (estimated)
const monthlyTax = (purchasePrice * propertyTaxRate) / 12;

// Monthly Insurance
const monthlyInsurance = insuranceAnnual / 12;

// Monthly PMI (if down payment < 20%)
const monthlyPMI = downPaymentPercent < 0.2 
  ? loanAmount * 0.005 / 12  // ~0.5% annual PMI rate
  : 0;

// Total PITI
const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI;
```

### Pre-Qualification Logic (Soft Check)

Initial implementation uses rule-based qualification:
- Credit 700+ AND income 3x monthly payment = Pre-Qualified
- Credit 650-699 OR income 2.5-3x = Needs Review
- Below thresholds = Contact for Options

Future: Integrate with lending partner API for real decisioning.

---

## Compliance & Legal

### Required Disclaimers
- "This is not a commitment to lend"
- "Rates and terms subject to change"
- "Pre-qualification is not pre-approval"
- "Equal Housing Lender" badge

### Data Handling
- All financial data stored securely in Supabase with RLS
- No SSN collection at this stage (soft pre-qual only)
- Clear privacy policy link in forms

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Calculator engagement rate | 50%+ of Step 4 visitors |
| Pre-qualification completion rate | 30%+ of calculator users |
| Pre-qualified to reservation conversion | 25%+ |
| Average time in calculator | 45+ seconds |

---

## Delivery Sequence

1. **Database migration**: Create `financing_applications` table with RLS
2. **Core hook**: `useFinancingCalculator` with PITI logic
3. **FinancingCalculator component**: Full interactive calculator
4. **MonthlyPaymentBadge**: Compact inline display
5. **PreQualificationFlow**: 3-step wizard with database submission
6. **Integration**: Wire into Step4Review and BuyerPricingDisplay
7. **Polish**: Animations, branding, accessibility

