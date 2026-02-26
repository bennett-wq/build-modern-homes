# BaseMod HomeMatch — Platform Architecture
## Technical Blueprint for the Three-Tab Platform
**Version:** 1.0 — February 2026
**Status:** Session 1 Deliverable — Architecture Definition
**Stack:** Vite + React 18 + TypeScript + Supabase + Tailwind/shadcn-ui

---

## 1. ARCHITECTURE OVERVIEW

HomeMatch extends the existing BaseMod dashboard (`build-modern-homes`) — a Vite + React 18 SPA with Supabase backend. It adds three new "tabs" sharing a common data layer:

```
┌─────────────────────────────────────────────────────────────┐
│                EXISTING BASEMODHOMES PLATFORM                │
│  (Configurator, Models, Developments, Pricing, Admin)        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  TAB 1       │  │  TAB 2       │  │  TAB 3            │  │
│  │  HomeMatch   │  │  Buyer       │  │  Acquisition      │  │
│  │  (Public)    │  │  Browse      │  │  Intelligence     │  │
│  │  /homes/*    │  │  (Public)    │  │  (Admin Only)     │  │
│  │              │  │  /browse/*   │  │  /admin/acquire/*  │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────────┘  │
│         │                 │                   │              │
│  ┌──────┴─────────────────┴───────────────────┴──────────┐  │
│  │              SHARED ENGINE LAYER                       │  │
│  │                                                        │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐ │  │
│  │  │ Model Fit   │ │ Pricing     │ │ Zoning           │ │  │
│  │  │ Calculator  │ │ Engine      │ │ Verification     │ │  │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘ │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐ │  │
│  │  │ Land Div.   │ │ Comp        │ │ Deal Scoring     │ │  │
│  │  │ Calculator  │ │ Engine      │ │ Engine           │ │  │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘ │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴───────────────────────────────┐  │
│  │                    DATA LAYER                          │  │
│  │                                                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │  │ Supabase │ │ Spark    │ │ Regrid   │ │ Zoning   │ │  │
│  │  │ Postgres │ │ API/MLS  │ │ API      │ │ Database │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Build Sequence
1. **Tab 3 first** — Acquisition Intelligence (internal, battle-tests engines)
2. **Tab 1 second** — HomeMatch public search (uses proven components)
3. **Tab 2 last** — Buyer Browse (curated subset of Tab 1)

---

## 2. DATABASE SCHEMA

### 2.1 — New Tables (Supabase Postgres)

All new tables extend the existing Supabase instance (`pljnisudnjbfmyffyggm`).

#### `mls_listings` — Vacant land from Spark API
```sql
CREATE TABLE mls_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
    -- active | pending | sold | expired | withdrawn | canceled
  listing_type TEXT NOT NULL DEFAULT 'vacant_land',

  -- Location
  address TEXT NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'MI',
  zip_code TEXT,
  county TEXT,
  municipality TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  -- Lot dimensions (from MLS + Regrid enrichment)
  lot_acres NUMERIC(10,4),
  lot_sqft NUMERIC(12,2),
  frontage_ft NUMERIC(8,2),
  depth_ft NUMERIC(8,2),

  -- Listing details
  list_price NUMERIC(12,2),
  original_list_price NUMERIC(12,2),
  price_per_acre NUMERIC(12,2),
  days_on_market INTEGER,
  list_date DATE,
  sold_date DATE,
  sold_price NUMERIC(12,2),
  expiration_date DATE,
  withdrawal_date DATE,

  -- Agent / Office
  listing_agent_name TEXT,
  listing_agent_phone TEXT,
  listing_agent_email TEXT,
  listing_office TEXT,
  coop_commission TEXT, -- e.g., "3%", "$3000"

  -- Utilities & Features
  water TEXT,       -- municipal | well | none
  sewer TEXT,       -- municipal | septic | none
  electric BOOLEAN DEFAULT true,
  gas TEXT,         -- natural | propane | none
  road_type TEXT,   -- paved | gravel | dirt | none
  topography TEXT,  -- flat | gentle_slope | steep | wooded

  -- MLS description
  description TEXT,
  photos JSONB DEFAULT '[]',

  -- Regrid enrichment
  regrid_parcel_id TEXT,
  parcel_boundary JSONB,  -- GeoJSON polygon

  -- Metadata
  source TEXT DEFAULT 'spark_api',
  raw_data JSONB,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mls_listings_status ON mls_listings(status);
