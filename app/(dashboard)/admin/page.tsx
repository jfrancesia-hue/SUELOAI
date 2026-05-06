import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Bot, Building2, CheckCircle2, FileText, Flag, Receipt, ShieldCheck, Users, Wallet } from 'lucide-react';
import { DashboardHero, MiniBuildingVisual, PhotoStrip, VisualMetricCard } from '@/components/dashboard/visual-shell';
import { features } from '@/lib/config/features';
import { markets } from '@/lib/config/markets';
import { isDemoMode } from '@/lib/demo';
import { requireAdminProfile } from '@/lib/auth/server';

async function count(admin: any, table: string, filter?: (q: any) => any) {
  let query = admin.from(table).select('id', { count: 'exact', head: true });
  if (filter) query = filter(query);
  const { count } = await query;
  return count || 0;
}

export default async function AdminPage() {
  if (!features.admin) redirect('/');

  if (isDemoMode()) {
    return (
      <AdminView
        users={28}
        projects={6}
        fundingProjects={3}
        pendingKyc={4}
        pendingWallet={2}
        invoices={12}
        leads={41}
        contacts={96}
        conversations={138}
        investments={23}
      />
    );
  }

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

  return (
    <AdminView
      users={users}
      projects={projects}
      fundingProjects={fundingProjects}
      pendingKyc={pendingKyc}
      pendingWallet={pendingWallet}
      invoices={invoices}
      leads={leads}
      contacts={contacts}
      conversations={conversations}
      investments={investments}
    />
  );
}

function AdminView({
  users,
  projects,
  fundingProjects,
  pendingKyc,
  pendingWallet,
  invoices,
  leads,
  contacts,
  conversations,
  investments,
}: {
  users: number;
  projects: number;
  fundingProjects: number;
  pendingKyc: number;
  pendingWallet: number;
  invoices: number;
  leads: number;
  contacts: number;
  conversations: number;
  investments: number;
}) {
  const alerts = [
    pendingKyc > 0 ? `${pendingKyc} KYC pendientes de revisión` : null,
    pendingWallet > 0 ? `${pendingWallet} movimientos de billetera pendientes` : null,
    fundingProjects === 0 ? 'No hay proyectos activos en financiación' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <DashboardHero
        eyebrow="Operación"
        title="Admin Suelo"
        description="Centro operativo para Paraguay y Bolivia: usuarios, proyectos, KYC, billetera, fiscal, leads, conversaciones IA y feature flags."
        visual={<MiniBuildingVisual label="Control operativo" />}
      />

      <PhotoStrip />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <VisualMetricCard title="Usuarios" value={String(users)} icon={Users} hint="Cuentas registradas" tone="emerald" />
        <VisualMetricCard title="Proyectos" value={String(projects)} icon={Building2} hint={`${fundingProjects} en funding`} tone="cyan" />
        <VisualMetricCard title="KYC pendientes" value={String(pendingKyc)} icon={ShieldCheck} hint="Revisión requerida" tone="gold" />
        <VisualMetricCard title="Movimientos pendientes" value={String(pendingWallet)} icon={Wallet} hint="Depósitos/retiros" tone="violet" />
        <VisualMetricCard title="Facturas" value={String(invoices)} icon={Receipt} hint="Fiscal" tone="cyan" />
        <VisualMetricCard title="Mercados activos" value="PY + BO" icon={Flag} hint="USD, USDT, PYG, BOB" tone="emerald" />
        <VisualMetricCard title="Leads CRM" value={String(leads)} icon={Users} hint={`${contacts} contactos`} tone="gold" />
        <VisualMetricCard title="Conversaciones IA" value={String(conversations)} icon={Bot} hint="Actividad del agente" tone="violet" />
        <VisualMetricCard title="Inversiones confirmadas" value={String(investments)} icon={FileText} hint="Operaciones válidas" tone="emerald" />
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
