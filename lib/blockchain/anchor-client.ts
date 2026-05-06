/**
 * Suelo Anchor Client
 *
 * Cliente TypeScript para interactuar con el smart contract SueloAnchor.sol
 * desplegado en Polygon (recomendado) o cualquier EVM chain.
 *
 * FLUJO:
 * 1. Backend tiene una private key con fondos en MATIC para pagar gas
 * 2. Cuando se genera un hash SHA-256 de un contrato, se ancla on-chain
 * 3. Se guarda la referencia en blockchain_anchors
 * 4. Usuarios pueden verificar en explorador o vía nuestra API
 *
 * COSTOS APROXIMADOS (Polygon):
 * - anchor(): ~$0.001-0.005 USD
 * - batchAnchor(100): ~$0.05-0.10 USD (0.001 cada uno)
 *
 * SETUP:
 * 1. Desplegar SueloAnchor.sol en Polygon (Remix, Hardhat, Foundry)
 * 2. Configurar vars: POLYGON_RPC_URL, ANCHOR_CONTRACT_ADDRESS, ANCHOR_PRIVATE_KEY
 * 3. Mantener saldo en MATIC (~5 USD mensuales soportan ~1000 anchors)
 */

import { ethers } from 'ethers';
import { getExplorerTxUrl } from '@/types/crypto';

// ABI mínimo del contrato
const ANCHOR_ABI = [
  'function anchor(bytes32 hash, bytes32 referenceId, string metadata) external returns (bool)',
  'function batchAnchor(bytes32[] hashes, bytes32[] referenceIds, string[] metadataArr) external',
  'function verify(bytes32 hash) external view returns (bool exists, bool valid, uint256 timestamp, address anchoredBy, string metadata)',
  'function isAnchored(bytes32 hash) external view returns (bool)',
  'function totalAnchors() external view returns (uint256)',
  'event HashAnchored(bytes32 indexed hash, bytes32 indexed referenceId, address indexed anchoredBy, uint256 timestamp, string metadata)',
];

interface AnchorConfig {
  rpcUrl: string;
  contractAddress: string;
  privateKey: string;
  network?: 'polygon' | 'ethereum' | 'base';
}

export class SueloAnchorClient {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private network: string;

  constructor(config: AnchorConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.contract = new ethers.Contract(config.contractAddress, ANCHOR_ABI, this.wallet);
    this.network = config.network || 'polygon';
  }

