
# Database Seeding Plan: CMH-Verified Pricing Data

## Overview

This plan will seed the Supabase database with all CMH Manufacturing spreadsheet-verified pricing data, establishing the database as the single source of truth for the application.

## Current State

| Table | Current Status |
|-------|----------------|
| `models` | Empty |
| `model_pricing` | Empty |
| `upgrade_options` | Empty |

## Data to Seed

### 1. Models Table (6 records)

| Slug | Name | Beds | Baths | Sqft | Length |
|------|------|------|-------|------|--------|
| hawthorne | Hawthorne | 3 | 2 | 1,620 | 64 |
| aspen | Aspen | 4 | 2 | 1,620 | 60 |
| belmont | Belmont | 3 | 2 | 1,620 | 60 |
| keeneland | Keeneland | 3 | 2 | 1,635 | 58 |
| laurel | Laurel | 3 | 2 | 1,065 | 48 |
| cypress | Cypress | 2 | 2 | 990 | 66 |

### 2. Model Pricing Table (11 records with audit trail) - DO NOT SHOW FREIGHT. WE ARE GOING TO HAVE ONE PRICE WHICH IS THE BASE HOME PRICE.

| Model | Build Type | Base Home Price | Quote # | Quote Date |
|-------|------------|-----------------|---------|---------|------------|
| Hawthorne | XMOD | $97,087 | 52202 | 2025-12-15 |
| Hawthorne | MOD | $107,904 | 52407 | 2026-01-08 |
| Aspen | XMOD | $98,246 | 52418 | 2026-01-08 |
| Aspen | MOD | $108,493  | 52422 | 2026-01-08 |
| Belmont | XMOD | $97,182  | 52409 | 2026-01-08 |
| Belmont | MOD | $111,323  | 52410 | 2026-01-08 |
| Keeneland | XMOD | $106,227  | 52250 | 2025-12-20 |
| Laurel | MOD | $95,245 | 52533 | 2026-01-15 |
| Cypress | XMOD | $62,213 | - | - |

(Note: Each pricing row will also store `base_cost`, `options_delta`, `where available from spreadsheets)

### 3. Upgrade Options Table (14 records)

| Slug | Label | Price | Build Types | Category |
|------|-------|-------|-------------|----------|
| office-replaces-bedroom | Office replaces bedroom | $1,500 | All | floor_plan |
| add-half-bath | Add 1/2 bath | $1,000 | All | floor_plan |
| 9ft-walls | 9' walls (Hawthorne) | $11,050 | MOD | floor_plan |
| 9ft-walls-laurel | 9' walls (Laurel) | $11,000 | MOD | floor_plan |
| ebuilt-plus-electric | eBuilt Plus - DOE Certified | $1,500 | All | floor_plan |
| crossmod-inspection-fee | CrossMod Inspection Fee (SC) | $750 | XMOD | floor_plan |
| garbage-disposal | Garbage Disposal | $170 | All | floor_plan |
| carrier-gas-furnace | Carrier High Efficiency Gas Furnace | $765 | All | floor_plan |
| basement-upgrade | Full Basement (upgrade from crawl) | $17,907 | MOD | foundation |
| black-fascia-package | Black Fascia + Drip Edge + Soffit | $525 | All | exterior |
| black-exterior-door | Black Exterior Door | $280 | All | exterior |
| storm-door | Storm Door (White) | $230 | All | exterior |
| plygem-under-55 | Premium Siding Upgrade (Under 55') | $1,205 | All | exterior |
| plygem-55-64 | Premium Siding Upgrade (55'-64') | $1,355 | All | exterior |
| plygem-over-64 | Premium Siding Upgrade (Over 64') | $1,505 | All | exterior |

---

## Technical Implementation

### Step 1: Insert Models

Execute an INSERT statement to populate all 6 model records with:
- Core specs (name, beds, baths, sqft, length)
- Active status and display order
- Placeholder image URLs (existing paths)

### Step 2: Insert Model Pricing

After models are inserted, use their UUIDs to insert pricing rows with:
- `base_home_price` = CMH Quote Total
- `freight_allowance` = Delivery & Set allowance ($22,500 standard) REMOVE THIS PLEASE
- `quote_number` and `quote_date` for audit trail
- `pricing_source` = CMH Quote reference string
- `is_current = true` for all records
- Add 20% Upcharge on Base Price

### Step 3: Insert Upgrade Options

Insert all 14 upgrade options with:
- `applies_to_models` = Model UUIDs array (empty for universal options)
- `applies_to_build_types` = Build type array constraint
- `category` using the `upgrade_category` enum

THIS CREATES THE HOME PACKAGE NO INSTALL

FOR HOME PACKAGE WITH INSTALL AND ESTIMATED SITEWORK, USE THE SITE COST CALCULATOR (DELIVERY AND SET + ON-SITE PORTION WITH ESTIMATES)

---

## Expected Outcome

After seeding:
- The application will fetch pricing from Supabase instead of local fallback
- Admin console will show populated pricing data
- Audit trail fields will be visible in the database for VC due diligence
- All CMH quote numbers will be traceable
