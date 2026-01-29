

# Database Seeding Plan Update: Add Crawl Foundation Type

## Issue Identified

The current `foundation_type` enum in the database only has two values:
- `slab`
- `basement`

To use "Crawl (8x8x16 CMU blocks on tip of a spread / trench footing)" as the default foundation, we need to add `crawl` to the enum.

## Implementation Steps

### Step 1: Add 'crawl' to foundation_type enum

Execute a database migration to add the new enum value:

```sql
ALTER TYPE foundation_type ADD VALUE 'crawl';
```

### Step 2: Insert Model Pricing with 'crawl' foundation

After the enum is updated, insert the 9 pricing records with:
- `foundation_type = 'crawl'` (the default)
- `freight_allowance = 0` (removed per instructions)
- All CMH quote audit trail data

| Model | Build Type | Base Home Price | Quote # | Quote Date |
|-------|------------|-----------------|---------|------------|
| Hawthorne | XMOD | $97,087 | 52202 | 2025-12-15 |
| Hawthorne | MOD | $107,904 | 52407 | 2026-01-08 |
| Aspen | XMOD | $98,246 | 52418 | 2026-01-08 |
| Aspen | MOD | $108,493 | 52422 | 2026-01-08 |
| Belmont | XMOD | $97,182 | 52409 | 2026-01-08 |
| Belmont | MOD | $111,323 | 52410 | 2026-01-08 |
| Keeneland | XMOD | $106,227 | 52250 | 2025-12-20 |
| Laurel | MOD | $95,245 | 52533 | 2026-01-15 |
| Cypress | XMOD | $62,213 | - | - |

### Step 3: Insert Upgrade Options (including basement upgrade)

Insert all 14 upgrade options, including the basement upgrade at $17,907 in the `foundation` category.

## Expected Outcome

- All model pricing will default to `crawl` foundation
- Basement remains an upgrade option (+$17,907)
- Audit trail preserved with CMH quote numbers
- Application fetches from database instead of local fallback

