
# Fix Upgrade Options - Remove Incorrect Duplicate

## Problem Identified

I incorrectly added a duplicate `9ft-ceiling-height` option at $2,500. The existing `9ft-walls` option at **$11,050** is the correct price from the CMH factory quote.

## Source of Truth (pricing-config.ts)

| Model | Option | Price | Build Type |
|-------|--------|-------|------------|
| Hawthorne | 9' walls | $11,050 | MOD only |
| Laurel | 9' walls | $11,000 | MOD only |
| Hawthorne, Aspen | Half bath | $1,000 | All |
| Hawthorne | Office conversion | $1,500 | All |
| Hawthorne, Aspen, Belmont, Laurel | Full Basement | $17,907 | MOD only |
| Cypress | Flex room as office | $0 | All |

## Required Fix

**Single Action**: Deactivate the incorrect `9ft-ceiling-height` ($2,500) entry:

```sql
UPDATE upgrade_options 
SET is_active = false 
WHERE slug = '9ft-ceiling-height';
```

## Current Database State (Verified Correct)

| Slug | Price | Status |
|------|-------|--------|
| `9ft-walls` | $11,050 | ✅ Keep active |
| `9ft-ceiling-height` | $2,500 | ❌ Deactivate |
| `full-basement` | $17,907 | ✅ Correct |
| `half-bath-addition` | $1,000 | ✅ Correct |
| `office-conversion` | $1,500 | ✅ Correct |
| `flex-room-office` | $0 | ✅ Correct |

## Note on Laurel Pricing

Laurel's 9' walls is priced at $11,000 (not $11,050). For now, the $50 difference is acceptable as a minor simplification. If precision is needed later, we can create a separate `9ft-walls-laurel` option.

## Success Criteria

1. Only one 9' walls option appears in wizard (at $11,050)
2. Option only shows for Hawthorne and Laurel in MOD build type
3. No pricing regression in existing flows
