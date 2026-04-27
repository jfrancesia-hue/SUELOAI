import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient, createClient } from '@/lib/supabase-server';
import { buildMovementHash, ensureWallet, normalizeAmount, walletNumber } from '@/lib/wallet/server';

export async function POST(request: NextRequest) {
  const demoRole = cookies().get('suelo_demo_role')?.value;
  if (demoRole === 'investor' || demoRole === 'developer') {
    const body = await request.json();
    const amount = normalizeAmount(body.amount);
    const recipientEmail = String(body.recipientEmail || '').trim().toLowerCase();
    const current = Number(cookies().get('suelo_demo_wallet_balance')?.value || (demoRole === 'investor' ? 10000 : 2500));

    if (amount < 5) return NextResponse.json({ error: 'Monto minimo de transferencia: USD 5' }, { status: 400 });
    if (!recipientEmail.includes('@')) return NextResponse.json({ error: 'Ingresa el email del destinatario' }, { status: 400 });
    if (current < amount) return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });

    const next = current - amount;
    const response = NextResponse.json({
      mode: 'demo',
      transferId: `demo-transfer-${Date.now()}`,
      debit: { amount, balance_before: current, balance_after: next, recipientEmail },
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
  const recipientEmail = String(body.recipientEmail || '').trim().toLowerCase();
  const note = String(body.note || '').trim().slice(0, 180);

  if (amount < 5) {
    return NextResponse.json({ error: 'Monto mínimo de transferencia: USD 5' }, { status: 400 });
  }
  if (!recipientEmail || !recipientEmail.includes('@')) {
    return NextResponse.json({ error: 'Ingresá el email del destinatario' }, { status: 400 });
  }
  if (recipientEmail === user.email?.toLowerCase()) {
    return NextResponse.json({ error: 'No podés transferirte a vos mismo' }, { status: 400 });
  }

  const admin = createAdminClient();
  const senderWallet = await ensureWallet(admin as any, user.id);
  const senderAvailable = walletNumber(senderWallet.balance_available);

  if (!senderWallet.is_active) {
    return NextResponse.json({ error: 'La billetera está inactiva' }, { status: 403 });
  }
  if (senderAvailable < amount) {
    return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
  }

  const { data: recipient, error: recipientError } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', recipientEmail)
    .maybeSingle();

  if (recipientError) {
    return NextResponse.json({ error: recipientError.message }, { status: 500 });
  }
  if (!recipient) {
    return NextResponse.json({ error: 'No encontramos un usuario con ese email' }, { status: 404 });
  }

  const recipientWallet = await ensureWallet(admin as any, recipient.id);
  const recipientAvailable = walletNumber(recipientWallet.balance_available);
  const transferId = crypto.randomUUID();

  const senderHash = await buildMovementHash({
    transfer_id: transferId,
    user_id: user.id,
    recipient_id: recipient.id,
    amount,
    type: 'transfer_out',
  });

  const { data: debit, error: debitError } = await admin
    .from('wallet_movements')
    .insert({
      wallet_id: senderWallet.id,
      user_id: user.id,
      type: 'transfer_out',
      status: 'completed',
      amount,
      balance_before: senderAvailable,
      balance_after: senderAvailable - amount,
      currency: senderWallet.currency || 'USD',
      provider: 'internal',
      provider_reference: transferId,
      provider_metadata: { recipient_id: recipient.id, recipient_email: recipient.email, note },
      description: `Transferencia a ${recipient.full_name || recipient.email}`,
      hash: senderHash,
    })
    .select('*')
    .single();

  if (debitError) {
    return NextResponse.json({ error: debitError.message }, { status: 500 });
  }

  const recipientHash = await buildMovementHash({
    transfer_id: transferId,
    user_id: recipient.id,
    sender_id: user.id,
    amount,
    type: 'transfer_in',
  });

  const { data: credit, error: creditError } = await admin
    .from('wallet_movements')
    .insert({
      wallet_id: recipientWallet.id,
      user_id: recipient.id,
      type: 'transfer_in',
      status: 'completed',
      amount,
      balance_before: recipientAvailable,
      balance_after: recipientAvailable + amount,
      currency: recipientWallet.currency || 'USD',
      provider: 'internal',
      provider_reference: transferId,
      provider_metadata: { sender_id: user.id, sender_email: user.email, note, debit_movement_id: debit.id },
      description: `Transferencia recibida de ${user.email}`,
      hash: recipientHash,
    })
    .select('*')
    .single();

  if (creditError) {
    const refundHash = await buildMovementHash({
      transfer_id: transferId,
      user_id: user.id,
      amount,
      type: 'refund',
      reason: creditError.message,
    });

    await admin.from('wallet_movements').insert({
      wallet_id: senderWallet.id,
      user_id: user.id,
      type: 'refund',
      status: 'completed',
      amount,
      balance_before: senderAvailable - amount,
      balance_after: senderAvailable,
      currency: senderWallet.currency || 'USD',
      provider: 'internal',
      provider_reference: transferId,
      provider_metadata: { failed_credit_error: creditError.message },
      description: 'Reintegro por transferencia fallida',
      hash: refundHash,
    });

    return NextResponse.json({ error: 'No pudimos acreditar al destinatario. El importe fue reintegrado.' }, { status: 500 });
  }

  await Promise.all([
    admin.from('notifications').insert({
      user_id: user.id,
      type: 'wallet_transfer_out',
      title: 'Transferencia enviada',
      body: `Enviaste USD ${amount} a ${recipient.full_name || recipient.email}.`,
      link: '/wallet',
      metadata: { transfer_id: transferId, movement_id: debit.id },
    }),
    admin.from('notifications').insert({
      user_id: recipient.id,
      type: 'wallet_transfer_in',
      title: 'Transferencia recibida',
      body: `Recibiste USD ${amount} de ${user.email}.`,
      link: '/wallet',
      metadata: { transfer_id: transferId, movement_id: credit.id },
    }),
  ]);

  return NextResponse.json({ transferId, debit, credit });
}
