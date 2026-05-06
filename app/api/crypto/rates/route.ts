import { createClient } from '@/lib/supabase-server';
import { getExchangeRate } from '@/lib/crypto/rates';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/crypto/rates?from=USD&to=ARS
 * Obtiene tipo de cambio con cache
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || 'USD';
  const to = searchParams.get('to') || 'USDT';

  const supabase = createClient();
  const rate = await getExchangeRate(from, to, supabase);

  return NextResponse.json({
    from,
    to,
    rate,
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET all supported rates
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();

  const pairs = [
    ['USD', 'ARS'],
    ['USD', 'PYG'],
    ['USD', 'USDT'],
    ['USDT', 'USD'],
    ['BTC', 'USD'],
    ['ETH', 'USD'],
  ];

  const rates = await Promise.all(
    pairs.map(async ([from, to]) => ({
      from, to, rate: await getExchangeRate(from, to, supabase),
    }))
  );

  return NextResponse.json({ rates, timestamp: new Date().toISOString() });
}
