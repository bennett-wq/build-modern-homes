

# Comprehensive Pricing Data Audit & Implementation Plan

## Executive Summary

This audit compares 6 comprehensive pricing spreadsheets from CMH Manufacturing against the current BaseMod codebase to identify all discrepancies and ensure VC-grade data integrity. The goal is to establish these spreadsheets as the single source of truth for all pricing calculations.

---

## 1. Spreadsheet Data Extraction

### 1.1 Factory Quote Totals (The "Quote Total" from CMH)

| Model | Configuration | Base Home | Options | Shipping | MHI | Quote Total |
|-------|---------------|-----------|---------|----------|-----|-------------|
| **Hawthorne** | MOD | $100,700 | $1,857 | $5,312 | $35 | **$107,904** |
| **Hawthorne** | CrossMod (XMOD) | $94,200 | -$1,902 | $4,754 | $35 | **$97,087** |
| **Aspen** | MOD | $103,650 | -$2,033 | $6,841 | $35 | **$108,493** (Summary: $112,559) |
| **Aspen** | CrossMod (XMOD) | $94,575 | -$1,760 | $5,396 | $35 | **$98,246** |
| **Belmont** | MOD | $102,500 | $1,947 | $6,841 | $35 | **$111,323** |
| **Belmont** | CrossMod (XMOD) | $93,425 | -$1,674 | $5,396 | $35 | **$97,182** |
| **Keeneland** | CrossMod (XMOD) | $99,737 | $1,715 | $4,740 | $35 | **$106,227** |
| **Laurel** | MOD | $89,325 | -$956 | $6,841 | $35 | **$95,245** |

Note: The spreadsheets use "Quote Total" as the factory-delivered price (Base + Options + Shipping + MHI Dues). This is the number used as `baseHomePrice` in the codebase.

### 1.2 Site Cost Totals (Zone 3 - Michigan)

| Component | Amount |
|-----------|--------|
| **Crane** | $8,750 |
| **Home Set** | $13,750 |
| **Total Delivery & Set Up** | **$22,500** |
| **On-Site Portion** | $63,817 - $64,267 (varies slightly by model) |
| **Total Site Costs** | **$86,317 - $86,767** |

### 1.3 Model Specifications

| Model | Sqft | Beds | Baths | Box Size |
|-------|------|------|-------|----------|
| Hawthorne | 1,620 | 3 | 2.0 | 64' x 32' |
| Aspen | 1,620 | 4 | 2.0 | 32' x 60' |
| Belmont | 1,620 | 3 | 2.0 | 32' x 60' |
| Keeneland | 1,635 | 3 | 2.0 | 58' x 32' |
| Laurel | 1,065 | 3 | 2.0 | 24' x 48' |

### 1.4 Model-Specific Upgrade Options (from Buyer Selections tabs)

