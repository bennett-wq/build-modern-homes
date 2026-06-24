import { test, expect, type Page } from '@playwright/test';

// Integration coverage for the backend-first lead delivery. The submit-lead
// Edge Function is intercepted so no real backend/production write occurs; we
// assert the UI only claims success after a confirmed response, never on
// failure, preserves buyer state, and reuses the idempotency id on retry.

const DESKTOP = { width: 1280, height: 900 };
const OK_BODY = JSON.stringify({
  id: '33333333-3333-4333-8333-333333333333',
  persisted: true,
  duplicate: false,
});
const FAIL_BODY = JSON.stringify({ error: 'simulated backend failure' });

// Community review (wizard step 5) reached directly via URL selections.
const REVIEW_URL =
  '/preview/developments/grand-haven/build?lot=Lot%2015&model=aspen&buildType=xmod&package=test-pkg&garage=test-garage';

async function fillCommunityQuote(page: Page) {
  await page.goto(REVIEW_URL);
  await page.getByRole('button', { name: 'Get Quote' }).click({ timeout: 25000 });
  await page.locator('#contact-name').fill('Test Buyer');
  await page.locator('#contact-email').fill('buyer@example.com');
  await page.locator('#contact-phone').fill('5551234567');
}

test.describe('Lead delivery — community quote form', () => {
  test.use({ viewport: DESKTOP });

  test('success → confirmation only after backend confirms', async ({ page }) => {
    await page.route('**/functions/v1/submit-lead', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: OK_BODY }),
    );
    await fillCommunityQuote(page);
    await page.getByRole('button', { name: /request quote/i }).click();
    await expect(page.getByText(/request received/i)).toBeVisible({ timeout: 10000 });
  });

  test('backend failure → no false success, state preserved, retry reuses the id', async ({ page }) => {
    const ids: string[] = [];
    await page.route('**/functions/v1/submit-lead', async (route) => {
      const body = route.request().postDataJSON();
      ids.push(body.requestId);
      await route.fulfill({ status: 500, contentType: 'application/json', body: FAIL_BODY });
    });
    await fillCommunityQuote(page);
    await page.getByRole('button', { name: /request quote/i }).click();

    await expect(page.getByText(/couldn.t send your request/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/request received/i)).toHaveCount(0);
    await expect(page.locator('#contact-name')).toHaveValue('Test Buyer'); // preserved

    // Retry the same submission → same idempotency UUID (no duplicate lead).
    await page.getByRole('button', { name: /request quote/i }).click();
    await expect.poll(() => ids.length).toBeGreaterThanOrEqual(2);
    expect(ids[0]).toBe(ids[1]);
  });
});

test.describe('Lead delivery — /contact', () => {
  test.use({ viewport: DESKTOP });

  test('success → thank-you only after backend confirms', async ({ page }) => {
    await page.route('**/functions/v1/submit-lead', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: OK_BODY }),
    );
    await page.goto('/contact');
    await page.locator('#name').fill('Test Buyer');
    await page.locator('#email').fill('buyer@example.com');
    await page.locator('#phone').fill('5551234567');
    await page.locator('#message').fill('Interested in a build.');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByRole('heading', { name: /thank you/i })).toBeVisible({ timeout: 10000 });
  });

  test('backend failure → no thank-you, message preserved', async ({ page }) => {
    await page.route('**/functions/v1/submit-lead', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: FAIL_BODY }),
    );
    await page.goto('/contact');
    await page.locator('#name').fill('Test Buyer');
    await page.locator('#email').fill('buyer@example.com');
    await page.locator('#message').fill('Interested in a build.');
    await page.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByText(/couldn.t send your message/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /thank you/i })).toHaveCount(0);
    await expect(page.locator('#message')).toHaveValue('Interested in a build.');
  });
});

test.describe('Lead delivery — newsletter + admin', () => {
  test.use({ viewport: DESKTOP });

  test('newsletter no longer claims a subscription', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Enter your email').fill('subscriber@example.com');
    await page.getByRole('button', { name: 'Subscribe' }).click();
    await expect(page.getByText(/thanks for subscribing/i)).toHaveCount(0);
    await expect(page.getByText(/reach us through our contact page/i)).toBeVisible();
  });

  test('admin buyer-leads view is protected', async ({ page }) => {
    await page.goto('/admin/quote-leads');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
  });
});