CREATE INDEX idx_mls_listings_municipality ON mls_listings(municipality);
CREATE INDEX idx_mls_listings_zip ON mls_listings(zip_code);
CREATE INDEX idx_mls_listings_price ON mls_listings(list_price);
CREATE INDEX idx_mls_listings_mls_number ON mls_listings(mls_number);
CREATE INDEX idx_mls_listings_coords ON mls_listings(latitude, longitude);
```

#### `municipalities` — Zoning intelligence per municipality
```sql
CREATE TABLE municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  county TEXT NOT NULL,
  state TEXT DEFAULT 'MI',
  fips_code TEXT,

  -- Subsection 6 / PA 58
  subsection_6_adopted TEXT DEFAULT 'unknown',
    -- yes | partial | no | unknown
  subsection_6_details TEXT,

  -- Market intelligence
  market_strength TEXT DEFAULT 'moderate',
    -- strong | moderate | weak
  new_construction_activity TEXT DEFAULT 'medium',
    -- high | medium | low | none
  planning_commission_trend TEXT DEFAULT 'neutral',
    -- pro_density | neutral | resistant
  intel_score INTEGER DEFAULT 0, -- 0-100 composite

  -- Coverage
  homematch_live BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'p3',
    -- p1 | p2 | p3

  -- Metadata
  ordinance_url TEXT,
  last_verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_municipalities_name_county
  ON municipalities(name, county, state);
```

#### `zoning_districts` — Dimensional requirements per zone
```sql
CREATE TABLE zoning_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality_id UUID REFERENCES municipalities(id) ON DELETE CASCADE,
  district_code TEXT NOT NULL,     -- e.g., "R-1"
  district_name TEXT NOT NULL,     -- e.g., "Single Family Residential"

  -- Dimensional requirements
  min_lot_width_ft NUMERIC(8,2),
  min_lot_depth_ft NUMERIC(8,2),
  min_lot_area_sqft NUMERIC(12,2),
  front_setback_ft NUMERIC(8,2),
  side_setback_ft NUMERIC(8,2),   -- per side
  rear_setback_ft NUMERIC(8,2),
  max_lot_coverage_pct NUMERIC(5,2),
  max_height_ft NUMERIC(8,2),
  max_dwelling_units INTEGER DEFAULT 1,

  -- Confidence
  confidence TEXT DEFAULT 'not_started',
    -- verified | ai_parsed | incomplete | not_started
  confidence_source TEXT,
  last_verified_at TIMESTAMPTZ,
  verified_by TEXT,

  -- Metadata
  notes TEXT,
  raw_ordinance_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_zoning_districts_municipality
  ON zoning_districts(municipality_id);
```

#### `parcel_zoning` — Links parcels to their zoning district
```sql
CREATE TABLE parcel_zoning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_listing_id UUID REFERENCES mls_listings(id) ON DELETE CASCADE,
  zoning_district_id UUID REFERENCES zoning_districts(id),
  regrid_parcel_id TEXT,

  -- Parcel-specific overrides (from Regrid / GIS)
  actual_frontage_ft NUMERIC(8,2),
  actual_depth_ft NUMERIC(8,2),
  actual_area_sqft NUMERIC(12,2),

  -- Computed buildable envelope
  buildable_width_ft NUMERIC(8,2),
  buildable_depth_ft NUMERIC(8,2),
  buildable_area_sqft NUMERIC(12,2),

  -- Special conditions
  floodplain BOOLEAN DEFAULT false,
  historic_district BOOLEAN DEFAULT false,
  pud_overlay BOOLEAN DEFAULT false,
  special_conditions TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_parcel_zoning_listing
  ON parcel_zoning(mls_listing_id);
