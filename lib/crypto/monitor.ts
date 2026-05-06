/**
 * Crypto Transaction Monitor
 *
 * Monitorea depósitos on-chain en las addresses de los usuarios.
 * Funciona con dos estrategias:
 *
 * 1. POLLING — query periódico a APIs de explorers (TronGrid, Etherscan, Polygonscan)
 * 2. WEBHOOKS — usar Alchemy Notify o Helius para eventos push
 *
 * En producción recomendamos Alchemy Notify para EVM (gratuito hasta cierto volumen).
 * Para Tron: TronGrid + polling cada 30s.
 */

import { getExplorerTxUrl, type CryptoNetwork, type CryptoToken } from '@/types/crypto';
import { getExchangeRate } from './rates';

// ============================================
// CONTRACT ADDRESSES POR RED
// ============================================
const TOKEN_CONTRACTS: Record<CryptoNetwork, Partial<Record<CryptoToken, string>>> = {
  polygon: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC native
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  },
  ethereum: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  tron: {
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // TRC20 USDT oficial
    USDC: 'TEkxiTehnzSmSe2XqrBj4w3RF1RKxwrbdB',
  },
  bsc: {
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  arbitrum: {
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  solana: {},
};

export function getTokenContract(network: CryptoNetwork, token: CryptoToken): string | null {
  return TOKEN_CONTRACTS[network]?.[token] || null;
}

// ============================================
// VERIFICAR TRANSACCIÓN (Polygon/EVM)
// ============================================
export async function verifyEvmTransaction(params: {
  network: CryptoNetwork;
  txHash: string;
}): Promise<{
  found: boolean;
  confirmations: number;
  blockNumber?: number;
  to?: string;
  from?: string;
  value?: string;
  tokenContract?: string;
  status?: string;
} | null> {
  const { network, txHash } = params;

  const apiKey = network === 'polygon' ? process.env.POLYGONSCAN_API_KEY :
                 network === 'ethereum' ? process.env.ETHERSCAN_API_KEY :
                 network === 'bsc' ? process.env.BSCSCAN_API_KEY : null;

  const apiBase = network === 'polygon' ? 'https://api.polygonscan.com' :
                  network === 'ethereum' ? 'https://api.etherscan.io' :
                  network === 'bsc' ? 'https://api.bscscan.com' : null;

  if (!apiBase || !apiKey) {
    throw new Error(`API key no configurada para ${network}`);
  }

  try {
    const [txRes, blockRes] = await Promise.all([
      fetch(`${apiBase}/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${apiKey}`),
      fetch(`${apiBase}/api?module=proxy&action=eth_blockNumber&apikey=${apiKey}`),
    ]);

    const txData = await txRes.json();
    const blockData = await blockRes.json();

    if (!txData.result) return { found: false, confirmations: 0 };

    const tx = txData.result;
    const currentBlock = parseInt(blockData.result, 16);
    const txBlock = parseInt(tx.blockNumber, 16);
    const confirmations = currentBlock - txBlock;

    return {
      found: true,
      confirmations,
      blockNumber: txBlock,
      to: tx.to?.toLowerCase(),
      from: tx.from?.toLowerCase(),
      value: tx.value,
      tokenContract: tx.to?.toLowerCase(),
      status: 'confirmed',
    };
  } catch (error) {
    console.error('Error verifying EVM tx:', error);
    return null;
  }
}

// ============================================
// VERIFICAR TRANSACCIÓN (Tron)
// ============================================
export async function verifyTronTransaction(txHash: string): Promise<{
  found: boolean;
  confirmations: number;
  to?: string;
  from?: string;
  amount?: number;
  token?: string;
  status?: string;
} | null> {
  const apiKey = process.env.TRONGRID_API_KEY;
  const apiBase = 'https://api.trongrid.io';

  try {
    const res = await fetch(`${apiBase}/v1/transactions/${txHash}`, {
      headers: apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {},
    });

    const data = await res.json();
    if (!data.data || data.data.length === 0) return { found: false, confirmations: 0 };

    const tx = data.data[0];
    const infoRes = await fetch(`${apiBase}/v1/transactions/${txHash}/events`, {
      headers: apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {},
    });
    const info = await infoRes.json();

    // Para TRC20 USDT, el evento Transfer contiene los detalles
    const transferEvent = info.data?.find((e: any) => e.event_name === 'Transfer');

    return {
      found: true,
      confirmations: tx.ret?.[0]?.contractRet === 'SUCCESS' ? 20 : 0,
      from: transferEvent?.result?.from,
      to: transferEvent?.result?.to,
      amount: transferEvent?.result?.value ? parseInt(transferEvent.result.value) / 1e6 : 0,
      token: 'USDT',
      status: tx.ret?.[0]?.contractRet === 'SUCCESS' ? 'confirmed' : 'failed',
    };
  } catch (error) {
    console.error('Error verifying Tron tx:', error);
    return null;
  }
}

// ============================================
// PROCESAR DEPÓSITO CRYPTO (end-to-end)
// ============================================
export async function processCryptoDeposit(params: {
  network: CryptoNetwork;
  token: CryptoToken;
  txHash: string;
  supabaseClient: any;
}): Promise<{
  success: boolean;
  message: string;
  transactionId?: string;
  amountUsd?: number;
}> {
  const { network, token, txHash, supabaseClient } = params;

  const existing = await supabaseClient
    .from('crypto_transactions')
    .select('id, status')
    .eq('tx_hash', txHash)
    .maybeSingle();

  if (existing.data && existing.data.status === 'completed') {
    return { success: true, message: 'Transacción ya procesada', transactionId: existing.data.id };
  }

  let txData;
  if (network === 'tron') {
    txData = await verifyTronTransaction(txHash);
  } else {
    txData = await verifyEvmTransaction({ network, txHash });
  }

  if (!txData || !txData.found) {
    return { success: false, message: 'Transacción no encontrada en la red' };
  }

  // Buscar qué usuario corresponde al address destino
  const { data: address } = await supabaseClient
    .from('crypto_addresses')
    .select('*, wallet:wallets(*)')
    .eq('address', txData.to?.toLowerCase())
    .eq('network', network)
    .eq('token', token)
    .eq('is_active', true)
    .maybeSingle();

  if (!address) {
    return { success: false, message: 'Address no registrada en el sistema' };
  }

  // Obtener rate de conversión (stablecoin ≈ 1:1 USD)
  const rate = await getExchangeRate(token, 'USD', supabaseClient);
  const amountCrypto = (txData as any).amount || 0;
  const amountUsd = amountCrypto * rate;

  // Calcular fee de plataforma (0.5%)
  const platformFeeUsd = Math.round(amountUsd * 0.005 * 100) / 100;

  // Insertar o actualizar crypto_transaction
  const confirmations = txData.confirmations || 0;
  const requiredConfirmations = network === 'tron' ? 20 : network === 'polygon' ? 30 : 12;
  const status = confirmations >= requiredConfirmations ? 'completed' : 'confirming';

  const txRecord = {
    user_id: address.user_id,
    direction: 'inbound' as const,
    network,
    token,
    tx_hash: txHash,
    from_address: txData.from?.toLowerCase() || '',
    to_address: txData.to?.toLowerCase() || '',
    amount_crypto: amountCrypto,
    amount_usd: amountUsd,
    exchange_rate: rate,
    platform_fee_usd: platformFeeUsd,
    status,
    confirmations,
    required_confirmations: requiredConfirmations,
    block_number: (txData as any).blockNumber ?? null,
    explorer_url: getExplorerTxUrl(network, txHash),
    raw_data: txData as any,
  };

  const { data: inserted, error } = existing.data
    ? await supabaseClient
        .from('crypto_transactions')
        .update(txRecord)
        .eq('id', existing.data.id)
        .select()
        .single()
    : await supabaseClient
        .from('crypto_transactions')
        .insert(txRecord)
        .select()
        .single();

  if (error) {
    console.error('Error inserting crypto tx:', error);
    return { success: false, message: error.message };
  }

  // Crear notificación si se confirmó
  if (status === 'completed') {
    await supabaseClient.from('notifications').insert({
      user_id: address.user_id,
      type: 'crypto_deposit',
      title: `Depósito crypto confirmado`,
      body: `Recibiste ${amountCrypto.toFixed(2)} ${token} (~$${amountUsd.toFixed(2)} USD)`,
      link: '/wallet',
    });
  }

  return {
    success: true,
    message: status === 'completed' ? 'Depósito procesado' : `Confirmando (${confirmations}/${requiredConfirmations})`,
    transactionId: inserted?.id,
    amountUsd,
  };
}
