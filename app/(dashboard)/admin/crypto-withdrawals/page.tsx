import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, WalletCards } from 'lucide-react';
import { isDemoMode } from '@/lib/demo';
import { requireAdminProfile } from '@/lib/auth/server';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { NETWORKS } from '@/types/crypto';
import { WithdrawalActions } from './actions';

type WithdrawalRow = {
  id: string;
  user_id: string;
  amount_usd: number;
  amount_crypto: number;
  network: keyof typeof NETWORKS;
  token: string;
  destination_address: string;
  status: string;
  platform_fee_usd: number | null;
  network_fee_estimated: number | null;
  total_debit_usd: number | null;
  email_verified: boolean | null;
  two_fa_verified: boolean | null;
  approved_at: string | null;
  processed_at: string | null;
  created_at: string;
  profiles?: { full_name?: string | null; email?: string | null } | null;
};

const demoWithdrawals: WithdrawalRow[] = [
  {
    id: 'demo-withdrawal-1',
    user_id: 'demo-investor',
    amount_usd: 1250,
    amount_crypto: 1250,
    network: 'tron',
    token: 'USDT',
    destination_address: 'TQr8DemoInvestorWallet9xY8z7w6v5u4t3s2r1',
    status: 'pending_approval',
    platform_fee_usd: 12.5,
    network_fee_estimated: 2,
    total_debit_usd: 1264.5,
    email_verified: true,
    two_fa_verified: false,
    approved_at: null,
    processed_at: null,
    created_at: new Date().toISOString(),
    profiles: { full_name: 'María Alvarenga', email: 'maria@example.com' },
  },
  {
    id: 'demo-withdrawal-2',
    user_id: 'demo-investor-2',
    amount_usd: 320,
    amount_crypto: 320,
    network: 'polygon',
    token: 'USDC',
    destination_address: '0x8A7b6C5d4E3f2A1b0C9D8e7F6A5b4C3d2E1f0A9b',
    status: 'pending',
    platform_fee_usd: 3.2,
    network_fee_estimated: 0.12,
    total_debit_usd: 323.32,
    email_verified: false,
    two_fa_verified: false,
    approved_at: null,
    processed_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    profiles: { full_name: 'Ramiro Torres', email: 'ramiro@example.com' },
  },
];

function badgeClass(status: string) {
  if (['approved', 'processed', 'completed'].includes(status)) return 'bg-brand-500/10 text-brand-500';
  if (['rejected', 'failed', 'cancelled'].includes(status)) return 'bg-red-500/10 text-red-500';
  return 'bg-amber-500/10 text-amber-600';
}

export default async function AdminCryptoWithdrawalsPage() {
  let withdrawals = demoWithdrawals;
  const demo = isDemoMode();

  if (!demo) {
    const auth = await requireAdminProfile();
    if ('error' in auth) {
      return (
        <div className="card mx-auto max-w-xl text-center">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h1 className="font-display text-xl font-bold text-surface-900">Acceso admin requerido</h1>
          <p className="mt-2 text-sm text-surface-500">Solo operaciones puede revisar retiros crypto.</p>
        </div>
      );
    }

    const { data } = await auth.admin
      .from('crypto_withdrawal_requests')
      .select('*, profiles:user_id(full_name,email)')
      .order('created_at', { ascending: false })
      .limit(50);

    withdrawals = (data || []) as WithdrawalRow[];
  }

  const pending = withdrawals.filter((w) => ['pending', 'pending_approval'].includes(w.status)).length;
  const totalPendingUsd = withdrawals
    .filter((w) => ['pending', 'pending_approval'].includes(w.status))
    .reduce((sum, w) => sum + Number(w.amount_usd || 0), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(6,182,212,0.08)_42%,rgba(245,197,66,0.10))] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
              <WalletCards className="h-3.5 w-3.5" />
              Retiros crypto
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">
              Control de retiros y aprobaciones
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/68">
              Operación segura: KYC, email, red, destino, fees y aprobación manual antes de mover fondos.
            </p>
          </div>
          <Link href="/admin/audit" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
            Ver auditoría <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-surface-500">Solicitudes</p>
          <p className="mt-2 font-display text-3xl font-bold text-surface-900">{withdrawals.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-surface-500">Pendientes</p>
          <p className="mt-2 font-display text-3xl font-bold text-amber-600">{pending}</p>
        </div>
        <div className="card">
          <p className="text-sm text-surface-500">Monto pendiente</p>
          <p className="mt-2 font-display text-3xl font-bold text-surface-900">{formatCurrency(totalPendingUsd)}</p>
        </div>
      </section>

      {demo && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700">
          Demo visual: los botones muestran el flujo, pero no mueven fondos reales.
        </div>
      )}

      <section className="card p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">Usuario</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">Monto</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">Red</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">Destino</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">Seguridad</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">Estado</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-surface-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal) => {
                const actionable = !demo && ['pending', 'pending_approval'].includes(withdrawal.status);
                return (
                  <tr key={withdrawal.id} className="border-b border-surface-200/60 last:border-0">
                    <td className="p-4 align-top">
                      <p className="font-semibold text-surface-900">{withdrawal.profiles?.full_name || 'Usuario'}</p>
                      <p className="text-xs text-surface-500">{withdrawal.profiles?.email || withdrawal.user_id}</p>
                      <p className="mt-1 text-xs text-surface-400">{formatDate(withdrawal.created_at)}</p>
                    </td>
                    <td className="p-4 align-top">
                      <p className="font-mono font-bold text-surface-900">{Number(withdrawal.amount_crypto).toFixed(2)} {withdrawal.token}</p>
                      <p className="text-xs text-surface-500">{formatCurrency(withdrawal.amount_usd)}</p>
                      <p className="text-xs text-surface-400">Total débito: {formatCurrency(withdrawal.total_debit_usd || withdrawal.amount_usd)}</p>
                    </td>
                    <td className="p-4 align-top">
                      <p className="font-semibold text-surface-900">{NETWORKS[withdrawal.network]?.displayName || withdrawal.network}</p>
                      <p className="text-xs text-surface-500">Fee red: {withdrawal.network_fee_estimated || 0}</p>
                    </td>
                    <td className="max-w-xs p-4 align-top">
                      <code className="block truncate rounded-xl bg-surface-100 px-3 py-2 text-xs text-surface-700">{withdrawal.destination_address}</code>
                    </td>
                    <td className="p-4 align-top">
                      <div className="space-y-2">
                        <p className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${withdrawal.email_verified ? 'bg-brand-500/10 text-brand-500' : 'bg-amber-500/10 text-amber-600'}`}>
                          {withdrawal.email_verified ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          Email
                        </p>
                        <p className={`ml-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${withdrawal.two_fa_verified ? 'bg-brand-500/10 text-brand-500' : 'bg-surface-200 text-surface-500'}`}>
                          2FA
                        </p>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${badgeClass(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <WithdrawalActions id={withdrawal.id} disabled={!actionable} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
