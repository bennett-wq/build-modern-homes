import { test, expect } from '@playwright/test';

// Regression guards for the recovery work. These lock in the behaviors that
// were previously only verified by manual QA: lot-identity carry-through,
// future-phase gating, honest Grand Haven phase handling, the ready-now cockpit
// framing, and the post-quote (quote-linked) selections contract.

const DESKTOP = { width: 1280, height: 900 };

test.describe('Lot identity carry-through', () => {
  test.use({ viewport: DESKTOP });

  test('canonical lot_number deep link preselects the lot', async ({ page }) => {
    await page.goto('/preview/developments/grand-haven/build?lot=Lot%2015');
    // A buildable lot preselected → Step 1 footer offers "Compare Homes".
    await expect(page.getByRole('button', { name: /compare homes/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Lot 15').first()).toBeVisible();
  });

  test('legacy numeric deep link still resolves', async ({ page }) => {
    await page.goto('/preview/developments/grand-haven/build?lot=15');
    await expect(page.getByRole('button', { name: /compare homes/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Lot 15').first()).toBeVisible();
  });

  test('future-phase lot is selectable for detail but not for a build', async ({ page }) => {
    await page.goto('/preview/developments/grand-haven/build?lot=Lot%201');
    await expect(page.getByText(/future phase/i).first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('button', { name: /compare homes/i })).toHaveCount(0);
  });
});

test.describe('Grand Haven phase handling', () => {
  test.use({ viewport: DESKTOP });

  test('Phase 2 tab shows a concept panel, not selectable lots', async ({ page }) => {
    await page.goto('/preview/developments/grand-haven/site-plan');
    const phase2 = page.getByRole('tab', { name: /phase 2/i });
    await expect(phase2).toBeVisible();
    await phase2.click();
    await expect(page.getByRole('heading', { name: /planned lots/i })).toBeVisible();
    await expect(page.getByText(/future concept/i)).toBeVisible();
    // The bottom "About … Lots" build section must not render on a future phase.
    await expect(page.getByText(/About Grand Haven Lots/i)).toHaveCount(0);
  });
});

test.describe('Communities cockpit', () => {
  test.use({ viewport: DESKTOP });

  test('uses ready-now / total framing, never a bare "Available" count', async ({ page }) => {
    await page.goto('/preview/communities');
    await expect(page.getByRole('heading', { name: 'Communities', exact: true })).toBeVisible();
    // Wait for the async community metrics to render (no fixed timeout).
    await expect.poll(() => page.getByText('Total lots').count()).toBeGreaterThan(0);
    expect(await page.getByText('Total lots').count()).toBeGreaterThan(0);
    expect(await page.getByText('Ready now').count()).toBeGreaterThan(0);
    expect(await page.getByText('Available', { exact: true }).count()).toBe(0);
  });
});

test.describe('Selections (post-quote, quote-linked)', () => {
  test.use({ viewport: DESKTOP });

  test('bare /selections is a non-conversion empty state', async ({ page }) => {
    await page.goto('/selections');
    await expect(
      page.getByRole('heading', { name: /your selections live with your quote/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /start your build/i })).toBeVisible();
  });

  test('/selections/:quoteId loads a saved snapshot, and 404s gracefully', async ({ page }) => {
    // Seed a saved quote the way the funnel would after Request Final Quote.
    await page.addInitScript(() => {
      const quote = {
        id: 'QREGTEST1',
        type: 'community',
        createdAt: '2026-06-15T12:00:00.000Z',
        contact: { name: '', email: '', phone: '' },
        selection: {
          developmentName: 'Grand Haven',
          lotLabel: 'Lot 15',
          modelName: 'Aspen',
          buildType: 'xmod',
          packageName: 'Modern Charcoal',
          garageDoorName: 'Carriage Black',
        },
        pricingMode: 'community_all_in',
        status: 'pending',
      };
      localStorage.setItem('basemod-quote-requests', JSON.stringify([quote]));
    });
    await page.goto('/selections/QREGTEST1');
    await expect(page.getByRole('heading', { name: /the aspen/i })).toBeVisible();
    await expect(page.getByText('Grand Haven')).toBeVisible();
    await expect(page.getByText('Modern Charcoal')).toBeVisible();

    // Unknown id → graceful not-found, never a blank/fabricated quote.
    await page.goto('/selections/DOES-NOT-EXIST');
    await expect(page.getByRole('heading', { name: /selections not found/i })).toBeVisible();
  });
});
