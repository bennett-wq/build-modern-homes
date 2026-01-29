
## Goal
Make the “Connect bank” (Plaid Link) flow reliable and usable in the Lovable editor preview (where your app runs inside an iframe), while also improving the production-grade architecture so it feels like a top-tier fintech experience.

## What we know (from the investigation + your answers)
- The failure happens in **Editor preview** on **Desktop Chrome/Edge**.
- The symptom is: **Plaid closes (“shuts down”)** when interacting with inputs (e.g., phone number).
- We have already tried the common “drawer focus trap / overlay” mitigations (disable modal, hide overlay, close guards, memoization). Those got us different failure modes (freeze/close), but it’s still unstable.
- This strongly points to a **host environment constraint**: Plaid Link is far less reliable when the host app itself is running inside a parent iframe (Lovable editor preview), especially when additional portals/overlays are involved.

## Working hypothesis (root cause)
Even with our Radix/Drawer mitigations, the editor preview iframe environment can still cause Plaid Link to exit unexpectedly due to:
- Nested iframe + portal layers + focus/blur events being interpreted as “dismiss/exit”
- Cross-frame event handling differences in embedded contexts
- Potential restrictions/quirks of an “app inside an iframe” environment that Plaid doesn’t consistently tolerate (especially on sensitive input steps like phone verification)

In other words: continuing to fight the modal-in-drawer approach inside an embedded iframe is high-risk and has already proven brittle.

## Strategy: Make Plaid run in a clean, top-level context (always reliable)
Instead of opening Plaid Link inside the drawer in the embedded preview, we will launch the bank connection in a **dedicated top-level page** (full-screen) and communicate the result back to the wizard.

This is a standard enterprise approach used by large fintech platforms: isolate the bank-link flow into a controlled surface with minimal UI interference.

---

## Implementation plan (phased, with clear acceptance criteria)

### Phase 1 — Add a dedicated “Secure Bank Connection” page (clean environment)
**What we will build**
- A new route/page (example: `/secure-bank-connect`) that:
  - Renders a minimal layout (no drawers, no Radix Sheet/Drawer, no Framer Motion wrappers).
  - Initializes Plaid Link with a freshly generated link token.
  - Optionally auto-opens Plaid when ready (with a clear “Continue” button fallback).
  - On success:
    - Sends `{ public_token, institution_name }` back to the opener via `window.opener.postMessage(...)` (if opened as a popup/new tab).
    - Shows a “Success — return to application” UX and closes itself if possible.
  - On exit/error:
    - Shows a clear retry UI and records diagnostics.

**Why this works**
- It avoids the drawer/overlay and embedded iframe interaction that’s currently causing Plaid to exit.

**Files involved**
- `src/App.tsx` (add route)
- New page: `src/pages/SecureBankConnect.tsx` (or similar)

**Acceptance criteria**
- From the editor preview, the bank connection page can open and Plaid no longer exits when typing phone number / interacting.

---

### Phase 2 — Change the Pre-Qualification flow to open Plaid in a top-level window when embedded
**What we will change**
- Detect when the app is running embedded:
  - `const isEmbedded = window.self !== window.top;`
- In `PreQualificationFlow` Step 2:
  - Replace the current inline Plaid modal launch with:
    - “Open secure bank connection” button
    - On click:
      1. Create a link token (either via existing backend function or by reusing existing client invoke)
      2. `window.open('/secure-bank-connect?...', 'plaid_connect', 'width=420,height=720')`
      3. Listen for a `message` event from the new window
      4. When message arrives, set:
         - `plaidPublicToken`
         - `plaidInstitutionName`
         - keep the drawer on Step 2 and show “Connected”
- Add robust handshake safety:
  - Generate a `connectSessionId` (UUID)
  - Pass it to the new window in the querystring
  - Require that same `connectSessionId` in the returning `postMessage`
  - Validate `event.origin === window.location.origin`

