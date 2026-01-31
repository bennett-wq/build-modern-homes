
# Hero Trust Line Update

## Overview
A single text change to update the trust line in the homepage hero section. The design polish requested is already fully implemented from the previous premium design overhaul.

---

## Change Required

### File: `src/pages/Index.tsx`

**Location:** Lines 111-114

**Current text:**
```
150+ families. 3 communities. And we're just getting started.
```

**New text:**
```
78-day builds. All-in pricing. The path to ownership—rebuilt.
```

---

## Implementation

Update line 113 in `src/pages/Index.tsx`:

```tsx
// FROM:
<p className="text-sm text-accent font-medium mb-8 max-w-md flex items-center">
  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
  150+ families. 3 communities. And we're just getting started.
</p>

// TO:
<p className="text-sm text-accent font-medium mb-8 max-w-md flex items-center">
  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
  78-day builds. All-in pricing. The path to ownership—rebuilt.
</p>
```

---

## Design Polish Status

All other design polish items are already implemented:

| Feature | Status |
|---------|--------|
| Button hover lift + shadow | Implemented |
| Card hover (translateY + scale) | Implemented |
| 200ms transitions | Implemented |
| Bold hero headline | Implemented |
| Large CTA buttons (size="xl") | Implemented |
| "Why This Matters" pull quote | Implemented |
| Warm cream backgrounds | Implemented |
| Step number badges | Implemented |
| Image zoom on homes | Implemented |
| Path card hover effects | Implemented |
| Manifesto entrance animation | Implemented |
| CTA glow effect | Implemented |
| Mission page alternating backgrounds | Implemented |
| Line-height 1.7 | Implemented |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Update trust line text (line 113) |

---

## What Will NOT Change
- Any other messaging or copy
- Layout structure
- Build flow logic
- Routing
- All design polish (already complete)
