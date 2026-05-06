import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Bitcoin,
  CheckCircle2,
  DatabaseZap,
  FileCheck2,
  KeyRound,
  Link2,
  LockKeyhole,
  Network,
  RadioTower,
  ShieldCheck,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { isDemoMode } from '@/lib/demo';
import { NETWORKS } from '@/types/crypto';

type Severity = 'required' | 'warning' | 'optional';

type Check = {
  key: string;
  label: string;
  ok: boolean;
  severity: Severity;
  helper: string;
};

function hasRealValue(value?: string, invalid: string[] = []) {
  if (!value || value.trim().length < 8) return false;
  const normalized = value.toLowerCase();
  return !invalid.some((token) => normalized.includes(token.toLowerCase()));
}

function envCheck(key: string, label: string, severity: Severity, helper: string): Check {
  return {
    key,
    label,
    ok: hasRealValue(process.env[key], ['placeholder', 'your-', '0x...', 'xpub...', 'random-secure-string']),
    severity,
    helper,
  };
}

const phaseCards = [
  {
    title: '1. Hash documental',
    icon: FileCheck2,
    text: 'Registrar hash de contratos, KYC y documentos críticos. Da trazabilidad sin vender tokens todavía.',
    status: 'Primero',
  },
  {
    title: '2. Wallet interna',
    icon: WalletCards,
    text: 'Saldo en USD/USDT dentro de Suelo, con movimientos auditables y conciliación admin.',
    status: 'Operable',
  },
  {
    title: '3. Depósitos USDT',
    icon: Bitcoin,
    text: 'Aceptar USDT/USDC por redes de bajo costo para inversores de Paraguay, Bolivia y exterior.',
    status: 'Luego',
  },
  {
    title: '4. Retiros controlados',
    icon: ShieldCheck,
    text: 'KYC, email, umbrales, aprobación manual y monitoreo de riesgo antes de enviar fondos.',
    status: 'Seguro',
  },
  {
    title: '5. Tokenización futura',
    icon: Link2,
    text: 'Solo avanzar cuando estructura legal, contratos y custodia estén revisados por especialistas.',
    status: 'Legal',
  },
];