```

#### `model_dimensions` — Physical footprints for model fit
```sql
CREATE TABLE model_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_slug TEXT NOT NULL,         -- matches existing models table
  model_name TEXT NOT NULL,

  -- Physical dimensions (CRITICAL for model fit)
  width_ft NUMERIC(8,2) NOT NULL,   -- perpendicular to street
  depth_ft NUMERIC(8,2) NOT NULL,   -- parallel to street / length
  height_ft NUMERIC(8,2) NOT NULL,
  footprint_sqft NUMERIC(12,2) GENERATED ALWAYS AS (width_ft * depth_ft) STORED,

  -- Build type variants
  build_type TEXT NOT NULL,          -- xmod | mod

  -- Reference to existing pricing
  beds INTEGER,
  baths INTEGER,
  living_sqft NUMERIC(8,2),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(model_slug, build_type)
);
```

#### `model_fits` — Pre-calculated fit results (batch computed)
```sql
CREATE TABLE model_fits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_listing_id UUID REFERENCES mls_listings(id) ON DELETE CASCADE,
  model_slug TEXT NOT NULL,
  build_type TEXT NOT NULL,

  -- Fit result
  fit_status TEXT NOT NULL,
    -- fits | tight_fit | no_fit
  fit_reason TEXT,  -- null if fits, explanation if no_fit

  -- Margins (how much room is left)
  width_margin_ft NUMERIC(8,2),
  depth_margin_ft NUMERIC(8,2),
  coverage_pct NUMERIC(5,2),

  -- Pricing
  lot_price NUMERIC(12,2),
  home_price NUMERIC(12,2),
  site_work_low NUMERIC(12,2),
  site_work_high NUMERIC(12,2),
  total_delivered_low NUMERIC(12,2),
  total_delivered_high NUMERIC(12,2),

  -- Confidence inherits from zoning
  zoning_confidence TEXT,

  computed_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(mls_listing_id, model_slug, build_type)
);

CREATE INDEX idx_model_fits_listing ON model_fits(mls_listing_id);
CREATE INDEX idx_model_fits_status ON model_fits(fit_status);
CREATE INDEX idx_model_fits_model ON model_fits(model_slug);
```

#### `land_divisions` — Division potential per lot
```sql
CREATE TABLE land_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_listing_id UUID REFERENCES mls_listings(id) ON DELETE CASCADE,

  -- Division analysis
  total_frontage_ft NUMERIC(8,2),
  min_lot_width_ft NUMERIC(8,2),
  max_possible_lots INTEGER,
  feasible_lots INTEGER,  -- after access easement deduction

  -- Per resulting lot (JSONB array)
  resulting_lots JSONB DEFAULT '[]',
  -- Each: { lot_number, width_ft, depth_ft, area_sqft, fitting_models: [...] }

  -- Development economics
  total_acquisition_cost NUMERIC(12,2),
  total_build_cost NUMERIC(12,2),
  total_site_work NUMERIC(12,2),
  total_development_cost NUMERIC(12,2),
  estimated_total_value NUMERIC(12,2),
  estimated_margin NUMERIC(12,2),
  estimated_roi_pct NUMERIC(5,2),

  computed_at TIMESTAMPTZ DEFAULT now()
);
```

#### `acquisition_scores` — Tab 3 scoring for expired/withdrawn lots
```sql
CREATE TABLE acquisition_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_listing_id UUID REFERENCES mls_listings(id) ON DELETE CASCADE,

  -- Composite score (0-100)
  total_score INTEGER NOT NULL,

  -- Sub-scores (each 0-25)
  seller_motivation_score INTEGER,
  lot_viability_score INTEGER,
  margin_potential_score INTEGER,
  market_strength_score INTEGER,

  -- Score reasoning
  score_factors JSONB DEFAULT '{}',
  -- { seller_motivation: { days_expired: 180, price_reductions: 2, ... },
  --   lot_viability: { models_that_fit: 4, zoning_confidence: "verified", ... },
  --   margin_potential: { est_margin_pct: 22, comp_support: "strong", ... },
  --   market_strength: { absorption_rate: 0.85, price_trend: "rising", ... } }

  -- Actions
  recommended_action TEXT,
    -- acquire_direct | contact_seller | monitor | pass
  recommended_offer NUMERIC(12,2),

  -- Status tracking
  review_status TEXT DEFAULT 'unreviewed',
    -- unreviewed | reviewing | approved | passed | acquired
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,

  computed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_acquisition_scores_total ON acquisition_scores(total_score DESC);
CREATE INDEX idx_acquisition_scores_status ON acquisition_scores(review_status);
```

#### `homematch_inquiries` — Lead capture from "I'm Interested"
```sql
CREATE TABLE homematch_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_listing_id UUID REFERENCES mls_listings(id),
  model_slug TEXT,

  -- Contact info
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,

  -- Context
  is_agent BOOLEAN DEFAULT false,
  agent_name TEXT,
  agent_brokerage TEXT,
  agent_mls_id TEXT,

  -- Source
  source_tab TEXT NOT NULL,
    -- homematch | buyer_browse | acquisition
  referrer_url TEXT,

  -- Status
  status TEXT DEFAULT 'new',
    -- new | contacted | qualified | in_pipeline | closed | lost
  assigned_to TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `search_analytics` — Track search behavior for intelligence
