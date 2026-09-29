import { expect, test } from '@playwright/test';

/**
 * Smoke tests del home page.
 *
 * Verifica:
 *   - Render correcto del landing
 *   - CTAs visibles
 *   - Cambio de idioma funciona
 *   - Navegación a /auth/login funciona
 */

test.describe('Home page', () => {
  test('renders the CRBNB brand and hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.crbnb-header__brand')).toContainText('CRBNB');
    await expect(page.locator('.crbnb-hero__title')).toBeVisible();
    await expect(page.locator('text=Hospedajes')).toBeVisible();
  });

  test('has a working language switcher', async ({ page }) => {
    await page.goto('/');
    const switcher = page.getByTestId('language-switcher');
    await expect(switcher).toBeVisible();
    await switcher.locator('button.crbnb-locale__toggle').click();
    await expect(switcher.locator('.crbnb-locale__menu')).toBeVisible();
    // Click English option
    await switcher.locator('button[role="option"]', { hasText: 'English' }).click();
    // Locale code should now show EN
    await expect(switcher.locator('.crbnb-locale__code')).toContainText('EN');
  });

  test('navigates to login page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a.crbnb-header__login').click();
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('h1')).toContainText('Iniciar sesión');
  });

  test('navigates to signup page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a.crbnb-header__signup').click();
    await expect(page).toHaveURL('/auth/signup');
    await expect(page.locator('h1')).toContainText('Crear cuenta');
  });

  test('renders legal pages', async ({ page }) => {
    await page.goto('/legal/privacy');
    await expect(page.locator('h1')).toContainText('Privacidad');
    await page.goto('/legal/terms');
    await expect(page.locator('h1')).toContainText('Términos');
    await page.goto('/legal/cookies');
    await expect(page.locator('h1')).toContainText('Cookies');
  });

  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.locator('h1')).toContainText('No encontramos esta página');
    await expect(page.locator('.crbnb-404__code')).toContainText('404');
  });
});