export default function BlockchainPage() {
  const demo = isDemoMode();
  const checks: Check[] = [
    envCheck('POLYGON_RPC_URL', 'RPC Polygon', 'required', 'Conexión para anchors y lectura de transacciones.'),
    envCheck('ANCHOR_CONTRACT_ADDRESS', 'Contrato Anchor', 'required', 'Contrato inteligente donde se guardan hashes.'),
    envCheck('CRYPTO_WEBHOOK_SECRET', 'Webhook secret', 'required', 'Firma para validar eventos de depósitos.'),
    envCheck('ANCHOR_PRIVATE_KEY', 'Signer backend', 'warning', 'Clave privada solo en servidor/vault, jamás en navegador.'),
    envCheck('POLYGONSCAN_API_KEY', 'PolygonScan API', 'warning', 'Verificación pública de transacciones Polygon.'),
    envCheck('TRONGRID_API_KEY', 'TronGrid API', 'warning', 'Lectura de depósitos USDT TRC20.'),
    envCheck('CRYPTO_MASTER_XPUB_EVM', 'XPUB EVM', 'warning', 'Direcciones públicas derivadas para Polygon/Ethereum/BSC.'),
    envCheck('CRYPTO_MASTER_XPUB_TRON', 'XPUB Tron', 'warning', 'Direcciones públicas para Tron si no se usa custodio.'),
    envCheck('CIRCLE_API_KEY', 'Circle API', 'optional', 'Proveedor opcional para USDC y wallets programables.'),
    envCheck('BITSO_API_KEY', 'Bitso API', 'optional', 'Proveedor opcional LATAM para operación crypto/fiat.'),
  ];
  const requiredOk = checks.filter((check) => check.severity === 'required').every((check) => check.ok);
  const readinessLabel = demo ? 'Demo visual activo' : requiredOk ? 'Base lista' : 'Faltan conexiones';
  const readinessClass = demo || requiredOk
    ? 'border-brand-500/20 bg-brand-500/10 text-brand-500'
    : 'border-amber-500/20 bg-amber-500/10 text-amber-500';

  const networkRoles = [
    {
      id: 'polygon' as const,
      role: 'Recomendada para contratos, hashes documentales y trazabilidad pública barata.',
    },
    {
      id: 'tron' as const,
      role: 'Recomendada para depósitos USDT TRC20 por costo bajo y adopción regional.',
    },
    {
      id: 'ethereum' as const,
      role: 'Útil para reputación institucional, pero no conviene empezar por costos altos.',
    },
    {
      id: 'bsc' as const,
      role: 'Alternativa opcional para stablecoins; activar solo si hay demanda real.',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-surface-200 bg-gradient-to-br from-surface-50 via-white to-brand-500/10 p-6 sm:p-8">
        <div className="absolute right-8 top-8 hidden h-40 w-40 rounded-full bg-brand-500/10 blur-3xl lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-500">
              <Network className="h-3.5 w-3.5" />
              Blockchain setup
            </div>
            <h1 className="font-display text-3xl font-bold text-surface-900 sm:text-4xl">
              Centro de conexión blockchain para Suelo
            </h1>
            <p className="mt-4 max-w-2xl text-base text-surface-600">
              Panel para preparar la conexión real: hashes documentales, wallets, depósitos USDT,
              retiros controlados y una ruta segura hacia tokenización futura en Paraguay y Bolivia.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/wallet/crypto" className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                Abrir wallet crypto <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/api/blockchain/status" className="inline-flex items-center gap-2 rounded-xl border border-surface-300 bg-white px-4 py-2 text-sm font-semibold text-surface-800 hover:bg-surface-100">
                Ver API status <RadioTower className="h-4 w-4" />
              </Link>
              <Link href="/api/readiness" className="inline-flex items-center gap-2 rounded-xl border border-surface-300 bg-white px-4 py-2 text-sm font-semibold text-surface-800 hover:bg-surface-100">
                Readiness prod <DatabaseZap className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-surface-200 bg-white/90 p-5 shadow-xl shadow-surface-900/5">
            <div className={`mb-4 flex items-center justify-between rounded-2xl border px-4 py-3 ${readinessClass}`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">Estado</p>
                <p className="text-lg font-bold">{readinessLabel}</p>
              </div>
              {demo || requiredOk ? <CheckCircle2 className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-surface-100 p-3">
                <p className="text-2xl font-bold text-surface-900">{checks.filter((c) => c.ok).length}</p>
                <p className="text-xs text-surface-500">OK</p>
              </div>
              <div className="rounded-2xl bg-surface-100 p-3">
                <p className="text-2xl font-bold text-surface-900">{checks.filter((c) => c.severity === 'required' && !c.ok).length}</p>
                <p className="text-xs text-surface-500">Críticas</p>
              </div>
              <div className="rounded-2xl bg-surface-100 p-3">
                <p className="text-2xl font-bold text-surface-900">PY+BO</p>
                <p className="text-xs text-surface-500">Mercado</p>
              </div>
            </div>
            <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700">
              Seguridad: este panel nunca muestra secretos. Las claves privadas, xprv, seed phrases y service role
              deben vivir solo en backend seguro o vault.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {phaseCards.map((phase) => {
          const Icon = phase.icon;
          return (
            <div key={phase.title} className="card">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-surface-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-surface-500">
                  {phase.status}
                </span>
              </div>
              <h2 className="font-display text-base font-semibold text-surface-900">{phase.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-surface-600">{phase.text}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title text-xl">Checklist de conexiones</h2>
              <p className="mt-1 text-sm text-surface-500">Variables necesarias para pasar de demo a operación real.</p>
            </div>
            <KeyRound className="h-6 w-6 text-brand-500" />
          </div>
          <div className="grid gap-3">
            {checks.map((check) => (
              <div key={check.key} className="flex gap-3 rounded-2xl border border-surface-200 bg-white p-4">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${check.ok ? 'bg-brand-500/10 text-brand-500' : check.severity === 'required' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {check.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-surface-900">{check.label}</p>
                    <code className="rounded-lg bg-surface-100 px-2 py-1 text-[11px] text-surface-600">{check.key}</code>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${check.severity === 'required' ? 'bg-red-500/10 text-red-500' : check.severity === 'warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-surface-100 text-surface-500'}`}>
                      {check.severity === 'required' ? 'Obligatoria' : check.severity === 'warning' ? 'Recomendada' : 'Opcional'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-surface-500">{check.helper}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="section-title text-xl">Redes sugeridas</h2>
            <div className="mt-4 grid gap-3">
              {networkRoles.map(({ id, role }) => {
                const network = NETWORKS[id];
                return (
                  <div key={id} className="rounded-2xl border border-surface-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-surface-900">{network.displayName}</p>
                        <p className="text-xs text-surface-500">Fee aprox. {network.feeRange.min}-{network.feeRange.max} {network.feeRange.unit}</p>
                      </div>
                      {network.recommended && <span className="rounded-full bg-brand-500/10 px-2 py-1 text-[10px] font-bold text-brand-500">RECOMENDADA</span>}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-surface-600">{role}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card border-amber-500/20 bg-amber-500/5">
            <div className="flex gap-3">
              <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <h2 className="font-display text-lg font-semibold text-surface-900">Regla de producción</h2>
                <p className="mt-2 text-sm leading-relaxed text-surface-600">
                  Primero usar blockchain como capa de prueba y trazabilidad. No prometer retornos garantizados,
                  no vender tokens de activos sin revisión legal local y no automatizar retiros grandes sin aprobación humana.
                </p>
                <Link href="https://github.com/jfrancesia-hue/SUELOAI/blob/main/docs/BLOCKCHAIN-CONNECTIONS.md" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600">
                  Ver guía técnica <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
