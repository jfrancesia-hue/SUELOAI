import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const tag = searchParams.get('tag');

  let query = supabase
    .from('crm_contacts')
    .select('*')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`);
  if (tag) query = query.contains('tags', [tag]);

  const { data, error } = await query.limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  if (!body.full_name || typeof body.full_name !== 'string') {
    return NextResponse.json({ error: 'full_name requerido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('crm_contacts')
    .insert({
      owner_id: user.id,
      full_name: body.full_name,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      position: body.position || null,
      country: body.country || 'AR',
      tags: Array.isArray(body.tags) ? body.tags : [],
      source: body.source || null,
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
    'full_name',
    'email',
    'phone',
    'company',
    'position',
    'country',
    'tags',
    'source',
    'notes',
  ]) {
    if (key in body) patch[key] = body[key];
  }

  const { data, error } = await supabase
    .from('crm_contacts')
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

  // Soft delete
  const { error } = await supabase
    .from('crm_contacts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
