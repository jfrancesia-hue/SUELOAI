import { test, expect } from '@playwright/test';

test.describe('Auth & middleware', () => {
  test('rutas protegidas redirigen a /login si no hay sesión', async ({ page }) => {
    const protectedPaths = [
      '/wallet',
      '/ai-analyst',
      '/crm',
      '/invoicing',
      '/secondary-market',
      '/investor',
    ];

    for (const path of protectedPaths) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    }
  });

  test('/login carga el formulario', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('/register carga el formulario', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('/login preserva query param redirect', async ({ page }) => {
    await page.goto('/wallet');
    const url = new URL(page.url());
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('redirect')).toBe('/wallet');
  });
});