```sql
CREATE TABLE search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Search context
  search_type TEXT NOT NULL,
    -- location | mls_number | filter | map_pan
  search_query TEXT,
  municipality TEXT,
  zip_code TEXT,

  -- Filters applied
  filters JSONB DEFAULT '{}',

  -- Results
  result_count INTEGER,

  -- User context (anonymous)
  session_id TEXT,
  source_tab TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Partition by month for analytics queries
CREATE INDEX idx_search_analytics_municipality
  ON search_analytics(municipality);
CREATE INDEX idx_search_analytics_created
  ON search_analytics(created_at);
```

### 2.2 — Model Dimensions Reference

Based on existing `pricing-config.ts` data, the model library for fit calculations:

| Model | Slug | Width (ft) | Depth/Length (ft) | Height (ft) | Footprint (sqft) | Beds | Baths | Living sqft | Build Types |
|---|---|---|---|---|---|---|---|---|---|
| Hawthorne | `hawthorne` | 32 | 64 | 15 | 2,048 | 3 | 2 | 1,620 | xmod, mod |
| Aspen | `aspen` | 32 | 64 | 15 | 2,048 | 4 | 2 | 1,620 | xmod, mod |
| Belmont | `belmont` | 32 | 64 | 15 | 2,048 | 3 | 2 | 1,620 | xmod, mod |
| Keeneland | `keeneland` | 32 | 58 | 15 | 1,856 | 3 | 2 | 1,800 | xmod |
| Laurel | `laurel` | 24 | 48 | 15 | 1,152 | 3 | 2 | 1,065 | mod |
| Cypress | `cypress` | 16 | 66 | 15 | 1,056 | 2 | 2 | 990 | xmod |

> **⚠️ ACTION REQUIRED:** Bennett must confirm exact width and height dimensions for each model. Width values above are inferred from descriptions and module configurations. The model fit calculator depends on precise footprints.

---

## 3. ENGINE SPECIFICATIONS

### 3.1 — Model Fit Calculator

**Location:** `src/lib/engines/modelFit.ts`

```typescript
interface ModelFitInput {
  lot: {
    frontage_ft: number;
    depth_ft: number;
    area_sqft: number;
  };
  zoning: {
    front_setback_ft: number;
    side_setback_ft: number;
    rear_setback_ft: number;
    max_lot_coverage_pct: number;
    max_height_ft: number;
  };
  model: {
    width_ft: number;
    depth_ft: number;
    height_ft: number;
    footprint_sqft: number;
  };
}

interface ModelFitResult {
  fit_status: 'fits' | 'tight_fit' | 'no_fit';
  fit_reason: string | null;
  width_margin_ft: number;
  depth_margin_ft: number;
  coverage_pct: number;
  buildable_envelope: {
    width_ft: number;
    depth_ft: number;
  };
}
```

**Logic:**
1. `buildable_width = frontage - (side_setback × 2)`
2. `buildable_depth = depth - front_setback - rear_setback`
3. Width check: `model.width + 2 (clearance buffer) <= buildable_width`
4. Depth check: `model.depth <= buildable_depth`
5. Coverage check: `model.footprint / lot.area_sqft <= max_lot_coverage_pct`
6. Height check: `model.height <= max_height_ft`
7. Tight fit: passes all checks but any margin < 4 ft
8. No fit: fails any check (reason captured)

**Execution:** Batch pre-calculated at MLS sync time. Results stored in `model_fits` table. On-demand recalculation only when zoning data changes.

### 3.2 — Land Division Calculator

**Location:** `src/lib/engines/landDivision.ts`

```typescript
interface LandDivisionResult {
  max_possible_lots: number;
  feasible_lots: number;
  resulting_lots: Array<{
    lot_number: number;
    width_ft: number;
    depth_ft: number;
    area_sqft: number;
    fitting_models: string[];
  }>;
  development_economics: {
    total_acquisition_cost: number;
    total_build_cost: number;
    total_site_work: number;
    total_development_cost: number;
    estimated_total_value: number;
    estimated_margin: number;
    estimated_roi_pct: number;
  };
}
```

**Logic:**
1. `max_lots = floor(total_frontage / min_lot_width)`
2. If `max_lots > 1`: deduct 20ft for access easement from interior lots
3. Verify each resulting lot meets minimum area
4. Run model fit on each resulting lot
5. Calculate development economics using existing pricing engine

### 3.3 — Pricing Engine (HomeMatch Extension)

Extends the existing `calculatePriceBreakdown.ts` with MLS lot data:

