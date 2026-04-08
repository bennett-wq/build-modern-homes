

# Rename GrandHavenSitePlan → SitePlanFullScreen

## Changes

### 1. Create `src/pages/SitePlanFullScreen.tsx`
- Copy contents of `src/pages/GrandHavenSitePlan.tsx`
- Rename the exported function from `GrandHavenSitePlan` to `SitePlanFullScreen`

### 2. Update `src/App.tsx`
- Change import: `import SitePlanFullScreen from "./pages/SitePlanFullScreen"`
- Change route element: `<Route path="/developments/:slug/site-plan" element={<SitePlanFullScreen />} />`
- Remove the old `GrandHavenSitePlan` import

### 3. Delete `src/pages/GrandHavenSitePlan.tsx`

No other files reference this component. No URL/route changes needed.

