
# Temporarily Hide Communities from Public Site

## Summary
Remove all public-facing links to Communities/Developments while keeping all code and data intact. Uses a single feature flag constant for easy restoration.

## Changes

### 1. Add feature flag — `src/config/featureFlags.ts` (new file)
```ts
export const SHOW_COMMUNITIES = false;
```
This single toggle will control visibility. To restore later, just set it to `true`.

### 2. Header — `src/components/layout/Header.tsx`
- Remove the `{ label: "Communities", href: "/communities" }` entry from `navItems`

### 3. Footer — `src/components/layout/Footer.tsx`
- Remove `{ label: "Communities", href: "/communities" }` from `footerLinks.homes`

### 4. Homepage — `src/pages/Index.tsx`
- Remove the "Build in a Community" card from the `pathCards` array (the one linking to `/developments`)

### 5. Models page — `src/pages/Models.tsx`
- Remove the "Browse Communities" button/link

### 6. App.tsx — Guard community routes
- Wrap the community-related routes (`/communities`, `/developments`, `/developments/:slug`, `/developments/:slug/site-plan`, `/developments/:slug/build`) with the feature flag — when `SHOW_COMMUNITIES` is `false`, redirect them to `/` (or show NotFound)
- This prevents direct URL access while keeping all route code in place

### 7. Configurator intent — `src/components/configurator/steps/StepIntent.tsx`
- Conditionally hide the "Build in a BaseMod Community" option when `SHOW_COMMUNITIES` is `false`

### 8. QuoteSummary — `src/pages/QuoteSummary.tsx`
- Change "Browse Developments" fallback links to point to `/models` instead of `/developments`

### What stays untouched
- All community/development pages, components, data files, and lot data remain in the codebase
- No files deleted
- Restoring is a one-line change: `SHOW_COMMUNITIES = true`

### Files modified (8)
| File | Change |
|------|--------|
| `src/config/featureFlags.ts` | New — single flag |
| `src/components/layout/Header.tsx` | Remove nav link |
| `src/components/layout/Footer.tsx` | Remove footer link |
| `src/pages/Index.tsx` | Remove path card |
| `src/pages/Models.tsx` | Remove CTA button |
| `src/App.tsx` | Guard routes with flag |
| `src/components/configurator/steps/StepIntent.tsx` | Hide community intent |
| `src/pages/QuoteSummary.tsx` | Redirect fallback links |
