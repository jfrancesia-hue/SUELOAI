// ============================================
// Suelo v3 — Crypto Types
// ============================================

export type CryptoNetwork =
  | 'tron' | 'ethereum' | 'polygon' | 'bsc' | 'solana' | 'base' | 'arbitrum';

export type CryptoToken =
  | 'USDT' | 'USDC' | 'DAI' | 'BTC' | 'ETH' | 'MATIC';

export type CryptoTxStatus =
  | 'pending' | 'confirming' | 'completed' | 'failed' | 'dropped' | 'refunded';

export type CryptoTxDirection = 'inbound' | 'outbound';

export interface CryptoAddress {
  id: string;
  user_id: string;
  wallet_id: string;
  network: CryptoNetwork;
  address: string;
  token: CryptoToken;
  derivation_path: string | null;
  provider: string | null;
  provider_address_id: string | null;
  is_active: boolean;
  memo: string | null;
  qr_code_url: string | null;
  created_at: string;
}

export interface CryptoTransaction {
  id: string;
  user_id: string;
  wallet_movement_id: string | null;
  direction: CryptoTxDirection;
  network: CryptoNetwork;
  token: CryptoToken;
  tx_hash: string;
  from_address: string;
  to_address: string;
  amount_crypto: number;
  amount_usd: number;
  exchange_rate: number | null;
  network_fee_crypto: number | null;
  network_fee_usd: number | null;
  platform_fee_usd: number;
  status: CryptoTxStatus;
  confirmations: number;
  required_confirmations: number;
  block_number: number | null;
  block_timestamp: string | null;
  explorer_url: string | null;
  raw_data: Record<string, unknown> | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlockchainAnchor {
  id: string;
  hash_record_id: string | null;
  investment_id: string | null;
  document_id: string | null;
  hash: string;
  network: CryptoNetwork;
  contract_address: string | null;
  tx_hash: string;
  block_number: number | null;
  block_timestamp: string | null;
  explorer_url: string;
  gas_used: number | null;
  cost_usd: number | null;
  status: string;
  created_by: string | null;
  created_at: string;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  source: string;
  timestamp: string;
}

export interface CryptoWithdrawalRequest {
  id: string;
  user_id: string;
  wallet_id: string;
  amount_usd: number;
  amount_crypto: number;
  network: CryptoNetwork;
  token: CryptoToken;
  destination_address: string;
  memo: string | null;
  status: string;
  approved_by: string | null;
  rejection_reason: string | null;
  crypto_transaction_id: string | null;
  network_fee_estimated: number | null;
  platform_fee_usd: number;
  total_debit_usd: number | null;
  two_fa_verified: boolean;
  email_verified: boolean;
  approved_at: string | null;
  processed_at: string | null;
  created_at: string;
}

// ============================================
// NETWORK METADATA
// ============================================
export interface NetworkInfo {
  id: CryptoNetwork;
  displayName: string;
  nativeCurrency: string;
  tokens: CryptoToken[];
  explorerBaseUrl: string;
  chainId?: number;
  rpcUrl?: string;
  confirmationsRequired: number;
  avgBlockTime: number;
  feeRange: { min: number; max: number; unit: string };
  recommended: boolean;
  mainnet: boolean;
}

export const NETWORKS: Record<CryptoNetwork, NetworkInfo> = {
  tron: {
    id: 'tron',
    displayName: 'Tron (TRC20)',
    nativeCurrency: 'TRX',
    tokens: ['USDT', 'USDC'],
    explorerBaseUrl: 'https://tronscan.org',
    confirmationsRequired: 20,
    avgBlockTime: 3,
    feeRange: { min: 1, max: 5, unit: 'USD' },
    recommended: true,
    mainnet: true,
  },
  polygon: {
    id: 'polygon',
    displayName: 'Polygon',
    nativeCurrency: 'MATIC',
    tokens: ['USDT', 'USDC', 'DAI'],
    explorerBaseUrl: 'https://polygonscan.com',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    confirmationsRequired: 30,
    avgBlockTime: 2,
    feeRange: { min: 0.01, max: 0.5, unit: 'USD' },
    recommended: true,
    mainnet: true,
  },
  ethereum: {
    id: 'ethereum',
    displayName: 'Ethereum',
    nativeCurrency: 'ETH',
    tokens: ['USDT', 'USDC', 'DAI'],
    explorerBaseUrl: 'https://etherscan.io',
    chainId: 1,
    confirmationsRequired: 12,
    avgBlockTime: 12,
    feeRange: { min: 5, max: 50, unit: 'USD' },
    recommended: false,
    mainnet: true,
  },
  bsc: {
    id: 'bsc',
    displayName: 'BNB Smart Chain',
    nativeCurrency: 'BNB',
    tokens: ['USDT', 'USDC'],
    explorerBaseUrl: 'https://bscscan.com',
    chainId: 56,
    confirmationsRequired: 15,
    avgBlockTime: 3,
    feeRange: { min: 0.1, max: 1, unit: 'USD' },
    recommended: false,
    mainnet: true,
  },
  solana: {
    id: 'solana',
    displayName: 'Solana',
    nativeCurrency: 'SOL',
    tokens: ['USDT', 'USDC'],
    explorerBaseUrl: 'https://solscan.io',
    confirmationsRequired: 1,
    avgBlockTime: 0.4,
    feeRange: { min: 0.00001, max: 0.01, unit: 'USD' },
    recommended: false,
    mainnet: true,
  },
  base: {
    id: 'base',
    displayName: 'Base',
    nativeCurrency: 'ETH',
    tokens: ['USDC'],
    explorerBaseUrl: 'https://basescan.org',
    chainId: 8453,
    confirmationsRequired: 10,
    avgBlockTime: 2,
    feeRange: { min: 0.05, max: 1, unit: 'USD' },
    recommended: false,
    mainnet: true,
  },
  arbitrum: {
    id: 'arbitrum',
    displayName: 'Arbitrum One',
    nativeCurrency: 'ETH',
    tokens: ['USDT', 'USDC'],
    explorerBaseUrl: 'https://arbiscan.io',
    chainId: 42161,
    confirmationsRequired: 1,
    avgBlockTime: 0.25,
    feeRange: { min: 0.1, max: 2, unit: 'USD' },
    recommended: false,
    mainnet: true,
  },
};

export function getNetworkInfo(network: CryptoNetwork): NetworkInfo {
  return NETWORKS[network];
}

export function getExplorerTxUrl(network: CryptoNetwork, txHash: string): string {
  return `${NETWORKS[network].explorerBaseUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(network: CryptoNetwork, address: string): string {
  return `${NETWORKS[network].explorerBaseUrl}/address/${address}`;
}
