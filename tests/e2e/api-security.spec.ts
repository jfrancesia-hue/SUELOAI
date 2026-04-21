import { test, expect } from '@playwright/test';

test.describe('API security', () => {
  test('POST /api/ai/chat sin auth devuelve 401', async ({ request }) => {
    const res = await request.post('/api/ai/chat', {
      data: { message: 'hola' },
    });
    // Puede ser 401 (sin sesión) o 429 (si el rate limit pegó antes) — ambos son OK
    expect([401, 429]).toContain(res.status());
  });

  test('GET /api/crm/contacts sin auth devuelve 401', async ({ request }) => {
    const res = await request.get('/api/crm/contacts');
    expect(res.status()).toBe(401);
  });

  test('POST /api/invoicing sin auth devuelve 401', async ({ request }) => {
    const res = await request.post('/api/invoicing', {
      data: { recipient_name: 'Test', total: 100 },
    });
    expect(res.status()).toBe(401);
  });

  test('API routes tienen X-Robots-Tag noindex', async ({ request }) => {
    const res = await request.get('/api/ai/chat');
    // No importa qué status, los headers deben estar
    const headers = res.headers();
    expect(headers['x-robots-tag']).toContain('noindex');
  });

  test('POST /api/ai/chat respeta rate limit (21 requests)', async ({ request }) => {
    const results: number[] = [];
    for (let i = 0; i < 22; i++) {
      const res = await request.post('/api/ai/chat', { data: { message: 'x' } });
      results.push(res.status());
    }
    // Alguno de los últimos debería ser 429 (rate limit)
    expect(results.some((s) => s === 429)).toBeTruthy();
  });

  test('/api/kyc/webhook health check funciona', async ({ request }) => {
    const res = await request.get('/api/kyc/webhook');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.service).toBe('suelo-kyc-webhook');
  });
});
