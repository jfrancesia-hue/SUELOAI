import { createClient } from '@/lib/supabase-server';
import { createDepositPreference } from '@/lib/mercadopago/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { amount } = await request.json();
  if (!amount || amount < 100) {
    return NextResponse.json({ error: 'Monto mínimo: $100' }, { status: 400 });
  }

  try {
    const preference = await createDepositPreference({
      userId: user.id,
      amount: Number(amount),
      email: user.email!,
    });

    // Registrar movimiento pendiente
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance_available')
      .eq('user_id', user.id)
      .single();

    if (wallet) {
      await supabase.from('wallet_movements').insert({
        wallet_id: wallet.id,
        user_id: user.id,
        type: 'deposit',
        status: 'pending',
        amount: Number(amount),
        balance_before: wallet.balance_available,
        balance_after: wallet.balance_available,
        currency: 'ARS',
        provider: 'mercadopago',
        provider_reference: preference.preference_id,
        description: 'Carga de saldo',
      });
    }

    return NextResponse.json(preference);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
