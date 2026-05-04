'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Bitcoin,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Copy,
  Download,
  Filter,
  Landmark,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  TrendingUp,
  Wallet as WalletIcon,
  XCircle,
} from 'lucide-react';
import type { Wallet, WalletMovement } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { Badge, Button, EmptyState, Input, LoadingSpinner } from '@/components/ui';

type WalletResponse = {
  wallet: Wallet;
  movements: WalletMovement[];
  profile: {
    id: string;
    email: string;
    full_name: string;
    kyc_verified?: boolean;
    kyc_status?: string;
    investor_level?: string;
  } | null;
};

type ActionMode = 'deposit' | 'withdraw' | 'transfer';
type FilterType = 'all' | WalletMovement['type'];
type FilterStatus = 'all' | WalletMovement['status'];

const typeLabel: Record<string, string> = {
  deposit: 'Depósito',
  withdrawal: 'Retiro',
  investment: 'Inversión',
  return: 'Renta',
  fee: 'Comisión',
  transfer_in: 'Transferencia recibida',
  transfer_out: 'Transferencia enviada',
  refund: 'Reintegro',
  crypto_deposit: 'Depósito crypto',
  crypto_withdrawal: 'Retiro crypto',
};

const statusLabel: Record<string, string> = {
  completed: 'Completado',
  pending: 'Pendiente',
  failed: 'Fallido',
  cancelled: 'Cancelado',
};

function money(value: number, currency = 'USD') {
  return formatCurrency(Number(value || 0), currency);
}

function isIncome(type: string) {
  return ['deposit', 'return', 'transfer_in', 'refund', 'crypto_deposit'].includes(type);
}

function movementIcon(type: string) {
  if (type === 'deposit' || type === 'crypto_deposit') return ArrowDownLeft;
  if (type === 'withdrawal' || type === 'crypto_withdrawal') return ArrowUpRight;
  if (type === 'transfer_out') return Send;
  if (type === 'transfer_in') return ArrowDownRight;
  if (type === 'investment') return Landmark;
  if (type === 'return') return TrendingUp;
  return CircleDollarSign;
}

