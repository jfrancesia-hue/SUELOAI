'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Coins,
  DollarSign,
  ExternalLink,
  FileText,
  Landmark,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { generateContractPDF } from '@/utils/contract-pdf';
import { cn, formatCurrency, formatDate, getProgressPercent, getStatusLabel } from '@/utils/helpers';
import { Badge, Button, Input, LoadingSpinner, ProgressBar, StatCard } from '@/components/ui';
import type { Investment, Profile, Project, Wallet as WalletType } from '@/types';

type InvestmentResult = Investment & {
  verification_url?: string;
  wallet_movement?: Record<string, unknown>;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = String(params.id);
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [tokensToBuy, setTokensToBuy] = useState(1);
  const [investError, setInvestError] = useState('');
  const [investSuccess, setInvestSuccess] = useState(false);
  const [lastInvestment, setLastInvestment] = useState<InvestmentResult | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    setLoading(true);
    setInvestError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, projectRes, investmentsRes, walletRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('projects').select('*, developer:profiles(full_name, email, company_name)').eq('id', projectId).single(),
        supabase
          .from('investments')
          .select('*')
          .eq('project_id', projectId)
          .eq('investor_id', user.id)
          .order('created_at', { ascending: false }),
        fetch('/api/wallet', { cache: 'no-store' }).catch(() => null),
      ]);

      setProfile(profileRes.data);
      setProject(projectRes.data);
      setInvestments(investmentsRes.data || []);

      if (walletRes?.ok) {
        const walletData = await walletRes.json();
        setWallet(walletData.wallet || null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleInvest() {
    if (!project || !profile) return;

    setInvesting(true);
    setInvestError('');
    setInvestSuccess(false);
    setLastInvestment(null);

    const tokenPrice = Number(project.token_price);
    const amount = Math.round(tokensToBuy * tokenPrice * 100) / 100;
    const availableTokens = Number(project.total_tokens) - Number(project.sold_tokens);

    if (tokensToBuy > availableTokens) {
      setInvestError(`Solo quedan ${availableTokens} tokens disponibles`);
      setInvesting(false);
      return;
    }

    if (amount < Number(project.min_investment)) {
      setInvestError(`La inversion minima es ${formatCurrency(Number(project.min_investment))}`);
      setInvesting(false);
      return;
    }

    const response = await fetch('/api/investments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        tokens_purchased: tokensToBuy,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setInvestError(result.error || 'No pudimos confirmar la inversion');
      setInvesting(false);
      return;
    }

    const investment = result.data as InvestmentResult;
    const dateStr = new Date().toISOString().split('T')[0];

    const pdf = generateContractPDF({
      investorName: profile.full_name,
      investorDni: profile.dni || '',
      investorEmail: profile.email,
      projectTitle: project.title,
      projectLocation: project.location,
      developerName: (project.developer as any)?.company_name || (project.developer as any)?.full_name || 'N/A',
      amount,
      tokens: tokensToBuy,
      tokenPrice,
      expectedReturn: Number(project.expected_return),
      returnPeriod: Number(project.return_period_months),
      contractHash: investment.contract_hash || '',
      date: dateStr,
      investmentId: investment.id,
    });

    pdf.save(`contrato-suelo-${investment.id.slice(0, 8)}.pdf`);

    setLastInvestment(investment);
    setInvestSuccess(true);
    setInvesting(false);
    await loadData();
  }

  const metrics = useMemo(() => {
    if (!project) return null;

    const tokenPrice = Number(project.token_price);
    const amount = Math.round(tokensToBuy * tokenPrice * 100) / 100;
    const expectedReturn = Number(project.expected_return);
    const totalTokens = Number(project.total_tokens);
    const soldTokens = Number(project.sold_tokens);
    const totalValue = Number(project.total_value);
    const ownership = totalTokens ? (tokensToBuy / totalTokens) * 100 : 0;
    const annualReturn = amount * (expectedReturn / 100);
    const monthlyRent = annualReturn / 12;

    return {
      amount,
      availableTokens: totalTokens - soldTokens,
      progress: getProgressPercent(soldTokens, totalTokens),
      ownership,
      monthlyRent,
      conservative: amount * (1 + Math.max(expectedReturn - 4, 2) / 100),
      balanced: amount * (1 + expectedReturn / 100),
      optimistic: amount * (1 + (expectedReturn + 4) / 100),
      totalValue,
    };
  }, [project, tokensToBuy]);

  if (loading) return <LoadingSpinner />;
  if (!project || !metrics) return <div className="py-12 text-center text-surface-500">Proyecto no encontrado</div>;

  const isInvestor = profile?.role === 'investor';
  const isDeveloper = profile?.id === project.developer_id;
  const canInvest = isInvestor && project.status === 'funding';
  const walletAvailable = Number(wallet?.balance_available || 0);
  const hasEnoughBalance = walletAvailable >= metrics.amount;
  const heroImage = (project as any).hero_image_url || project.image_url || project.gallery_urls?.[0];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#07111F] p-6 text-white shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(6,182,212,0.16),transparent_30%),linear-gradient(135deg,#07111F,#111827_64%,#07111F)]" />
        {heroImage && (
          <div className="absolute inset-y-0 right-0 hidden w-[46%] opacity-42 lg:block">
            <img src={heroImage} alt={project.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07111F] via-[#07111F]/35 to-transparent" />
          </div>
        )}

        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge variant={project.status === 'funding' ? 'success' : 'warning'}>{getStatusLabel(project.status)}</Badge>
              <Badge variant="info" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                Hash verificable
              </Badge>
              {project.featured && (
                <Badge variant="success" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Destacado
                </Badge>
              )}
            </div>

            <h1 className="font-display text-4xl font-bold tracking-[-0.03em] text-white md:text-6xl">{project.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/62">{project.description}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-300" />
                {project.location}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-300" />
                Publicado {formatDate(project.created_at)}
              </span>
              <span className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-amber-300" />
                {(project.developer as any)?.company_name || (project.developer as any)?.full_name || 'Developer verificado'}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.065] p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/40">Funding</p>
                <p className="mt-1 font-display text-3xl font-bold">{metrics.progress}%</p>
              </div>
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                <Building2 className="h-6 w-6 text-emerald-300" />
              </div>
            </div>
            <ProgressBar value={Number(project.sold_tokens)} max={Number(project.total_tokens)} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-black/18 p-3">
                <p className="text-white/42">Recaudado</p>
                <p className="mt-1 font-semibold text-white">{formatCurrency(Number(project.sold_tokens) * Number(project.token_price))}</p>
              </div>
              <div className="rounded-2xl bg-black/18 p-3">
                <p className="text-white/42">Objetivo</p>
                <p className="mt-1 font-semibold text-white">{formatCurrency(metrics.totalValue)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Valor Total" value={formatCurrency(Number(project.total_value))} icon={DollarSign} />
        <StatCard title="Precio Token" value={formatCurrency(Number(project.token_price))} icon={Coins} />
        <StatCard title="Retorno Esperado" value={`${project.expected_return}%`} change={`${project.return_period_months} meses`} icon={TrendingUp} />
        <StatCard title="Disponibles" value={`${metrics.availableTokens}`} change={`${project.total_tokens} tokens totales`} icon={Building2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="card">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-brand-500/10 p-3">
                <FileText className="h-5 w-5 text-brand-500" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-surface-900">Centro de confianza</h2>
                <p className="text-sm text-surface-500">Tu participacion, tus documentos, tu trazabilidad.</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ['Developer', 'Verificado'],
                ['Contrato', 'SHA-256 publico'],
                ['Documentacion', project.documents_url ? 'Disponible' : 'En revision'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-surface-500">{label}</p>
                  <p className="mt-2 font-semibold text-surface-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-display text-lg font-bold text-surface-900">Escenarios de retorno</h2>
            <p className="mt-1 text-sm text-surface-500">Simulacion sobre el monto seleccionado.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ['Conservador', metrics.conservative, 'Ritmo menor al objetivo'],
                ['Medio', metrics.balanced, 'Retorno esperado del proyecto'],
                ['Optimista', metrics.optimistic, 'Mayor plusvalia estimada'],
              ].map(([label, value, note], index) => (
                <div
                  key={label as string}
                  className={cn(
                    'rounded-2xl border p-4',
                    index === 1 ? 'border-brand-500/25 bg-brand-500/10' : 'border-surface-200 bg-surface-50'
                  )}
                >
                  <p className="text-sm font-semibold text-surface-900">{label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-surface-900">{formatCurrency(Number(value))}</p>
                  <p className="mt-1 text-xs text-surface-500">{note}</p>
                </div>
              ))}
            </div>
          </div>

          {investments.length > 0 && (
            <div className="card">
              <h2 className="font-display text-lg font-bold text-surface-900">
                {isDeveloper ? 'Inversiones recibidas' : 'Mis inversiones en este proyecto'}
              </h2>
              <div className="mt-4 space-y-3">
                {investments.map((inv) => (
                  <div key={inv.id} className="flex flex-col gap-3 rounded-2xl border border-surface-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-surface-900">
                        {inv.tokens_purchased} tokens · {formatCurrency(Number(inv.amount))}
                      </p>
                      <p className="mt-1 text-xs text-surface-500">{formatDate(inv.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {inv.contract_hash && (
                        <Link href={`/verify/${inv.contract_hash}`} className="btn-ghost text-xs" target="_blank">
                          Verificar <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                      <Badge variant={inv.status === 'confirmed' ? 'success' : 'warning'}>{getStatusLabel(inv.status)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {canInvest ? (
            <div className="card gradient-border">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-surface-900">Invertir ahora</h2>
                  <p className="mt-1 text-sm text-surface-500">Contrato, hash y wallet en un solo paso.</p>
                </div>
                <div className="rounded-2xl bg-brand-500/10 p-3">
                  <ShieldCheck className="h-5 w-5 text-brand-500" />
                </div>
              </div>

              <Input
                id="tokens"
                label="Participaciones"
                type="number"
                min={1}
                max={metrics.availableTokens}
                value={tokensToBuy}
                onChange={(event) => {
                  const next = Math.floor(Number(event.target.value) || 1);
                  setTokensToBuy(Math.max(1, Math.min(metrics.availableTokens, next)));
                }}
              />

              <div className="mt-4 space-y-2 rounded-2xl bg-surface-100 p-4">
                <InvestmentRow label="Precio unitario" value={formatCurrency(Number(project.token_price))} />
                <InvestmentRow label="Participacion estimada" value={`${metrics.ownership.toFixed(3)}%`} />
                <InvestmentRow label="Renta mensual estimada" value={formatCurrency(metrics.monthlyRent)} />
                <div className="border-t border-surface-200 pt-3">
                  <InvestmentRow label="Total a invertir" value={formatCurrency(metrics.amount)} strong />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-surface-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-surface-600">
                    <Wallet className="h-4 w-4 text-brand-500" />
                    Saldo disponible
                  </span>
                  <span className={cn('font-mono font-semibold', hasEnoughBalance ? 'text-surface-900' : 'text-amber-500')}>
                    {formatCurrency(walletAvailable)}
                  </span>
                </div>
                {!hasEnoughBalance && (
                  <Link href="/wallet" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-500">
                    Cargar saldo <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {investError && (
                <div className="mt-4 flex gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{investError}</span>
                </div>
              )}

              {investSuccess && lastInvestment && (
                <div className="mt-4 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand-500">
                    <CheckCircle2 className="h-4 w-4" />
                    Inversion confirmada
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-surface-500">
                    El contrato se descargo y tu hash publico ya esta disponible.
                  </p>
                  {lastInvestment.contract_hash && (
                    <Link href={`/verify/${lastInvestment.contract_hash}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-500">
                      Ver hash <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              )}

              <Button onClick={handleInvest} loading={investing} disabled={!hasEnoughBalance || investing} className="mt-4 w-full" icon={ShieldCheck}>
                Confirmar inversion
              </Button>

              <p className="mt-3 text-center text-xs leading-relaxed text-surface-500">
                Se debita tu wallet, se confirma la participacion y se genera un contrato PDF verificable.
              </p>
            </div>
          ) : (
            <div className="card">
              <h2 className="font-display text-lg font-bold text-surface-900">Proyecto no disponible para invertir</h2>
              <p className="mt-2 text-sm text-surface-500">El estado actual es {getStatusLabel(project.status)}.</p>
              <Link href="/marketplace" className="btn-primary mt-4">
                Ver otros proyectos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function InvestmentRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={strong ? 'font-semibold text-surface-900' : 'text-surface-500'}>{label}</span>
      <span className={strong ? 'font-display text-lg font-bold text-brand-500' : 'font-mono font-semibold text-surface-900'}>{value}</span>
    </div>
  );
}
