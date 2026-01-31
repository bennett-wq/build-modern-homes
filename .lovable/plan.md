

## Buyer Financial Summary - Lender-Ready Deliverable

### Overview
After completing Plaid bank verification, buyers will be able to download a professional "Financial Summary" PDF and copy a text summary to share with lenders for MH Advantage, CHOICEHome, or other manufactured housing loan programs.

### What Lenders Need (Based on Fannie Mae/Freddie Mac Guidelines)
For MH Advantage and CHOICEHome loans, lenders require:
- **Income verification** (verified via Plaid bank transactions/deposits)
- **Asset documentation** (bank account balances from Plaid)
- **Debt-to-Income ratios** (calculated from verified income and liabilities)
- **Employment information** (detected from payroll transactions)
- **Credit assessment** (self-reported, lender will pull actual credit)

### What We Can Provide from Verified Data
| Data Point | Source | Lender Value |
|------------|--------|--------------|
| Verified Annual Income | Plaid transactions | Primary qualification metric |
| Verified Monthly Income | Calculated | DTI calculations |
| Total Assets | Plaid account balances | Reserves verification |
| Total Liabilities | Plaid credit/loan accounts | Back-end DTI |
| Net Worth | Calculated | Overall financial health |
| Front-End DTI | Calculated | Housing expense ratio (target: <31%) |
| Back-End DTI | Calculated | Total debt ratio (target: <43%) |
| Employment Verified | Plaid payroll detection | Income stability |
| Eligible Programs | Engine calculation | Loan program matching |

### Implementation Plan

#### 1. Create Buyer Financial Summary Component
Create a new `src/components/financing/BuyerFinancialSummary.tsx` component that:
- Accepts the application ID and verified financial data
- Generates a professional, lender-ready PDF using jsPDF
- Provides a "Copy to Clipboard" text summary option

#### 2. PDF Report Sections
The buyer-facing PDF will include:

**Header**
- "Financial Summary" title with BaseMod Financial branding
- Buyer name and date generated
- "Bank Verified" or "Self-Reported" badge

**Buyer Information**
- Full name, email, phone
- Intended use (Primary/Second Home/Investment)
- Purchase timeframe

**Loan Overview**
- Purchase price
- Down payment (amount and percentage)
- Loan amount requested
- Estimated monthly payment (PITI breakdown)

**Verified Financial Profile** (highlighted section)
- Verified Annual Income (with Plaid verification badge)
- Verified Monthly Income
- Total Assets (from connected accounts)
- Total Liabilities
- Net Worth (Assets - Liabilities)

**DTI Analysis** (visual boxes like admin PDF)
- Front-End DTI with health indicator (green/yellow/red)
- Back-End DTI with health indicator
- Target thresholds for MH Advantage (31%/43%)

**Eligible Loan Programs**
- List of programs buyer qualifies for
- Best match highlighted
- Brief description of each program

**Footer/Disclaimer**
- "This summary is based on verified bank data and is provided for informational purposes"
- "Final loan approval subject to lender underwriting"
- Generation date and application reference

#### 3. Update PreQualificationFlow Step 3
Add download/share buttons to the results screen after verification completes:

```text
[Results Screen after verification]
   |
   v
+----------------------------------+
| Download Financial Summary (PDF) |  <-- Primary CTA
+----------------------------------+
+----------------------------------+
| Copy Summary to Clipboard        |  <-- Secondary option
+----------------------------------+
```

The buttons will only appear when:
- User completed Plaid bank verification
- Prequal results have been calculated
- Verified financial data exists

#### 4. Text Summary for Clipboard
Generate a clean, professional text summary for easy sharing:

```
BASEMOB FINANCIAL - BUYER SUMMARY
=================================
Name: [Buyer Name]
Generated: [Date]
Status: BANK VERIFIED

LOAN DETAILS
Purchase Price: $XXX,XXX
Down Payment: $XX,XXX (X%)
Loan Amount: $XXX,XXX

VERIFIED FINANCIALS (Plaid)
Annual Income: $XXX,XXX
Total Assets: $XX,XXX
Total Liabilities: $XX,XXX
Front-End DTI: XX.X%
Back-End DTI: XX.X%

ELIGIBLE PROGRAMS
- MH Advantage (Best Match)
- CHOICEHome
- Conventional

Reference: [App ID]
```

### Technical Details

**New Files:**
- `src/components/financing/BuyerFinancialSummary.tsx` - PDF generation and clipboard logic

**Modified Files:**
- `src/components/financing/PreQualificationFlow.tsx` - Add download/share buttons to Step 3 results

**Data Flow:**
1. User completes Plaid verification
2. `prequal-engine` calculates DTI and eligible programs
3. Results stored in `financing_applications` and `verified_financials` tables
4. Step 3 renders with download buttons when `prequalResults` has verified data
5. User clicks download -> PDF generated client-side with jsPDF
6. User clicks copy -> Text summary copied to clipboard

**PDF Design:**
- Match the admin BorrowerProfile PDF style (professional, color-coded DTI boxes)
- Use emerald/green for healthy metrics, amber for borderline, red for high DTI
- Include "Verified" badges prominently
- Professional footer with disclaimers

### User Experience Flow

```text
[Step 2: Bank Verification]
        |
        v
[Secure Bank Connect Page]
        |
   [Success!]
        |
        v
[Step 3: Results Dashboard]
        |
   Shows: Verified income, DTI ratios, eligible programs
        |
        v
[New Section: "Share with Your Lender"]
   |                           |
   v                           v
[Download PDF]         [Copy Summary]
   |                           |
   v                           v
Professional PDF      Text on clipboard
saved to device       ready to paste
```

### Value Proposition
- **For Buyers**: Professional document to share with lenders, speeding up the loan process
- **For Lenders**: Pre-verified financial data reduces document requests
- **For BaseMod**: Positions platform as a true fintech partner in the home buying journey