function WalletSparkline({ values }: { values: number[] }) {
  const width = 420;
  const height = 120;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => {
    const x = (index / Math.max(1, values.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 12) - 6;
    return `${x},${y}`;
  });
  const area = `0,${height} ${points.join(' ')} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" aria-label="Evolución de balance">
      <defs>
        <linearGradient id="walletSpark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#walletSpark)" />
      <polyline points={points.join(' ')} fill="none" stroke="#34D399" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
    </svg>
  );
}

export default function WalletPage() {
  const searchParams = useSearchParams();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [movements, setMovements] = useState<WalletMovement[]>([]);
  const [profile, setProfile] = useState<WalletResponse['profile']>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mode, setMode] = useState<ActionMode>('deposit');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const [depositAmount, setDepositAmount] = useState('500');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDestination, setWithdrawDestination] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank_transfer' | 'crypto'>('bank_transfer');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
  const [transferNote, setTransferNote] = useState('');

  useEffect(() => {
    loadWallet();
    const status = searchParams.get('status');
    if (status === 'success') setMessage({ type: 'success', text: 'Pago aprobado. El saldo se acreditará cuando Mercado Pago confirme el webhook.' });
    if (status === 'pending') setMessage({ type: 'info', text: 'Pago pendiente. Te avisamos apenas se acredite.' });
    if (status === 'failure') setMessage({ type: 'error', text: 'El pago no se pudo completar.' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadWallet(silent = false) {
    if (silent) setRefreshing(true);
    else setLoading(true);

    const response = await fetch('/api/wallet', { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok) {
      setMessage({ type: 'error', text: data.error || 'No pudimos cargar tu billetera' });
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setWallet(data.wallet);
    setMovements(data.movements || []);
    setProfile(data.profile || null);
    setLoading(false);
    setRefreshing(false);
  }

  async function submitDeposit(event: FormEvent) {
    event.preventDefault();
    setProcessing(true);
    setMessage(null);

    const response = await fetch('/api/wallet/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(depositAmount), currency: wallet?.currency || 'USD' }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage({ type: 'error', text: data.error || 'No pudimos iniciar el depósito' });
      setProcessing(false);
      return;
    }

    if (data.init_point) {
      window.location.href = data.init_point;
      return;
    }

    setMessage({ type: 'success', text: data.message || 'Saldo acreditado' });
    setDepositAmount('');
    await loadWallet(true);
    setProcessing(false);
  }

  async function submitWithdraw(event: FormEvent) {
    event.preventDefault();
    setProcessing(true);
    setMessage(null);

    const response = await fetch('/api/wallet/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Number(withdrawAmount),
        destination: withdrawDestination,
        method: withdrawMethod,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage({ type: 'error', text: data.error || 'No pudimos procesar el retiro' });
    } else {
      setMessage({ type: 'success', text: `Retiro registrado. Comisión: ${money(data.fee || 0)}` });
      setWithdrawAmount('');
      setWithdrawDestination('');
      await loadWallet(true);
    }
    setProcessing(false);
  }

  async function submitTransfer(event: FormEvent) {
    event.preventDefault();
    setProcessing(true);
    setMessage(null);

    const response = await fetch('/api/wallet/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Number(transferAmount),
        recipientEmail: transferEmail,
        note: transferNote,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage({ type: 'error', text: data.error || 'No pudimos enviar la transferencia' });
    } else {
      setMessage({ type: 'success', text: 'Transferencia enviada y acreditada' });
      setTransferAmount('');
      setTransferEmail('');
      setTransferNote('');
      await loadWallet(true);
    }
    setProcessing(false);
  }

  const summary = useMemo(() => {
    if (!wallet) return null;
    const available = Number(wallet.balance_available || 0);
    const locked = Number(wallet.balance_locked || 0);
    const returns = Number(wallet.balance_returns || 0);
    const total = available + locked + returns;
    const completed = movements.filter((movement) => movement.status === 'completed');
    const income = completed.filter((movement) => isIncome(movement.type)).reduce((sum, movement) => sum + Number(movement.amount), 0);
    const outcome = completed.filter((movement) => !isIncome(movement.type)).reduce((sum, movement) => sum + Number(movement.amount), 0);
    const pending = movements.filter((movement) => movement.status === 'pending').reduce((sum, movement) => sum + Number(movement.amount), 0);
    const spark = [...completed].reverse().reduce<number[]>((values, movement) => {
      const prev = values.length ? values[values.length - 1] : Math.max(0, total - income + outcome);
      values.push(Math.max(0, prev + (isIncome(movement.type) ? Number(movement.amount) : -Number(movement.amount))));
      return values;
    }, []);
    return {
      available,
      locked,
      returns,
      total,
      income,
      outcome,
      pending,
      spark: spark.length > 1 ? spark : [0, available * 0.25, available * 0.72, total],
    };
  }, [movements, wallet]);

  const filteredMovements = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return movements.filter((movement) => {
      const matchesType = typeFilter === 'all' || movement.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || movement.status === statusFilter;
      const matchesQuery = !normalizedQuery
        || movement.description?.toLowerCase().includes(normalizedQuery)
        || movement.reference_code?.toLowerCase().includes(normalizedQuery)
        || movement.provider_reference?.toLowerCase().includes(normalizedQuery);
      return matchesType && matchesStatus && matchesQuery;
    });
  }, [movements, query, statusFilter, typeFilter]);

  function exportCsv() {
    const rows = [
      ['fecha', 'tipo', 'estado', 'monto', 'moneda', 'referencia', 'descripcion'],
      ...filteredMovements.map((movement) => [
        movement.created_at,
        movement.type,
        movement.status,
        movement.amount,
        movement.currency,
        movement.reference_code,
        movement.description || '',
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `suelo-wallet-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyWalletId() {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet.id);
    setMessage({ type: 'success', text: 'ID de billetera copiado' });
  }

  if (loading) return <LoadingSpinner />;
  if (!wallet || !summary) {
    return (
      <EmptyState
        icon={WalletIcon}
        title="No pudimos cargar tu billetera"
        description="Probá actualizar la página o iniciar sesión nuevamente."
      />
    );
  }

  const isVerified = Boolean(profile?.kyc_verified || profile?.kyc_status === 'approved');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400">Billetera virtual</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.02em] text-surface-900 md:text-4xl">
            Tu capital listo para invertir.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/68">
            Cargá saldo, transferí entre usuarios, solicitá retiros y seguí cada movimiento con trazabilidad.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={RefreshCw} loading={refreshing} onClick={() => loadWallet(true)}>
            Actualizar
          </Button>
          <Button variant="ghost" icon={Download} onClick={exportCsv} className="text-white/68 hover:text-white">
            Exportar CSV
          </Button>
          <Link href="/wallet/crypto" className="btn-secondary min-h-11 text-sm">
            <Bitcoin className="h-4 w-4 shrink-0" />
            Crypto
          </Link>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
            message.type === 'success'
              ? 'border-brand-500/20 bg-brand-500/10 text-brand-300'
              : message.type === 'error'
              ? 'border-red-500/20 bg-red-500/10 text-red-300'
              : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : message.type === 'error' ? <XCircle className="mt-0.5 h-4 w-4" /> : <Clock3 className="mt-0.5 h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111F] p-6 text-white shadow-[0_28px_90px_-48px_rgba(16,185,129,0.45)] md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_80%_28%,rgba(6,182,212,0.14),transparent_32%),linear-gradient(135deg,#07111F,#111827)]" />
          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            <div>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10">
                    <WalletIcon className="h-5 w-5 text-emerald-300" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Wallet Suelo</p>
                    <button onClick={copyWalletId} className="mt-1 flex max-w-full items-center gap-1.5 text-xs text-white/45 hover:text-white/75">
                      {wallet.id.slice(0, 8)}...{wallet.id.slice(-6)}
                      <Copy className="h-3 w-3 shrink-0" />
                    </button>
                  </div>
                </div>
                <Badge variant={wallet.is_active ? 'success' : 'danger'}>{wallet.is_active ? 'Activa' : 'Inactiva'}</Badge>
              </div>

              <p className="text-sm text-white/48">Balance total</p>
              <p className="mt-2 break-words font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl md:text-7xl">
                {money(summary.total, wallet.currency)}
              </p>
              <p className="mt-3 text-sm text-white/48">
                Disponible para invertir: <span className="font-semibold text-emerald-300">{money(summary.available, wallet.currency)}</span>
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  { key: 'deposit' as const, icon: Plus, label: 'Cargar saldo' },
                  { key: 'withdraw' as const, icon: ArrowUpRight, label: 'Retirar' },
                  { key: 'transfer' as const, icon: Send, label: 'Transferir' },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none ${
                      mode === key
                        ? 'bg-emerald-300 text-[#03130D]'
                        : 'border border-white/10 bg-white/[0.06] text-white/76 hover:bg-white/[0.09]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="whitespace-nowrap">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Flujo</p>
                <span className="text-xs text-emerald-300">Últimos movimientos</span>
              </div>
              <div className="h-40">
                <WalletSparkline values={summary.spark} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <ArrowDownLeft className="mb-2 h-4 w-4 text-emerald-300" />
                  <p className="text-xs text-white/45">Ingresos</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-white">{money(summary.income)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <ArrowUpRight className="mb-2 h-4 w-4 text-amber-300" />
                  <p className="text-xs text-white/45">Egresos</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-white">{money(summary.outcome)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="wallet-action-panel rounded-[28px] border border-white/10 bg-[#0B0F0D]/92 p-5 shadow-[0_24px_80px_-56px_rgba(0,0,0,0.9)] md:p-6">
          {mode === 'deposit' && (
            <form onSubmit={submitDeposit} className="space-y-5">
              <ActionHeader icon={Plus} title="Cargar saldo" description="Mercado Pago si está configurado; fallback manual en desarrollo." />
              <Input
                id="depositAmount"
                label="Monto"
                type="number"
                min={100}
                step={50}
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                hint="Mínimo $100"
              />
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2500].map((value) => (
                  <button key={value} type="button" onClick={() => setDepositAmount(String(value))} className="rounded-xl border border-surface-300 bg-surface-150 px-3 py-2 text-sm text-surface-800 hover:border-brand-500/40">
                    {money(value)}
                  </button>
                ))}
              </div>
              <Button type="submit" loading={processing} icon={ArrowRight} iconPosition="right" className="w-full">
                Confirmar carga
              </Button>
            </form>
          )}

          {mode === 'withdraw' && (
            <form onSubmit={submitWithdraw} className="space-y-5">
              <ActionHeader icon={Banknote} title="Retirar fondos" description="Registra un retiro bancario o crypto con comisión estimada de 0,6%." />
              <Input
                id="withdrawAmount"
                label="Monto"
                type="number"
                min={10}
                step={10}
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value)}
                hint={`Disponible: ${money(summary.available, wallet.currency)}`}
              />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'bank_transfer' as const, label: 'Banco/CVU' },
                  { value: 'crypto' as const, label: 'Crypto' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setWithdrawMethod(item.value)}
                    className={`rounded-xl border px-3 py-2 text-sm ${withdrawMethod === item.value ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-surface-300 bg-surface-150 text-surface-700'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <Input
                id="withdrawDestination"
                label={withdrawMethod === 'crypto' ? 'Dirección destino' : 'CBU / CVU / cuenta destino'}
                value={withdrawDestination}
                onChange={(event) => setWithdrawDestination(event.target.value)}
                placeholder={withdrawMethod === 'crypto' ? '0x..., T..., o dirección USDT' : 'CBU/CVU o alias'}
              />
              <KycNotice isVerified={isVerified} />
              <Button type="submit" loading={processing} icon={ArrowUpRight} iconPosition="right" className="w-full">
                Solicitar retiro
              </Button>
            </form>
          )}

          {mode === 'transfer' && (
            <form onSubmit={submitTransfer} className="space-y-5">
              <ActionHeader icon={Send} title="Transferir a otro usuario" description="Envía saldo interno a un usuario registrado por email." />
              <Input
                id="transferEmail"
                label="Email del destinatario"
                type="email"
                value={transferEmail}
                onChange={(event) => setTransferEmail(event.target.value)}
                placeholder="inversor@suelo.ai"
              />
              <Input
                id="transferAmount"
                label="Monto"
                type="number"
                min={5}
                step={5}
                value={transferAmount}
                onChange={(event) => setTransferAmount(event.target.value)}
                hint="Mínimo USD 5"
              />
              <Input
                id="transferNote"
                label="Nota opcional"
                value={transferNote}
                onChange={(event) => setTransferNote(event.target.value)}
                placeholder="Reserva, devolución, aporte..."
              />
              <Button type="submit" loading={processing} icon={Send} iconPosition="right" className="w-full">
                Enviar transferencia
              </Button>
            </form>
          )}
        </section>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric title="Disponible" value={money(summary.available, wallet.currency)} icon={WalletIcon} tone="brand" />
        <Metric title="Bloqueado" value={money(summary.locked, wallet.currency)} icon={Lock} tone="neutral" />
        <Metric title="Retornos" value={money(summary.returns, wallet.currency)} icon={TrendingUp} tone="brand" />
        <Metric title="Pendiente" value={money(summary.pending, wallet.currency)} icon={Clock3} tone="warning" />
      </section>

      <section className="rounded-[28px] border border-surface-200 bg-surface-100 p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-surface-900">Movimientos</h2>
            <p className="mt-1 text-sm text-white/58">Historial auditable de depósitos, retiros, inversiones y transferencias.</p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="relative w-full sm:w-48 lg:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="input-field h-10 w-full pl-9 text-sm"
                placeholder="Buscar referencia"
              />
            </div>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as FilterType)} className="input-field h-10 w-full text-sm sm:w-56">
              <option value="all">Todos los tipos</option>
              {Object.keys(typeLabel).map((type) => (
                <option key={type} value={type}>{typeLabel[type]}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as FilterStatus)} className="input-field h-10 w-full text-sm sm:w-56">
              <option value="all">Todos los estados</option>
              {Object.entries(statusLabel).map(([status, label]) => (
                <option key={status} value={status}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredMovements.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="Sin movimientos para mostrar"
            description="Probá cambiar los filtros o realizar tu primera carga de saldo."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-surface-200">
            <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr] border-b border-surface-200 bg-surface-150 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-surface-500 md:grid">
              <span>Concepto</span>
              <span>Fecha</span>
              <span>Estado</span>
              <span className="text-right">Monto</span>
            </div>
            <div className="divide-y divide-surface-200/70">
              {filteredMovements.map((movement) => {
                const Icon = movementIcon(movement.type);
                const positive = isIncome(movement.type);
                return (
                  <div key={movement.id} className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr] md:items-center">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${positive ? 'bg-brand-500/10 text-brand-400' : 'bg-surface-300 text-surface-700'}`}>
                        <Icon className="h-4 w-4" strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-surface-900">
                          {movement.description || typeLabel[movement.type] || movement.type}
                        </p>
                        <p className="mt-0.5 break-all text-xs text-surface-500">{movement.reference_code}</p>
                      </div>
                    </div>
                    <p className="text-sm text-surface-600">{formatDate(movement.created_at)}</p>
                    <div>
                      <Badge variant={movement.status === 'completed' ? 'success' : movement.status === 'pending' ? 'warning' : 'danger'}>
                        {statusLabel[movement.status] || movement.status}
                      </Badge>
                    </div>
                    <p className={`text-left font-mono text-sm font-semibold md:pr-8 md:text-right ${positive ? 'text-brand-400' : 'text-surface-900'}`}>
                      {positive ? '+' : '-'}{money(Number(movement.amount), movement.currency || wallet.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ActionHeader({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-500/20 bg-brand-500/10">
        <Icon className="h-5 w-5 text-brand-400" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <h2 className="font-display text-xl font-bold text-surface-900">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-surface-500">{description}</p>
      </div>
    </div>
  );
}

function Metric({ title, value, icon: Icon, tone }: { title: string; value: string; icon: any; tone: 'brand' | 'neutral' | 'warning' }) {
  const toneClass = tone === 'brand' ? 'text-brand-400 bg-brand-500/10 border-brand-500/20' : tone === 'warning' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-surface-600 bg-surface-200 border-surface-300';
  return (
    <div className="rounded-2xl border border-surface-200 bg-surface-100 p-5">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${toneClass}`}>
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-surface-500">{title}</p>
      <p className="mt-2 break-words font-display text-xl font-bold text-surface-900 md:text-2xl">{value}</p>
    </div>
  );
}

function KycNotice({ isVerified }: { isVerified: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 text-sm ${isVerified ? 'border-brand-500/20 bg-brand-500/10 text-brand-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-300'}`}>
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-4 w-4" strokeWidth={1.8} />
        <div>
          <p className="font-semibold">{isVerified ? 'KYC aprobado' : 'KYC pendiente'}</p>
          <p className="mt-1 leading-relaxed opacity-80">
            {isVerified
              ? 'Podés operar con límites ampliados.'
              : 'Retiros mayores a USD 1.000 requieren verificación de identidad.'}
          </p>
        </div>
      </div>
    </div>
  );
}
