

# Admin Pricing Console Redesign

## Overview

The current Admin Pricing page is technically oriented and difficult for non-technical users to navigate. This plan redesigns it into an intuitive, tabbed dashboard that presents all pricing data in easy-to-understand tables with inline editing capabilities.

## Current State Analysis

The existing admin pricing console has several usability issues:

1. **Complex Draft/Publish Workflow** - Uses a JSONB config blob approach that requires creating drafts before viewing or editing any pricing
2. **No Direct Database Editing** - Model prices, lots, and markups are stored in relational tables, but the admin only shows the JSONB config
3. **Missing Data Visibility** - Cannot see lot pricing, upgrade options, or exterior packages
4. **Technical Interface** - Form inputs without context; requires understanding of pricing formulas

## Proposed Solution

A redesigned admin pricing console with 5 intuitive tabs, each presenting data in clear tables with inline editing:

### Tab Structure

| Tab | Purpose | Data Source |
|-----|---------|-------------|
| **Home Prices** | Model base prices by build type | `models` + `model_pricing` tables |
| **Lot Inventory** | Lot prices and status by community | `developments` + `lots` tables |
| **Sitework Costs** | Regional installation baselines | `pricing_zones` table |
| **Markups** | Dealer/installer/developer percentages | `pricing_markups` table |
| **Upgrades** | Options and add-on pricing | `upgrade_options` + `exterior_packages` tables |

### Visual Design Principles

- **Clean Tables**: Each section displays data in a sortable, readable table format
- **Inline Editing**: Click-to-edit cells with immediate save confirmation
- **Plain English Labels**: "Dealer Markup (20%)" instead of "dealerMarkupPct: 0.20"
- **Visual Status Indicators**: Color-coded badges for lot status (Available/Reserved/Sold)
- **Price Formatting**: All prices shown with dollar signs and commas ($97,087)

---

## Detailed Tab Designs

### 1. Home Prices Tab

Displays all models with their base prices in a clear table format:

| Model | Beds | Baths | Sqft | Factory-Built Price | Modular Price | Last Updated |
|-------|------|-------|------|---------------------|---------------|--------------|
| Hawthorne | 3 | 2 | 1,620 | $97,087 | $107,904 | Jan 15, 2026 |
| Aspen | 4 | 2 | 1,620 | $98,246 | $108,493 | Jan 15, 2026 |
| ... | ... | ... | ... | ... | ... | ... |

**Features**:
- Click any price cell to edit inline
- "Save All Changes" button appears when edits are pending
- Show which CMH quote number each price came from (for audit trail)

### 2. Lot Inventory Tab

Organized by community with status filters:

**Community Selector** - Dropdown to choose development (Grand Haven, St. James Bay, etc.)

| Lot # | Acreage | Premium | Status | Phase | Availability |
|-------|---------|---------|--------|-------|--------------|
| Lot 15 | 2.47 | $61,750 | 🟢 Available | 1 | Now |
| Lot 16 | 2.46 | $61,500 | 🟢 Available | 1 | Now |
| Lot 1 | 3.06 | $75,000 | 🟢 Available | 2 | Fall 2026 |
| ... | ... | ... | ... | ... | ... |

**Features**:
- Filter by status (Available/Reserved/Sold)
- Filter by phase (1, 2, 3)
- Click premium to edit
- Click status to change (with confirmation for Reserved/Sold)
- Summary card: "18 lots | 4 available | $48,000 - $802,250"

### 3. Sitework Costs Tab

Regional installation cost baselines:

| Zone | Baseline | Buffer (10%) | Total | Permits | Utility Fees |
|------|----------|--------------|-------|---------|--------------|
| Zone 3 - Michigan | $86,767 | $8,677 | $95,444 | $2,085 | $7,546 |

**Features**:
- "Add Zone" button for new regions
- Inline editing for all cost components
- Preview of "Typical Installed Price" calculation using current values

### 4. Markups Tab

Simple percentage-based markup display:

