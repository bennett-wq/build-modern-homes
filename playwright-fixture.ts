// Standard Playwright fixture entrypoint.
//
// Re-exports the base `test`/`expect` from @playwright/test so specs can import
// from a single project-local module and we can extend fixtures here later if
// needed. Replaces the previously-undeclared `lovable-agent-playwright-config`
// fixture import.
export { test, expect } from "@playwright/test";
