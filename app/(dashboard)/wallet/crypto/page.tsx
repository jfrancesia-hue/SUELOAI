'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { isDemoMode } from '@/lib/demo';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { Button, Select, Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import { NETWORKS, type CryptoNetwork, type CryptoToken, type CryptoTransaction } from '@/types/crypto';
import {
  Bitcoin, Copy, CheckCircle2, ArrowDownToLine, ArrowUpFromLine,
  ExternalLink, AlertCircle, QrCode, Sparkles, Shield,
} from 'lucide-react';

const DEMO_MODE = isDemoMode();

const DEMO_CRYPTO_TRANSACTIONS: CryptoTransaction[] = [
  {
    id: 'demo-crypto-1',
    user_id: 'demo-investor',
    wallet_movement_id: null,
    direction: 'inbound',
    network: 'tron',
    token: 'USDT',
    tx_hash: '9b3a7d4e6f8c1a2b0d5e7f9a3c4b6d8e1f2a9b7c6d5e4f3a2b1c0d9e8f7a6b5c',
    from_address: 'TQdemoInvestorSender1111111111111111111',
    to_address: 'TQdemoSueloUSDT9xY8z7w6v5u4t3s2r1',
    amount_crypto: 1250,
    amount_usd: 1250,
    exchange_rate: 1,
    network_fee_crypto: 3.2,
    network_fee_usd: 3.2,
    platform_fee_usd: 6.25,
    status: 'completed',
    confirmations: 20,
    required_confirmations: 20,
    block_number: 61124589,
    block_timestamp: new Date().toISOString(),
    explorer_url: 'https://tronscan.org/#/transaction/9b3a7d4e6f8c1a2b0d5e7f9a3c4b6d8e1f2a9b7c6d5e4f3a2b1c0d9e8f7a6b5c',
    raw_data: null,
    confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-crypto-2',
    user_id: 'demo-investor',
    wallet_movement_id: null,
    direction: 'outbound',
    network: 'polygon',
    token: 'USDC',
    tx_hash: '0x4f2c3d7a8b9e1f0a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3',
    from_address: '0x6E0d45a31b1A8F9C2dA4E6F8C0b7D9a1F2E3C4B5',
    to_address: '0x8A7b6C5d4E3f2A1b0C9D8e7F6A5b4C3d2E1f0A9b',
    amount_crypto: 320,
    amount_usd: 320,
    exchange_rate: 1,
    network_fee_crypto: 0.08,
    network_fee_usd: 0.08,
    platform_fee_usd: 3.2,
    status: 'confirming',
    confirmations: 18,
    required_confirmations: 30,
    block_number: 70124512,
    block_timestamp: new Date().toISOString(),
    explorer_url: 'https://polygonscan.com/tx/0x4f2c3d7a8b9e1f0a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3',
    raw_data: null,
    confirmed_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEMO_ADDRESSES: Partial<Record<CryptoNetwork, string>> = {
  tron: 'TQdemoSueloUSDT9xY8z7w6v5u4t3s2r1',
  polygon: '0x6E0d45a31b1A8F9C2dA4E6F8C0b7D9a1F2E3C4B5',
  ethereum: '0x2C9B8a7F6E5d4C3b2A1f0E9d8C7b6A5F4e3D2c1B',
  bsc: '0xB0A9f8E7d6C5b4A3f2E1d0C9b8A7F6e5D4c3B2a1',
};

export default function CryptoWalletPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('tron');
  const [selectedToken, setSelectedToken] = useState<CryptoToken>('USDT');
  const [address, setAddress] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    generateAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork, selectedToken]);

  async function loadTransactions() {
    setLoading(true);
    if (DEMO_MODE) {
      setTransactions(DEMO_CRYPTO_TRANSACTIONS);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('crypto_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    setTransactions(data || []);
    setLoading(false);
  }

  async function generateAddress() {
    setGenerating(true);
    if (DEMO_MODE) {
      setAddress(DEMO_ADDRESSES[selectedNetwork] || DEMO_ADDRESSES.polygon || '');
      setQrUrl('');
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch('/api/crypto/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ network: selectedNetwork, token: selectedToken }),
      });
      const data = await res.json();
      if (data.address) {
        setAddress(data.address);
        setQrUrl(data.qr_code_url);
      }
    } catch {
      setAddress('');
      setQrUrl('');
    } finally {
      setGenerating(false);
    }
  }

  function copyAddress() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const networkInfo = NETWORKS[selectedNetwork];
  const availableTokens = networkInfo.tokens;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Bitcoin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-surface-900">
              Crypto Wallet
            </h1>
            <p className="text-surface-500 text-sm">Depositá y retirá en stablecoins</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="card bg-gradient-to-br from-brand-500/5 to-purple-500/5 border-brand-500/20">
        <div className="flex gap-4">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 mb-1">
              Invertí desde cualquier parte del mundo
            </h3>
            <p className="text-sm text-surface-600">
              Depositá USDT o USDC y tu saldo se acredita en minutos.
              Sin bancos, sin barreras cambiarias.
            </p>
            {DEMO_MODE && (
              <p className="mt-2 inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700">
                Demo visual: no envíes fondos reales a estas direcciones.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-200">
        {[
          { id: 'deposit', label: 'Depositar', icon: ArrowDownToLine },
          { id: 'withdraw', label: 'Retirar', icon: ArrowUpFromLine },
          { id: 'history', label: 'Historial', icon: Bitcoin },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-surface-500 hover:text-surface-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Deposit tab */}
      {activeTab === 'deposit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selección */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-surface-900">
              1. Elegí red y token
            </h3>

            <div>
              <label className="text-sm font-medium text-surface-700 block mb-2">
                Red blockchain
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(NETWORKS) as CryptoNetwork[])
                  .filter((n) => NETWORKS[n].recommended || n === selectedNetwork)
                  .map((net) => {
                    const info = NETWORKS[net];
                    return (
                      <button
                        key={net}
                        onClick={() => {
                          setSelectedNetwork(net);
                          if (!info.tokens.includes(selectedToken)) {
                            setSelectedToken(info.tokens[0]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedNetwork === net
                            ? 'border-brand-500 bg-brand-500/5'
                            : 'border-surface-300 hover:border-surface-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-surface-900">
                            {info.displayName}
                          </span>
                          {info.recommended && (
                            <Badge variant="success" className="text-[10px]">
                              Recomendada
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-surface-500">
                          Comisión: ~${info.feeRange.min}-{info.feeRange.max}
                        </p>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-surface-700 block mb-2">
                Token
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableTokens.map((tok) => (
                  <button
                    key={tok}
                    onClick={() => setSelectedToken(tok)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedToken === tok
                        ? 'border-brand-500 bg-brand-500/5 text-surface-900'
                        : 'border-surface-300 text-surface-600 hover:border-surface-400'
                    }`}
                  >
                    <p className="font-bold text-sm">{tok}</p>
                    <p className="text-[10px] text-surface-500 mt-0.5">
                      1 {tok} ≈ $1 USD
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200">
                <strong>Importante:</strong> Solo enviá {selectedToken} en la red {networkInfo.displayName}.
                Enviar otro token o red causa pérdida permanente de fondos.
              </div>
            </div>
          </div>

          {/* Address + QR */}
          <div>
            <h3 className="font-display text-lg font-semibold text-surface-900 mb-4">
              2. Enviá a esta dirección
            </h3>

            {generating ? (
              <LoadingSpinner />
            ) : address ? (
              <div className="card text-center">
                {qrUrl && (
                  <div className="bg-white p-4 rounded-xl inline-block mb-4">
                    <Image src={qrUrl} alt="Código QR de depósito" width={192} height={192} unoptimized className="h-48 w-48" />
                  </div>
                )}

                <p className="text-xs text-surface-500 mb-2 uppercase tracking-wider">
                  Tu dirección {selectedToken} ({networkInfo.displayName})
                </p>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-200 font-mono text-xs break-all text-surface-900 mb-3">
                  {address}
                </div>

                <Button
                  onClick={copyAddress}
                  variant={copied ? 'primary' : 'secondary'}
                  icon={copied ? CheckCircle2 : Copy}
                  className="w-full"
                >
                  {copied ? 'Copiado!' : 'Copiar dirección'}
                </Button>

                <div className="mt-4 pt-4 border-t border-surface-200 space-y-2 text-xs text-left">
                  <p className="flex items-start gap-2 text-surface-600">
                    <Shield className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" />
                    Los fondos se acreditan tras {networkInfo.confirmationsRequired} confirmaciones
                  </p>
                  <p className="flex items-start gap-2 text-surface-600">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" />
                    Comisión Suelo: 0.5% sobre monto depositado
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState icon={QrCode} title="Seleccioná red y token" />
            )}
          </div>
        </div>
      )}

      {/* Withdraw tab */}
      {activeTab === 'withdraw' && <WithdrawForm />}

      {/* History tab */}
      {activeTab === 'history' && (
        <div>
          {loading ? (
            <LoadingSpinner />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={Bitcoin}
              title="Sin transacciones crypto"
              description="Tus depósitos y retiros aparecerán acá"
            />
          ) : (
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Red
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-right p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="text-right p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-surface-200/50 last:border-0">
                      <td className="p-4 text-surface-600">{formatDate(tx.created_at)}</td>
                      <td className="p-4">
                        <Badge variant={tx.direction === 'inbound' ? 'success' : 'info'}>
                          {tx.direction === 'inbound' ? 'Depósito' : 'Retiro'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-surface-700">
                          {NETWORKS[tx.network]?.displayName || tx.network}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            tx.status === 'completed' ? 'success' :
                            tx.status === 'confirming' ? 'warning' : 'danger'
                          }
                        >
                          {tx.status === 'confirming' ? `${tx.confirmations}/${tx.required_confirmations}` : tx.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-mono font-medium text-surface-900">
                          {Number(tx.amount_crypto).toFixed(2)} {tx.token}
                        </p>
                        <p className="text-xs text-surface-500">
                          ≈ {formatCurrency(tx.amount_usd)}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        {tx.explorer_url && (
                          <a
                            href={tx.explorer_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400"
                          >
                            Ver <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// WITHDRAW FORM
// ============================================
function WithdrawForm() {
  const supabase = createClient();
  const demoMode = DEMO_MODE;
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<CryptoNetwork>('polygon');
  const [token, setToken] = useState<CryptoToken>('USDT');
  const [address, setAddress] = useState('');
  const [kycStatus, setKycStatus] = useState<string>(demoMode ? 'approved' : '');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    async function loadKyc() {
      if (demoMode) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('kyc_status').eq('id', user.id).single();
      setKycStatus(data?.kyc_status || 'not_started');
    }
    loadKyc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    if (demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setResult({
        ok: true,
        msg: 'Demo: solicitud creada. En producción se enviaría email, KYC y aprobación admin según umbral.',
      });
      setProcessing(false);
      setAmount('');
      setAddress('');
      return;
    }

    try {
      const res = await fetch('/api/crypto/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_usd: Number(amount),
          network, token,
          destination_address: address,
        }),
      });
      const data = await res.json();

      setResult({
        ok: res.ok,
        msg: res.ok ? data.message : data.error,
      });

      if (res.ok) {
        setAmount('');
        setAddress('');
      }
    } catch {
      setResult({
        ok: false,
        msg: 'No se pudo conectar con el servidor. Revisá Supabase/API y probá nuevamente.',
      });
    }
    setProcessing(false);
  }

  if (kycStatus !== 'approved') {
    return (
      <div className="card text-center py-12">
        <Shield className="w-12 h-12 text-surface-400 mx-auto mb-3" />
        <h3 className="font-display text-lg font-semibold text-surface-900">
          KYC requerido
        </h3>
        <p className="text-sm text-surface-500 mt-2 max-w-md mx-auto">
          Los retiros crypto requieren verificación de identidad (KYC).
          Este proceso toma menos de 5 minutos.
        </p>
        <Button className="mt-6" onClick={() => window.location.href = '/settings/kyc'}>
          Completar KYC
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-xl space-y-4">
      <div>
        <label className="text-sm font-medium text-surface-700 block mb-2">Monto a retirar (USD)</label>
        <input
          type="number"
          min="10"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100"
          className="input-field"
          required
        />
        <p className="text-xs text-surface-500 mt-1">Mínimo: $10 USD · Comisión plataforma: 1%</p>
      </div>

      <Select
        label="Red"
        value={network}
        onChange={(e) => setNetwork(e.target.value as CryptoNetwork)}
        options={Object.keys(NETWORKS)
          .filter((n) => NETWORKS[n as CryptoNetwork].recommended)
          .map((n) => ({ value: n, label: NETWORKS[n as CryptoNetwork].displayName }))}
      />

      <Select
        label="Token"
        value={token}
        onChange={(e) => setToken(e.target.value as CryptoToken)}
        options={NETWORKS[network].tokens.map((t) => ({ value: t, label: t }))}
      />

      <div>
        <label className="text-sm font-medium text-surface-700 block mb-2">
          Dirección destino
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x..."
          className="input-field font-mono text-xs"
          required
        />
        <p className="text-xs text-surface-500 mt-1">
          Verificá que la dirección corresponde a la red {NETWORKS[network].displayName}
        </p>
      </div>

      {result && (
        <div className={`p-3 rounded-xl ${result.ok ? 'bg-brand-500/10 text-brand-400' : 'bg-red-500/10 text-red-400'} text-sm`}>
          {result.msg}
        </div>
      )}

      <Button type="submit" loading={processing} className="w-full">
        Solicitar retiro
      </Button>

      <p className="text-xs text-surface-500 text-center">
        Retiros mayores a $1000 requieren aprobación manual (hasta 24hs)
      </p>
    </form>
  );
}
