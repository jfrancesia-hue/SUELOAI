import { features } from '@/lib/config/features';
import { getMarket, type MarketCountry } from '@/lib/config/markets';

export type FiscalDocumentInput = {
  invoiceId: string;
  country: MarketCountry;
  issuerId: string;
  recipientName: string;
  recipientTaxId?: string | null;
  invoiceNumber: string;
  invoiceType: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  issueDate: string;
  lineItems?: unknown[];
};

export type FiscalDocumentResult = {
  provider: string;
  status: 'issued' | 'pending' | 'rejected';
  fiscalCode: string;
  fiscalCodeExpiry?: string | null;
  rawResponse: Record<string, unknown>;
};

export interface FiscalProvider {
  id: 'sifen_dnit' | 'sin_bolivia';
  country: MarketCountry;
  isConfigured(): boolean;
  issue(input: FiscalDocumentInput): Promise<FiscalDocumentResult>;
}

function notConfigured(provider: string): never {
  throw new Error(`${provider} no configurado. Conectá credenciales/API reales antes de emitir comprobantes.`);
}

class ParaguaySifenProvider implements FiscalProvider {
  id = 'sifen_dnit' as const;
  country = 'PY' as const;

  isConfigured() {
    return Boolean(process.env.SIFEN_API_URL && process.env.SIFEN_API_KEY && process.env.SIFEN_ENVIRONMENT);
  }

  async issue(_input: FiscalDocumentInput): Promise<FiscalDocumentResult> {
    if (!features.fiscalIssuing || !this.isConfigured()) notConfigured('SIFEN/DNIT Paraguay');
    // TODO API: POST process.env.SIFEN_API_URL con API key/certificado del tenant.
    notConfigured('SIFEN/DNIT Paraguay');
  }
}

class BoliviaSinProvider implements FiscalProvider {
  id = 'sin_bolivia' as const;
  country = 'BO' as const;

  isConfigured() {
    return Boolean(process.env.SIN_BOLIVIA_API_URL && process.env.SIN_BOLIVIA_API_KEY && process.env.SIN_BOLIVIA_ENVIRONMENT);
  }

  async issue(_input: FiscalDocumentInput): Promise<FiscalDocumentResult> {
    if (!features.fiscalIssuing || !this.isConfigured()) notConfigured('SIN Bolivia');
    // TODO API: POST process.env.SIN_BOLIVIA_API_URL con credenciales del tenant.
    notConfigured('SIN Bolivia');
  }
}

const providers: Record<MarketCountry, FiscalProvider> = {
  PY: new ParaguaySifenProvider(),
  BO: new BoliviaSinProvider(),
};

export function getFiscalProvider(country?: string | null): FiscalProvider {
  const market = getMarket(country);
  return providers[market.code];
}
