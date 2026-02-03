

# Update Grand Haven Lot Polygons

## Overview
Add the polygon coordinate data you provided to enable the interactive site plan map for Grand Haven. The lot records already exist with metadata (acreage, premium, zoning, etc.) but have empty `polygon: []` arrays.

---

## What Will Change

**File:** `src/data/lots/grand-haven.ts`

Each lot will receive its polygon coordinates. For example:

**Before (Lot 1):**
```ts
polygon: [],
```

**After (Lot 1):**
```ts
polygon: [
  { x: 10.55, y: 72.03 },
  { x: 14.22, y: 72.03 },
  { x: 14.37, y: 87.15 },
  { x: 11.01, y: 87.15 },
  { x: 10.4, y: 72.03 },
],
```

---

## Summary of Polygon Data

| Lot | Polygon Points | Phase |
|-----|---------------|-------|
| 1 | 5 points | 2 |
| 2 | 5 points | 2 |
| 3 | 5 points | 2 |
| 4 | 5 points | 2 |
| 5 | 4 points | 2 |
| 6 | 4 points | 2 |
| 7 | 4 points | 2 |
| 8 | 4 points | 2 |
| 9 | 4 points | 3 |
| 10 | 4 points | 3 |
| 11 | 4 points | 3 |
| 12 | 9 points (large estate) | 3 |
| 13 | 6 points (large estate) | 3 |
| 14 | Empty (Future Waterfront - TBD) | 3 |
| 15 | 4 points | 1 |
| 16 | 4 points | 1 |
| 17 | 4 points | 1 |
| 18 | 10 points (large estate) | 1 |

---

## Result
After this update, the interactive site plan at `/developments/grand-haven` will render clickable lot polygons overlaid on the site plan image, enabling lot selection in the Community build wizard.