| Upgrade | Price | Applies To |
|---------|-------|------------|
| 9' Walls | $11,050 | Hawthorne (30x64) |
| Add 1/2 Bath | $1,000 | Hawthorne |
| Office Option | $1,500 | Hawthorne |
| eBuilt Plus (DOE Certified) | $1,500 | All models |
| Black Fascia & Drip Edge & Soffit | $525 | All models |
| PlyGem 4400 Siding (To 54') | $1,205 | All models |
| PlyGem 4400 Siding (55'-64') | $1,355 | All models |
| PlyGem 4400 Siding (65'+) | $1,505 | All models |
| Black Exterior Door | $280 | All models |
| Storm Door | $230 | All models |
| Carrier High Efficiency Gas Furnace | $765 | All models |
| Garbage Disposal | $170 | All models |
| CrossMod Fee with SC Inspection | $750 | CrossMod only |
Please add another choice for Foundation Selection
| Foundation - Full basement (Upgrade from Crawl 8x8x16 CMU blocks on tip of a spread / trench footing to full basement) | $17,907 | Mod Only | OR 

---

## 2. Discrepancy Analysis

### 2.1 CRITICAL: Model Pricing Discrepancies

| Model | Config | Codebase Value | Spreadsheet Value | Status |
|-------|--------|----------------|-------------------|--------|
| Hawthorne MOD | baseHomePrice | $107,904 | $107,904 | CORRECT |
| Hawthorne XMOD | baseHomePrice | $97,087 | $97,087 | CORRECT |
| Aspen MOD | baseHomePrice | $112,559 | **$108,493** (Quote) / $112,559 (Summary) | VERIFY |
| Aspen XMOD | baseHomePrice | $98,246 | $98,246 | CORRECT |
| Belmont MOD | baseHomePrice | $111,323 | $111,323 | CORRECT |
| Belmont XMOD | baseHomePrice | $97,182 | $97,182 | CORRECT |
| Keeneland XMOD | baseHomePrice | $106,227 | $106,227 | CORRECT |
| Laurel MOD | baseHomePrice | $95,245 | $95,245 | CORRECT |

**Finding**: Aspen MOD has a potential discrepancy. The Quote Tab shows $108,493 but the Summary Tab shows $112,559. The codebase uses $112,559. Need to clarify which is correct. USE 108,493 THAT IS FINE

### 2.2 CRITICAL: Missing Pricing Configurations

The spreadsheets confirm the following build type availability:

| Model | MOD Pricing? | XMOD Pricing? |
|-------|--------------|---------------|
| Hawthorne | YES | YES |
| Aspen | YES | YES |
| Belmont | YES | YES |
| Keeneland | NO (not in spreadsheet) | YES |
| Laurel | YES | NO (not in spreadsheet) |
| Cypress | NO SPREADSHEET | NO SPREADSHEET |

**Finding**: 
- Cypress has NO spreadsheet provided - current pricing is placeholder
- Keeneland MOD pricing is not provided - This is ok we don't have mod quote
- Laurel XMOD pricing is not provided - no xmod quote yet for this model

### 2.3 Model Specification Discrepancies

| Model | Field | Codebase | Spreadsheet | Issue |
|-------|-------|----------|-------------|-------|
| **Keeneland** | sqft | 1,635 (pricingConfig) | Not specified | Codebase also has 1,635 in models.ts |
| **Keeneland** | length | 58 | 58 (58' x 32') | OFF BY 2 FT | Use 58 but it is a width moreso than length as all are w x l
| **Aspen** | length | 64 | 60 (32' x 60') | OFF BY 4 FT | Use 60
| **Belmont** | length | 64 | 60 (32' x 60') | OFF BY 4 FT | Use 60

### 2.4 Site Cost Discrepancies

| Component | Codebase | Spreadsheet | Status |
|-----------|----------|-------------|--------|
| Crane | $8,750 | $8,750 | CORRECT |
| Home Set | $13,750 | $13,750 | CORRECT |
| Baseline (Total Site Costs) | $86,767 | $86,317 - $86,767 | CLOSE (use $86,767) |
| On-Site Portion | $64,267 | $63,817 - $64,267 | CLOSE (use $64,267) |
| Buffer/Contingency | $5,000 | NOT IN SPREADSHEET | KEEP AS IS |

### 2.5 Upgrade Option Pricing Verification

| Option | Codebase | Spreadsheet | Status |
|--------|----------|-------------|--------|
| 9' Walls (Hawthorne) | $11,050 | $11,050 | CORRECT |
| Add 1/2 Bath | $1,000 | $1,000 | CORRECT |
| Office Option | $1,500 | $1,500 | CORRECT |
| Black Fascia Package | $525 | $525 | CORRECT |
| Black Exterior Door | $280 | $280 | CORRECT |
| Storm Door | $230 | $230 | CORRECT |
| PlyGem Under 55' | $1,205 | $1,205 | CORRECT |
| PlyGem 55-64' | $1,355 | $1,355 | CORRECT |
| PlyGem Over 64' | $1,505 | $1,505 | CORRECT |



---

## 3. Database Schema Alignment

### 3.1 Current Database Tables vs Spreadsheet Structure

The spreadsheets reveal a richer data structure than currently modeled:

```text
SPREADSHEET COMPONENTS          DATABASE TABLE
--------------------------      -------------------
Base Home Cost                  model_pricing.base_home_price
Options Total                   (calculated from selected options)
Shipping & Destination          model_pricing.freight_allowance
MHI Dues                        (NEW - fixed $35 per unit)
Site Costs                      pricing_zones (zone-specific)
Buyer Selections                upgrade_options (junction table)
```

### 3.2 Missing Database Fields

| Table | Missing Field | Source | Action |
|-------|---------------|--------|--------|
| model_pricing | `mhi_dues` | $35 fixed | Add column or constant |
| model_pricing | `base_home_cost` | Spreadsheet "Base Cost of Home" | Currently combined into quote total |
| model_pricing | `options_total` | Spreadsheet "Options Total" | Currently not tracked |
| model_pricing | `shipping_charge` | Spreadsheet "Shipping & Destination" | Currently in freight_allowance |
| model_pricing | `quote_number` | e.g., "52407" | Add for audit trail |
| model_pricing | `quote_date` | e.g., "01/08/2026" | Add for audit trail |

### 3.3 Pricing Zones Enhancement

Spreadsheets show Zone 3 (Michigan) costs. Need zone-specific data for:
- Zone 4 (Florida/St. James Bay)
- Zone 2 (if applicable) JUST USE ZONE 3 COST DATA FOR EVERYTHING FOR NOW

---

## 4. Implementation Plan

### Phase 1: Fix Critical Data Discrepancies

**Files to modify:**
- `src/data/pricing/pricingConfig.ts` - Update model lengths
- `src/data/pricing/localConfig.ts` - Mirror the same fixes
- `src/data/models.ts` - Fix Keeneland sqft discrepancy

**Changes:**

1. **Fix Aspen length**: 64 -> 60
2. **Fix Belmont length**: 64 -> 60  
3. **Fix Keeneland length**: 58 -> 56
4. **Resolve Keeneland sqft**: models.ts shows 1,635; pricingConfig shows 1,800. Keeneland is 58 x 32, but part of this includes the garage. The real "Livable" sf is 1,635 so please use that number.
5. **Flag Aspen MOD pricing for verification**: The spreadsheet shows $108,493 as Quote Total but $112,559 on the summary. Use $108,493

### Phase 2: Add Missing Upgrade Options

Based on the Buyer Selections tab, add these missing options:

```typescript
// New options to add
{ id: 'ebuilt-plus-electric', label: 'eBuilt Plus - DOE Certified', price: 1500, appliesTo: [], buildTypes: [], category: 'exterior' },
{ id: 'crossmod-inspection-fee', label: 'CrossMod Inspection Fee', price: 750, appliesTo: [], buildTypes: ['xmod'], category: 'floor_plan' },
{ id: 'garbage-disposal', label: 'Garbage Disposal', price: 170, appliesTo: [], buildTypes: [], category: 'floor_plan' },
{ id: 'carrier-gas-furnace', label: 'Carrier High Efficiency Gas Furnace', price: 765, appliesTo: [], buildTypes: [], category: 'floor_plan' },
```

### Phase 3: Database Migration

Create a migration to add audit trail fields to `model_pricing`:

```sql
ALTER TABLE model_pricing
ADD COLUMN quote_number TEXT,
ADD COLUMN quote_date DATE,
ADD COLUMN base_cost NUMERIC,
ADD COLUMN options_delta NUMERIC,
ADD COLUMN shipping_charge NUMERIC;

-- Add MHI dues as a system constant
COMMENT ON TABLE model_pricing IS 'MHI Dues fixed at $35 per unit - not stored per row';
```

### Phase 4: Seed Database with Verified Pricing

Using the spreadsheet values:

| Model | Build Type | Foundation | Base Home Price | Freight Allowance | Quote Number |
|-------|------------|------------|-----------------|-------------------|--------------|
| Hawthorne | xmod | Crawl (8x8x16 CMU blocks on tip of a spread / trench footing) | 97,087 | 22,500 | 52202 |
| Hawthorne | mod | Crawl (8x8x16 CMU blocks on tip of a spread / trench footing) | 107,904 | 22,500 | 52407 |
| Aspen | xmod | Crawl (8x8x16 CMU blocks on tip of a spread / trench footing) | 98,246 | 22,500 | 52418 |
| Aspen | mod | Crawl (8x8x16 CMU blocks on tip of a spread / trench footing) | 112,559 | 22,500 | 52422 |
| Belmont | xmod | Crawl (8x8x16 CMU blocks on tip of a spread / trench footing) | 97,182 | 22,500 | 52409 |
| Belmont | mod | Crawl (8x8x16 CMU blocks on tip of a spread / trench footing) | 111,323 | 22,500 | 52410 |
| Keeneland | xmod | Crawl (8x8x16 CMU blocks on tip of a spread / trench footing) | 106,227 | 22,500 | 52250 |
| Laurel | mod | slab | 95,245 | 22,500 | 52533 |

### Phase 5: Add Cypress Pricing (Requires Spreadsheet)

Cypress currently has placeholder pricing ($62,213 with `freightPending: true`). Action required:
- Request Cypress comprehensive pricing spreadsheet from CMH
- Or mark Cypress as "Coming Soon" until pricing is confirmed

---

## 5. Pricing Calculation Verification

### 5.1 Current Calculation Flow

```text
Factory Quote Total (spreadsheet)
        |
        v
+20% Dealer Markup = Retail Home Price
        |
        v
+ Site Costs (baseline $86,767 + buffer $5,000) * 1.20 markup
        |
        v
= Delivered & Installed Estimate
```

### 5.2 Verification: Hawthorne XMOD

```text
Spreadsheet Quote Total: $97,087
+ 20% Dealer Markup: $97,087 * 1.20 = $116,504

Sitework: $86,767 + $5,000 = $91,767
+ 20% Installer Markup: $91,767 * 1.20 = $110,120

Total D&I Estimate: $116,504 + $110,120 = $226,624

With Fees: + $9,631 = $236,255
```

This matches the expected calculation logic.

---

## 6. Quality Assurance Checklist

### Data Integrity

- [ ] All 5 models with spreadsheets have correct baseHomePrice values
- [ ] All model lengths match spreadsheet box sizes
- [ ] All model sqft values are internally consistent
- [ ] Site cost baseline matches spreadsheet ($86,767)
- [ ] Upgrade options match spreadsheet pricing exactly

### Database Schema

- [ ] model_pricing table can store all spreadsheet fields
- [ ] pricing_zones table ready for Zone 4 (Florida) data
- [ ] Audit trail fields (quote_number, quote_date) added

### Code Changes

- [ ] pricingConfig.ts updated with corrected lengths
- [ ] localConfig.ts mirrors pricingConfig.ts exactly
- [ ] models.ts Keeneland sqft updated to 1,800
- [ ] Missing upgrade options added

### Documentation

- [ ] Add pricing version comment with spreadsheet sources
- [ ] Document Aspen MOD pricing discrepancy resolution
- [ ] Note Cypress as placeholder pending CMH quote

---

## 7. Outstanding Questions for Business

1. **Aspen MOD Pricing**: The Quote Detail tab shows $108,493 but the Summary shows $112,559. Which is the correct factory quote total to use? USE $108,493

2. **Keeneland MOD**: No MOD configuration in spreadsheet. Is this intentional (XMOD-only model)? WE DO NOT HAVE A MOD CONFIGURATION OR PRICING YET 

3. **Laurel XMOD**: No XMOD configuration in spreadsheet. Is this intentional (MOD-only model)? WE DO NOT HAVE LAUREL XMOD CONFIGURATION YET

4. **Cypress Pricing**: No spreadsheet provided. Current $62,213 is a placeholder. When will CMH quote be available? WE DO NOT HAVE QUOTE YET. USE 62,213 for factory quote total and build from there. 

5. **Zone 4 (Florida) Site Costs**: Spreadsheets only show Zone 3 (Michigan). What are the site costs for St. James Bay (Carrabelle, FL)? UNKNOWN JUST USE MICHIGAN FOR NOW.

---

## 8. Summary of Changes

### Immediate Fixes (Phase 1)

| File | Change |
|------|--------|
| `src/data/pricing/pricingConfig.ts` | Fix Aspen/Belmont length to 60, Keeneland length to 56 |
| `src/data/pricing/localConfig.ts` | Same length fixes |


### Data Quality Improvements (Phase 2-4)

| Component | Change |
|-----------|--------|
| Upgrade Options | Add 4 new options from Buyer Selections tabs plus add foundation selection for basement upgrade |
| Database Schema | Add quote_number, quote_date columns for audit |
| Model Pricing Seed | Insert verified pricing from spreadsheets |

### Pending Requirements

| Item | Blocker |
|------|---------|
| Cypress Pricing | Awaiting CMH spreadsheet |
| Zone 4 Site Costs | Awaiting Florida cost data |
| Aspen MOD Verification | Business decision needed |

