import { createClient } from '@/lib/supabase-server';
import { getOrCreateAddress } from '@/lib/crypto/hd-wallet';
import { NextRequest, NextResponse } from 'next/server';
import type { CryptoNetwork, CryptoToken } from '@/types/crypto';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { network, token } = await request.json() as {
    network: CryptoNetwork;
    token: CryptoToken;
  };

  if (!network || !token) {
    return NextResponse.json({ error: 'network y token requeridos' }, { status: 400 });
  }

  const { data: wallet } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet no encontrada' }, { status: 404 });
  }

  try {
    const result = await getOrCreateAddress({
      userId: user.id,
      walletId: wallet.id,
      network,
      token,
      supabaseClient: supabase,
    });

    return NextResponse.json({
      address: result.address,
      network,
      token,
      qr_code_url: result.qr_code_url,
      instructions: [
        `Solo enviá ${token} por la red ${network.toUpperCase()}.`,
        `Enviar otro token o usar otra red resultará en pérdida permanente.`,
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
