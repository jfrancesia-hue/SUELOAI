import { createClient } from '@/lib/supabase-server';
import { anchorHashOnChain, getAnchorClient } from '@/lib/blockchain/anchor-client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/crypto/anchor
 * Ancla un hash en blockchain pública (Polygon)
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { hash, investment_id, hash_record_id, metadata } = await request.json();

  if (!hash) {
    return NextResponse.json({ error: 'Hash requerido' }, { status: 400 });
  }

  // Verificar que el usuario es dueño del hash_record o investment
  if (investment_id) {
    const { data: inv } = await supabase
      .from('investments')
      .select('investor_id, contract_hash')
      .eq('id', investment_id)
      .single();

    if (!inv || (inv.investor_id !== user.id && inv.contract_hash !== hash)) {
      return NextResponse.json({ error: 'No autorizado para este hash' }, { status: 403 });
    }
  }

  // Verificar si ya está anchored
  const { data: existingAnchor } = await supabase
    .from('blockchain_anchors')
    .select('*')
    .eq('hash', hash)
    .maybeSingle();

  if (existingAnchor) {
    return NextResponse.json({
      data: existingAnchor,
      message: 'Hash ya anchored previamente',
      alreadyAnchored: true,
    });
  }

  // Ejecutar anchor on-chain
  const result = await anchorHashOnChain({
    hash,
    referenceId: investment_id || hash_record_id || hash,
    metadata: metadata || '',
    supabaseClient: supabase,
    hashRecordId: hash_record_id,
    investmentId: investment_id,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Get anchor completo
  const { data: anchor } = await supabase
    .from('blockchain_anchors')
    .select('*')
    .eq('id', result.anchorId)
    .single();

  return NextResponse.json({
    data: anchor,
    message: 'Hash anchored exitosamente en Polygon',
  });
}

/**
 * GET /api/crypto/anchor?hash=xxx
 * Verifica si un hash está anchored
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');
  const verifyOnChain = searchParams.get('verify_on_chain') === 'true';

  if (!hash) {
    return NextResponse.json({ error: 'Hash requerido' }, { status: 400 });
  }

  const supabase = createClient();

  // Buscar en DB
  const { data: anchor } = await supabase
    .from('blockchain_anchors')
    .select('*')
    .eq('hash', hash)
    .maybeSingle();

  if (!anchor) {
    return NextResponse.json({ anchored: false, message: 'Hash no anchored' });
  }

  // Opcionalmente verificar on-chain
  let onChainVerification = null;
  if (verifyOnChain) {
    const client = getAnchorClient();
    if (client) {
      onChainVerification = await client.verify(hash);
    }
  }

  return NextResponse.json({
    anchored: true,
    data: anchor,
    on_chain_verification: onChainVerification,
  });
}
