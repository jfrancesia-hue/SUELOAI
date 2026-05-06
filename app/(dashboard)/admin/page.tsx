import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { features } from '@/lib/config/features';
import { markets } from '@/lib/config/markets';
import { requireAdminProfile } from '@/lib/auth/server';

async function count(admin: any, table: string, filter?: (q: any) => any) {
  let query = admin.from(table).select('id', { count: 'exact', head: true });
  if (filter) query = filter(query);
  const { count } = await query;
  return count || 0;
}

function Card({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="card">
      <p className="text-sm text-surface-500">{title}</p>
      <p className="mt-2 font-display text-3xl font-bold text-surface-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-surface-500">{hint}</p>}
    </div>
  );
}

export default async function AdminPage() {
  if (!features.admin) redirect('/');

  const auth = await requireAdminProfile();
  if ('error' in auth) redirect('/investor');

  const admin = auth.admin;
  const [users, projects, fundingProjects, pendingKyc, pendingWallet, invoices, leads, contacts, conversations, investments] = await Promise.all([
    count(admin, 'profiles'),
    count(admin, 'projects'),
    count(admin, 'projects', (q) => q.eq('status', 'funding')),
    count(admin, 'kyc_verifications', (q) => q.eq('status', 'pending')),
    count(admin, 'wallet_movements', (q) => q.eq('status', 'pending')),
    count(admin, 'invoices'),
    count(admin, 'crm_leads'),
    count(admin, 'crm_contacts'),
    count(admin, 'ai_conversations'),
    count(admin, 'investments', (q) => q.eq('status', 'confirmed')),
  ]);

  const alerts = [
    pendingKyc > 0 ? `${pendingKyc} KYC pendientes de revisión` : null,
    pendingWallet > 0 ? `${pendingWallet} movimientos de billetera pendientes` : null,
    fundingProjects === 0 ? 'No hay proyectos activos en financiación' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Operación</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-surface-900">Admin Suelo</h1>
        <p className="mt-2 max-w-3xl text-surface-500">
          Centro operativo para Paraguay y Bolivia: usuarios, proyectos, KYC, billetera, fiscal y feature flags.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Usuarios" value={users} />
        <Card title="Proyectos" value={projects} hint={`${fundingProjects} en funding`} />
        <Card title="KYC pendientes" value={pendingKyc} />
        <Card title="Movimientos pendientes" value={pendingWallet} hint="Depósitos/retiros por validar" />
        <Card title="Facturas" value={invoices} />
        <Card title="Mercados activos" value="PY + BO" hint="USD, USDT, PYG, BOB" />
        <Card title="Leads CRM" value={leads} hint={`${contacts} contactos`} />
        <Card title="Conversaciones IA" value={conversations} hint="Actividad del agente" />
        <Card title="Inversiones confirmadas" value={investments} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <h2 className="section-title text-lg">Alertas operativas</h2>
          <div className="mt-4 space-y-3">
            {alerts.length > 0 ? alerts.map((alert) => (
              <div key={alert} className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {alert}
              </div>
            )) : (
              <div className="flex gap-3 rounded-xl border border-brand-500/20 bg-brand-500/10 p-3 text-sm text-brand-500">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                Sin alertas críticas.
              </div>
            )}
          </div>
          <div className="mt-5 grid gap-2">
            {[
              ['/crm/leads', 'Revisar leads'],
              ['/projects', 'Gestionar proyectos'],
              ['/invoicing', 'Ver facturación'],
              ['/wallet', 'Ver billetera'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="flex items-center justify-between rounded-xl bg-surface-100 px-3 py-2 text-sm font-medium text-surface-800 hover:bg-surface-200">
                {label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title text-lg">Feature flags</h2>
          <div className="mt-4 grid gap-2 text-sm">
            {Object.entries(features).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-surface-100 px-3 py-2">
                <span className="font-mono text-xs text-surface-700">{key}</span>
                <span className={value ? 'text-brand-500' : 'text-surface-500'}>{value ? 'ON' : 'OFF'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title text-lg">Mercados</h2>
          <div className="mt-4 grid gap-3">
            {Object.values(markets).map((market) => (
              <div key={market.code} className="rounded-xl border border-surface-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-surface-900">{market.name}</p>
                  <span className="rounded-lg bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-500">{market.code}</span>
                </div>
                <p className="mt-2 text-sm text-surface-500">Fiscal: {market.fiscalProvider}</p>
                <p className="text-sm text-surface-500">Monedas: {[market.currency, ...market.secondaryCurrencies].join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
