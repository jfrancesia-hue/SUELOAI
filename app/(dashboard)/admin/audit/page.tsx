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
      <section className="relative overflow-hidden rounded-[32px] border border-cyan-300/20 bg-[linear-gradient(135deg,#08111F_0%,#123B43_45%,#7A4B10_100%)] p-6 shadow-[0_28px_90px_-58px_rgba(6,182,212,0.8)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(16,185,129,0.22),transparent_30%),radial-gradient(circle_at_84%_20%,rgba(245,197,66,0.22),transparent_32%)]" />
        <div className="relative">
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
          <Activity className="h-3.5 w-3.5" />
          Auditoría
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">
          Trazabilidad de actividad
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/68">
          Registro operativo para saber quién hizo qué, cuándo, sobre qué entidad y con qué hash de integridad.
        </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5 shadow-[0_20px_70px_-55px_rgba(16,185,129,0.9)] backdrop-blur-xl">
          <p className="text-sm font-semibold text-emerald-100/80">Eventos</p>
          <p className="mt-2 font-display text-3xl font-bold text-white">{rows.length}</p>
        </div>
        {Object.entries(entityCounts).slice(0, 3).map(([entity, count]) => (
          <div key={entity} className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 shadow-[0_20px_70px_-55px_rgba(245,197,66,0.85)] backdrop-blur-xl">
            <p className="truncate text-sm font-semibold text-amber-100/80">{entity}</p>
            <p className="mt-2 font-display text-3xl font-bold text-white">{count}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_80px_-60px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="space-y-4">
          {rows.map((row) => {
            const Icon = iconFor(row.entity_type);
            return (
              <div key={row.id} className="grid gap-4 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.045))] p-4 shadow-[0_18px_50px_-42px_rgba(0,0,0,0.9)] lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{row.action}</p>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-100">{row.entity_type}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/62">
                    {row.profiles?.full_name || 'Usuario'} · {row.profiles?.email || row.user_id || 'sistema'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/58">
                    {row.entity_id && <code className="rounded-lg border border-white/10 bg-black/18 px-2 py-1">entity: {row.entity_id}</code>}
                    {row.ip_address && <code className="rounded-lg border border-white/10 bg-black/18 px-2 py-1">ip: {row.ip_address}</code>}
                    <code className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-amber-100">hash: {row.hash}</code>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white/60">{formatDate(row.created_at)}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
