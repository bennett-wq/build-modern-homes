import { test, expect } from '../playwright-fixture';

test.describe('Wizard Mobile Footer Regression', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 Pro

  test('Step 4 sticky footer Continue button is visible on mobile', async ({ page }) => {
    // Navigate to the build wizard
    await page.goto('/build');

    // Step 1: Select intent
    await page.getByRole('button', { name: /build on my land/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 2: Enter zip code
    await page.getByPlaceholder(/zip/i).fill('90210');
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 3: Select a model (Aspen)
    await page.getByText('Aspen').first().click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 4: Build Type - this is the critical step
    // Wait for the step to load
    await expect(page.getByRole('heading', { name: /build type/i })).toBeVisible();

    // CRITICAL ASSERTION: The sticky footer with Continue button must be visible
    const continueButton = page.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeVisible();

    // Verify button is in the viewport (not just in DOM)
    const boundingBox = await continueButton.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.y).toBeLessThan(844); // Button should be within viewport height
    expect(boundingBox!.y + boundingBox!.height).toBeGreaterThan(0);
  });

  test('Step 4 sticky footer is always present even when disabled', async ({ page }) => {
    // Navigate directly to build with model pre-selected
    await page.goto('/build?model=aspen');

    // Complete steps 1-3 to reach step 4
    await page.getByRole('button', { name: /build on my land/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByPlaceholder(/zip/i).fill('90210');
    await page.getByRole('button', { name: /continue/i }).click();

    // Model should be pre-selected, click continue
    await page.getByRole('button', { name: /continue/i }).click();

    // On Step 4
    await expect(page.getByRole('heading', { name: /build type/i })).toBeVisible();

    // The footer container should exist and be visible
    const footer = page.locator('[class*="fixed"][class*="bottom-0"]').filter({
      has: page.getByRole('button', { name: /continue/i }),
    });

    // Footer should be visible (containing Continue button)
    const continueBtn = page.getByRole('button', { name: /continue/i });
    await expect(continueBtn).toBeVisible();

    // Verify it's at the bottom of the viewport
    const box = await continueBtn.boundingBox();
    expect(box).not.toBeNull();
    // Button should be in the bottom portion of the screen (last 150px)
    expect(box!.y).toBeGreaterThan(844 - 150);
  });
});
