import { test, expect } from '@playwright/test';

// The /build route renders the Configurator (8-step) flow. `?model=aspen`
// hydrates the model and jumps straight to Step 4 (Build Type) — where the
// shared WizardStickyFooter (portaled, `fixed bottom-0`) must stay visible on
// mobile. These tests guard that footer against regressions. Aspen exposes two
// build types, so Step 4 renders the "How should we build your Aspen?" heading
// and CrossMod®/Modular selection cards.
test.describe('Wizard Mobile Footer Regression', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 Pro

  test('Step 4 sticky footer Continue button is visible on mobile', async ({ page }) => {
    await page.goto('/build?model=aspen');

    // Lands directly on Step 4 (Build Type) for the preselected model.
    await expect(
      page.getByRole('heading', { name: /how should we build your aspen/i }),
    ).toBeVisible();

    // Selecting a build type enables the sticky-footer Continue button.
    await page.getByRole('heading', { name: 'CrossMod®' }).click();

    const continueButton = page.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeVisible();

    // The button must sit within the viewport (sticky footer, not pushed off).
    const box = await continueButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(844);
    expect(box!.y + box!.height).toBeGreaterThan(0);
    // Bottom edge must stay within the 844px mobile viewport (not pushed off).
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  });

  test('Step 4 sticky footer stays visible even when Continue is disabled', async ({ page }) => {
    await page.goto('/build?model=aspen');

    // On arrival no build type is selected, so Continue is disabled — but the
    // footer must still be present and visible (the original regression).
    await expect(
      page.getByRole('heading', { name: /how should we build your aspen/i }),
    ).toBeVisible();

    const continueButton = page.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeVisible();

    // Anchored near the bottom of the viewport.
    const box = await continueButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThan(844 - 200);
  });
});
