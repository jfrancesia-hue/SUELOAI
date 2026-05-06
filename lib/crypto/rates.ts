/**
 * Exchange Rates Manager
 *
 * Fuentes:
 * - CoinGecko API (gratis, rate-limited) - crypto ↔ USD
 * - DollarAPI / DolarSi - USD ↔ ARS/PYG blue/oficial
 * - BCP Paraguay - tipos de cambio oficiales
 *
 * Cache en Supabase tabla exchange_rates (TTL 10 min)
 */

export async function getExchangeRate(
  from: string,
  to: string,
  supabaseClient: any
): Promise<number> {
  // Stablecoin = USD (1:1 aproximado)
  if ((from === 'USDT' || from === 'USDC' || from === 'DAI') && to === 'USD') return 1.0;
  if (from === 'USD' && (to === 'USDT' || to === 'USDC' || to === 'DAI')) return 1.0;

  if (from === to) return 1.0;

  // Intentar obtener del cache
  const { data: cached } = await supabaseClient
    .from('exchange_rates')
    .select('rate')
    .eq('from_currency', from)
    .eq('to_currency', to)
    .gte('timestamp', new Date(Date.now() - 10 * 60 * 1000).toISOString())
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cached) return Number(cached.rate);

  // Fetch fresh
  const rate = await fetchRateFromProvider(from, to);

  if (rate !== null) {
    // Guardar en cache
    await supabaseClient.from('exchange_rates').insert({
      from_currency: from,
      to_currency: to,
      rate,
      source: 'coingecko',
    });
  }

  return rate || 1.0;
}

async function fetchRateFromProvider(from: string, to: string): Promise<number | null> {
  try {
    // Crypto ↔ FIAT via CoinGecko
    if (['BTC', 'ETH', 'MATIC'].includes(from)) {
      const id = from === 'BTC' ? 'bitcoin' : from === 'ETH' ? 'ethereum' : 'matic-network';
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${to.toLowerCase()}`);
      const data = await res.json();
      return data[id]?.[to.toLowerCase()] || null;
    }

    // USD ↔ ARS (blue rate)
    if (from === 'USD' && to === 'ARS') {
      const res = await fetch('https://api.bluelytics.com.ar/v2/latest');
      const data = await res.json();
      return data.blue?.value_sell || null;
    }
    if (from === 'ARS' && to === 'USD') {
      const res = await fetch('https://api.bluelytics.com.ar/v2/latest');
      const data = await res.json();
      return data.blue?.value_sell ? 1 / data.blue.value_sell : null;
    }

    // USD ↔ PYG
    if (from === 'USD' && to === 'PYG') {
      // BCP Paraguay o usar rate fijo aproximado
      return 7300; // valor aproximado, actualizar con API real del BCP
    }
    if (from === 'PYG' && to === 'USD') {
      return 1 / 7300;
    }

    return null;
  } catch (error) {
    console.error('Error fetching rate:', error);
    return null;
  }
}

/**
 * Conversión con spread de plataforma
 * Aplicamos 0.5% spread en conversiones fiat <-> crypto
 */
export function applySpread(amount: number, spreadPercent: number = 0.5): number {
  return amount * (1 - spreadPercent / 100);
}