```typescript
interface HomeMatchPricing {
  lot_price: number;           // From MLS listing
  home_price: number;          // From existing pricing config (factory_quote_total)
  site_work_estimate: {
    low: number;               // Standard flat lot
    mid: number;               // Moderate site prep
    high: number;              // Complex site
  };
  total_delivered: {
    low: number;
    mid: number;
    high: number;
  };
  basemod_fee_stack: number;   // dealer + CM + mortgage estimate
  estimated_monthly_payment: number; // 30yr fixed, 20% down
}
```

**Site Work Tiers:**
| Tier | Description | Estimate |
|---|---|---|
| Standard | Flat lot, utilities at street | $35,000–$42,000 |
| Moderate | Some grading, utilities within 100ft | $42,000–$55,000 |
| Complex | Significant grading, long utility runs | $55,000–$75,000 |

### 3.4 — Deal Scoring Engine (Tab 3)

**Location:** `src/lib/engines/dealScoring.ts`

Four dimensions, each scored 0–25, totaling 0–100:

#### Seller Motivation (0–25)
| Factor | Points |
|---|---|
| Days since expiration/withdrawal: 30–90 | +5 |
| Days since expiration/withdrawal: 90–180 | +10 |
| Days since expiration/withdrawal: 180+ | +15 |
| Price reductions during listing | +5 per reduction (max +10) |
| Listed multiple times | +5 |
| Below-market asking price | +5 |

#### Lot Viability (0–25)
| Factor | Points |
|---|---|
| Models that fit: 3+ | +10 |
| Models that fit: 1–2 | +5 |
| Zoning confidence: verified | +10 |
| Zoning confidence: ai_parsed | +5 |
| Utilities at street | +5 |
| Flat topography | +5 |
| Land division possible | +5 |

#### Margin Potential (0–25)
| Factor | Points |
|---|---|
| Estimated margin > 25% | +15 |
| Estimated margin 15–25% | +10 |
| Estimated margin 5–15% | +5 |
| Comp support: strong | +10 |
| Comp support: moderate | +5 |

#### Market Strength (0–25)
| Factor | Points |
|---|---|
| Municipality intel score > 70 | +10 |
| Municipality intel score 40–70 | +5 |
| New construction activity: high | +10 |
| Price trend: rising | +5 |
| Absorption rate > 80% | +5 |
| Subsection 6 adopted | +5 |

**Recommended Action Thresholds:**
- 80–100: `acquire_direct` — Strong buy signal
- 60–79: `contact_seller` — Worth pursuing
- 40–59: `monitor` — Track for changes
- 0–39: `pass` — Not viable currently

### 3.5 — Data Sync Pipeline

```
┌────────────┐    Daily 2am     ┌──────────────┐
│ Spark API  │ ────────────────→│ mls_listings │
│ (FlexMLS)  │   Supabase fn   │   (active)   │
└────────────┘                  └──────┬───────┘
                                       │
┌────────────┐    On sync       ┌──────┴───────┐
│ Regrid API │ ────────────────→│ Enrichment   │
│            │   Parcel data    │ (dimensions) │
└────────────┘                  └──────┬───────┘
                                       │
                                ┌──────┴───────┐
                                │ Batch Calc   │
                                │ model_fits   │
                                │ land_divs    │
                                │ acq_scores   │
                                └──────────────┘
```

**Sync cadence:**
- Active listings: Daily (2am ET) via Supabase Edge Function
- Expired/withdrawn (Tab 3): Weekly full refresh, daily incremental
- Model fits: Recalculated on every listing sync
- Acquisition scores: Recalculated weekly or on zoning data change

---

## 4. API ROUTES

### 4.1 — Supabase Edge Functions (New)

| Function | Method | Auth | Description |
|---|---|---|---|
| `sync-mls-listings` | POST | Admin | Pull latest from Spark API, upsert into mls_listings |
| `enrich-parcel-data` | POST | Admin | Fetch Regrid data for listings missing dimensions |
| `calculate-model-fits` | POST | Admin | Batch run model fit for all listings with zoning data |
| `calculate-acquisition-scores` | POST | Admin | Score expired/withdrawn listings |

### 4.2 — Client-Side Data Access (Supabase RLS)

