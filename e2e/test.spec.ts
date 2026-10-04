import { expect, type Page, test } from '@playwright/test';

async function openStore(page: Page) {
  await page.goto('/store', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Curated print catalog' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Add$/ }).first()).toBeVisible({ timeout: 15000 });
}

async function addFirstCatalogItem(page: Page) {
  await openStore(page);
  await page.getByRole('button', { name: /^Add$/ }).first().click();
  await expect(page.getByRole('button', { name: /Cart\s+1/ })).toBeVisible();
}

test.describe('Thewworks deployment smoke tests', () => {
  test.describe('Store', () => {
    test.beforeEach(async ({ page }) => {
      await openStore(page);
    });

    test('loads the storefront and catalog', async ({ page }) => {
      await expect(page).toHaveTitle(/Thewworks/);
      await expect(page.getByRole('article', { name: /Premium Business Cards/i }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /Cart\s+0/ })).toBeVisible();
    });

    test('supports catalog search input', async ({ page }) => {
      const searchInput = page.getByPlaceholder('What are you looking for?');
      await searchInput.fill('Business');
      await page.locator('button[aria-label="Search"]').click();

      await expect(searchInput).toHaveValue('Business');
      await expect(page.getByText(/Premium Business Cards/i).first()).toBeVisible();
    });

    test('filters categories and toggles density', async ({ page }) => {
      await page.getByRole('button', { name: 'Business Essentials' }).click();
      await expect(page.getByText(/Premium Business Cards/i).first()).toBeVisible();

      await page.getByRole('button', { name: /Dense layout/i }).click();
      await expect(page.getByRole('button', { name: /Relaxed layout|Dense layout/i })).toBeVisible();
    });

    test('adds an item to the cart', async ({ page }) => {
      await page.getByRole('button', { name: /^Add$/ }).first().click();
      await expect(page.getByRole('button', { name: /Cart\s+1/ })).toBeVisible();
    });
  });

  test.describe('Cart and checkout', () => {
    test('shows the empty cart state', async ({ page }) => {
      await openStore(page);
      await page.getByRole('button', { name: /Cart\s+0/ }).click();

      await expect(page.getByRole('heading', { name: 'No print services shortlisted yet' })).toBeVisible();
    });

    test('opens checkout after a product is shortlisted', async ({ page }) => {
      await addFirstCatalogItem(page);
      await page.getByRole('button', { name: /Cart\s+1/ }).click();
      await page.getByRole('button', { name: 'Continue to checkout' }).click();

      await expect(page.getByRole('heading', { name: 'Complete your order' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Proceed to payment' })).toBeVisible();
    });

    test('validates checkout form fields', async ({ page }) => {
      await addFirstCatalogItem(page);
      await page.getByRole('button', { name: /Cart\s+1/ }).click();
      await page.getByRole('button', { name: 'Continue to checkout' }).click();
      await page.getByRole('button', { name: 'Proceed to payment' }).click();

      await expect(page.getByText('Name is required')).toBeVisible();
      await expect(page.getByText('Valid email is required')).toBeVisible();
    });
  });

  test.describe('Admin', () => {
    test('shows the protected Google OAuth entrance when unauthenticated', async ({ page }) => {
      await page.goto('/admin', { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
      await expect(page.getByText('Protected admin access')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('navigates from landing page to quote desk', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.getByRole('link', { name: /Quote desk/i }).click();

      await expect(page).toHaveURL(/\/store$/);
      await expect(page.getByRole('heading', { name: 'Curated print catalog' })).toBeVisible();
    });

    test('serves the landing page for unknown client routes', async ({ page }) => {
      await page.goto('/nonexistent-page', { waitUntil: 'domcontentloaded' });

      await expect(page).toHaveURL('/');
      await expect(page.getByText('Creative Excellence').first()).toBeVisible({ timeout: 15000 });
    });

    test('renders the footer', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText(/All rights reserved/i)).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Accessibility and performance', () => {
    test('has visible headings and actionable controls', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      await expect(page.getByRole('button').first()).toBeVisible();
    });

    test('product images expose alt text', async ({ page }) => {
      await openStore(page);

      const productImage = page.getByRole('img', { name: /Premium Business Cards/i }).first();
      await expect(productImage).toBeVisible();
    });

    test('loads the landing page within the smoke-test budget', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Creative Excellence').first()).toBeVisible({ timeout: 15000 });

      expect(Date.now() - startTime).toBeLessThan(10000);
    });
  });
});
