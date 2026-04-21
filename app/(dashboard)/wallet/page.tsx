'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { Button, Input, StatCard, Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import type { Wallet, WalletMovement } from '@/types';
import {
  Wallet as WalletIcon,
  TrendingUp, Lock, ArrowUpRight, ArrowDownRight,
  Plus, Send, Download,
} from 'lucide-react';

export default function WalletPage() {
  const supabase = createClient();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [movements, setMovements] = useState<WalletMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [walletRes, movRes] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', user.id).single(),
      supabase.from('wallet_movements').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    setWallet(walletRes.data);
    setMovements(movRes.data || []);
    setLoading(false);
  }

  async function handleDeposit() {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    setProcessing(true);

    const res = await fetch('/api/wallet/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(depositAmount) }),
    });

    const data = await res.json();
    if (data.init_point) {
      window.location.href = data.init_point;
    } else {
      alert('Error al procesar el depósito');
    }
    setProcessing(false);
  }

  if (loading) return <LoadingSpinner />;
  if (!wallet) return <div>Wallet no encontrada</div>;

  const total = wallet.balance_available + wallet.balance_locked + wallet.balance_returns;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Mi Billetera</h1>
        <p className="text-surface-500 mt-1">Gestioná tu saldo y movimientos</p>
      </div>

      {/* Main balance card */}
      <div className="card gradient-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-sm text-surface-500">Balance Total</p>
          <p className="font-display text-4xl font-bold text-surface-900 mt-2">
            {formatCurrency(total, wallet.currency)}
          </p>

          <div className="flex gap-2 mt-6">
            <Button onClick={() => setShowDeposit(!showDeposit)} icon={Plus}>
              Cargar Saldo
            </Button>
            <Button variant="secondary" icon={ArrowUpRight}>
              Retirar
            </Button>
            <Button variant="ghost" icon={Send}>
              Transferir
            </Button>
          </div>

          {showDeposit && (
            <div className="mt-6 p-4 rounded-xl bg-surface-200/50 border border-surface-300">
              <h3 className="font-semibold text-surface-900 mb-3">Cargar saldo vía Mercado Pago</h3>
              <div className="flex gap-3">
                <Input
                  id="deposit_amount"
                  type="number"
                  placeholder="Monto en ARS"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleDeposit} loading={processing}>
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Disponible"
          value={formatCurrency(wallet.balance_available)}
          icon={WalletIcon}
          change="Listo para invertir"
          changeType="positive"
        />
        <StatCard
          title="Bloqueado"
          value={formatCurrency(wallet.balance_locked)}
          icon={Lock}
          change="En procesos activos"
          changeType="neutral"
        />
        <StatCard
          title="Retornos"
          value={formatCurrency(wallet.balance_returns)}
          icon={TrendingUp}
          change="Ganancias acumuladas"
          changeType="positive"
        />
      </div>

      {/* Movements */}
      <div>
        <h2 className="section-title text-lg mb-4">Últimos Movimientos</h2>

        {movements.length === 0 ? (
          <EmptyState
            icon={WalletIcon}
            title="Sin movimientos aún"
            description="Tus depósitos e inversiones aparecerán acá"
          />
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Concepto</th>
                  <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Monto</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => {
                  const isIncome = ['deposit', 'return', 'transfer_in', 'refund'].includes(m.type);
                  return (
                    <tr key={m.id} className="border-b border-surface-200/50 last:border-0">
                      <td className="p-4 text-surface-600">{formatDate(m.created_at)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${isIncome ? 'bg-brand-500/10 text-brand-500' : 'bg-surface-300 text-surface-600'}`}>
                            {isIncome ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-surface-900 font-medium">
                              {m.description || m.type}
                            </p>
                            <p className="text-xs text-surface-500">{m.reference_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={m.status === 'completed' ? 'success' : m.status === 'pending' ? 'warning' : 'danger'}>
                          {m.status}
                        </Badge>
                      </td>
                      <td className={`p-4 text-right font-mono font-medium ${isIncome ? 'text-brand-500' : 'text-surface-900'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(m.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
