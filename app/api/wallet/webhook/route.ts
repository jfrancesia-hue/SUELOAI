import { createAdminClient } from '@/lib/supabase-server';
import { getPaymentStatus } from '@/lib/mercadopago/client';
import { verifyMercadoPagoSignature } from '@/lib/webhook-security';
import { generateHash } from '@/utils/hash';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const paymentId = body.data?.id?.toString();

    if (process.env.NODE_ENV === 'production' && !process.env.MP_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Webhook no configurado' }, { status: 503 });
    }

    if (process.env.MP_WEBHOOK_SECRET) {
      const { searchParams } = new URL(request.url);
      const isValid = verifyMercadoPagoSignature({
        dataId: searchParams.get('data.id') || paymentId,
        requestId: request.headers.get('x-request-id'),
        signature: request.headers.get('x-signature'),
        secret: process.env.MP_WEBHOOK_SECRET,
      });

      if (!isValid) {
        return NextResponse.json({ error: 'Firma invalida' }, { status: 401 });
      }
    }

    // MP envía notificaciones con formato: { type: 'payment', data: { id: '...' } }
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true });
    }

    if (!paymentId) {
      return NextResponse.json({ error: 'No payment id' }, { status: 400 });
    }

    // Obtener estado del pago
    const payment = await getPaymentStatus(paymentId.toString());

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true, status: payment.status });
    }

    const userId = payment.external_reference;
    if (!userId) {
      return NextResponse.json({ error: 'No user reference' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Buscar el movimiento pendiente
    const { data: pendingMovement } = await supabase
      .from('wallet_movements')
      .select('*, wallet:wallets(*)')
      .eq('user_id', userId)
      .eq('provider', 'mercadopago')
      .eq('status', 'pending')
      .eq('amount', payment.amount)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!pendingMovement) {
      return NextResponse.json({ error: 'Movement not found' }, { status: 404 });
    }

    // Generar hash del movimiento
    const snapshot = JSON.stringify({
      amount: payment.amount,
      date: payment.date_approved,
      payment_id: payment.id,
      user_id: userId,
    });
    const hash = await generateHash(snapshot);

    // Actualizar movimiento a completado (trigger actualiza balance)
    await supabase
      .from('wallet_movements')
      .update({
        status: 'completed',
        provider_reference: payment.id?.toString(),
        provider_metadata: payment as any,
        hash,
      })
      .eq('id', pendingMovement.id);

    // Registrar notificación
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'wallet_deposit',
      title: 'Saldo cargado',
      body: `Se acreditaron $${payment.amount} en tu billetera`,
      link: '/wallet',
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