**Why this works**
- In editor preview: Plaid runs top-level, not nested under the preview iframe.
- In published site: we can choose to keep the same approach for maximum reliability, or only use it when embedded.

**Files involved**
- `src/components/financing/PreQualificationFlow.tsx`
- `src/components/financing/PlaidLinkButton.tsx` (may be refactored into a “token-driven” component for the new page)

**Acceptance criteria**
- In editor preview, clicking “Connect bank” opens a new window/tab that completes the bank connection without exiting.
- After completion, the main wizard shows “Connected to {Institution}” and allows submit.

---

### Phase 3 — Reduce complexity and remove the fragile overlay hacks (stabilize UX)
Once Phase 2 is working, we’ll simplify the existing drawer logic to reduce regressions:
- Remove/stop relying on:
  - `allowOutsideInteraction={isPlaidModalOpen}`
  - close debounces and dismissal guards intended for inline Plaid overlays
- Keep the pre-qualification drawer as a normal modal drawer again (predictable UI).
- This reduces the chance that other drawers/sheets across the app are impacted by Plaid-specific workarounds.

**Files involved**
- `src/components/financing/PreQualificationFlow.tsx`
- Potentially `src/components/ui/info-drawer.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/drawer.tsx` (only if cleanup is needed)

**Acceptance criteria**
- Drawer behaves normally (overlay/focus trap works) and bank connect still works (because it’s now externalized).

---

### Phase 4 — Fintech-grade polish + resilience (what “top of the line” looks like)
**User experience upgrades**
- Add a “Secure connection” explanation panel before launching:
  - “We’ll open a secure window to connect your bank. This keeps your session stable and protected.”
- Handle popup blockers:
  - If `window.open` returns `null`, show:
    - “Pop-up blocked. Click here to open in this tab instead.”
    - Fallback: navigate current tab to `/secure-bank-connect` and provide a “Back to application” return flow.
- Add a deterministic “Resume” state:
  - If user returns without success, keep them on Step 2 with a clear “Try again” CTA.
- Show richer error messages:
  - If Plaid exits with an error, display:
    - Friendly summary
    - “Try again” button (generates a fresh link token)
    - Optional “Contact support” CTA

**Operational excellence (PM-level instrumentation)**
- Add structured logging/telemetry (client-side) for:
  - link token creation start/success/fail
  - connect window opened / blocked
  - message received / invalid origin / invalid sessionId
  - Plaid onExit metadata (sanitized)
- Optionally persist minimal event rows to the backend for debugging (non-PII) so we can diagnose real-world failures.

**Acceptance criteria**
- Clear, guided flow with reliable retries and no “dead ends.”
- If anything fails, the user always has a visible, simple path to recover.

---

## How we’ll use your uploaded video (Screenflick_Movie.mp4)
During implementation we’ll use it to validate:
- The exact click sequence that triggers shutdown
- Whether the shutdown happens at a consistent input step
- Whether the drawer or Plaid window is losing focus/closing first
This will help confirm the fix actually addresses the observed behavior, not just the theory.

---

## Test plan (must pass before we call it “fixed”)
1. **Editor preview (embedded iframe)**
   - Open Pre-Qual → Step 2 → Connect bank
   - New secure window opens
   - Enter phone number and proceed (no shutdown)
   - Success returns to wizard and shows “Connected”
2. **Published site (normal top-level browser tab)**
   - Same flow, confirm consistent behavior
3. **Popup blocked scenario**
   - Verify fallback (open in same tab) works
4. **Retry scenario**
   - Exit Plaid, retry, ensure a fresh link token is used and it still works

---

## Deliverables summary
- A dedicated, clean `/secure-bank-connect` experience
- Pre-qualification wizard updated to use secure top-level bank connect when embedded (editor preview)
- Simplified drawer behavior (remove brittle Plaid-in-drawer hacks)
- Fintech-grade UX polish + failure recovery + optional telemetry

