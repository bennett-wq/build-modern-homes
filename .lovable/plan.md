

# Next-Generation Loan Pre-Qualification System - Implementation Plan

## Executive Summary

Transform BaseMod Financial from a basic lead capture form into a VC-grade, borrower-centric pre-qualification engine. This implementation adds Plaid integration for instant financial verification, smart DTI-based decisioning, and loan program matching for MH Advantage, CHOICEHome, and construction-to-perm programs.

---

## Phase 1: Foundation & Infrastructure

### 1.1 Database Schema Additions

Create new tables and extend existing schema:

**New Table: `plaid_connections`**
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| application_id | uuid | FK to financing_applications |
| plaid_item_id | text | Encrypted Plaid item identifier |
| access_token | text | Encrypted (never client-exposed) |
| institution_name | text | Bank name for display |
| products_enabled | text[] | ['income', 'assets', 'liabilities'] |
| consent_timestamp | timestamptz | Compliance tracking |
| created_at | timestamptz | Auto-generated |

**New Table: `verified_financials`**
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| application_id | uuid | FK to financing_applications |
| verified_annual_income | decimal | From Plaid income data |
| verified_monthly_income | decimal | Calculated |
| verified_assets_total | decimal | From Plaid assets |
| verified_liabilities_total | decimal | From Plaid liabilities |
| employment_verified | boolean | Employer confirmation |
| employer_name | text | From payroll data |
| income_sources | jsonb | Detailed income breakdown |
| data_freshness | timestamptz | When data was pulled |

**Extend `financing_applications`**
- `verification_method` enum: 'manual' | 'plaid_verified'
- `dti_ratio` decimal: Calculated debt-to-income
- `front_end_dti` decimal: Housing-only DTI
- `eligible_programs` text[]: ['mh_advantage', 'choicehome', etc.]
- `prequal_letter_url` text: Generated PDF location
- `consent_credit_pull` boolean: Soft pull consent
- `consent_timestamp` timestamptz: Compliance tracking

### 1.2 Plaid Edge Functions

**`plaid-create-link-token`**
- Generates Plaid Link initialization token
- Configures products: income, assets, identity, liabilities
- Includes redirect URI for mobile support
- Returns token to frontend for Plaid Link SDK

**`plaid-exchange-token`**
- Receives public token from Plaid Link callback
- Exchanges for permanent access token
- Stores encrypted access token in `plaid_connections`
- Never exposes access token to client

**`plaid-get-financials`**
- Fetches verified income, assets, and liabilities
- Processes and normalizes data
- Stores in `verified_financials` table
- Returns sanitized summary to frontend

**`prequal-engine`**
- Calculates DTI ratios using verified data
- Determines maximum loan amount
- Matches eligible programs based on:
  - Credit score thresholds
  - LTV requirements
  - Property use type
- Returns tiered status: Pre-Qualified | Conditional | Needs Review

### 1.3 Required Secrets

Before implementation can begin:
- `PLAID_CLIENT_ID` - From Plaid dashboard
- `PLAID_SECRET` - From Plaid dashboard  
- `PLAID_ENV` - 'sandbox' for testing, 'production' for launch

---

## Phase 2: Smart Decisioning Engine

### 2.1 DTI Calculation Logic

```text
Front-End DTI = (Monthly Housing Payment) / (Monthly Gross Income)
- Target: < 28% for best rates
- Maximum: 31% for conventional

Back-End DTI = (Total Monthly Debt) / (Monthly Gross Income)
- Target: < 36% for best rates
- Maximum: 43% for QM loans, 50% for some programs
```

### 2.2 Loan Program Eligibility Rules

**MH Advantage (Fannie Mae)**
- HUD-labeled manufactured home with MH Advantage sticker
- Permanent foundation required
- Real property titled
- Primary: Up to 97% LTV (3% down)
- Second home: 90% LTV
- Credit minimum: 620

**CHOICEHome (Freddie Mac)**
- Freddie Mac CHOICEHome label
- Real property classification
- Up to 97% LTV with Home Possible
- Credit minimum: 620

**Construction-to-Perm**
- Single-close option
- Interest-only during construction
- Available for all BaseMod models
- Converts to permanent mortgage at completion

**FHA Title I**
- Chattel (personal property) classification
- 20-year max for single-wide
- 25-year max for multi-section
- Lower credit score tolerance (580+)

### 2.3 Pre-Qualification Tiers