| Query | Auth | Tab | Description |
|---|---|---|---|
| `mls_listings` WHERE status='active' | Public | 1, 2 | Active lots with model fits |
| `mls_listings` WHERE status IN ('expired','withdrawn') | Admin | 3 | Expired/withdrawn for acquisition |
| `model_fits` JOIN `mls_listings` | Public | 1, 2 | Lot + model combinations |
| `acquisition_scores` JOIN `mls_listings` | Admin | 3 | Scored acquisition opportunities |
| `municipalities` | Public | All | Municipality data |
| `zoning_districts` | Public | All | Zoning requirements |
| `homematch_inquiries` INSERT | Public | 1, 2 | Lead capture |
| `search_analytics` INSERT | Public | All | Anonymous search tracking |

### 4.3 — RLS Policies

```sql
-- Public can read active listings and their fits
CREATE POLICY "Public read active listings" ON mls_listings
  FOR SELECT USING (status = 'active');

-- Public can read model fits for active listings
CREATE POLICY "Public read model fits" ON model_fits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mls_listings
      WHERE mls_listings.id = model_fits.mls_listing_id
      AND mls_listings.status = 'active'
    )
  );

-- Admin can read all listings (including expired/withdrawn for Tab 3)
CREATE POLICY "Admin read all listings" ON mls_listings
  FOR SELECT USING (is_admin());

-- Admin can read acquisition scores
CREATE POLICY "Admin read acquisition scores" ON acquisition_scores
  FOR SELECT USING (is_admin());
CREATE POLICY "Admin update acquisition scores" ON acquisition_scores
  FOR UPDATE USING (is_admin());

-- Public can insert inquiries and search analytics
CREATE POLICY "Public insert inquiries" ON homematch_inquiries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert analytics" ON search_analytics
  FOR INSERT WITH CHECK (true);

-- Municipalities and zoning are public read
CREATE POLICY "Public read municipalities" ON municipalities
  FOR SELECT USING (true);
CREATE POLICY "Public read zoning" ON zoning_districts
  FOR SELECT USING (true);
```

---

## 5. COMPONENT ARCHITECTURE

### 5.1 — New Route Structure

```typescript
// Added to App.tsx Routes
// Tab 3 — Acquisition Intelligence (Admin only)
<Route path="/admin/acquisition" element={<AcquisitionDashboard />} />
<Route path="/admin/acquisition/:listingId" element={<AcquisitionDetail />} />

// Tab 1 — HomeMatch Public Search (future Session 3)
<Route path="/homes" element={<HomeMatchSearch />} />
<Route path="/homes/:listingId" element={<HomeMatchListing />} />

// Tab 2 — Buyer Browse (future Session 5)
<Route path="/browse" element={<BuyerBrowse />} />
```

### 5.2 — Tab 3 Component Tree (Session 1 Build)

```
AcquisitionDashboard (page)
├── AdminShell (existing — header + sidebar)
├── AcquisitionFilters
│   ├── ScoreRangeSlider
│   ├── MunicipalitySelect
│   ├── StatusFilter (unreviewed/reviewing/approved/passed)
│   ├── ActionFilter (acquire/contact/monitor/pass)
│   └── SortSelect (score/price/days_expired/margin)
├── AcquisitionStats (summary cards)
│   ├── StatCard — Total Opportunities
│   ├── StatCard — Avg Score
│   ├── StatCard — Top Municipality
│   └── StatCard — Est. Pipeline Value
├── AcquisitionTable
│   ├── Row per scored listing
│   │   ├── ScoreBadge (color-coded 0-100)
│   │   ├── Address + Municipality
│   │   ├── Price + Days Expired
│   │   ├── Models Fit Count + Badge
│   │   ├── Margin Estimate
│   │   ├── Recommended Action Badge
│   │   └── Review Status
│   └── Pagination
└── AcquisitionDetailDrawer (slide-out panel)
    ├── LotOverview
    │   ├── Address + Map
    │   ├── Parcel dimensions
    │   └── MLS history (list/expire dates, price changes)
    ├── ScoreBreakdown
    │   ├── RadarChart (4 dimensions)
    │   └── Factor detail cards
    ├── ZoningVerification
    │   ├── DimensionalRequirementsTable
    │   └── ConfidenceBadge
    ├── ModelFitCards
    │   ├── FittingModelCard (per model that fits)
    │   │   ├── Model image + specs
    │   │   ├── Fit margins
    │   │   └── Total delivered price
    │   └── NonFittingModelCard (grayed, with reason)
    ├── LandDivisionPanel (if applicable)
    │   ├── Division diagram
    │   └── Development economics table
    ├── MarketComps (placeholder for Session 2)
    └── ActionBar
        ├── "Mark as Reviewing" / "Approve" / "Pass"
        ├── "Set Offer Price"
        ├── "Add Notes"
        └── "Export PDF"
```