  /**
   * Ancla un hash SHA-256 en blockchain
   */
  async anchor(params: {
    hash: string; // hex string (sin 0x prefix o con)
    referenceId: string; // UUID o ID interno (se convierte a bytes32)
    metadata?: string; // Info adicional (project title, amount, etc)
  }): Promise<{
    success: boolean;
    txHash?: string;
    blockNumber?: number;
    explorerUrl?: string;
    costUsd?: number;
    error?: string;
  }> {
    try {
      const hashBytes32 = this.normalizeHash(params.hash);
      const refBytes32 = this.referenceToBytes32(params.referenceId);
      const metadata = params.metadata || '';

      // Estimar gas
      const estimatedGas = await this.contract.anchor.estimateGas(hashBytes32, refBytes32, metadata);
      const gasPrice = (await this.provider.getFeeData()).gasPrice || BigInt(30_000_000_000);

      // Ejecutar transacción
      const tx = await this.contract.anchor(hashBytes32, refBytes32, metadata, {
        gasLimit: estimatedGas * BigInt(12) / BigInt(10), // +20% margin
      });

      const receipt = await tx.wait();
      if (!receipt) throw new Error('No receipt');

      // Calcular costo en USD (aprox Polygon MATIC ~$0.5)
      const gasUsed = receipt.gasUsed;
      const gasCostWei = gasUsed * (receipt.gasPrice || gasPrice);
      const gasCostMatic = parseFloat(ethers.formatEther(gasCostWei));
      const maticPriceUsd = 0.5; // Aproximado, en prod usar API
      const costUsd = gasCostMatic * maticPriceUsd;

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        explorerUrl: getExplorerTxUrl(this.network as any, tx.hash),
        costUsd,
      };
    } catch (error: any) {
      console.error('Anchor error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ancla múltiples hashes en una sola transacción (gas-efficient)
   */
  async batchAnchor(items: Array<{
    hash: string;
    referenceId: string;
    metadata?: string;
  }>): Promise<{
    success: boolean;
    txHash?: string;
    blockNumber?: number;
    explorerUrl?: string;
    count: number;
    costUsd?: number;
    error?: string;
  }> {
    try {
      const hashes = items.map((i) => this.normalizeHash(i.hash));
      const refs = items.map((i) => this.referenceToBytes32(i.referenceId));
      const metadataArr = items.map((i) => i.metadata || '');

      const tx = await this.contract.batchAnchor(hashes, refs, metadataArr);
      const receipt = await tx.wait();

      const gasUsed = receipt?.gasUsed || BigInt(0);
      const gasCostWei = gasUsed * (receipt?.gasPrice || BigInt(30_000_000_000));
      const costUsd = parseFloat(ethers.formatEther(gasCostWei)) * 0.5;

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber,
        explorerUrl: getExplorerTxUrl(this.network as any, tx.hash),
        count: items.length,
        costUsd,
      };
    } catch (error: any) {
      return { success: false, count: 0, error: error.message };
    }
  }

  /**
   * Verifica si un hash existe on-chain
   */
  async verify(hash: string): Promise<{
    exists: boolean;
    valid: boolean;
    timestamp?: Date;
    anchoredBy?: string;
    metadata?: string;
  }> {
    try {
      const hashBytes32 = this.normalizeHash(hash);
      const result = await this.contract.verify(hashBytes32);

      return {
        exists: result[0],
        valid: result[1],
        timestamp: result[2] > 0 ? new Date(Number(result[2]) * 1000) : undefined,
        anchoredBy: result[3],
        metadata: result[4],
      };
    } catch (error) {
      return { exists: false, valid: false };
    }
  }

  /**
   * Balance del wallet operador (para alertas)
   */
  async getOperatorBalance(): Promise<{
    balanceEth: string;
    balanceUsd: number;
    anchorsRemaining: number;
  }> {
    const balance = await this.provider.getBalance(this.wallet.address);
    const balanceEth = ethers.formatEther(balance);
    const maticPriceUsd = 0.5;
    const balanceUsd = parseFloat(balanceEth) * maticPriceUsd;
    const avgCostPerAnchor = 0.003;
    const anchorsRemaining = Math.floor(balanceUsd / avgCostPerAnchor);

    return { balanceEth, balanceUsd, anchorsRemaining };
  }

  // ============================================
  // HELPERS
  // ============================================
  private normalizeHash(hash: string): string {
    const clean = hash.startsWith('0x') ? hash : `0x${hash}`;
    if (clean.length !== 66) {
      throw new Error(`Hash debe ser bytes32 (64 hex chars). Recibido: ${hash.length}`);
    }
    return clean;
  }

  private referenceToBytes32(ref: string): string {
    const noHyphens = ref.replace(/-/g, '');
    if (noHyphens.length === 32 && /^[0-9a-f]+$/i.test(noHyphens)) {
      return `0x${noHyphens}`;
    }
    return ethers.keccak256(ethers.toUtf8Bytes(ref));
  }
}

// ============================================
// SINGLETON
// ============================================
let _client: SueloAnchorClient | null = null;

export function getAnchorClient(): SueloAnchorClient | null {
  if (_client) return _client;

  const rpcUrl = process.env.POLYGON_RPC_URL;
  const contractAddress = process.env.ANCHOR_CONTRACT_ADDRESS;
  const privateKey = process.env.ANCHOR_PRIVATE_KEY;

  if (!rpcUrl || !contractAddress || !privateKey) {
    console.warn('Blockchain anchoring deshabilitado (faltan env vars)');
    return null;
  }

  _client = new SueloAnchorClient({ rpcUrl, contractAddress, privateKey });
  return _client;
}

/**
 * Helper para anchor desde cualquier parte del código
 */
export async function anchorHashOnChain(params: {
  hash: string;
  referenceId: string;
  metadata?: string;
  supabaseClient: any;
  hashRecordId?: string;
  investmentId?: string;
}): Promise<{ success: boolean; anchorId?: string; error?: string }> {
  const client = getAnchorClient();
  if (!client) {
    return { success: false, error: 'Anchoring no habilitado' };
  }

  const result = await client.anchor(params);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  const { data: anchor, error } = await params.supabaseClient
    .from('blockchain_anchors')
    .insert({
      hash_record_id: params.hashRecordId || null,
      investment_id: params.investmentId || null,
      hash: params.hash,
      network: 'polygon',
      contract_address: process.env.ANCHOR_CONTRACT_ADDRESS!,
      tx_hash: result.txHash!,
      block_number: result.blockNumber,
      explorer_url: result.explorerUrl!,
      cost_usd: result.costUsd,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, anchorId: anchor.id };
}