| Tier | Criteria | Action |
|------|----------|--------|
| Pre-Qualified | DTI < 36%, Credit 680+, Verified income | Instant approval letter |
| Conditionally Pre-Qualified | DTI 36-43%, Credit 620-679 | Review within 24 hours |
| Needs Review | DTI > 43% OR Credit < 620 | Manual underwriting required |

---

## Phase 3: Enhanced User Experience

### 3.1 New Frontend Components

**`PlaidLinkButton.tsx`**
- Wrapper for Plaid Link SDK
- Branded styling matching BaseMod design
- Loading states and error handling
- Success/failure callbacks

**`VerificationProgress.tsx`**
- Real-time status during Plaid data fetch
- Animated progress indicators
- Step-by-step status messages:
  - "Connecting to your bank..."
  - "Verifying income..."
  - "Calculating eligibility..."

**`EligibilityResults.tsx`**
- Program cards showing what you qualify for
- Visual comparison of programs
- Down payment requirements
- Rate estimates by program

**`PreQualLetter.tsx`**
- Downloadable PDF generation
- Shareable link option
- Includes: Name, date, pre-qualified amount, programs

**`FinancialSummary.tsx`**
- Verified income display (partially redacted)
- Asset verification status
- Privacy-conscious presentation

### 3.2 Updated PreQualificationFlow

**Step 1: Quick Contact (30 seconds)**
- Name, email, phone
- Intended use dropdown
- Purchase price (auto-filled from quote)

**Step 2: Verify Financials (45 seconds)**
- **Option A**: Connect Bank (Plaid - Recommended)
  - Launch Plaid Link
  - Auto-fetch verified data
  - Skip manual entry entirely
- **Option B**: Manual Entry (Fallback)
  - Income range dropdown
  - Credit score estimate
  - Employment status
- Down payment slider

**Step 3: Instant Results (15 seconds)**
- Animated status reveal
- Eligible programs display
- Maximum loan amount
- Monthly payment estimate (PITI)
- Download pre-qual letter button
- Schedule a call CTA

---

## Phase 4: Admin Enhancements

### 4.1 Leads Dashboard Updates

Add columns to `/admin/leads`:
- **Verification Status**: Badge showing "Plaid Verified" vs "Self-Reported"
- **DTI Ratio**: Color-coded (green < 36%, yellow 36-43%, red > 43%)
- **Eligible Programs**: Tags for MH Advantage, CHOICEHome, etc.
- **Pre-Qual Amount**: Calculated maximum

### 4.2 Lead Detail Enhancements

In the lead detail drawer:
- Verified financials section (if Plaid connected)
- Income sources breakdown
- Asset/liability summary
- Program eligibility analysis
- One-click "Generate Letter" button

---

## Technical Implementation Order

### Week 1: Core Infrastructure
1. Request Plaid secrets from user
2. Create database migration for new tables
3. Build `plaid-create-link-token` edge function
4. Build `plaid-exchange-token` edge function
5. Build `plaid-get-financials` edge function
6. Test with Plaid sandbox

### Week 2: Decisioning Engine
7. Build `prequal-engine` edge function
8. Implement DTI calculation logic
9. Implement program eligibility rules
10. Create `PlaidLinkButton` component
11. Create `VerificationProgress` component
12. Update `PreQualificationFlow` with verification choice

### Week 3: Results & Polish
13. Build `EligibilityResults` component
14. Build `FinancialSummary` component
15. Create pre-qualification letter PDF generation
16. Update admin leads dashboard
17. Mobile optimization pass
18. End-to-end testing

---

## Security & Compliance

### Data Protection
- Plaid access tokens encrypted at rest (never client-exposed)
- Verified financials encrypted in database
- Automatic data expiration policy (30 days)
- Consent timestamps for audit trail

### Regulatory Compliance
- Clear disclosures: "This is not a commitment to lend"
- Soft credit pull consent language
- ECOA-compliant decision language
- Privacy policy integration

### RLS Policies
- Users can only view their own applications
- Team members (admin/builder) can view all
- Plaid connections restricted to system access only
- Verified financials protected with same rules as applications

---

## Success Metrics

| Metric | Current State | Target |
|--------|---------------|--------|
| Pre-qual completion rate | ~40% | 70%+ |
| Time to completion | 3-5 minutes | < 2 minutes |
| Verified applications | 0% | 60%+ |
| Lead-to-call conversion | Unknown | Track baseline |

---

## Prerequisites Before Starting

**Immediate Blocker**: Plaid credentials must be configured:
1. `PLAID_CLIENT_ID`
2. `PLAID_SECRET`
3. `PLAID_ENV` (set to 'sandbox' for initial development)

Once these secrets are provided, implementation can begin with Phase 1.

