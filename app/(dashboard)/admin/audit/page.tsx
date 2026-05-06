import { Activity, Bot, FileCheck2, ShieldCheck, WalletCards } from 'lucide-react';
import { isDemoMode } from '@/lib/demo';
import { requireAdminProfile } from '@/lib/auth/server';
import { formatDate } from '@/utils/helpers';

type AuditRow = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  hash: string;
  created_at: string;
  profiles?: { full_name?: string | null; email?: string | null } | null;
};

const demoAudit: AuditRow[] = [
  {
    id: 'audit-1',
    user_id: 'demo-admin',
    action: 'crypto_withdrawal.approved',
    entity_type: 'crypto_withdrawal_request',
    entity_id: 'demo-withdrawal-1',
    ip_address: '190.104.24.18',
    user_agent: 'Suelo Admin',
    hash: 'sha256:8f7a6b5c4d3e2f1a',
    created_at: new Date().toISOString(),
    profiles: { full_name: 'Demo Admin', email: 'demo.admin@suelo.ai' },
  },
  {
    id: 'audit-2',
    user_id: 'demo-investor',
    action: 'kyc.submitted',
    entity_type: 'kyc_verification',
    entity_id: 'kyc-demo-1',
    ip_address: '181.40.10.82',
    user_agent: 'Mobile Chrome',
    hash: 'sha256:2b1c0d9e8f7a6b5c',
    created_at: new Date(Date.now() - 1000 * 60 * 21).toISOString(),
    profiles: { full_name: 'María Alvarenga', email: 'maria@example.com' },
  },
  {
    id: 'audit-3',
    user_id: 'demo-developer',
    action: 'project.document_uploaded',
    entity_type: 'project_document',
    entity_id: 'doc-demo-1',
    ip_address: '177.222.33.11',
    user_agent: 'Desktop Chrome',
    hash: 'sha256:9a8b7c6d5e4f3a2b',
    created_at: new Date(Date.now() - 1000 * 60 * 77).toISOString(),
    profiles: { full_name: 'Demo Desarrollador', email: 'demo.developer@suelo.ai' },
  },
  {
    id: 'audit-4',
    user_id: 'demo-investor',
    action: 'ai_agent.lead_qualified',
    entity_type: 'ai_conversation',
    entity_id: 'conv-demo-1',
    ip_address: '181.115.88.30',
    user_agent: 'WhatsApp/Web',
    hash: 'sha256:1f2a9b7c6d5e4f3a',
    created_at: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    profiles: { full_name: 'Ramiro Torres', email: 'ramiro@example.com' },
  },
];

function iconFor(entity: string) {
  if (entity.includes('withdrawal') || entity.includes('wallet')) return WalletCards;
  if (entity.includes('kyc')) return ShieldCheck;
  if (entity.includes('ai')) return Bot;
  if (entity.includes('document')) return FileCheck2;
  return Activity;
}

export default async function AdminAuditPage() {
  let rows = demoAudit;
  const demo = isDemoMode();

  if (!demo) {
    const auth = await requireAdminProfile();
    if ('error' in auth) {
      return (
        <div className="card mx-auto max-w-xl text-center">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h1 className="font-display text-xl font-bold text-surface-900">Acceso admin requerido</h1>
          <p className="mt-2 text-sm text-surface-500">La auditoría es solo para el equipo operativo.</p>
        </div>
      );
    }

    const { data } = await auth.admin
      .from('audit_logs')
      .select('*, profiles:user_id(full_name,email)')
      .order('created_at', { ascending: false })
      .limit(100);

    rows = (data || []) as AuditRow[];
  }

  const entityCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.entity_type] = (acc[row.entity_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(6,182,212,0.08)_42%,rgba(245,197,66,0.10))] p-6 md:p-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
          <Activity className="h-3.5 w-3.5" />
          Auditoría
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">
          Trazabilidad de actividad
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/68">
          Registro operativo para saber quién hizo qué, cuándo, sobre qué entidad y con qué hash de integridad.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="card">
          <p className="text-sm text-surface-500">Eventos</p>
          <p className="mt-2 font-display text-3xl font-bold text-surface-900">{rows.length}</p>
        </div>
        {Object.entries(entityCounts).slice(0, 3).map(([entity, count]) => (
          <div key={entity} className="card">
            <p className="truncate text-sm text-surface-500">{entity}</p>
            <p className="mt-2 font-display text-3xl font-bold text-surface-900">{count}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="space-y-4">
          {rows.map((row) => {
            const Icon = iconFor(row.entity_type);
            return (
              <div key={row.id} className="grid gap-4 rounded-2xl border border-surface-200 bg-white p-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-surface-900">{row.action}</p>
                    <span className="rounded-full bg-surface-100 px-2 py-1 text-xs font-bold text-surface-500">{row.entity_type}</span>
                  </div>
                  <p className="mt-1 text-sm text-surface-500">
                    {row.profiles?.full_name || 'Usuario'} · {row.profiles?.email || row.user_id || 'sistema'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-surface-400">
                    {row.entity_id && <code className="rounded-lg bg-surface-100 px-2 py-1">entity: {row.entity_id}</code>}
                    {row.ip_address && <code className="rounded-lg bg-surface-100 px-2 py-1">ip: {row.ip_address}</code>}
                    <code className="rounded-lg bg-surface-100 px-2 py-1">hash: {row.hash}</code>
                  </div>
                </div>
                <p className="text-sm font-medium text-surface-500">{formatDate(row.created_at)}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
