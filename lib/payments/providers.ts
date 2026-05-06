import { features } from '@/lib/config/features';
import { isSupportedCurrency } from '@/lib/config/markets';
import { createDepositPreference } from '@/lib/mercadopago/client';

export type DepositProviderId = 'mercadopago' | 'bank_transfer' | 'crypto';

export type DepositIntentInput = {
  provider: DepositProviderId;
  userId: string;
  email: string;
  amount: number;
  currency: string;
  country?: string | null;
};

export type DepositIntent = {
  provider: DepositProviderId | 'manual';
  status: 'pending' | 'redirect_required';
  providerReference: string;
  currency: string;
  metadata: Record<string, unknown>;
  checkoutUrl?: string;
  message?: string;
};

function validateCurrency(currency: string) {
  if (!isSupportedCurrency(currency)) throw new Error(`Moneda no soportada: ${currency}`);
}

export async function createDepositIntent(input: DepositIntentInput): Promise<DepositIntent> {
  validateCurrency(input.currency);

  if (input.provider === 'bank_transfer') {
    if (!features.bankTransferDeposits) throw new Error('Depósitos por transferencia deshabilitados');
    const ref = `BANK-${Date.now()}-${input.userId.slice(0, 8).toUpperCase()}`;
    return {
      provider: 'manual',
      status: 'pending',
      providerReference: ref,
      currency: input.currency,
      metadata: {
        provider: 'bank_transfer',
        country: input.country || null,
        instructions: process.env.BANK_TRANSFER_INSTRUCTIONS || 'Configurar instrucciones bancarias por país.',
      },
      message: 'Solicitud creada. Un admin debe validar la transferencia antes de acreditar saldo.',
    };
  }

  if (input.provider === 'crypto') {
    if (!features.crypto) throw new Error('Depósitos crypto deshabilitados hasta conectar custodio/API real');
    throw new Error('Depósitos crypto requieren conectar Bitso/Circle/Fireblocks antes de producción');
  }

  if (!features.mercadoPagoDeposits) throw new Error('Mercado Pago deshabilitado');
  if (!process.env.MP_ACCESS_TOKEN) throw new Error('Mercado Pago no configurado');

  const preference = await createDepositPreference({
    userId: input.userId,
    amount: input.amount,
    email: input.email,
  });

  return {
    provider: 'mercadopago',
    status: 'redirect_required',
    providerReference: preference.preference_id || `MP-${Date.now()}`,
    checkoutUrl: preference.init_point || preference.sandbox_init_point || undefined,
    currency: input.currency,
    metadata: { preference },
  };
}


