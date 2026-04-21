/**
 * /api/secondary/listings
 *
 * GET    → lista listings (pública de "open" + propias del seller)
 * POST   → crea listing (requiere tener tokens suficientes en una investment confirmada)
 * PATCH  → update listing propia (precio, cancel)
 * DELETE → cancelar listing propia
 */

import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const onlyMine = searchParams.get('mine') === 'true';

  let query = supabase
    .from('secondary_market_listings')
    .select(
      `*,
       project:projects(id, title, location, expected_return, token_price),
       seller:profiles!seller_id(full_name)`
    )
    .order('created_at', { ascending: false });

  if (onlyMine) {
    query = query.eq('seller_id', user.id);
  } else {
    query = query.eq('status', 'open');
  }

  if (projectId) query = query.eq('project_id', projectId);

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
  const { investment_id, tokens_offered, price_per_token, notes, expires_at } = body;

  if (!investment_id || !tokens_offered || !price_per_token) {
    return NextResponse.json(
      { error: 'investment_id, tokens_offered y price_per_token requeridos' },
      { status: 400 }
    );
  }

  // Validar que la inversión existe, es del usuario y tiene los tokens disponibles
  const { data: investment } = await supabase
    .from('investments')
    .select('id, investor_id, tokens_purchased, project_id, status')
    .eq('id', investment_id)
    .single();

  if (!investment || investment.investor_id !== user.id) {
    return NextResponse.json({ error: 'Inversión no encontrada' }, { status: 404 });
  }
  if (investment.status !== 'confirmed') {
    return NextResponse.json(
      { error: 'La inversión debe estar confirmada para listarse.' },
      { status: 400 }
    );
  }

  // Verificar cuántos tokens ya están listados
  const { data: existingListings } = await supabase
    .from('secondary_market_listings')
    .select('tokens_remaining')
    .eq('investment_id', investment_id)
    .in('status', ['open', 'partial']);

  const alreadyListed = (existingListings || []).reduce(
    (s, l) => s + Number(l.tokens_remaining),
    0
  );

  if (alreadyListed + Number(tokens_offered) > Number(investment.tokens_purchased)) {
    return NextResponse.json(
      {
        error: `Tokens insuficientes. Tenés ${investment.tokens_purchased}, ya listados ${alreadyListed}.`,
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('secondary_market_listings')
    .insert({
      seller_id: user.id,
      investment_id,
      project_id: investment.project_id,
      tokens_offered: Number(tokens_offered),
      tokens_remaining: Number(tokens_offered),
      price_per_token: Number(price_per_token),
      currency: body.currency || 'USD',
      status: 'open',
      expires_at: expires_at || null,
      notes: notes || null,
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
  for (const key of ['price_per_token', 'notes', 'expires_at', 'status']) {
    if (key in body) patch[key] = body[key];
  }

  const { data, error } = await supabase
    .from('secondary_market_listings')
    .update(patch)
    .eq('id', body.id)
    .eq('seller_id', user.id)
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
    .from('secondary_market_listings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('seller_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
