

# Update St. James Bay with Real Lot Data & Site Plan

## Summary

Replace the 80 placeholder St. James Bay lots with **30 real lots** from your January 2026 pricing data, update the development metadata with accurate Carrabelle address information, and add the new site plan image.

---

## Data Parsed from Your Upload

### Development Updates
| Field | Current Value | New Value |
|-------|---------------|-----------|
| City | St. James Bay | **Carrabelle** |
| Address | *(none)* | **151 Laughing Gull Ln, Carrabelle, FL 32322** |
| Description | *(generic)* | **Beautiful Golf Course & Scenic View Lots Available with all-in BaseMod Pricing** |
| Site Plan | `st-james-bay-site-plan.jpg` | **`hero-carrabelle-site-plan.png`** |

### 30 Real Lots Extracted

| Lot | Acreage | Premium | Phase | Availability | Status |
|-----|---------|---------|-------|--------------|--------|
| 1 | 0.23 | $30,000 | 2 | Fall 2026 | available |
| 2 | 0.33 | $30,000 | 2 | Fall 2026 | available |
| 3 | 0.12 | $30,000 | 2 | Fall 2026 | available |
| 4 | 0.22 | $30,000 | 2 | Fall 2026 | available |
| 5 | 0.20 | $30,000 | 2 | Fall 2026 | available |
| 6 | 0.30 | $30,000 | 2 | Fall 2026 | available |
| 7 | 0.20 | $30,000 | 2 | Fall 2026 | available |
| 8 | 0.25 | $30,000 | 2 | Fall 2026 | available |
| 9 | 0.20 | $30,000 | 3 | Spring 2027 | available |
| 10 | 0.18 | $30,000 | 3 | Spring 2027 | available |
| 11 | 0.30 | $30,000 | 3 | Spring 2027 | available |
| 12 | 0.23 | $30,000 | 3 | Spring 2027 | available |
| 13 | 0.20 | $30,000 | 3 | Spring 2027 | available |
| 14 | 0.30 | $30,000 | 3 | Spring 2027 | available |
| 15 | 0.25 | $30,000 | 1 | **Now** | available |
| 16 | 0.20 | $30,000 | 1 | **Now** | available |
| 17 | 0.30 | $30,000 | 1 | **Now** | available |
| 18 | 0.35 | $30,000 | 1 | **Now** | available |
| 19 | 0.20 | $30,000 | 4 | TBD | available |
| 20 | 0.18 | $30,000 | 4 | TBD | available |
| 21-30 | TBD | $30,000 | 4 | TBD | available |

**Key observations:**
- **30 lots** total (not 80 as previously estimated)
- All lots priced at **$30,000 premium**
- **4 lots available NOW** (Phase 1): Lots 15, 16, 17, 18
- Lots include lat/long coordinates and parcel straps for future mapping
- No well/septic required (all "No")

---

## Implementation Steps

### Step 1: Save New Site Plan Image
**Action:** Copy uploaded image to project assets

```text
Source: user-uploads://Hero-Carrabelle-Site-Plan.png
Target: public/images/developments/st-james-bay/hero-carrabelle-site-plan.png
```

The colorful site plan shows the golf course layout with:
- Royal Tern Court (top)
- Laughing Gull Ln (center - matches address)
- Plover Court, White Pelican Way, Spoonbill Court (surrounding streets)
- Orange lots = BaseMod available lots

---

### Step 2: Update St. James Bay Static Data

**File:** `src/data/lots/st-james-bay.ts`

Replace the placeholder generator with real lot data:

```typescript
// St. James Bay (Carrabelle, FL) - Real lot data as of Jan 2026
import { Lot, LotStatus } from './grand-haven';

export const stJamesBayLots: Lot[] = [
  {
    id: 1,
    label: 'Lot 1',
    status: 'available',
    polygon: [],
    acreage: 0.23,
    premium: 30000,
    notes: 'Phase 2 - Available Fall 2026',
  },
  // ... 29 more lots with real data
];
```

**Fields per lot:**
- `id` - Lot number (1-30)
- `label` - "Lot {n}" format
- `status` - 'available' for all currently
- `acreage` - From spreadsheet (null for TBD lots 21-30)
- `premium` - $30,000 for all lots
- `notes` - Phase and availability timeline

---

### Step 3: Update Development Metadata

**File:** `src/data/developments.ts`

Update the St. James Bay entry:

```typescript
{
  slug: 'st-james-bay',
  name: 'St. James Bay',
  city: 'Carrabelle',  // Changed from "St. James Bay"
  state: 'Florida',
  address: '151 Laughing Gull Ln, Carrabelle, FL 32322',  // NEW
  sitePlanImagePath: '/images/developments/st-james-bay/hero-carrabelle-site-plan.png',  // Updated
  description: 'Beautiful Golf Course & Scenic View Lots Available with all-in BaseMod Pricing',  // Updated
  // ... rest unchanged
}
```

---

### Step 4: Update Database Seeding SQL

The database migration will use the real lot data:

```sql
-- St. James Bay Lots (30 lots)
INSERT INTO lots (development_id, lot_number, acreage, premium, status, notes)
SELECT 
  d.id,
  '1',
  0.23,
  30000,
  'available',
  'Phase 2 - Available Fall 2026'
FROM developments d WHERE d.slug = 'st-james-bay';
-- ... repeat for all 30 lots
```

---

### Step 5: Add Coordinates for Future Mapping

The lot data includes GPS coordinates that we'll store for future interactive map features:

```typescript
// Extended lot interface (optional enhancement)
interface StJamesBayLot extends Lot {
  parcelStrap?: string;  // e.g., "03W07S051000000C039"
  latitude?: number;     // e.g., 29.904722
  longitude?: number;    // e.g., -84.559444
  phase?: number;        // 1-4
}
```

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `public/images/developments/st-james-bay/hero-carrabelle-site-plan.png` | **Create** | New site plan image |
| `src/data/lots/st-james-bay.ts` | **Replace** | 30 real lots instead of 80 placeholders |
| `src/data/developments.ts` | **Update** | City, address, description, image path |
| `src/types/database.ts` | **Update** | Add optional coordinate fields to Lot type |

---

## Database Schema Consideration

The `lots` table already has a `restrictions` JSONB column that can store extended data:

```sql
-- Store phase and coordinates in restrictions JSONB
restrictions: {
  "phase": 1,
  "parcel_strap": "03W07S051001000F007",
  "coordinates": {
    "lat": 29.9075,
    "lng": -84.557222
  }
}
```

---

## Verification After Implementation

1. **Static data test**: Navigate to `/developments/st-james-bay` - should show 30 lots
2. **Site plan display**: New colorful site plan image should render
3. **Build wizard test**: Start build at St. James Bay - lot picker should show 30 options
4. **Phase filtering**: Phase 1 lots (15-18) marked as "Available Now"

---

## Technical Details

### Lot Data Mapping

| Spreadsheet Column | Database Column | TypeScript Field |
|-------------------|-----------------|------------------|
| Project Lot # | `lot_number` | `label` |
| Size (Acres) | `acreage` | `acreage` |
| Price for Land | `premium` | `premium` |
| Phase | `restrictions->phase` | `notes` (text) |
| Available When? | `notes` | `notes` |
| Parcel_strap | `restrictions->parcel_strap` | *(future)* |
| Latitude | `restrictions->coordinates->lat` | *(future)* |
| Longitude | `restrictions->coordinates->lng` | *(future)* |

