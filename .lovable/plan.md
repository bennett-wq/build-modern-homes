
# Upgrade Options Database Sync Plan

## Overview
This plan reconciles the CMH Builders Series CROSSMOD Option Price List (dated 1-14-26) with the current `upgrade_options` table in the database. The spreadsheet contains 100+ individual options across multiple categories that need to be properly represented.

## Current State Analysis

**Database Status:** 14 upgrade options currently exist
**Spreadsheet Contents:** 100+ options across 12+ categories

### Options Already in Database (Price Verification)

| Option | DB Price | Spreadsheet Price | Status |
|--------|----------|-------------------|--------|
| eBuilt Plus (DOE Certified) | $1,500 | $1,500 | Correct |
| CrossMod Inspection Fee | $750 | $750 | Correct |
| Carrier Gas Furnace | $765 | $765 | Correct |
| Garbage Disposal | $170 | $170 | Correct |
| Black Fascia & Soffit | $525 | $525 | Correct |
| Black Exterior Doors | $280 | $280 | Correct |

### Options Needing Updates

| Option | Current DB | Spreadsheet | Action |
|--------|------------|-------------|--------|
| Storm Door Package | $450 (package) | $230 (each) | Update to $230 each |
| 9' Ceiling Height | $2,200 | $11,050 (Hawthorne specific) | Update + model restriction |
| Half Bath Addition | $3,500 | $1,000 | Update price |
| Office/Den Conversion | $1,800 | $1,500 | Update price |
| PlyGem Siding Tier 1 | $1,200 | $1,205-$1,505 (by length) | Update to $1,355 (mid) |
| PlyGem Siding Tier 2 | $1,800 | N/A (remove or rename) | Remove duplicate |

---

## Implementation Steps

### Step 1: Update Existing Options with Correct Prices

Update these existing records to match CMH spreadsheet:

```text
slug                    | Current  | New Price | Notes
------------------------|----------|-----------|------------------
storm-doors             | $450     | $230      | Per door, not package
half-bath-addition      | $3,500   | $1,000    | CMH quoted price
office-conversion       | $1,800   | $1,500    | CMH quoted price
9ft-walls               | $2,200   | $11,050   | Hawthorne 30x64 specific
plygem-siding-tier1     | $1,200   | $1,355    | 55'-64' length tier
```

### Step 2: Add Missing High-Priority Options

**Structural/Packages:**
- R-38 Roof Insulation IPO R-30 ($425-$625 by length)
- Reverse Side to Side ($500)

**Heating & Fireplaces:**
- Half Stone Gas Fireplace ($2,995)
- Electric Fireplace w/Panel ($2,385)

**Appliances:**
- Gas Range Upgrade ($225)
- 25 CF Bottom Freezer Refrigerator ($495)
- 26 CF Side-by-Side Refrigerator ($1,170)
- 27 CF SxS w/Bottom Freezer ($1,780)
- Washer ($1,010)
- Electric Dryer ($795)
- Gas Dryer Make Ready ($175)

**Interior Doors & Trim:**
- White Painted Pine Trim 48'-56' ($1,770)
- White Painted Pine Trim 60'-68' ($1,985)
- Interior Barn Door ($460)
- Louvered Barn Door ($475)
- Lever Locksets Black ($425)

**Electrical:**
- Ceiling Fan w/Light ($130)
- Prep for Flat Screen ($110)
- Ring Door Bell ($185)
- Ring Floodlight Cam ($270)
- Ring Interior Camera ($140)
- USB-C Port & Receptacle ($75)

**Plumbing:**
- 27"x10" SS Kitchen Sink Upgrade ($705)
- Gooseneck Kitchen Faucet - Brushed Nickel ($110)
- Gooseneck Kitchen Faucet - Matte Black ($125)
- Water Softener Prep ($230)

**Baths:**
- Lighted Vanity Mirror ($370)
- 60" Ceramic Shower ($2,300)
- Curved Shower Rod ($85)
- Hi-Rise Commode ($50)

**Countertops:**
- Crescent Edging Kitchen ($190)
- Crescent Edging Throughout ($240)
- Quartz Island Countertop 82"x38" ($1,325)

**Cabinets:**
- Cabinet Color - White Linen ($410)
- Cabinet Color - Carmel Latte ($450)
- Hardwood Stiles - Timberwolf Grey ($795)
- Hardwood Stiles - White Linen ($1,355)
- Hardwood Stiles - Carmel Latte ($1,495)
- Hardwood Stiles - Black Timber ($1,715)
- Kitchen Hardware Black/Gold ($330)

### Step 3: Add New Categories

Create these additional category values:
- `heating` - Fireplaces, furnace upgrades
- `appliance` - Kitchen appliances
- `electrical` - Smart home, outlets, fans
- `plumbing` - Sinks, faucets, water systems
- `bath` - Bathroom upgrades
- `countertop` - Surface upgrades
- `cabinet` - Cabinet options
- `interior` - Doors, trim, flooring

### Step 4: Remove or Deactivate Obsolete Options

- `full-basement` - Keep at $17,907 (verified separately from CMH sectional sheet)
- `plygem-siding-tier2` - Deactivate (spreadsheet shows single tier with length-based pricing)
- `garage-door-upgrade` - Verify if still offered

---

## Database Changes Summary

### Schema Changes Required

Add new category enum values to support the expanded option catalog:

```sql
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'heating';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'appliance';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'electrical';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'plumbing';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'bath';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'countertop';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'cabinet';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'interior';
```

### Data Changes

**Updates:** 6 existing records with corrected prices
**Inserts:** ~45 new upgrade options
**Deactivations:** 2 obsolete options

---

## Technical Notes

- The spreadsheet shows model-specific pricing (Hawthorne, Belmont, Aspen sections) - these will be mapped via the `applies_to_models` array
- Length-based pricing (48'-56', 60'-68') will use the mid-tier as default with notes
- All prices are CMH factory prices before markup
- Options marked "STD" (standard) are included in base price and won't be added as upgrades
- Color/style variants will be represented as separate options for admin clarity

## Success Criteria

1. All CMH spreadsheet options with pricing are represented in database
2. Prices match the 1-14-26 dated spreadsheet exactly
3. Model-specific restrictions are correctly applied
4. Admin Pricing Console displays all options organized by category
5. Configurator can filter applicable options by model and build type
