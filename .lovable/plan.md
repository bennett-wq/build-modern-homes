

## Next-Generation Loan Pre-Qualification System

### Vision: "Get Pre-Qualified in Under 2 Minutes"

Transform BaseMod Financial from a basic lead capture form into a VC-grade, borrower-centric pre-qualification engine that rivals the best fintech experiences. This system will securely verify financial credentials through Plaid integration, provide instant DTI-based decisions, and deliver a premium experience aligned with Fannie Mae MH Advantage and Freddie Mac CHOICEHome programs.

---

## What You'll Get

### 1. Instant Financial Verification via Plaid
- **One-click bank connection** instead of manual income/asset entry
- Verified income data (paystubs, W-2 equivalents, bank deposits)
- Asset verification for down payment proof
- Real credit score (with soft pull consent)
- Eliminates guessing and self-reported ranges

### 2. Smart DTI-Based Decisioning Engine
- Real-time Debt-to-Income calculation using verified data
- Automatic loan amount calculation based on actual financials
- MH Advantage / CHOICEHome eligibility flagging
- Tiered results: Pre-Qualified / Conditionally Pre-Qualified / Needs Review

### 3. Premium User Experience
- 3-step streamlined flow (60-90 seconds typical)
- Progress animations and real-time feedback
- Mobile-first responsive design
- Save and resume capability
- Instant downloadable pre-qualification letter

### 4. Loan Program Intelligence
- Automatic matching to eligible programs (MH Advantage, CHOICEHome, FHA Title I, VA, Construction-to-Perm)
- Program comparison cards showing benefits
- Down payment requirement optimization
- Rate estimates by program type

---

## Technical Architecture

### New Edge Functions

| Function | Purpose |
|----------|---------|
| `plaid-create-link-token` | Generate Plaid Link token for frontend |
| `plaid-exchange-token` | Exchange public token for access token |
| `plaid-get-financials` | Fetch verified income, assets, liabilities |
| `prequal-engine` | Run DTI calculations and eligibility logic |
| `generate-prequal-letter` | Create downloadable PDF letter |

### Database Schema Additions

```text
plaid_connections (new table)
├── id (uuid, PK)
├── application_id (FK → financing_applications)
├── plaid_item_id (encrypted)
├── access_token (encrypted, never exposed to client)
├── institution_name
├── products_enabled (income, assets, identity, liabilities)
├── consent_timestamp
├── created_at

verified_financials (new table)
├── id (uuid, PK)
├── application_id (FK → financing_applications)
├── verified_annual_income (decimal)
├── verified_monthly_income (decimal)
├── verified_assets_total (decimal)
├── verified_liabilities_total (decimal)
├── employment_verified (boolean)
├── employer_name
├── income_sources (jsonb)
├── data_freshness (timestamp)
├── created_at

financing_applications (additions)
├── verification_method (enum: 'manual', 'plaid_verified')
├── dti_ratio (decimal)
├── front_end_dti (decimal)
├── eligible_programs (text[])
├── prequal_letter_url (text)
├── consent_credit_pull (boolean)
├── consent_timestamp
```

### Frontend Components

| Component | Description |
|-----------|-------------|
| `PlaidLinkButton` | Wrapper for Plaid Link SDK with branded styling |
| `VerificationProgress` | Real-time status during Plaid data fetch |
| `EligibilityResults` | Program cards showing what you qualify for |
| `PreQualLetter` | Downloadable/shareable pre-qualification letter |
| `FinancialSummary` | Verified income/assets display (redacted for privacy) |

---

## User Flow

```text
Step 1: Quick Contact (30 sec)
├── Name, email, phone
├── Intended use (primary/second/investment)
├── Purchase price (auto-filled from quote)
└── [Continue]

Step 2: Verify Financials (45 sec)
├── Option A: Connect Bank (Plaid - recommended)
│   ├── Launch Plaid Link
│   ├── User selects bank & logs in
│   ├── Grant income/asset permissions
│   └── Auto-fetch verified data
├── Option B: Manual Entry (fallback)
│   ├── Income range dropdown
│   ├── Credit score estimate
│   └── Employment status
└── Down payment % selector

Step 3: Instant Results (15 sec)
├── Pre-Qualification Status (animated reveal)
├── Eligible Programs (MH Advantage, CHOICEHome, etc.)
├── Maximum loan amount
├── Estimated monthly payment (PITI)
├── Download Pre-Qual Letter button
└── Schedule a Call CTA
```

---

## Loan Program Logic

### MH Advantage Eligibility
- HUD-labeled manufactured home with MH Advantage sticker
- Permanent foundation
- Real property titled
- Up to 97% LTV (3% down) for primary residence
- 90% LTV for second homes
- Standard conventional underwriting

### CHOICEHome Eligibility
- Freddie Mac CHOICEHome label
- Real property classification
- Up to 97% LTV with Home Possible
- 620+ credit score minimum

### Construction-to-Perm
- Single-close option
- Converts to permanent mortgage upon completion
- Interest-only during construction phase
- Available for all BaseMod models

### FHA Title I
- For chattel (personal property) classification
- 20-year max term for single-wide
- 25-year max for multi-section
- Lower credit score tolerance

---

## Security & Compliance

### Data Protection
- Plaid access tokens stored encrypted (never client-exposed)
- Verified financials encrypted at rest
- Automatic data expiration (30 days)
- Consent timestamps for compliance

### Regulatory Considerations
- Clear disclosures: "This is not a commitment to lend"
- Soft credit pull consent language
- ECOA-compliant language
- Privacy policy link

---

## Implementation Phases

### Phase 1: Core Engine (Week 1)
- Create Plaid edge functions (link token, exchange, fetch)
- Add database tables for verified financials
- Build DTI calculation engine
- Update `PreQualificationFlow` with verification choice

### Phase 2: Smart Decisioning (Week 2)
- Implement program eligibility logic
- Build results display with program cards
- Add conditional pre-qual paths
- Create verified financials display

### Phase 3: Premium Polish (Week 3)
- Pre-qualification letter PDF generation
- Email delivery of results
- Save and resume functionality
- Mobile optimization pass

### Phase 4: Admin Enhancements
- Leads dashboard: show verification status
- Verified vs manual indicators
- DTI and program eligibility columns
- One-click "call now" for hot leads

---

## Prerequisites

### Plaid Account Setup
1. Create account at [plaid.com](https://plaid.com)
2. Enable products: Income, Assets, Liabilities, Identity
3. Get Client ID and Secret (Sandbox for testing, Production for launch)
4. Configure webhook URL for async updates

### Secrets Required
- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `PLAID_ENV` (sandbox / development / production)

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Pre-qual completion rate | ~40% | 70%+ |
| Time to completion | 3-5 min | <2 min |
| Verified applications | 0% | 60%+ |
| Lead-to-call conversion | Unknown | Track |

---

## Summary

This upgrade transforms your pre-qualification from a basic form into a true fintech-grade experience:

- **Plaid Integration** for instant, verified financial data
- **Smart DTI Engine** for real-time eligibility decisions
- **Program Matching** for MH Advantage, CHOICEHome, and construction-to-perm
- **Premium UX** with animations, progress tracking, and instant letters
- **Admin Insights** with verification status and eligibility flags

The result: borrowers get instant, credible answers. Your team gets pre-qualified leads with verified financials. Everyone wins.

