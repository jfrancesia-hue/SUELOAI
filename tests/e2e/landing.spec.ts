import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('carga y muestra el hero de inversión inmobiliaria real', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Invertí en');
    await expect(page.locator('h1')).toContainText('ladrillo real');
    await expect(page.locator('h1')).toContainText('desde USD 100');
  });

  test('tiene CTAs a registro y marketplace', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /empezar a invertir/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /ver proyectos/i })).toBeVisible();
  });

  test('los metadata OpenGraph están presentes', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDesc = await page
      .locator('meta[property="og:description"]')
      .getAttribute('content');

    expect(ogTitle).toContain('Suelo');
    expect(ogDesc).toBeTruthy();
  });

  test('headers de seguridad están activos', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);

    const headers = res.headers();
    expect(headers['x-frame-options']?.toLowerCase()).toBe('deny');
    expect(headers['x-content-type-options']?.toLowerCase()).toBe('nosniff');
    expect(headers['referrer-policy']).toBeTruthy();
  });
});
