/**
 * /api/kyc
 *
 * GET   → estado KYC del usuario actual
 * POST  → iniciar proceso KYC (crea sesión con Didit si hay API key, si no → pending manual)
 * PATCH → update manual (solo admin) o confirmar completitud desde cliente
 *
 * En producción, el webhook de Didit actualiza el status desde
 * /api/kyc/webhook (no implementado acá).
 */

import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

async function createDiditSession(
  userId: string,
  userEmail: string
): Promise<{ reference: string; workflowUrl: string } | null> {
  const apiKey = process.env.DIDIT_API_KEY;
  const workflowId = process.env.DIDIT_WORKFLOW_ID;
  if (!apiKey || !workflowId) return null;

  try {
    const res = await fetch('https://verification.didit.me/v1/session/', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        vendor_data: userId,
        callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/kyc/webhook`,
      }),
    });
    if (!res.ok) throw new Error(`Didit returned ${res.status}`);
    const body = await res.json();
    return {
      reference: body.session_id || body.id,
      workflowUrl: body.url || body.verification_url,
    };
  } catch (err) {
    console.error('[kyc] Didit session failed:', err);
    return null;
  }
}

export async function GET(_request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: latest } = await supabase
    .from('kyc_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: profile } = await supabase
    .from('profiles')
    .select('kyc_status, kyc_verified')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    request: latest,
    profile_status: profile?.kyc_status ?? 'pending',
    verified: !!profile?.kyc_verified,
  });
}

export async function POST(_request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  // ¿Ya tiene uno en progreso?
  const { data: existing } = await supabase
    .from('kyc_requests')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['pending', 'in_progress'])
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ data: existing, message: 'Ya tenés un KYC en curso.' });
  }

  const session = await createDiditSession(user.id, user.email || '');

  const { data, error } = await supabase
    .from('kyc_requests')
    .insert({
      user_id: user.id,
      provider: session ? 'didit' : 'manual',
      status: session ? 'in_progress' : 'pending',
      provider_reference: session?.reference ?? null,
      workflow_id: process.env.DIDIT_WORKFLOW_ID ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    verification_url: session?.workflowUrl ?? null,
    provider: session ? 'didit' : 'manual',
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  // Usuario solo puede marcar documentos subidos; approve/reject es solo admin
  const patch: Record<string, any> = {};
  if (body.documents_submitted) patch.documents_submitted = body.documents_submitted;
  if (body.status === 'in_progress') patch.status = 'in_progress';

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') {
    // admin puede aprobar/rechazar
    if (body.status) patch.status = body.status;
    if (body.rejection_reason) patch.rejection_reason = body.rejection_reason;
    if (body.reviewer_notes) patch.reviewer_notes = body.reviewer_notes;
    patch.reviewed_at = new Date().toISOString();
    patch.reviewer_id = user.id;
  }

  const { data, error } = await supabase
    .from('kyc_requests')
    .update(patch)
    .eq('id', body.id)
    .eq(profile?.role === 'admin' ? 'id' : 'user_id', profile?.role === 'admin' ? body.id : user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Si aprobó, sincronizar profile.kyc_status + kyc_verified
  if (profile?.role === 'admin' && body.status === 'approved') {
    await supabase
      .from('profiles')
      .update({ kyc_status: 'approved', kyc_verified: true })
      .eq('id', data.user_id);
  }

  return NextResponse.json({ data });
}
