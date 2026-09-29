import { expect, test } from '@playwright/test';

/**
 * Tests E2E del flujo de autenticación.
 *
 * Estos tests usan Supabase local (configurado en CI). Para correr contra
 * Supabase real, exportar SUPABASE_URL/SUPABASE_ANON_KEY antes de `pnpm e2e`.
 */

test.describe('Auth flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('login page shows form', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText(/link mágico/i);
  });

  test('signup page shows name + email fields', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('submit button is disabled when email is empty', async ({ page }) => {
    await page.goto('/auth/login');
    const submit = page.locator('button[type="submit"]');
    await expect(submit).toBeDisabled();
  });

  test('protected /account redirects to login', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe('Responsive design', () => {
  test('home page is mobile-friendly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // Hero title should still be readable
    await expect(page.locator('.crbnb-hero__title')).toBeVisible();
    // Header should still show brand
    await expect(page.locator('.crbnb-header__brand')).toBeVisible();
  });

  test('home page works on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    // Nav links should be visible on desktop
    await expect(page.locator('a[routerLink="/search"]')).toBeVisible();
  });
});