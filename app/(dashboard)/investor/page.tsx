import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { formatCurrency, formatDate, getStatusLabel } from '@/utils/helpers';
import { StatCard, Badge, ProgressBar, EmptyState } from '@/components/ui';
import { PortfolioCharts } from '@/components/dashboard/PortfolioCharts';
import { Wallet, TrendingUp, Building2, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function InvestorDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'investor') redirect('/developer');

  // Fetch investments with project data
  const { data: investments } = await supabase
    .from('investments')
    .select('*, project:projects(*)')
    .eq('investor_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, project:projects(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const activeInvestments = investments?.filter((i) => i.status === 'confirmed') || [];
  const projectIds = [...new Set(activeInvestments.map((i) => i.project_id))];

  // Breakdown para charts
  const byLocationMap = new Map<string, number>();
  const byProjectMap = new Map<string, number>();
  for (const inv of activeInvestments) {
    const loc = inv.project?.location || 'Sin ubicación';
    const title = inv.project?.title || 'Proyecto';
    const amount = Number(inv.amount) || 0;
    byLocationMap.set(loc, (byLocationMap.get(loc) ?? 0) + amount);
    byProjectMap.set(title, (byProjectMap.get(title) ?? 0) + amount);
  }
  const byLocation = Array.from(byLocationMap.entries()).map(([name, value]) => ({ name, value }));
  const byProject = Array.from(byProjectMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">
          Hola, {profile.full_name?.split(' ')[0] || 'Inversor'} 👋
        </h1>
        <p className="text-surface-500 mt-1">Resumen de tu portafolio de inversiones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invertido"
          value={formatCurrency(profile.total_invested)}
          icon={Wallet}
          change="+2.3% este mes"
          changeType="positive"
        />
        <StatCard
          title="Retornos"
          value={formatCurrency(profile.total_returns)}
          icon={TrendingUp}
          change="Acumulado"
          changeType="neutral"
        />
        <StatCard
          title="Proyectos Activos"
          value={String(projectIds.length)}
          icon={Building2}
        />
        <StatCard
          title="Inversiones"
          value={String(activeInvestments.length)}
          icon={FileText}
        />
      </div>

      {/* Charts */}
      {byLocation.length > 0 && (
        <PortfolioCharts byLocation={byLocation} byProject={byProject} />
      )}

      {/* Investments list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title text-lg">Mis Inversiones</h2>
          <Link href="/marketplace" className="btn-ghost text-sm text-brand-500">
            Ver Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!investments || investments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Sin inversiones aún"
            description="Explorá el marketplace para encontrar tu primer proyecto"
            action={
              <Link href="/marketplace" className="btn-primary">
                Explorar Proyectos
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {investments.map((inv) => (
              <div key={inv.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-surface-900 truncate">
                      {inv.project?.title || 'Proyecto'}
                    </h3>
                    <Badge
                      variant={
                        inv.status === 'confirmed' ? 'success' :
                        inv.status === 'pending' ? 'warning' : 'danger'
                      }
                    >
                      {getStatusLabel(inv.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-surface-500">
                    {inv.tokens_purchased} tokens · {formatDate(inv.created_at)}
                  </p>
                  {inv.project && (
                    <ProgressBar
                      value={inv.project.sold_tokens}
                      max={inv.project.total_tokens}
                      size="sm"
                      className="mt-2 max-w-xs"
                    />
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-surface-900">
                    {formatCurrency(inv.amount)}
                  </p>
                  {inv.project?.expected_return && (
                    <p className="text-xs text-brand-500">
                      {inv.project.expected_return}% retorno esperado
                    </p>
                  )}
                </div>

                <Link
                  href={`/projects/${inv.project_id}`}
                  className="btn-ghost text-xs shrink-0"
                >
                  Ver <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent transactions */}
      {transactions && transactions.length > 0 && (
        <div>
          <h2 className="section-title text-lg mb-4">Últimas Transacciones</h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Proyecto</th>
                  <th className="text-left p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-right p-4 text-xs font-medium text-surface-500 uppercase tracking-wider">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-surface-200/50 last:border-0">
                    <td className="p-4 text-surface-600">{formatDate(tx.created_at)}</td>
                    <td className="p-4 text-surface-900">{tx.project?.title || '-'}</td>
                    <td className="p-4">
                      <Badge variant={tx.type === 'return' ? 'success' : 'info'}>
                        {tx.type === 'investment' ? 'Inversión' : tx.type === 'return' ? 'Retorno' : tx.type}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-mono font-medium text-surface-900">
                      {formatCurrency(tx.amount)}
                    </td>
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
