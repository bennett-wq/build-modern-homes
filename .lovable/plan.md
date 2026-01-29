
## Immediate stabilization (site-wide scrolling + “everything feels broken” prevention)

### 0.1 Reproduce and pinpoint the scroll lock source (fast, deterministic)
- Add a temporary **Scroll Diagnostics** utility (dev-only) that can be toggled to print:
  - `document.documentElement/body` computed `overflow`, `position`, `height`
  - Radix/vaul attributes (e.g. `data-state`, `data-scroll-locked`, etc.)
  - whether any `Dialog/Sheet/Drawer` portals are still mounted while “closed”
- Use it to verify: is scroll locked because
  1) `html/body { overflow: hidden }` is stuck, or  
  2) pages are structurally “non-scrollable” due to `overflow-hidden` + fixed-height layouts (e.g. wizard pages).

### 0.2 Add a global “scroll lock failsafe”
Even if a library gets into a bad state, the app should recover.
- Implement a **RouteChangeScrollUnlock** component (mounted once near the router) that on every route change:
  - clears `document.body.style.overflow`, `position`, `top`, `width`
  - clears `document.documentElement.style.overflow`
  - removes known lock attributes/classes if present
- Add an additional “on modal close” cleanup hook for the key overlays (FinancingModal → PreQualificationFlow → InfoDrawer).

### 0.3 Fix structural non-scroll cases (especially wizard-style pages)
Audit pages that intentionally use `overflow-hidden` to create “app-like” steps (e.g. BuildWizard) and ensure they have:
- Exactly one scroll container that is actually scrollable (e.g. `main` or a step panel)
- Proper flexbox constraints (`min-h-0` on flex children) so nested `overflow-auto` works on mobile
- Sticky footer spacing (`WizardFooterSpacer`) applied consistently so content is not trapped behind the footer

**Acceptance criteria**
- You can scroll normally on marketing pages, models, developments.
- On wizard pages: the intended content region scrolls reliably; nothing feels “frozen”.

---

## Mobile “full site audit” plan (ruthless and structured)

### 1.1 Audit scope (the routes that must be perfect)
We will test each on iOS-sized and Android-sized viewports (and also tablet):
1) Home (`/`)
2) Models list + detail (`/models`, `/models/:modelId`)
3) Developments list + detail (`/developments`, `/developments/:slug`)
4) Community build wizard (`/developments/:slug/build`) — “lot picking experience”
5) Direct quote configurator (`/build`) — “Step 7 → 8” issue
6) Financing funnel entry points (wherever “Get Pre-Qualified” is visible)
7) Secure bank connection host (`/secure-bank-connect`)

### 1.2 Audit method (how we won’t miss things)
For each route we will validate:
- Scroll: page scroll + inner scroll areas (lists, drawers, panels)
- Touch: tap targets, accidental dismiss, drag conflicts, pinch/zoom conflicts on site plan
- Keyboard: inputs don’t hide CTAs; focus doesn’t trap the user
- Sticky UI: headers/footers don’t cover actionable controls
- Loading states: skeletons/spinners, clear “what’s happening” copy, no dead-ends
- Accessibility basics: focus visible, logical tab order, “role=listbox” interactions don’t break touch

**Deliverable**
- A short “Mobile audit report” list of issues + severity + fix priority, then we implement fixes in priority order.

---

## Fix 1: “Can’t proceed from Step 7 to 8” (Configurator /build)

### Likely causes we will confirm
1) **Proceed gating**: Step 7 uses `Step3Design` with `canProceed = selectedPackageId && selectedGarageDoorId`.  
   If certain models don’t support garage selection (or default isn’t set), mobile users can get stuck.
2) **Scroll / footer overlap**: On mobile the selection panel might not scroll due to missing `min-h-0`, so the user can’t reach the controls needed to satisfy `canProceed`.

### Planned fixes
- Make Step 7 “always completable”:
  - If a model requires garage selection, auto-select a default garage choice the moment a package is selected (or on step entry).
  - If a model does not require garage selection, update `canProceed` to only require package.
  - Add clear inline validation messaging (“Select a package to continue”, “Select a garage style to continue”) with auto-scroll to the missing section.
- Ensure nested scroll works:
  - Add `min-h-0` to the right containers in `Step3Design` so `TabsContent overflow-auto` is actually scrollable.
  - Ensure `WizardFooterSpacer` is present and effective on mobile to avoid content being hidden behind the sticky footer.

**Acceptance criteria**
- On mobile, Step 7 always allows the user to reach and use required controls and proceed to Step 8.

---

