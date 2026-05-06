import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config para Suelo.
 *
 * Corre contra el dev server local por default. Para testear contra preview
 * de Vercel, setear BASE_URL en el env antes de correr `npm run test:e2e`.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testEnv = {
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
  NEXT_PUBLIC_DEFAULT_COUNTRY: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || 'PY',
  NEXT_PUBLIC_SUPPORTED_COUNTRIES: process.env.NEXT_PUBLIC_SUPPORTED_COUNTRIES || 'PY,BO',
  NEXT_PUBLIC_DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'USD',
};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Solo levanta dev server si estamos contra localhost
  webServer: BASE_URL.startsWith('http://localhost')
    ? {
        command: 'npm run dev',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: testEnv,
      }
    : undefined,
});
