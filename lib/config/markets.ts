export type MarketCountry = 'PY' | 'BO';
export type MarketCurrency = 'USD' | 'USDT' | 'PYG' | 'BOB';

export type MarketConfig = {
  code: MarketCountry;
  name: string;
  currency: MarketCurrency;
  secondaryCurrencies: MarketCurrency[];
  minInvestmentUsd: number;
  fiscalProvider: 'sifen_dnit' | 'sin_bolivia';
  kycRequiredAboveUsd: number;
  enabled: boolean;
};

export const SUPPORTED_COUNTRIES = ['PY', 'BO'] as const;
export const SUPPORTED_CURRENCIES = ['USD', 'USDT', 'PYG', 'BOB'] as const;

export const markets: Record<MarketCountry, MarketConfig> = {
  PY: {
    code: 'PY',
    name: 'Paraguay',
    currency: 'USD',
    secondaryCurrencies: ['USDT', 'PYG'],
    minInvestmentUsd: 100,
    fiscalProvider: 'sifen_dnit',
    kycRequiredAboveUsd: 1000,
    enabled: true,
  },
  BO: {
    code: 'BO',
    name: 'Bolivia',
    currency: 'USD',
    secondaryCurrencies: ['USDT', 'BOB'],
    minInvestmentUsd: 100,
    fiscalProvider: 'sin_bolivia',
    kycRequiredAboveUsd: 1000,
    enabled: true,
  },
};

export function getDefaultCountry(): MarketCountry {
  const value = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY;
  return value === 'BO' ? 'BO' : 'PY';
}

export function getMarket(country?: string | null): MarketConfig {
  const code = country === 'BO' ? 'BO' : 'PY';
  return markets[code];
}

export function isSupportedCountry(country?: string | null): country is MarketCountry {
  return country === 'PY' || country === 'BO';
}

export function isSupportedCurrency(currency?: string | null): currency is MarketCurrency {
  return SUPPORTED_CURRENCIES.includes(currency as MarketCurrency);
}
