
# Grand Haven Development Update Plan

## Overview
Update the Grand Haven development with real lot pricing data, updated metadata, and a new site plan image based on the provided spreadsheet and aerial site plan.

---

## Data Received

### Development Details
| Field | Value |
|-------|-------|
| Location | Cedar & 118th Street, Grand Haven, MI |
| Address | 11665 N Cedar Road, Grand Haven, MI |
| Status | Active (BaseMod Lots For Sale) |
| Description | Beautiful large lots and waterfront community on the Grand River in Grand Haven with BaseMod homes |
| HOA | No HOA restrictions on lots 1-13 |
| Utilities | Well & Septic (all lots) |

### Lot Inventory (18 lots)

| Lot | Acres | Premium | Phase | Availability | Zoning |
|-----|-------|---------|-------|--------------|--------|
| 1 | 3.06 | $75,000 | Phase 2 | Fall 2026 | R-1 |
| 2 | 2.03 | $50,750 | Phase 2 | Fall 2026 | R-1 |
| 3 | 1.97 | $49,250 | Phase 2 | Fall 2026 | R-1 |
| 4 | 1.92 | $48,000 | Phase 2 | Fall 2026 | R-1 |
| 5 | 2.03 | $50,750 | Phase 2 | Fall 2026 | R-1 |
| 6 | 1.98 | $49,500 | Phase 2 | Fall 2026 | R-1 |
| 7 | 1.93 | $48,250 | Phase 2 | Fall 2026 | R-1 |
| 8 | 1.96 | $49,000 | Phase 2 | Fall 2026 | R-1 |
| 9 | 2.46 | $61,500 | Phase 3 | Spring 2027 | R-1 |
| 10 | 2.40 | $60,000 | Phase 3 | Spring 2027 | R-1 |
| 11 | 2.34 | $58,500 | Phase 3 | Spring 2027 | R-1 |
| 12 | 32.09 | $802,250 | Phase 3 | Spring 2027 | R-1 |
| 13 | 18.16 | $454,000 | Phase 3 | Spring 2027 | R-1 |
| 14 | 67.93 | TBD | Phase 3 | Spring 2027 | I-2 (Future Waterfront) |
| 15 | 2.47 | $61,750 | Phase 1 | Now | R-1 |
| 16 | 2.46 | $61,500 | Phase 1 | Now | R-1 |
| 17 | 2.44 | $61,000 | Phase 1 | Now | R-1 |
| 18 | 15.40 | $385,000 | Phase 1 | Now | R-1 |

---

## Implementation Steps

### Step 1: Copy New Site Plan Image
Copy the uploaded site plan to the project assets folder.

- **Source**: `user-uploads://Hero-grandhaven-site-plan.jpg`
- **Destination**: `public/images/developments/grand-haven/hero-site-plan.jpg`

### Step 2: Update Development Metadata
Modify `src/data/developments.ts` to update the Grand Haven entry:

**Changes:**
- Update `sitePlanImagePath` to new hero image
- Update `description` with waterfront community messaging and address
- Add note about No HOA restrictions (lots 1-13)
- Update `locationHighlights` to emphasize Grand River waterfront

### Step 3: Update Lot Data
Completely rewrite `src/data/lots/grand-haven.ts` with:

- All 18 lots with correct acreage from spreadsheet
- Land premiums for each lot
- Phase assignment with availability notes (Now, Fall 2026, Spring 2027)
- Well/Septic indicator
- Special handling for Lot 14 (Future Waterfront, I-2 zoning, Price TBD)
- Zoning data preserved (R-1 for most, I-2 for Lot 14)

---

## Technical Details

### File Changes

```text
Files to Modify:
├── public/images/developments/grand-haven/
│   └── hero-site-plan.jpg (new - copy from upload)
├── src/data/developments.ts
│   └── Update Grand Haven entry
└── src/data/lots/grand-haven.ts
    └── Complete rewrite with pricing data
```

### Lot Interface (existing)
```typescript
export interface Lot {
  id: number;
  label: string;
  status: LotStatus;
  polygon: LotPolygonPoint[];
  acreage?: number;
  netAcreage?: number;
  zoning?: string;
  premium?: number;
  notes?: string;
}
```

### New Fields to Consider
- Add `requiresWellSeptic?: boolean` field if needed for UI display
- Use `notes` field for phase and availability information

### Development Entry Updates
```typescript
{
  slug: 'grand-haven',
  name: 'Grand Haven',
  city: 'Grand Haven',
  state: 'Michigan',
  sitePlanImagePath: '/images/developments/grand-haven/hero-site-plan.jpg',
  description: 'Beautiful large lots and waterfront community on the Grand River. Located at 11665 N Cedar Road, Grand Haven, MI. No HOA restrictions on lots 1-13.',
  status: 'active',
  locationHighlights: [
    { icon: 'Waves', title: 'Grand River Waterfront', description: 'Stunning riverfront community with waterfront and scenic view lots.' },
    { icon: 'TreePine', title: 'Large Acreage Lots', description: 'Spacious lots ranging from 2 to 32+ acres for ultimate privacy.' },
    // ... updated highlights
  ],
  features: [
    { icon: 'Sun', title: 'Well & Septic Ready', description: 'All lots are prepared for well and septic system installation.' },
    // ... updated features
  ],
}
```

---

## Validation Checklist
After implementation, verify:
- [ ] Site plan image displays on `/developments/grand-haven`
- [ ] All 18 lots appear in the lot picker
- [ ] Lot premiums display correctly ($48,000 - $802,250 range)
- [ ] Phase 1 lots (15-18) show "Available Now"
- [ ] Lot 14 shows "Future Waterfront - Price TBD"
- [ ] Acreage values match spreadsheet data
