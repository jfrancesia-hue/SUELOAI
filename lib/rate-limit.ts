/**
 * Rate limiter para API routes de Suelo.
 *
 * Estrategia dual:
 *  - Si hay UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN → Upstash Redis (distribuido, funciona en Vercel serverless)
 *  - Si no → LRU in-memory (funciona en dev, limitado a una instancia en prod)
 *
 * Ejemplo de uso en una API route:
 *   const limit = await limitByIp(request, 'ai-chat', { requests: 20, window: 60 });
 *   if (!limit.success) return limit.response;
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// LRU fallback (in-memory, solo single-instance)
// ============================================
interface Bucket {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

function memoryCheck(key: string, limit: number, windowMs: number): {
  success: boolean;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const bucket = memoryStore.get(key);

  if (!bucket || now >= bucket.resetAt) {
    if (memoryStore.size >= MAX_KEYS) {
      // Evict el primero (aproximación LRU barata)
      const firstKey = memoryStore.keys().next().value;
      if (firstKey) memoryStore.delete(firstKey);
    }
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { success: false, remaining: 0, reset: bucket.resetAt };
  }
  return { success: true, remaining: limit - bucket.count, reset: bucket.resetAt };
}

// ============================================
// Upstash Redis (primario si está configurado)
// ============================================
async function upstashCheck(
  key: string,
  limit: number,
  windowSec: number
): Promise<{ success: boolean; remaining: number; reset: number } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    // Script Lua via REST: INCR + EXPIRE si es nuevo
    const redisKey = `ratelimit:${key}`;
    const pipeline = [
      ['INCR', redisKey],
      ['EXPIRE', redisKey, String(windowSec), 'NX'],
      ['TTL', redisKey],
    ];

    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipeline),
    });

    if (!res.ok) {
      console.error('[rate-limit] Upstash error', res.status);
      return null;
    }

    const data = (await res.json()) as Array<{ result: any }>;
    const count = Number(data[0]?.result ?? 0);
    const ttl = Number(data[2]?.result ?? windowSec);
    const reset = Date.now() + ttl * 1000;

    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      reset,
    };
  } catch (err) {
    console.error('[rate-limit] Upstash fallback a memoria:', err);
    return null;
  }
}

// ============================================
// API pública
// ============================================
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<{ success: boolean; remaining: number; reset: number; backend: 'upstash' | 'memory' }> {
  const upstash = await upstashCheck(key, limit, windowSec);
  if (upstash) return { ...upstash, backend: 'upstash' };

  const memory = memoryCheck(key, limit, windowSec * 1000);
  return { ...memory, backend: 'memory' };
}

/** Obtener IP del request — maneja proxies Vercel/Cloudflare. */
export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

/**
 * Helper all-in-one: limita por IP + prefijo, devuelve un NextResponse si excedió.
 *
 * Uso:
 *   const limited = await limitByIp(request, 'ai-chat', { requests: 20, window: 60 });
 *   if (!limited.success) return limited.response;
 */
export async function limitByIp(
  request: NextRequest,
  prefix: string,
  opts: { requests: number; window: number } = { requests: 30, window: 60 }
): Promise<
  | { success: true; remaining: number; reset: number }
  | { success: false; response: NextResponse; reset: number }
> {
  const ip = getClientIp(request);
  const key = `${prefix}:${ip}`;
  const check = await checkRateLimit(key, opts.requests, opts.window);

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(opts.requests),
    'X-RateLimit-Remaining': String(check.remaining),
    'X-RateLimit-Reset': String(Math.floor(check.reset / 1000)),
  };

  if (!check.success) {
    const retryAfter = Math.max(1, Math.ceil((check.reset - Date.now()) / 1000));
    return {
      success: false,
      reset: check.reset,
      response: NextResponse.json(
        {
          error: 'Demasiadas solicitudes. Esperá un momento y volvé a intentar.',
          retry_after_seconds: retryAfter,
        },
        {
          status: 429,
          headers: { ...headers, 'Retry-After': String(retryAfter) },
        }
      ),
    };
  }

  return { success: true, remaining: check.remaining, reset: check.reset };
}

/** Limita por user_id (para rutas autenticadas — más justo que IP cuando hay NAT). */
export async function limitByUser(
  userId: string,
  prefix: string,
  opts: { requests: number; window: number } = { requests: 30, window: 60 }
): Promise<{ success: boolean; remaining: number; reset: number }> {
  return checkRateLimit(`${prefix}:user:${userId}`, opts.requests, opts.window);
}