### 5.3 — Shared Components (Used Across All Tabs)

```
src/components/homematch/
├── shared/
│   ├── ModelFitCard.tsx          — Model photo + specs + fit status
│   ├── ModelFitBadge.tsx         — Green/Yellow/Red fit indicator
│   ├── ZoningTable.tsx           — Dimensional requirements table
│   ├── ConfidenceBadge.tsx       — 🟢🟡🔴⬜ confidence indicator
│   ├── PriceBreakdownCard.tsx    — Lot + Home + Site Work = Total
│   ├── TotalDeliveredPrice.tsx   — Large formatted price display
│   ├── LotMapPreview.tsx         — Small map with lot pin
│   ├── LandDivisionSummary.tsx   — Division potential badge + count
│   └── ListingStatusBadge.tsx    — Active/Expired/Withdrawn badge
├── tab3/
│   ├── AcquisitionDashboard.tsx  — Main page
│   ├── AcquisitionFilters.tsx    — Filter bar
│   ├── AcquisitionStats.tsx      — Summary stat cards
│   ├── AcquisitionTable.tsx      — Scored lot table
│   ├── AcquisitionDetailDrawer.tsx — Slide-out detail panel
│   ├── ScoreBadge.tsx            — Color-coded score circle
│   ├── ScoreBreakdown.tsx        — 4-dimension radar + factors
│   └── ActionBar.tsx             — Review actions
├── tab1/ (Session 3)
│   └── ...
└── tab2/ (Session 5)
    └── ...
```

### 5.4 — Design System Extension

Uses existing shadcn-ui + Tailwind. New tokens:

```typescript
// HomeMatch-specific colors (extend tailwind.config.ts)
const homematchColors = {
  fit: {
    green: '#22c55e',   // 3+ models fit
    yellow: '#eab308',  // 1-2 models fit
    red: '#ef4444',     // no models fit
    gray: '#9ca3af',    // zoning data pending
  },
  confidence: {
    verified: '#22c55e',   // 🟢
    ai_parsed: '#eab308',  // 🟡
    incomplete: '#ef4444',  // 🔴
    not_started: '#d1d5db', // ⬜
  },
  score: {
    high: '#22c55e',    // 80-100
    medium: '#3b82f6',  // 60-79
    low: '#eab308',     // 40-59
    pass: '#9ca3af',    // 0-39
  },
  action: {
    acquire: '#7c3aed',  // Purple — strong signal
    contact: '#3b82f6',  // Blue — worth pursuing
    monitor: '#eab308',  // Yellow — watch
    pass: '#9ca3af',     // Gray — skip
  },
};
```

---

## 6. DATA FLOW: TAB 3 (ACQUISITION INTELLIGENCE)

### 6.1 — How Data Gets In (Future — Session 2 connects live APIs)

```
1. Spark API sync pulls expired/withdrawn vacant land listings (last 3 years)
2. Regrid enrichment adds parcel dimensions to each listing
3. Municipality + zoning lookup assigns zoning district
4. Model fit calculator runs on each lot
5. Land division calculator checks lots with excess frontage
6. Deal scoring engine generates composite score
7. Results appear in Tab 3 dashboard
```

### 6.2 — How Data Gets In (Session 1 — Mock Data)

For the Tab 3 prototype, mock data simulates the full pipeline:
- 50 expired/withdrawn listings across 5 municipalities
- Realistic Michigan addresses, prices, dimensions
- Pre-computed model fits and acquisition scores
- Mix of score ranges to test all UI states

### 6.3 — User Flow

```
Bennett opens /admin/acquisition
  → Sees dashboard with 50 scored opportunities
  → Filters to Score > 70, Municipality = "Ypsilanti Twp"
  → Sees 8 high-score lots
  → Clicks top-scored lot
  → Detail drawer opens:
     - Score breakdown: 82/100
     - Seller motivation: 20/25 (expired 200 days, 2 price reductions)
     - Lot viability: 22/25 (4 models fit, verified zoning, utilities)
     - Margin potential: 20/25 (22% est. margin, strong comps)
     - Market strength: 20/25 (high activity, rising prices, S6 adopted)
  → Reviews zoning table, model fit cards, pricing
  → Clicks "Mark as Reviewing"
  → Enters offer price: $35,000
  → Adds note: "Contact seller agent next week"
  → Status changes from "unreviewed" to "reviewing"
```

---

