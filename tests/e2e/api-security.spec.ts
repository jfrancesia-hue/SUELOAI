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

  test('POST /api/ai/chat respeta rate limit al saturar', async ({ request }) => {
    // Usar IP única para no pisarse con otros tests paralelos
    const uniqueIp = `192.0.2.${Math.floor(Math.random() * 254) + 1}`;
    const headers = { 'x-forwarded-for': uniqueIp };

    const results: number[] = [];
    // Limit es 20/min → con 40 requests garantizamos saturación
    for (let i = 0; i < 40; i++) {
      const res = await request.post('/api/ai/chat', {
        data: { message: 'x' },
        headers,
      });
      results.push(res.status());
    }
    // Con IP limpia, al menos uno de los últimos 20 debe ser 429
    const last20 = results.slice(-20);
    expect(last20.some((s) => s === 429)).toBeTruthy();
  });

  test('/api/kyc/webhook health check funciona', async ({ request }) => {
    const res = await request.get('/api/kyc/webhook');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.service).toBe('suelo-kyc-webhook');
  });
});
