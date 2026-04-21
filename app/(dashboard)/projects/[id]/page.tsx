'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { formatCurrency, formatDate, getStatusLabel, getProgressPercent } from '@/utils/helpers';
import { generateHash, createContractSnapshot } from '@/utils/hash';
import { generateContractPDF } from '@/utils/contract-pdf';
import { Button, Input, Badge, ProgressBar, StatCard, LoadingSpinner } from '@/components/ui';
import type { Project, Profile, Investment } from '@/types';
import {
  MapPin, Calendar, TrendingUp, DollarSign, Users,
  ShieldCheck, FileText, Download, ExternalLink,
  Building2, Coins,
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const supabase = createClient();
  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [tokensToBuy, setTokensToBuy] = useState(1);
  const [investError, setInvestError] = useState('');
  const [investSuccess, setInvestSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, projectRes, investmentsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('projects').select('*, developer:profiles(full_name, email, company_name)').eq('id', params.id).single(),
      supabase.from('investments').select('*').eq('project_id', params.id).eq('investor_id', user.id).order('created_at', { ascending: false }),
    ]);

    setProfile(profileRes.data);
    setProject(projectRes.data);
    setInvestments(investmentsRes.data || []);
    setLoading(false);
  }

  async function handleInvest() {
    if (!project || !profile) return;
    setInvesting(true);
    setInvestError('');

    const amount = tokensToBuy * project.token_price;
    const availableTokens = project.total_tokens - project.sold_tokens;

    if (tokensToBuy > availableTokens) {
      setInvestError(`Solo quedan ${availableTokens} tokens disponibles`);
      setInvesting(false);
      return;
    }

    if (amount < project.min_investment) {
      setInvestError(`La inversión mínima es ${formatCurrency(project.min_investment)}`);
      setInvesting(false);
      return;
    }

    // 1. Crear la inversión
    const { data: investment, error: invError } = await supabase
      .from('investments')
      .insert({
        investor_id: profile.id,
        project_id: project.id,
        tokens_purchased: tokensToBuy,
        amount,
        status: 'confirmed',
      })
      .select()
      .single();

    if (invError) {
      setInvestError(invError.message);
      setInvesting(false);
      return;
    }

    // 2. Crear snapshot y generar hash
    const dateStr = new Date().toISOString().split('T')[0];
    const snapshot = createContractSnapshot({
      investorName: profile.full_name,
      investorDni: profile.dni || '',
      projectTitle: project.title,
      amount,
      tokens: tokensToBuy,
      date: dateStr,
    });

    const contractHash = await generateHash(snapshot);

    // 3. Actualizar inversión con hash
    await supabase
      .from('investments')
      .update({ contract_hash: contractHash })
      .eq('id', investment.id);

    // 4. Registrar hash en hash_records
    await supabase.from('hash_records').insert({
      investment_id: investment.id,
      project_id: project.id,
      hash: contractHash,
      algorithm: 'SHA-256',
      data_snapshot: JSON.parse(snapshot),
      verified: true,
      verification_url: `${window.location.origin}/verify/${contractHash}`,
      created_by: profile.id,
    });

    // 5. Crear transacción
    await supabase.from('transactions').insert({
      user_id: profile.id,
      investment_id: investment.id,
      project_id: project.id,
      type: 'investment',
      amount,
      description: `Inversión de ${tokensToBuy} tokens en ${project.title}`,
    });

    // 6. Generar PDF
    const pdf = generateContractPDF({
      investorName: profile.full_name,
      investorDni: profile.dni || '',
      investorEmail: profile.email,
      projectTitle: project.title,
      projectLocation: project.location,
      developerName: (project.developer as any)?.full_name || 'N/A',
      amount,
      tokens: tokensToBuy,
      tokenPrice: project.token_price,
      expectedReturn: project.expected_return,
      returnPeriod: project.return_period_months,
      contractHash,
      date: dateStr,
      investmentId: investment.id,
    });

    pdf.save(`contrato-suelo-${investment.id.slice(0, 8)}.pdf`);

    setInvestSuccess(true);
    setInvesting(false);
    await loadData();
  }

  if (loading) return <LoadingSpinner />;
  if (!project) return <div className="text-center py-12 text-surface-500">Proyecto no encontrado</div>;

  const progress = getProgressPercent(project.sold_tokens, project.total_tokens);
  const availableTokens = project.total_tokens - project.sold_tokens;
  const isInvestor = profile?.role === 'investor';
  const isDeveloper = profile?.id === project.developer_id;
  const investmentTotal = tokensToBuy * project.token_price;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-surface-900">
              {project.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-surface-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {project.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(project.created_at)}
              </span>
            </div>
          </div>
          <Badge
            variant={
              project.status === 'funding' ? 'success' :
              project.status === 'completed' ? 'info' :
              project.status === 'draft' ? 'default' : 'warning'
            }
          >
            {getStatusLabel(project.status)}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Valor Total" value={formatCurrency(project.total_value)} icon={DollarSign} />
        <StatCard title="Precio por Token" value={formatCurrency(project.token_price)} icon={Coins} />
        <StatCard
          title="Retorno Esperado"
          value={`${project.expected_return}%`}
          change={`en ${project.return_period_months} meses`}
          changeType="neutral"
          icon={TrendingUp}
        />
        <StatCard
          title="Tokens Disponibles"
          value={`${availableTokens} / ${project.total_tokens}`}
          icon={Building2}
        />
      </div>

      {/* Progress */}
      <div className="card">
        <h3 className="font-display font-semibold text-surface-900 mb-3">Progreso de Financiamiento</h3>
        <ProgressBar value={project.sold_tokens} max={project.total_tokens} />
        <div className="flex justify-between mt-3 text-sm">
          <span className="text-surface-500">
            Recaudado: <span className="text-brand-500 font-semibold">{formatCurrency(project.sold_tokens * project.token_price)}</span>
          </span>
          <span className="text-surface-500">
            Objetivo: <span className="text-surface-800 font-semibold">{formatCurrency(project.total_value)}</span>
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <h3 className="font-display font-semibold text-surface-900 mb-3">Descripción del Proyecto</h3>
        <p className="text-surface-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Investment panel */}
        {isInvestor && project.status === 'funding' && !investSuccess && (
          <div className="lg:col-span-2 card gradient-border sticky top-4">
            <h3 className="font-display font-semibold text-surface-900 mb-4">Invertir</h3>

            <Input
              id="tokens"
              label="Cantidad de Tokens"
              type="number"
              min={1}
              max={availableTokens}
              value={tokensToBuy}
              onChange={(e) => setTokensToBuy(Math.max(1, Number(e.target.value)))}
            />

            <div className="mt-4 p-4 rounded-xl bg-surface-200/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Tokens</span>
                <span className="text-surface-900 font-mono">{tokensToBuy}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Precio unitario</span>
                <span className="text-surface-900 font-mono">{formatCurrency(project.token_price)}</span>
              </div>
              <div className="border-t border-surface-300 my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-surface-900">Total</span>
                <span className="font-display font-bold text-lg text-brand-500">
                  {formatCurrency(investmentTotal)}
                </span>
              </div>
            </div>

            {investError && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">{investError}</p>
              </div>
            )}

            <Button
              onClick={handleInvest}
              loading={investing}
              className="w-full mt-4"
              icon={ShieldCheck}
            >
              Confirmar Inversión
            </Button>

            <p className="text-xs text-surface-500 mt-3 text-center">
              Se generará un contrato PDF con verificación SHA-256
            </p>
          </div>
        )}

        {/* Success state */}
        {investSuccess && (
          <div className="lg:col-span-2 card text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-brand-500" />
            </div>
            <h3 className="font-display font-bold text-surface-900 text-lg">¡Inversión Exitosa!</h3>
            <p className="text-sm text-surface-500 mt-2">
              Tu contrato fue generado y descargado. Podés verificarlo en cualquier momento.
            </p>
            <Button
              onClick={() => setInvestSuccess(false)}
              variant="secondary"
              className="mt-4"
            >
              Invertir de nuevo
            </Button>
          </div>
        )}

        {/* My investments in this project */}
        <div className={isInvestor && project.status === 'funding' ? 'lg:col-span-3' : 'lg:col-span-5'}>
          {investments.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-surface-900 mb-3">
                {isDeveloper ? 'Inversiones Recibidas' : 'Mis Inversiones en este Proyecto'}
              </h3>
              <div className="space-y-2">
                {investments.map((inv) => (
                  <div key={inv.id} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-surface-900">
                        {inv.tokens_purchased} tokens · {formatCurrency(inv.amount)}
                      </p>
                      <p className="text-xs text-surface-500">{formatDate(inv.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {inv.contract_hash && (
                        <a
                          href={`/verify/${inv.contract_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost text-xs"
                        >
                          <FileText className="w-3 h-3" />
                          Verificar
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <Badge variant={inv.status === 'confirmed' ? 'success' : 'warning'}>
                        {getStatusLabel(inv.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
