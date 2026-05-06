import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  KeyRound,
  Mail,
  MessageCircle,
  RadioTower,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { isDemoMode } from '@/lib/demo';
import { features } from '@/lib/config/features';
import { requireAdminProfile } from '@/lib/auth/server';

type Status = 'ok' | 'missing' | 'warning';

function hasRealValue(value?: string, invalid: string[] = []) {
  if (!value || value.trim().length < 8) return false;
  const normalized = value.toLowerCase();
  return !invalid.some((token) => normalized.includes(token.toLowerCase()));
}

function envStatus(key: string, label: string, required: boolean, helper: string) {
  const ok = hasRealValue(process.env[key], ['placeholder', 'your-', 'anon-key', 'service-role', 'random-secure-string']);
  return {
    key,
    label,
    required,
    helper,
    status: ok ? 'ok' : required ? 'missing' : 'warning',
  } as const;
}

const groups = [
  {
    title: 'Base de datos y Auth',
    icon: Database,
    checks: [
      envStatus('NEXT_PUBLIC_SUPABASE_URL', 'Supabase URL', true, 'Proyecto Supabase conectado.'),
      envStatus('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anon key', true, 'Clave pública para login, registro y sesión.'),
      envStatus('SUPABASE_SERVICE_ROLE_KEY', 'Service role key', true, 'Clave backend para operación admin segura.'),
    ],
  },
  {
    title: 'Mensajería comercial',
    icon: MessageCircle,
    checks: [
      envStatus('NEXT_PUBLIC_WHATSAPP_NUMBER', 'WhatsApp asesor', false, 'Número comercial para leads calientes.'),
      envStatus('TWILIO_ACCOUNT_SID', 'Twilio SID', false, 'Automatización WhatsApp/CRM.'),
      envStatus('TWILIO_AUTH_TOKEN', 'Twilio token', false, 'Token backend de Twilio.'),
    ],
  },
  {
    title: 'Emails y recuperación',
    icon: Mail,
    checks: [
      envStatus('RESEND_API_KEY', 'Resend API key', false, 'Emails transaccionales y recuperación de contraseña.'),
      envStatus('RESEND_FROM_EMAIL', 'Email remitente', false, 'Remitente validado para producción.'),
    ],
  },
  {
    title: 'KYC y confianza',
    icon: ShieldCheck,
    checks: [
      envStatus('DIDIT_API_KEY', 'Didit API key', false, 'Verificación de identidad para inversores y retiros.'),
      envStatus('DIDIT_WORKFLOW_ID', 'Didit workflow', false, 'Flujo KYC configurado.'),
      envStatus('DIDIT_WEBHOOK_SECRET', 'Didit webhook secret', false, 'Validación de eventos KYC.'),
    ],
  },
  {
    title: 'Blockchain / Crypto',
    icon: RadioTower,
    checks: [
      envStatus('POLYGON_RPC_URL', 'Polygon RPC', false, 'Anchoring documental y lectura on-chain.'),
      envStatus('ANCHOR_CONTRACT_ADDRESS', 'Anchor contract', false, 'Contrato donde se registran hashes.'),
      envStatus('CRYPTO_WEBHOOK_SECRET', 'Crypto webhook secret', false, 'Valida depósitos y eventos externos.'),
      envStatus('TRONGRID_API_KEY', 'TronGrid API key', false, 'Depósitos USDT TRC20.'),
    ],
  },
  {
    title: 'IA y agente vendedor',
    icon: Sparkles,
    checks: [
      envStatus('ANTHROPIC_API_KEY', 'Anthropic API key', false, 'Agente, scoring, reportes y análisis.'),
      envStatus('ANTHROPIC_MODEL_ANALYST', 'Modelo analista', false, 'Modelo principal del agente IA.'),
    ],
  },
];

export default async function ProductionPage() {
  if (!isDemoMode()) {
    const auth = await requireAdminProfile();
    if ('error' in auth) {
      return (
        <div className="card mx-auto max-w-xl text-center">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h1 className="font-display text-xl font-bold text-surface-900">Acceso admin requerido</h1>
          <p className="mt-2 text-sm text-surface-500">Este centro solo debe verlo el equipo operativo.</p>
        </div>
      );
    }
  }

  const demo = isDemoMode();
  const allChecks = groups.flatMap((group) => group.checks);
  const missingRequired = allChecks.filter((check) => check.required && check.status !== 'ok').length;
  const warnings = allChecks.filter((check) => !check.required && check.status !== 'ok').length;
  const okCount = allChecks.filter((check) => check.status === 'ok').length;
  const productionReady = !demo && missingRequired === 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(6,182,212,0.08)_42%,rgba(245,197,66,0.10))] p-6 md:p-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
              <KeyRound className="h-3.5 w-3.5" />
              Producción
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">
              Centro de configuración real
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/68 md:text-lg">
              Checklist operativo para pasar de demo a producción: Supabase, emails, KYC, WhatsApp, IA,
              blockchain y flags críticos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/api/readiness" className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                Ver readiness API <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/blockchain" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                Blockchain setup <RadioTower className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#07111F]/70 p-5 backdrop-blur-xl">
            <div className={`mb-4 rounded-2xl border p-4 ${productionReady ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200' : 'border-amber-300/20 bg-amber-300/10 text-amber-200'}`}>
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Estado general</p>
              <p className="mt-1 font-display text-2xl font-bold">
                {productionReady ? 'Listo para conectar real' : demo ? 'Demo activo' : 'Faltan claves'}
              </p>
              <p className="mt-2 text-xs opacity-80">
                {demo ? 'Apagar NEXT_PUBLIC_DEMO_MODE para operar real.' : 'Revisar obligatorias y warnings.'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/[0.06] p-3">
                <p className="font-display text-2xl font-bold text-white">{okCount}</p>
                <p className="text-xs text-white/45">OK</p>
              </div>
              <div className="rounded-2xl bg-white/[0.06] p-3">
                <p className="font-display text-2xl font-bold text-white">{missingRequired}</p>
                <p className="text-xs text-white/45">Críticas</p>
              </div>
              <div className="rounded-2xl bg-white/[0.06] p-3">
                <p className="font-display text-2xl font-bold text-white">{warnings}</p>
                <p className="text-xs text-white/45">Warnings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {Object.entries(features).map(([key, value]) => (
          <div key={key} className="card flex items-center justify-between">
            <div>
              <p className="font-mono text-sm font-semibold text-surface-900">{key}</p>
              <p className="mt-1 text-xs text-surface-500">Feature flag operativo</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${value ? 'bg-brand-500/10 text-brand-500' : 'bg-surface-200 text-surface-500'}`}>
              {value ? 'ON' : 'OFF'}
            </span>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-surface-900">{group.title}</h2>
                  <p className="text-xs text-surface-500">Variables y servicios</p>
                </div>
              </div>
              <div className="grid gap-3">
                {group.checks.map((check) => (
                  <div key={check.key} className="flex gap-3 rounded-2xl border border-surface-200 bg-white p-4">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${check.status === 'ok' ? 'bg-brand-500/10 text-brand-500' : check.required ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {check.status === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : check.required ? <XCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-surface-900">{check.label}</p>
                        <code className="rounded-lg bg-surface-100 px-2 py-1 text-[11px] text-surface-600">{check.key}</code>
                      </div>
                      <p className="mt-1 text-sm text-surface-500">{check.helper}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
