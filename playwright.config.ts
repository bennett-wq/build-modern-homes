import { defineConfig, devices } from "@playwright/test";

/**
 * Standard, self-contained Playwright config for BaseModHomes e2e.
 *
 * Replaces the previously-undeclared `lovable-agent-playwright-config` package
 * (which broke `npx playwright test`) with an explicit config that has no extra
 * dependencies. Boots the Vite dev server on port 8080 (see vite.config.ts) and
 * exposes it via `baseURL` so specs can navigate with relative paths
 * (e.g. `page.goto('/build')`).
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 8080);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
