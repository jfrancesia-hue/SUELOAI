import { createHmac, timingSafeEqual } from 'crypto';

function parseHeaderPairs(header: string | null) {
  const pairs = new Map<string, string>();
  if (!header) return pairs;

  for (const part of header.split(',')) {
    const [key, value] = part.split('=');
    if (key && value) pairs.set(key.trim(), value.trim());
  }

  return pairs;
}

function safeEqualHex(a: string, b: string) {
  try {
    const left = Buffer.from(a, 'hex');
    const right = Buffer.from(b, 'hex');
    return left.length === right.length && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function verifyMercadoPagoSignature(params: {
  dataId?: string | null;
  requestId?: string | null;
  signature?: string | null;
  secret?: string | null;
  now?: number;
}) {
  const { dataId, requestId, signature, secret, now = Date.now() } = params;
  if (!secret || !signature) return false;

  const parts = parseHeaderPairs(signature);
  const ts = parts.get('ts');
  const v1 = parts.get('v1');
  if (!ts || !v1) return false;

  const tsNumber = Number(ts);
  if (!Number.isFinite(tsNumber)) return false;
  const tsMs = tsNumber > 9_999_999_999 ? tsNumber : tsNumber * 1000;
  if (Math.abs(now - tsMs) > 10 * 60 * 1000) return false;

  const normalizedId = dataId && /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifest = [
    normalizedId ? `id:${normalizedId};` : '',
    requestId ? `request-id:${requestId};` : '',
    `ts:${ts};`,
  ].join('');

  const expected = createHmac('sha256', secret).update(manifest).digest('hex');
  return safeEqualHex(expected, v1);
}

export function verifyStaticWebhookSecret(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}
