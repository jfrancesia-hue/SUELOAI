import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Building2, DollarSign, FolderPlus, TrendingUp, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { DashboardHero, MiniBuildingVisual, VisualActionCard, VisualMetricCard } from '@/components/dashboard/visual-shell';
import { Badge, ProgressBar } from '@/components/ui';
import { createClient } from '@/lib/supabase-server';
import { formatCurrency, formatDate, getProgressPercent, getStatusLabel } from '@/utils/helpers';

type DeveloperProject = {
  id: string;
  title: string;
  location: string;
  status: string;
  total_value: number;
  token_price: number;
  total_tokens: number;
  sold_tokens: number;
  expected_return: number;
  created_at: string;
};

type DeveloperInvestment = {
  id: string;
  investor_id: string;
  tokens_purchased: number;
  amount: number;
  created_at: string;
  investor?: { full_name?: string; email?: string };
};

export default async function DeveloperDashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'developer') redirect('/investor');

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('developer_id', user.id)
    .order('created_at', { ascending: false });

  const projectIds = projects?.map((project) => project.id) || [];
  const { data: investments } =
    projectIds.length > 0
      ? await supabase
          .from('investments')
          .select('*, investor:profiles(full_name, email)')
          .in('project_id', projectIds)
          .eq('status', 'confirmed')
          .order('created_at', { ascending: false })
          .limit(10)
      : { data: [] };

  return (
    <DeveloperDashboardView
      projects={(projects || []) as DeveloperProject[]}
      investments={(investments || []) as DeveloperInvestment[]}
    />
  );
}

function DeveloperDashboardView({
  projects,
  investments,
}: {
  projects: DeveloperProject[];
  investments: DeveloperInvestment[];
}) {
  const totalRaised = projects.reduce((sum, project) => sum + Number(project.sold_tokens) * Number(project.token_price), 0);
  const activeProjects = projects.filter((project) => ['funding', 'in_progress'].includes(project.status));
  const uniqueInvestors = new Set(investments.map((investment) => investment.investor_id));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <DashboardHero
        eyebrow="Panel desarrollador"
        title="Convertí tu obra en una oportunidad clara para inversores."
        description="Gestioná proyectos, documentación, leads, funding y seguimiento comercial con una presentación visual lista para Paraguay y Bolivia."
        visual={<MiniBuildingVisual label="Proyecto presentado al inversor" />}
      >
        <Link href="/projects?new=true" className="btn-primary">
          <FolderPlus className="h-4 w-4" />
          Nuevo Proyecto
        </Link>
        <Link href="/crm" className="btn-secondary">
          Ver CRM <ArrowRight className="h-4 w-4" />
        </Link>
      </DashboardHero>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <VisualMetricCard title="Total recaudado" value={formatCurrency(totalRaised)} icon={DollarSign} hint="Capital confirmado" tone="emerald" />
        <VisualMetricCard title="Proyectos activos" value={String(activeProjects.length)} icon={Building2} hint="En funding u obra" tone="cyan" />
        <VisualMetricCard title="Total proyectos" value={String(projects.length)} icon={TrendingUp} hint="Histórico" tone="gold" />
        <VisualMetricCard title="Inversores únicos" value={String(uniqueInvestors.size)} icon={Users} hint="Base interesada" tone="violet" />
      </div>

      <VisualActionCard
        title="Ruta visual para publicar un proyecto"
        description="La plataforma guía al desarrollador para no dejar información crítica afuera."
        items={['Ficha comercial clara', 'Documentos y permisos cargados', 'Scoring y riesgos explicados', 'Campañas y leads en CRM']}
      />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title text-lg">Mis Proyectos</h2>
          <Link href="/crm" className="btn-ghost text-sm text-brand-500">
            Ver CRM <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <ServerEmptyState
            title="Sin proyectos aun"
            description="Crea tu primer proyecto inmobiliario para empezar a recibir inversiones"
            action={<Link href="/projects?new=true" className="btn-primary"><FolderPlus className="h-4 w-4" />Crear Proyecto</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {projects.map((project) => {
              const progress = getProgressPercent(project.sold_tokens, project.total_tokens);
              const raised = Number(project.sold_tokens) * Number(project.token_price);

              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="card-interactive">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-surface-900">{project.title}</h3>
                      <p className="mt-0.5 text-xs text-surface-500">{project.location}</p>
                    </div>
                    <Badge
                      variant={
                        project.status === 'funding'
                          ? 'success'
                          : project.status === 'completed'
                            ? 'info'
                            : project.status === 'draft'
                              ? 'default'
                              : 'warning'
                      }
                    >
                      {getStatusLabel(project.status as any)}
                    </Badge>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-3">
                    <MiniMetric label="Valor Total" value={formatCurrency(Number(project.total_value))} />
                    <MiniMetric label="Recaudado" value={formatCurrency(raised)} highlight />
                    <MiniMetric label="Retorno" value={`${project.expected_return}%`} />
                  </div>

                  <ProgressBar value={project.sold_tokens} max={project.total_tokens} size="sm" />
                  <p className="mt-2 text-xs text-surface-500">{progress}% financiado</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {investments.length > 0 && (
        <div>
          <h2 className="section-title mb-4 text-lg">Ultimos Inversores</h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-surface-500">Inversor</th>
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-surface-500">Tokens</th>
                  <th className="p-4 text-right text-xs font-medium uppercase tracking-wider text-surface-500">Monto</th>
                  <th className="p-4 text-right text-xs font-medium uppercase tracking-wider text-surface-500">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment) => (
                  <tr key={investment.id} className="border-b border-surface-200/50 last:border-0">
                    <td className="p-4">
                      <p className="font-medium text-surface-900">{investment.investor?.full_name || 'Inversor'}</p>
                      <p className="text-xs text-surface-500">{investment.investor?.email}</p>
                    </td>
                    <td className="p-4 font-mono text-surface-700">{investment.tokens_purchased}</td>
                    <td className="p-4 text-right font-mono font-medium text-surface-900">{formatCurrency(Number(investment.amount))}</td>
                    <td className="p-4 text-right text-surface-500">{formatDate(investment.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ServerEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-200 bg-white px-4 py-16 text-center">
      <div className="mb-4 rounded-2xl bg-surface-200 p-4">
        <Building2 className="h-8 w-8 text-surface-500" />
      </div>
      <h3 className="font-display text-lg font-semibold text-surface-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-surface-500">{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}

function MiniMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-surface-500">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${highlight ? 'text-brand-500' : 'text-surface-900'}`}>{value}</p>
    </div>
  );
}
