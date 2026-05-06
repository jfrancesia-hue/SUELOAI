import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase-server';
import { createDepositIntent } from '@/lib/payments/providers';
import { ensureWallet, normalizeAmount, walletNumber } from '@/lib/wallet/server';
import { getDefaultCountry, getMarket, isSupportedCurrency } from '@/lib/config/markets';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const country = body.country || getDefaultCountry();
  const market = getMarket(country);
  const provider = body.provider || 'bank_transfer';
  const currency = String(body.currency || market.currency || 'USD').toUpperCase();
  const normalizedAmount = normalizeAmount(body.amount);

  if (!isSupportedCurrency(currency)) {
    return NextResponse.json({ error: `Moneda no soportada: ${currency}` }, { status: 400 });
  }

  if (!normalizedAmount || normalizedAmount < market.minInvestmentUsd) {
    return NextResponse.json({ error: `Monto mínimo: USD ${market.minInvestmentUsd}` }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const wallet = await ensureWallet(admin as any, user.id);

    if (!wallet.is_active) {
      return NextResponse.json({ error: 'La billetera está inactiva' }, { status: 403 });
    }

    const intent = await createDepositIntent({
      provider,
      userId: user.id,
      email: user.email!,
      amount: normalizedAmount,
      currency,
      country: market.code,
    });

    await admin.from('wallet_movements').insert({
      wallet_id: wallet.id,
      user_id: user.id,
      type: 'deposit',
      status: 'pending',
      amount: normalizedAmount,
      balance_before: walletNumber(wallet.balance_available),
      balance_after: walletNumber(wallet.balance_available),
      currency,
      provider: intent.provider === 'bank_transfer' ? 'manual' : intent.provider,
      provider_reference: intent.providerReference,
      provider_metadata: intent.metadata,
      description: intent.message || 'Carga de saldo pendiente',
    });

    return NextResponse.json({
      ok: true,
      provider: intent.provider,
      status: intent.status,
      provider_reference: intent.providerReference,
      init_point: intent.checkoutUrl,
      message: intent.message,
      metadata: intent.metadata,
    });
  } catch (error: any) {
    const status = /no configurado|deshabilitado|requiere conectar/i.test(error.message) ? 503 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
