import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demo';
import { requireAdminProfile } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

function auditHash(payload: unknown) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { action, reason } = await request.json().catch(() => ({ action: null }));

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({
      ok: true,
      message: action === 'approve' ? 'Demo: retiro aprobado' : 'Demo: retiro rechazado',
    });
  }

  const auth = await requireAdminProfile();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: before, error: beforeError } = await auth.admin
    .from('crypto_withdrawal_requests')
    .select('*')
    .eq('id', params.id)
    .single();

  if (beforeError || !before) {
    return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
  }

  if (!['pending', 'pending_approval'].includes(before.status)) {
    return NextResponse.json({ error: 'La solicitud ya no está pendiente' }, { status: 409 });
  }

  const nextStatus = action === 'approve' ? 'approved' : 'rejected';
  const patch = {
    status: nextStatus,
    approved_by: auth.user.id,
    approved_at: action === 'approve' ? new Date().toISOString() : null,
    rejection_reason: action === 'reject' ? reason || 'Rechazado por admin' : null,
  };

  const { data: after, error } = await auth.admin
    .from('crypto_withdrawal_requests')
    .update(patch)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const payload = {
    action: `crypto_withdrawal.${nextStatus}`,
    entity_type: 'crypto_withdrawal_request',
    entity_id: params.id,
    before,
    after,
    at: new Date().toISOString(),
  };

  await auth.admin.from('audit_logs').insert({
    user_id: auth.user.id,
    action: payload.action,
    entity_type: payload.entity_type,
    entity_id: payload.entity_id,
    before_data: before,
    after_data: after,
    ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    user_agent: request.headers.get('user-agent'),
    hash: auditHash(payload),
  });

  return NextResponse.json({
    ok: true,
    data: after,
    message: action === 'approve' ? 'Retiro aprobado y auditado' : 'Retiro rechazado y auditado',
  });
}
