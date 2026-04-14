

## Unhide Communities Section

### Summary
Change the feature flag to restore all Communities links, routes, and UI elements.

### Change

**File: `src/config/featureFlags.ts`**
- Change `SHOW_COMMUNITIES = false` to `SHOW_COMMUNITIES = true`

This single change will restore:
- "Communities" links in header and footer navigation
- "Build in a Community" card on homepage
- "Browse Communities" button on Models page  
- All `/communities` and `/developments/*` routes (no more redirects)
- "Build in a BaseMod Community" option in configurator

### After making this change
You'll need to **Publish** the site to push the change live to basemodhomes.com.

