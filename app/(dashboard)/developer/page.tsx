import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { formatCurrency, formatDate, getStatusLabel, getProgressPercent } from '@/utils/helpers';
import { StatCard, Badge, ProgressBar, EmptyState } from '@/components/ui';
import { Building2, DollarSign, Users, FolderPlus, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function DeveloperDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'developer') redirect('/investor');

  // Fetch developer's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('developer_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch investments in developer's projects
  const projectIds = projects?.map((p) => p.id) || [];
  const { data: investments } = projectIds.length > 0
    ? await supabase
        .from('investments')
        .select('*, investor:profiles(full_name, email)')
        .in('project_id', projectIds)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] };

  const totalRaised = projects?.reduce((sum, p) => sum + (p.sold_tokens * p.token_price), 0) || 0;
  const activeProjects = projects?.filter((p) => ['funding', 'in_progress'].includes(p.status)) || [];
  const uniqueInvestors = new Set(investments?.map((i) => i.investor_id) || []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">
            Panel de Desarrollador
          </h1>
          <p className="text-surface-500 mt-1">Gestioná tus proyectos inmobiliarios</p>
        </div>
        <Link href="/projects?new=true" className="btn-primary">
          <FolderPlus className="w-4 h-4" />
          Nuevo Proyecto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Recaudado"
          value={formatCurrency(totalRaised)}
          icon={DollarSign}
        />
        <StatCard
          title="Proyectos Activos"
          value={String(activeProjects.length)}
          icon={Building2}
        />
        <StatCard
          title="Total Proyectos"
          value={String(projects?.length || 0)}
          icon={TrendingUp}
        />
        <StatCard
          title="Inversores Únicos"
          value={String(uniqueInvestors.size)}
          icon={Users}
        />
      </div>

      {/* Projects list */}
      <div>
        <h2 className="section-title text-lg mb-4">Mis Proyectos</h2>

        {!projects || projects.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Sin proyectos aún"
            description="Creá tu primer proyecto inmobiliario para empezar a recibir inversiones"
            action={
              <Link href="/projects?new=true" className="btn-primary">
                <FolderPlus className="w-4 h-4" />
                Crear Proyecto
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map((project) => {
              const progress = getProgressPercent(project.sold_tokens, project.total_tokens);
              const raised = project.sold_tokens * project.token_price;

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="card-interactive"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-surface-900">
                        {project.title}
                      </h3>
                      <p className="text-xs text-surface-500 mt-0.5">{project.location}</p>
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

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-surface-500">Valor Total</p>
                      <p className="text-sm font-semibold text-surface-900 mt-0.5">
                        {formatCurrency(project.total_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-surface-500">Recaudado</p>
                      <p className="text-sm font-semibold text-brand-500 mt-0.5">
                        {formatCurrency(raised)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-surface-500">Retorno</p>
                      <p className="text-sm font-semibold text-surface-900 mt-0.5">
                        {project.expected_return}%
                      </p>
                    </div>
                  </div>

                  <ProgressBar value={project.sold_tokens} max={project.total_tokens} size="sm" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent investors */}
      {investments && investments.length > 0 && (
        <div>
          <h2 className="section-title text-lg mb-4">Últimos Inversores</h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Inversor</th>
                  <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Tokens</th>
                  <th className="text-right p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Monto</th>
                  <th className="text-right p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id} className="border-b border-surface-200/50 last:border-0">
                    <td className="p-4">
                      <p className="text-surface-900 font-medium">{inv.investor?.full_name || 'Inversor'}</p>
                      <p className="text-xs text-surface-500">{inv.investor?.email}</p>
                    </td>
                    <td className="p-4 font-mono text-surface-700">{inv.tokens_purchased}</td>
                    <td className="p-4 text-right font-mono font-medium text-surface-900">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="p-4 text-right text-surface-500">{formatDate(inv.created_at)}</td>
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
