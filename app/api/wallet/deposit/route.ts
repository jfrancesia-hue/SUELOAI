import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient, createClient } from '@/lib/supabase-server';
import { createDepositPreference } from '@/lib/mercadopago/client';
import { buildMovementHash, ensureWallet, normalizeAmount, walletNumber } from '@/lib/wallet/server';

export async function POST(request: NextRequest) {
  const demoRole = cookies().get('suelo_demo_role')?.value;
  if (demoRole === 'investor' || demoRole === 'developer') {
    const { amount } = await request.json();
    const normalizedAmount = normalizeAmount(amount);
    const current = Number(cookies().get('suelo_demo_wallet_balance')?.value || (demoRole === 'investor' ? 10000 : 2500));
    const next = current + normalizedAmount;
    const response = NextResponse.json({
      ok: true,
      mode: 'demo',
      message: 'Saldo demo acreditado',
      movement: { amount: normalizedAmount, balance_before: current, balance_after: next },
    });
    response.cookies.set('suelo_demo_wallet_balance', String(next), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { amount, currency = 'ARS' } = await request.json();
  const normalizedAmount = normalizeAmount(amount);

  if (!normalizedAmount || normalizedAmount < 100) {
    return NextResponse.json({ error: 'Monto mínimo: $100' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const wallet = await ensureWallet(admin as any, user.id);

    if (!wallet.is_active) {
      return NextResponse.json({ error: 'La billetera está inactiva' }, { status: 403 });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      const available = walletNumber(wallet.balance_available);
      const hash = await buildMovementHash({
        user_id: user.id,
        type: 'deposit',
        amount: normalizedAmount,
        provider: 'manual',
      });

      const { data: movement, error } = await admin
        .from('wallet_movements')
        .insert({
          wallet_id: wallet.id,
          user_id: user.id,
          type: 'deposit',
          status: 'completed',
          amount: normalizedAmount,
          balance_before: available,
          balance_after: available + normalizedAmount,
          currency,
          provider: 'manual',
          provider_reference: `DEV-${Date.now()}`,
          provider_metadata: { mode: 'development_fallback' },
          description: 'Carga de saldo manual (dev)',
          hash,
        })
        .select('*')
        .single();

      if (error) throw error;

      return NextResponse.json({
        ok: true,
        mode: 'manual',
        movement,
        message: 'Saldo acreditado en modo desarrollo',
      });
    }

    const preference = await createDepositPreference({
      userId: user.id,
      amount: normalizedAmount,
      email: user.email!,
    });

    await admin.from('wallet_movements').insert({
      wallet_id: wallet.id,
      user_id: user.id,
      type: 'deposit',
      status: 'pending',
      amount: normalizedAmount,
      balance_before: walletNumber(wallet.balance_available),
      balance_after: walletNumber(wallet.balance_available),
      currency: 'ARS',
      provider: 'mercadopago',
      provider_reference: preference.preference_id,
      description: 'Carga de saldo',
    });

    return NextResponse.json(preference);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
