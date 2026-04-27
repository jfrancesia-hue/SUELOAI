import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient, createClient } from '@/lib/supabase-server';
import { buildMovementHash, ensureWallet, normalizeAmount, walletNumber } from '@/lib/wallet/server';

export async function POST(request: NextRequest) {
  const demoRole = cookies().get('suelo_demo_role')?.value;
  if (demoRole === 'investor' || demoRole === 'developer') {
    const body = await request.json();
    const amount = normalizeAmount(body.amount);
    const current = Number(cookies().get('suelo_demo_wallet_balance')?.value || (demoRole === 'investor' ? 10000 : 2500));
    const fee = Math.max(1, Math.round(amount * 0.006 * 100) / 100);
    const totalDebit = Math.round((amount + fee) * 100) / 100;

    if (current < totalDebit) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
    }

    const next = current - totalDebit;
    const response = NextResponse.json({
      mode: 'demo',
      fee,
      totalDebit,
      movement: { amount: totalDebit, balance_before: current, balance_after: next },
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

  const body = await request.json();
  const amount = normalizeAmount(body.amount);
  const destination = String(body.destination || '').trim();
  const method = String(body.method || 'bank_transfer');

  if (amount < 10) {
    return NextResponse.json({ error: 'Monto mínimo de retiro: USD 10' }, { status: 400 });
  }
  if (!destination || destination.length < 6) {
    return NextResponse.json({ error: 'Ingresá una cuenta, CVU/CBU o dirección válida' }, { status: 400 });
  }

  const admin = createAdminClient();
  const wallet = await ensureWallet(admin as any, user.id);
  const available = walletNumber(wallet.balance_available);

  if (!wallet.is_active) {
    return NextResponse.json({ error: 'La billetera está inactiva' }, { status: 403 });
  }
  if (available < amount) {
    return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('kyc_verified, kyc_status')
    .eq('id', user.id)
    .single();

  const isVerified = Boolean(profile?.kyc_verified || profile?.kyc_status === 'approved');
  if (amount > 1000 && !isVerified) {
    return NextResponse.json(
      { error: 'Para retirar más de USD 1.000 necesitás completar KYC' },
      { status: 403 }
    );
  }

  const fee = Math.max(1, Math.round(amount * 0.006 * 100) / 100);
  const totalDebit = Math.round((amount + fee) * 100) / 100;

  if (available < totalDebit) {
    return NextResponse.json({ error: `Saldo insuficiente para cubrir comisión de USD ${fee}` }, { status: 400 });
  }

  const hash = await buildMovementHash({
    user_id: user.id,
    type: 'withdrawal',
    amount: totalDebit,
    destination,
    method,
  });

  const { data: movement, error } = await admin
    .from('wallet_movements')
    .insert({
      wallet_id: wallet.id,
      user_id: user.id,
      type: 'withdrawal',
      status: 'completed',
      amount: totalDebit,
      balance_before: available,
      balance_after: available - totalDebit,
      currency: wallet.currency || 'USD',
      provider: 'manual',
      provider_reference: destination,
      provider_metadata: { method, destination, withdrawal_amount: amount, fee },
      description: `Retiro ${method === 'crypto' ? 'crypto' : 'bancario'} solicitado`,
      hash,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await admin.from('notifications').insert({
    user_id: user.id,
    type: 'wallet_withdrawal',
    title: 'Retiro solicitado',
    body: `Registramos tu retiro por USD ${amount}. Comisión: USD ${fee}.`,
    link: '/wallet',
    metadata: { movement_id: movement.id },
  });

  return NextResponse.json({ movement, fee, totalDebit });
}
