'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-browser';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { Button, Select, Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import { NETWORKS, type CryptoNetwork, type CryptoToken, type CryptoTransaction } from '@/types/crypto';
import {
  Bitcoin, Copy, CheckCircle2, ArrowDownToLine, ArrowUpFromLine,
  ExternalLink, AlertCircle, QrCode, Sparkles, Shield,
} from 'lucide-react';

export default function CryptoWalletPage() {
  const supabase = useMemo(() => createClient(), []);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('tron');
  const [selectedToken, setSelectedToken] = useState<CryptoToken>('USDT');
  const [address, setAddress] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setTransactions([]);
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
  }, [supabase]);

  const generateAddress = useCallback(async () => {
    setGenerating(true);
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
    setGenerating(false);
  }, [selectedNetwork, selectedToken]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    generateAddress();
  }, [generateAddress]);

  function copyAddress() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const networkInfo = NETWORKS[selectedNetwork];
  const availableTokens = networkInfo.tokens;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <div className="mb-2 flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
            <Bitcoin className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-surface-900">
              Crypto Wallet
            </h1>
            <p className="text-surface-500 text-sm">Depositá y retirá en stablecoins</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="card bg-gradient-to-br from-brand-500/5 to-purple-500/5 border-brand-500/20">
        <div className="flex min-w-0 gap-4">
          <div className="shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20">
              <Sparkles className="h-5 w-5 text-brand-400" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-surface-900 mb-1">
              Invertí desde cualquier parte del mundo
            </h3>
            <p className="text-sm text-surface-600">
              Depositá USDT o USDC y tu saldo se acredita en minutos.
              Sin bancos, sin barreras cambiarias.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-surface-200">
        {[
          { id: 'deposit', label: 'Depositar', icon: ArrowDownToLine },
          { id: 'withdraw', label: 'Retirar', icon: ArrowUpFromLine },
          { id: 'history', label: 'Historial', icon: Bitcoin },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-surface-500 hover:text-surface-700'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
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
                        className={`min-w-0 rounded-xl border p-3 text-left transition-all ${
                          selectedNetwork === net
                            ? 'border-brand-500 bg-brand-500/5'
                            : 'border-surface-300 hover:border-surface-400'
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate text-sm font-semibold text-surface-900">
                            {info.displayName}
                          </span>
                          {info.recommended && (
                            <Badge variant="success" className="shrink-0 text-[10px]">
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
                    className={`min-h-[76px] rounded-xl border p-3 text-center transition-all ${
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
            <div className="flex gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
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
                  <div className="mb-4 inline-block rounded-xl bg-white p-4">
                    <Image
                      src={qrUrl}
                      alt="QR Code"
                      width={192}
                      height={192}
                      unoptimized
                      className="h-48 w-48 max-w-full"
                    />
                  </div>
                )}

                <p className="text-xs text-surface-500 mb-2 uppercase tracking-wider">
                  Tu dirección {selectedToken} ({networkInfo.displayName})
                </p>

                <div className="mb-3 flex items-start gap-2 break-all rounded-xl bg-surface-200 p-3 text-left font-mono text-xs text-surface-900">
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
                    <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                    Los fondos se acreditan tras {networkInfo.confirmationsRequired} confirmaciones
                  </p>
                  <p className="flex items-start gap-2 text-surface-600">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
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
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-sm">
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
                            Ver <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
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
  const supabase = useMemo(() => createClient(), []);
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<CryptoNetwork>('polygon');
  const [token, setToken] = useState<CryptoToken>('USDT');
  const [address, setAddress] = useState('');
  const [kycStatus, setKycStatus] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    async function loadKyc() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('kyc_status').eq('id', user.id).single();
      setKycStatus(data?.kyc_status || 'not_started');
    }
    loadKyc();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

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
    setProcessing(false);

    if (res.ok) {
      setAmount('');
      setAddress('');
    }
  }

  if (kycStatus !== 'approved') {
    return (
      <div className="card py-12 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-200">
          <Shield className="h-7 w-7 text-surface-500" />
        </div>
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
