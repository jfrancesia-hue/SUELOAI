/**
 * POST /api/kyc/webhook
 *
 * Callback de Didit (o provider KYC equivalente). Cuando el usuario termina
 * la verificación en el portal del provider, se nos notifica acá con el
 * veredicto (approved | rejected | review).
 *
 * Seguridad:
 *   - Si DIDIT_WEBHOOK_SECRET está seteado, validamos el header
 *     `x-didit-signature` contra HMAC-SHA256(body).
 *   - Si no hay secret, aceptamos sin validar y logueamos una advertencia
 *     (útil para desarrollo; endurecer antes de producción real).
 *
 * Usa el service role key para saltar RLS (el webhook no es un usuario
 * autenticado — es Didit hablándonos).
 */

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') return false;
    console.warn('[kyc/webhook] DIDIT_WEBHOOK_SECRET no configurado — aceptando sin validar.');
    return true;
  }
  if (!signature) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const received = signature.replace(/^sha256=/, '').trim();

  try {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(received, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-didit-signature');

  if (!verifySignature(rawBody, signature)) {
    console.error('[kyc/webhook] firma inválida');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Didit envía: session_id, vendor_data (= userId), status, decision, ...
  const providerReference: string | undefined =
    payload.session_id || payload.id || payload.reference;
  const vendorData: string | undefined = payload.vendor_data || payload.vendorData;
  const diditStatus: string =
    payload.status || payload.decision || payload.verification_status || '';

  if (!providerReference && !vendorData) {
    console.error('[kyc/webhook] payload sin session_id ni vendor_data', payload);
    return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
  }

  const mappedStatus =
    {
      approved: 'approved',
      verified: 'approved',
      declined: 'rejected',
      rejected: 'rejected',
      expired: 'expired',
      review: 'in_progress',
      in_review: 'in_progress',
      pending: 'in_progress',
    }[diditStatus.toLowerCase()] || 'in_progress';

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Buscar el request KYC por provider_reference o por vendor_data (userId)
  let query = supabase.from('kyc_requests').select('id, user_id').limit(1);
  if (providerReference) {
    query = query.eq('provider_reference', providerReference);
  } else if (vendorData) {
    query = query
      .eq('user_id', vendorData)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false });
  }

  const { data: kycRow } = await query.maybeSingle();

  if (!kycRow) {
    console.error('[kyc/webhook] KYC request no encontrado', { providerReference, vendorData });
    return NextResponse.json({ error: 'KYC request not found' }, { status: 404 });
  }

  // Actualizar KYC request
  await supabase
    .from('kyc_requests')
    .update({
      status: mappedStatus,
      reviewed_at: new Date().toISOString(),
      rejection_reason: payload.reason || payload.rejection_reason || null,
      documents_submitted: payload.documents || payload.documents_submitted || null,
    })
    .eq('id', kycRow.id);

  // Sincronizar profiles.kyc_status si aprobó/rechazó
  if (mappedStatus === 'approved' || mappedStatus === 'rejected') {
    await supabase
      .from('profiles')
      .update({
        kyc_status: mappedStatus,
        kyc_verified: mappedStatus === 'approved',
      })
      .eq('id', kycRow.user_id);
  }

  return NextResponse.json({ ok: true, kyc_status: mappedStatus });
}

// Health check (para que Didit valide que el endpoint existe)
export async function GET() {
  return NextResponse.json({
    service: 'suelo-kyc-webhook',
    status: 'ok',
    signature_required: !!process.env.DIDIT_WEBHOOK_SECRET,
  });
}
