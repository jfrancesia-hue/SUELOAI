import { createAdminClient } from '@/lib/supabase-server';
import { demoProjects } from '@/lib/demo-data';
import { demoProfiles, isDemoModeEnabled } from '@/lib/demo-session';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { Shield, CheckCircle2, XCircle, FileText, Hash } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: { hash: string };
}

export default async function PublicVerifyPage({ params }: PageProps) {
  const demoProject = isDemoModeEnabled() && params.hash.startsWith('demo-') ? demoProjects.find((project) => params.hash.includes(project.slug)) || demoProjects[0] : null;
  if (demoProject) {
    return (
      <VerifyView
        hash={params.hash}
        record={{
          id: 'demo-hash-record',
          algorithm: 'SHA-256',
          verified: true,
          created_at: new Date().toISOString(),
        }}
        investment={{
          amount: demoProject.token_price,
          tokens_purchased: 1,
          created_at: new Date().toISOString(),
          investor: { full_name: demoProfiles.investor.full_name },
          project: {
            ...demoProject,
            developer: demoProfiles.developer,
          },
        }}
      />
    );
  }

  const supabase = createAdminClient();

  const { data: record } = await supabase
    .from('hash_records')
    .select(`
      *,
      investment:investments(
        id, amount, tokens_purchased, created_at, status,
        investor:profiles(full_name),
        project:projects(title, location, expected_return, return_period_months, developer:profiles(full_name, company_name))
      )
    `)
    .eq('hash', params.hash)
    .single();

  const investment = record?.investment;

  return <VerifyView hash={params.hash} record={record} investment={investment} />;
}

function VerifyView({ hash, record, investment }: { hash: string; record: any; investment: any }) {
  const isValid = !!record && record.verified;
  const project = investment?.project;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="border-b border-surface-200 bg-surface-100/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-surface-900">
              Prop<span className="text-brand-500">Chain</span>
            </span>
          </Link>
          <span className="text-xs text-surface-500">Verificación Pública</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Status */}
        <div className="text-center mb-8">
          {isValid ? (
            <>
              <div className="w-20 h-20 rounded-3xl bg-brand-500/15 flex items-center justify-center mx-auto mb-4 animate-scale-in">
                <CheckCircle2 className="w-10 h-10 text-brand-500" />
              </div>
              <h1 className="font-display text-3xl font-bold text-surface-900">
                Contrato Verificado
              </h1>
              <p className="text-surface-500 mt-2">
                Este contrato es auténtico y no ha sido modificado
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-3xl bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="font-display text-3xl font-bold text-surface-900">
                No Encontrado
              </h1>
              <p className="text-surface-500 mt-2">
                No se encontró un contrato con este hash en nuestros registros
              </p>
            </>
          )}
        </div>

        {/* Hash display */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-surface-500" />
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Hash SHA-256</span>
          </div>
          <p className="font-mono text-xs text-surface-700 break-all bg-surface-200 p-3 rounded-lg">
            {hash}
          </p>
        </div>

        {isValid && investment && project && (
          <div className="space-y-4">
            {/* Contract details */}
            <div className="card">
              <h3 className="font-display font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                Detalles del Contrato
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-surface-200/50">
                  <span className="text-sm text-surface-500">Proyecto</span>
                  <span className="text-sm font-medium text-surface-900">{project.title}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-200/50">
                  <span className="text-sm text-surface-500">Ubicación</span>
                  <span className="text-sm text-surface-900">{project.location}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-200/50">
                  <span className="text-sm text-surface-500">Inversor</span>
                  <span className="text-sm text-surface-900">{investment.investor?.full_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-200/50">
                  <span className="text-sm text-surface-500">Desarrollador</span>
                  <span className="text-sm text-surface-900">
                    {(project.developer as any)?.company_name || (project.developer as any)?.full_name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-200/50">
                  <span className="text-sm text-surface-500">Monto</span>
                  <span className="text-sm font-bold text-surface-900">{formatCurrency(investment.amount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-200/50">
                  <span className="text-sm text-surface-500">Participaciones</span>
                  <span className="text-sm font-mono text-surface-900">{investment.tokens_purchased} tokens</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-200/50">
                  <span className="text-sm text-surface-500">Retorno Esperado</span>
                  <span className="text-sm text-brand-500 font-medium">
                    {project.expected_return}% en {project.return_period_months} meses
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-surface-500">Fecha del Contrato</span>
                  <span className="text-sm text-surface-900">{formatDate(investment.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Verification metadata */}
            <div className="card bg-brand-500/5 border-brand-500/10">
              <div className="flex items-center gap-2 text-sm text-brand-500 font-medium">
                <Shield className="w-4 h-4" />
                Registro verificado el {formatDate(record.created_at)}
              </div>
              <p className="text-xs text-surface-500 mt-2">
                Algoritmo: {record.algorithm} · ID Registro: {record.id.slice(0, 8)}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-surface-400">
            Verificación provista por Suelo · Plataforma de Inversión Inmobiliaria Fraccionada
          </p>
          <Link href="/" className="text-xs text-brand-500 hover:text-brand-400 mt-1 inline-block">
            Ir a Suelo
          </Link>
        </div>
      </main>
    </div>
  );
}
