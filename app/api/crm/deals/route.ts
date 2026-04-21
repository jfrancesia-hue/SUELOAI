/**
 * /api/crm/deals
 *
 * GET   → lista stages + deals del pipeline del usuario (seed de stages default si no existen)
 * POST  → crea deal
 * PATCH → update deal (mover de stage = drag&drop desde Kanban)
 * DELETE → borra deal
 */

import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

async function ensureDefaultStages(supabase: any, userId: string) {
  const { data: existing } = await supabase
    .from('crm_deal_stages')
    .select('id')
    .eq('owner_id', userId)
    .limit(1);

  if (existing && existing.length > 0) return;

  const defaults = [
    { name: 'Nuevo', order_index: 0, color: '#94A3B8', is_win_stage: false, is_lost_stage: false },
    { name: 'Contactado', order_index: 1, color: '#60A5FA', is_win_stage: false, is_lost_stage: false },
    { name: 'Calificado', order_index: 2, color: '#818CF8', is_win_stage: false, is_lost_stage: false },
    { name: 'Propuesta', order_index: 3, color: '#A78BFA', is_win_stage: false, is_lost_stage: false },
    { name: 'Negociación', order_index: 4, color: '#F59E0B', is_win_stage: false, is_lost_stage: false },
    { name: 'Ganado', order_index: 5, color: '#00C853', is_win_stage: true, is_lost_stage: false },
    { name: 'Perdido', order_index: 6, color: '#EF4444', is_win_stage: false, is_lost_stage: true },
  ];

  await supabase
    .from('crm_deal_stages')
    .insert(defaults.map((s) => ({ ...s, owner_id: userId })));
}

export async function GET(_request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await ensureDefaultStages(supabase, user.id);

  const [stagesRes, dealsRes] = await Promise.all([
    supabase
      .from('crm_deal_stages')
      .select('*')
      .eq('owner_id', user.id)
      .order('order_index', { ascending: true }),
    supabase
      .from('crm_deals')
      .select('*, contact:crm_contacts(id, full_name, company, email)')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(500),
  ]);

  return NextResponse.json({
    stages: stagesRes.data ?? [],
    deals: dealsRes.data ?? [],
  });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  if (!body.title) return NextResponse.json({ error: 'title requerido' }, { status: 400 });

  await ensureDefaultStages(supabase, user.id);

  let stageId = body.stage_id;
  if (!stageId) {
    const { data: firstStage } = await supabase
      .from('crm_deal_stages')
      .select('id')
      .eq('owner_id', user.id)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();
    stageId = firstStage?.id;
  }

  const { data, error } = await supabase
    .from('crm_deals')
    .insert({
      owner_id: user.id,
      contact_id: body.contact_id || null,
      stage_id: stageId,
      title: body.title,
      value_usd: body.value_usd || 0,
      probability: body.probability ?? 50,
      expected_close_date: body.expected_close_date || null,
      project_id: body.project_id || null,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  const patch: Record<string, any> = {};
  for (const key of [
    'title',
    'value_usd',
    'probability',
    'expected_close_date',
    'project_id',
    'contact_id',
    'stage_id',
    'notes',
    'lost_reason',
  ]) {
    if (key in body) patch[key] = body[key];
  }

  // Si el stage es win/lost, marcamos timestamps
  if (body.stage_id) {
    const { data: stage } = await supabase
      .from('crm_deal_stages')
      .select('is_win_stage, is_lost_stage')
      .eq('id', body.stage_id)
      .single();
    if (stage?.is_win_stage) patch.won_at = new Date().toISOString();
    if (stage?.is_lost_stage) patch.lost_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('crm_deals')
    .update(patch)
    .eq('id', body.id)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  const { error } = await supabase
    .from('crm_deals')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
