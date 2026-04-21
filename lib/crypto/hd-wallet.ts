/**
 * HD Wallet Manager
 *
 * Genera addresses determinísticas por usuario a partir de un xpub maestro.
 * NUNCA guardamos la private key en el servidor — solo derivamos addresses públicas.
 *
 * La master seed debe estar en un HSM / vault externo, o usamos provider custodial
 * (Circle, BitGo, Fireblocks) para no manejar keys directamente.
 *
 * Para el MVP usamos Tron Web y ethers.js con xpub público.
 * Para producción real: migrar a Fireblocks o BitGo.
 */

import { ethers } from 'ethers';
import type { CryptoNetwork, CryptoToken } from '@/types/crypto';

// ============================================
// CONFIG
// ============================================
const MASTER_XPUB_EVM = process.env.CRYPTO_MASTER_XPUB_EVM!;
const MASTER_XPUB_TRON = process.env.CRYPTO_MASTER_XPUB_TRON!;

// ============================================
// DERIVACIÓN DE ADDRESSES (EVM: Polygon, Ethereum, BSC)
// ============================================
export function deriveEvmAddress(userId: string, index: number = 0): {
  address: string;
  derivationPath: string;
} {
  // Convertimos userId a número determinístico dentro del rango BIP32
  const userIndex = parseInt(userId.replace(/-/g, '').slice(0, 8), 16) % 2_000_000_000;
  const path = `m/44'/60'/0'/0/${userIndex}${index > 0 ? `/${index}` : ''}`;

  if (!MASTER_XPUB_EVM) {
    throw new Error('CRYPTO_MASTER_XPUB_EVM no configurado');
  }

  const hdNode = ethers.HDNodeWallet.fromExtendedKey(MASTER_XPUB_EVM);
  const derived = (hdNode as ethers.HDNodeWallet).derivePath(`0/${userIndex}`);

  return {
    address: derived.address.toLowerCase(),
    derivationPath: path,
  };
}

// ============================================
// DERIVACIÓN DE ADDRESSES (TRON)
// ============================================
export async function deriveTronAddress(userId: string, index: number = 0): Promise<{
  address: string;
  derivationPath: string;
}> {
  // Para Tron usamos tronweb. Como alternativa simple, derivamos con BIP44 coin 195
  const userIndex = parseInt(userId.replace(/-/g, '').slice(0, 8), 16) % 2_000_000_000;
  const path = `m/44'/195'/0'/0/${userIndex}${index > 0 ? `/${index}` : ''}`;

  // IMPORTANTE: En producción usar TronWeb con xpub Tron.
  // Placeholder que requiere integración real con Fireblocks o Bitso.
  if (!MASTER_XPUB_TRON) {
    throw new Error('CRYPTO_MASTER_XPUB_TRON no configurado. Recomendamos usar custodial provider.');
  }

  // Para producción real, integrar con provider custodial:
  // - Fireblocks: crear vault asset por usuario
  // - Bitso Business: API de creación de addresses
  // - Circle Programmable Wallets: developer-controlled wallets

  throw new Error(
    'Tron HD derivation requires custodial integration. ' +
    'Use Fireblocks, Bitso Business, or Circle. ' +
    'See docs/CRYPTO-SETUP.md'
  );
}

// ============================================
// OBTENER O CREAR ADDRESS
// ============================================
export async function getOrCreateAddress(params: {
  userId: string;
  walletId: string;
  network: CryptoNetwork;
  token: CryptoToken;
  supabaseClient: any;
}): Promise<{ address: string; derivation_path: string | null; qr_code_url: string }> {
  const { userId, walletId, network, token, supabaseClient } = params;

  // Buscar si ya existe
  const { data: existing } = await supabaseClient
    .from('crypto_addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('network', network)
    .eq('token', token)
    .eq('is_active', true)
    .maybeSingle();

  if (existing) {
    return {
      address: existing.address,
      derivation_path: existing.derivation_path,
      qr_code_url: existing.qr_code_url || generateQrUrl(existing.address, token, network),
    };
  }

  // Crear nueva address según red
  let address: string;
  let derivationPath: string | null;
  let provider: string;

  switch (network) {
    case 'polygon':
    case 'ethereum':
    case 'bsc':
    case 'base':
    case 'arbitrum': {
      const derived = deriveEvmAddress(userId);
      address = derived.address;
      derivationPath = derived.derivationPath;
      provider = 'hd_wallet_evm';
      break;
    }
    case 'tron': {
      // En MVP, usar provider custodial como Bitso
      // Por ahora usar una address específica + memo como identificador
      const memo = userId.slice(0, 8).toUpperCase();
      address = process.env.BITSO_TRON_HOT_WALLET || 'TSharedWalletAddress';
      derivationPath = null;
      provider = 'bitso_shared_memo';

      const { error } = await supabaseClient.from('crypto_addresses').insert({
        user_id: userId,
        wallet_id: walletId,
        network,
        token,
        address,
        derivation_path: derivationPath,
        provider,
        memo,
        qr_code_url: generateQrUrl(address, token, network, memo),
        is_active: true,
      });

      if (error) throw error;

      return { address, derivation_path: null, qr_code_url: generateQrUrl(address, token, network, memo) };
    }
    case 'solana': {
      throw new Error('Solana support via custodial provider (pending)');
    }
    default:
      throw new Error(`Network no soportada: ${network}`);
  }

  // Persistir en DB
  const qrUrl = generateQrUrl(address, token, network);
  const { error } = await supabaseClient.from('crypto_addresses').insert({
    user_id: userId,
    wallet_id: walletId,
    network,
    token,
    address,
    derivation_path: derivationPath,
    provider,
    qr_code_url: qrUrl,
    is_active: true,
  });

  if (error) throw error;

  return { address, derivation_path: derivationPath, qr_code_url: qrUrl };
}

// ============================================
// QR CODE URL (usamos servicio gratuito)
// ============================================
function generateQrUrl(address: string, token: CryptoToken, network: CryptoNetwork, memo?: string): string {
  // Formato estándar compatible con wallets mobile:
  const prefix = network === 'ethereum' ? 'ethereum:' :
                 network === 'polygon' ? 'polygon:' :
                 network === 'tron' ? 'tron:' :
                 network === 'bsc' ? 'bsc:' : '';
  const data = memo ? `${prefix}${address}?memo=${memo}` : `${prefix}${address}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
}

// ============================================
// VALIDACIÓN DE ADDRESS
// ============================================
export function isValidAddress(address: string, network: CryptoNetwork): boolean {
  try {
    switch (network) {
      case 'polygon':
      case 'ethereum':
      case 'bsc':
      case 'base':
      case 'arbitrum':
        return ethers.isAddress(address);
      case 'tron':
        return /^T[A-Za-z0-9]{33}$/.test(address);
      case 'solana':
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      default:
        return false;
    }
  } catch {
    return false;
  }
}