| Markup Type | Current Rate | Description |
|-------------|--------------|-------------|
| Dealer Markup | 20% | Applied to home package cost |
| Installer Markup | 20% | Applied to sitework baseline |
| Developer Markup | 5% | Applied to community builds |

**Features**:
- Slider or simple input for percentage changes
- Live preview: "A $100,000 home becomes $120,000 retail"

### 5. Upgrades Tab

All available options and add-ons:

| Category | Option | Price | Active |
|----------|--------|-------|--------|
| Floor Plan | eBuilt Plus (DOE Certified) | $1,500 | ✓ |
| Floor Plan | 9' Ceiling Height | $2,200 | ✓ |
| Exterior | Black Fascia & Soffit | $525 | ✓ |
| Foundation | Full Basement Upgrade | $17,907 | ✓ |
| ... | ... | ... | ... |

**Features**:
- Group by category with expandable sections
- Toggle active/inactive status
- "Add New Option" button

---

## Technical Implementation

### File Changes

1. **Create new component**: `src/components/admin/pricing/` directory
   - `PricingHomePricesTab.tsx` - Model pricing table
   - `PricingLotsTab.tsx` - Lot inventory manager
   - `PricingSiteworkTab.tsx` - Zone costs editor
   - `PricingMarkupsTab.tsx` - Markup percentages
   - `PricingUpgradesTab.tsx` - Options manager
   - `PriceEditCell.tsx` - Reusable inline edit component

2. **Refactor**: `src/pages/admin/AdminPricing.tsx`
   - Replace current complex JSONB editor with tab-based layout
   - Use React Query hooks to fetch directly from relational tables
   - Add mutation hooks for inline saves

3. **Add new hooks**:
   - `useModelPricingAdmin.ts` - CRUD for model_pricing with admin access
   - `useLotsAdmin.ts` - CRUD for lots with development filtering
   - `usePricingZonesAdmin.ts` - CRUD for pricing_zones
   - `useUpgradeOptionsAdmin.ts` - CRUD for upgrade_options

### Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                    Admin Pricing Console                    │
├──────────┬──────────┬───────────┬──────────┬───────────────┤
│  Home    │   Lots   │ Sitework  │ Markups  │   Upgrades    │
│  Prices  │          │  Costs    │          │               │
├──────────┴──────────┴───────────┴──────────┴───────────────┤
│                                                             │
│   ┌─────────────┐     ┌──────────────┐     ┌────────────┐  │
│   │ model_pricing│     │    lots      │     │ upgrade_   │  │
│   │   table     │     │    table     │     │  options   │  │
│   └─────────────┘     └──────────────┘     └────────────┘  │
│          ↓                    ↓                    ↓        │
│   React Query         React Query          React Query     │
│   useMutation         useMutation          useMutation     │
│          ↓                    ↓                    ↓        │
│   Supabase Update     Supabase Update      Supabase Update │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Seed Data Migration

Since the `developments` and `lots` tables are currently empty (app uses static fallbacks), we need to seed them:

1. Create a database migration to INSERT the Grand Haven development and its 18 lots
2. Create a migration to INSERT St. James Bay and Ypsilanti developments
3. This allows the admin to manage lot pricing via the database

---

## User Experience Improvements

1. **Immediate Feedback**: Toast notifications on save ("Lot 15 premium updated to $65,000")
2. **Bulk Actions**: Select multiple lots to update status simultaneously
3. **Search/Filter**: Quick search across all tabs
4. **Audit Trail**: "Last modified by [user] on [date]" shown on hover
5. **Help Tooltips**: Explain what each field means (e.g., "Dealer Markup: The percentage added to factory cost for retail pricing")

---

## Migration Strategy

**Phase 1** (This implementation):
- Seed lots and developments into database
- Build read-only views of all pricing data
- Add inline editing for most-changed fields (lot premiums, model prices)

**Phase 2** (Future):
- Add version history for pricing changes
- Implement draft/publish workflow for major updates
- Add pricing audit reports