## 7. PHASE 1 MUNICIPALITY LIST

Priority municipalities for initial zoning database build:

| # | Municipality | County | Reason | Priority |
|---|---|---|---|---|
| 1 | Ypsilanti Township | Washtenaw | Active project (12 acres R-4) | P1 |
| 2 | Grand Haven | Ottawa | Active project (Clark Farm) | P1 |
| 3 | Spring Lake Township | Ottawa | Adjacent to Grand Haven | P1 |
| 4 | Wyoming | Kent | High vacant land volume, growing market | P1 |
| 5 | Byron Township | Kent | Active BMH target | P1 |
| 6 | Georgetown Township | Ottawa | Active BMH target | P1 |
| 7 | Kentwood | Kent | Strong market, S6 potential | P1 |
| 8 | Walker | Kent | Growing market, available land | P1 |
| 9 | Plainfield Township | Kent | Growth corridor | P1 |
| 10 | Holland Township | Ottawa | Strong market | P1 |
| 11 | Zeeland Township | Ottawa | S6 adoption activity | P1 |
| 12 | Pittsfield Township | Washtenaw | Near Ypsilanti, growth area | P2 |
| 13 | Ypsilanti City | Washtenaw | Urban infill opportunities | P2 |
| 14 | Grand Rapids (select zones) | Kent | Major metro, selective coverage | P2 |
| 15 | Lansing Township | Ingham | Expansion market | P2 |
| 16 | Delhi Township | Ingham | Lansing area growth | P2 |
| 17 | Canton Township | Wayne | SE Michigan target | P2 |
| 18 | Brownstown Township | Wayne | SE Michigan affordable | P2 |
| 19 | Muskegon | Muskegon | Lakeshore market | P3 |
| 20 | Kalamazoo Township | Kalamazoo | SW Michigan target | P3 |

---

## 8. EXTERNAL API INTEGRATION PLAN

### 8.1 — Spark API / FlexMLS (Session 2)
- **Purpose:** Real-time vacant land listings + comp data
- **Auth:** RETS/Spark OAuth (BaseModHomes broker credentials)
- **Data pulled:** All vacant land listings in target municipalities, plus sold comps
- **Sync:** Supabase Edge Function on cron (daily 2am)
- **Storage:** Raw data in `mls_listings.raw_data` JSONB, parsed fields in columns

### 8.2 — Regrid API (Session 2)
- **Purpose:** Parcel boundaries, dimensions, ownership
- **Auth:** API key
- **Data pulled:** Frontage, depth, area, boundaries, parcel ID
- **Triggered:** After MLS sync, for listings missing parcel data
- **Storage:** Dimensions in `mls_listings` columns, boundary in `parcel_boundary` JSONB

### 8.3 — Google Maps (Session 3)
- **Purpose:** Map rendering, geocoding, neighborhood data
- **Auth:** Maps JavaScript API key
- **Usage:** Tab 1 map view, lot detail maps, geocoding for address search
- **Component:** Leaflet or Google Maps React wrapper

---

## 9. SESSION 2 HANDOFF — WHAT TO BUILD NEXT

**Session 2 Goal:** Connect Tab 3 to live data sources.

1. **Spark API Edge Function** — Build `sync-mls-listings` that pulls expired/withdrawn vacant land from Spark API, upserts into `mls_listings`
2. **Regrid Enrichment** — Build `enrich-parcel-data` that fetches parcel dimensions for listings
3. **Model Fit Calculator** — Implement `src/lib/engines/modelFit.ts` as pure TypeScript logic
4. **Land Division Calculator** — Implement `src/lib/engines/landDivision.ts`
5. **Deal Scoring Engine** — Implement `src/lib/engines/dealScoring.ts`
6. **Batch Pipeline** — Wire calculators into Edge Function that runs after sync
7. **Replace Mock Data** — Point Tab 3 components at live Supabase queries

---

## 10. FUTURE SESSION ROADMAP

| Session | Focus | Key Deliverables |
|---|---|---|
| **Session 2** | Tab 3 Live Data | Spark API sync, Regrid enrichment, live model fit, deal scoring |
| **Session 3** | Tab 1 — HomeMatch Search | Public search page, map view, listing pages, filters |
| **Session 4** | Tab 1 — Polish & SEO | Shareable listing URLs, lead capture, SEO indexable pages |
| **Session 5** | Tab 2 — Buyer Browse | Curated featured homes grid, analytics dashboard |

---

*This architecture document is the canonical technical reference. Update as decisions are made and code is written.*
