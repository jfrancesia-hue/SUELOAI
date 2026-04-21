import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { generateHash, createContractSnapshot } from '@/utils/hash';

// GET /api/investments - Obtener inversiones del usuario
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('investments')
    .select('*, project:projects(title, location, token_price, expected_return, status)')
    .eq('investor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/investments - Crear inversión
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  const body = await request.json();
  const { project_id, tokens_purchased } = body;

  if (!project_id || !tokens_purchased || tokens_purchased < 1) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // Validar proyecto
  const { data: project } = await supabase
    .from('projects')
    .select('*, developer:profiles(full_name)')
    .eq('id', project_id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  if (project.status !== 'funding') {
    return NextResponse.json({ error: 'Proyecto no acepta inversiones actualmente' }, { status: 400 });
  }

  const availableTokens = project.total_tokens - project.sold_tokens;
  if (tokens_purchased > availableTokens) {
    return NextResponse.json({ error: `Solo quedan ${availableTokens} tokens disponibles` }, { status: 400 });
  }

  const amount = tokens_purchased * project.token_price;
  if (amount < project.min_investment) {
    return NextResponse.json({ error: `Inversión mínima: USD ${project.min_investment}` }, { status: 400 });
  }

  // Crear inversión
  const { data: investment, error: invError } = await supabase
    .from('investments')
    .insert({
      investor_id: user.id,
      project_id,
      tokens_purchased,
      amount,
      status: 'confirmed',
    })
    .select()
    .single();

  if (invError) {
    return NextResponse.json({ error: invError.message }, { status: 500 });
  }

  // Generar hash
  const dateStr = new Date().toISOString().split('T')[0];
  const snapshot = createContractSnapshot({
    investorName: profile.full_name,
    investorDni: profile.dni || '',
    projectTitle: project.title,
    amount,
    tokens: tokens_purchased,
    date: dateStr,
  });

  const contractHash = await generateHash(snapshot);

  // Actualizar inversión con hash
  await supabase
    .from('investments')
    .update({ contract_hash: contractHash })
    .eq('id', investment.id);

  // Registrar hash
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  await supabase.from('hash_records').insert({
    investment_id: investment.id,
    project_id,
    hash: contractHash,
    algorithm: 'SHA-256',
    data_snapshot: JSON.parse(snapshot),
    verified: true,
    verification_url: `${appUrl}/verify/${contractHash}`,
    created_by: user.id,
  });

  // Registrar transacción
  await supabase.from('transactions').insert({
    user_id: user.id,
    investment_id: investment.id,
    project_id,
    type: 'investment',
    amount,
    description: `Inversión de ${tokens_purchased} tokens en ${project.title}`,
  });

  return NextResponse.json({
    data: {
      ...investment,
      contract_hash: contractHash,
      verification_url: `${appUrl}/verify/${contractHash}`,
    },
  }, { status: 201 });
}
