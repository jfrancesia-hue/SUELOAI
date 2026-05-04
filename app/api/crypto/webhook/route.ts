import { createAdminClient } from '@/lib/supabase-server';
import { processCryptoDeposit } from '@/lib/crypto/monitor';
import { verifyStaticWebhookSecret } from '@/lib/webhook-security';
import { NextRequest, NextResponse } from 'next/server';
import type { CryptoNetwork, CryptoToken } from '@/types/crypto';

/**
 * POST /api/crypto/webhook
 *
 * Endpoint unificado que recibe notificaciones de:
 * - Alchemy Notify (EVM: Polygon, Ethereum, BSC)
 * - TronGrid webhook (Tron)
 * - Helius (Solana)
 *
 * Body:
 * {
 *   network: 'tron' | 'polygon' | ...,
 *   token: 'USDT' | 'USDC' | ...,
 *   txHash: '0x...'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { network, token, txHash, signature } = body;

    if (!network || !token || !txHash) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    // Validar signature del webhook provider
    const webhookSecret = process.env.CRYPTO_WEBHOOK_SECRET;
    if (process.env.NODE_ENV === 'production' && !webhookSecret) {
      return NextResponse.json({ error: 'Webhook no configurado' }, { status: 503 });
    }

    if (webhookSecret && !verifyStaticWebhookSecret(String(signature || ''), webhookSecret)) {
      return NextResponse.json({ error: 'Signature inválida' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const result = await processCryptoDeposit({
      network: network as CryptoNetwork,
      token: token as CryptoToken,
      txHash,
      supabaseClient: supabase,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Crypto webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET para polling manual / verificación desde el frontend
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible en produccion' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const txHash = searchParams.get('tx_hash');
  const network = searchParams.get('network') as CryptoNetwork;
  const token = searchParams.get('token') as CryptoToken;

  if (!txHash || !network || !token) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const result = await processCryptoDeposit({
    network, token, txHash, supabaseClient: supabase
  });

  return NextResponse.json(result);
}