## Fix 2: Communities “lot picking” on mobile (Development build wizard)

### Likely causes we will confirm
- Gesture conflicts between:
  - Site plan viewer container using `touch-none`/`select-none` patterns
  - Custom bottom sheet using `touchAction: pan-y`
  - ScrollArea usage in lot list

### Planned fixes
- Normalize gesture behavior:
  - Ensure the site plan supports the intended mobile gestures (pan/zoom if desired) without blocking basic page interactions.
  - Ensure the mobile lot list sheet:
    - scrolls reliably (use a single scroll container, `min-h-0`, `overflow-auto`, and iOS momentum scrolling where appropriate)
    - doesn’t accidentally close when trying to scroll
- UX upgrades:
  - Make “Browse lots” and selection confirmation feel crisp:
    - Clear “Selected” state
    - Immediate “All-in” feedback
    - A single obvious path to continue
  - Reduce cognitive load with tighter filtering and “Available Now” default focus.

**Acceptance criteria**
- Lot selection on mobile is fast, obvious, and never fights scrolling/dragging.
- The user can always continue without UI getting in the way.

---

## Fix 3: Plaid reliability + “AHA” results experience

### 3.1 Stop the infinite “Analyzing…” and timeouts
We’ll address both frontend UX and backend execution time.

**Frontend**
- Implement a staged analysis UI (a real progress narrative):
  1) “Securing your connection”
  2) “Verifying income & assets”
  3) “Calculating affordability & DTI”
  4) “Matching best programs”
- Add a **hard UX timeout** (e.g. 25–35s):
  - If still pending: show “We’re still verifying — you’re not stuck.”
  - Offer a safe fallback:
    - “Continue — we’ll email results” (application remains submitted)
    - “Retry verification” (re-invoke)
    - “Switch to manual verification” (so the user can still finish)
- Ensure the secure connect window reports meaningful failure reasons back to the wizard (not just “cancelled”).

**Backend**
- Optimize the pre-qualification function for latency:
  - Add timeouts (AbortController) around Plaid API calls
  - Parallelize independent Plaid calls where possible
  - If Plaid is slow/unavailable, fall back to self-reported data quickly and mark `confidence_level` lower
- Consider splitting responsibilities if needed:
  - `plaid-exchange-token`: exchange token + store access token
  - `prequal-engine`: compute decision primarily from stored verified_financials (fast path)
  - This reduces “single call does everything” runtime risk.

### 3.2 Deliver the “massive AHA” moment (results screen)
Design the results as a fintech-grade dashboard:
- “Verified snapshot” card:
  - Verified income used
  - Assets + liabilities
  - Verification method + timestamp
- DTI visualization:
  - Front-end and back-end DTI with color-coded thresholds
- “Best match” program:
  - one top recommendation with why it fits
  - secondary eligible programs (if any)
- Clear next steps CTAs:
  - “Schedule a 10-minute call”
  - “Download your summary”
  - “Continue building your quote”
- Tone: confident, transparent, and fast.

**Acceptance criteria**
- Verification never feels like it’s “hanging”; users always have clarity and control.
- Results are instantly understandable and feel premium (the “AHA” moment).

---

## End-to-end test plan (what we will verify before calling it fixed)

### Desktop (Editor preview + normal tab)
- Site scroll works on `/`, `/models`, `/developments`, `/build`
- Financing drawer opens/closes without breaking scroll
- Secure bank connect opens, connects, returns reliably
- Prequal “Analyzing” never dead-ends; always resolves or offers a graceful fallback

### Mobile (multiple sizes)
- Configurator Step 7 → Step 8 is unblocked
- Community lot selection is smooth and scrollable
- Sticky footer does not hide primary actions
- Inputs and keyboard do not break navigation

### Automated sanity checks (optional but recommended)
- Add a small Playwright suite for:
  - scrollability assertions (page can scroll, not locked)
  - step progression (Configurator step transitions)
  - lot selection (tap lot → continue enabled)

---

## Execution order (to minimize regressions)
1) Restore/guarantee global scrolling (failsafe + structural fixes)
2) Fix Step 7 → 8 gating + mobile scroll containers
3) Fix community lot picking gestures/scroll
4) Plaid timeout reliability improvements (backend + UX)
5) “AHA” results polish + instrumentation

---

## Deliverables you’ll get
- Scroll restored across the site (no more “everything is frozen”)
- A written mobile audit + implemented fixes for the highest-impact issues
- Step 7 → 8 and community lot picking working flawlessly on mobile
- Plaid flow that feels fast, trustworthy, and culminates in a premium “AHA” decision experience
