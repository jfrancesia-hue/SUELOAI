import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Building2, FileText, TrendingUp, Wallet } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { PortfolioCharts } from '@/components/dashboard/PortfolioCharts';
import { Badge, ProgressBar } from '@/components/ui';
import { createClient } from '@/lib/supabase-server';
import { demoProfiles } from '@/lib/demo-session';
import { formatCurrency, formatDate, getStatusLabel } from '@/utils/helpers';

type DashboardInvestment = {
  id: string;
  investor_id: string;
  project_id: string;
  tokens_purchased: number;
  amount: number;
  status: string;
  created_at: string;
  project?: any;
};

type DashboardTransaction = {
  id: string;
  type: string;
  amount: number;
  created_at: string;
  project?: { title?: string } | null;
};

export default async function InvestorDashboard() {
  const demoRole = cookies().get('suelo_demo_role')?.value;

  if (demoRole === 'investor') {
    return (
      <InvestorDashboardView
        profile={demoProfiles.investor}
        investments={demoInvestments}
        transactions={demoTransactions}
      />
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'investor') redirect('/developer');

  const { data: investments } = await supabase
    .from('investments')
    .select('*, project:projects(*)')
    .eq('investor_id', user.id)
    .order('created_at', { ascending: false });

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, project:projects(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <InvestorDashboardView
      profile={profile}
      investments={(investments || []) as DashboardInvestment[]}
      transactions={(transactions || []) as DashboardTransaction[]}
    />
  );
}

function InvestorDashboardView({
  profile,
  investments,
  transactions,
}: {
  profile: any;
  investments: DashboardInvestment[];
  transactions: DashboardTransaction[];
}) {
  const activeInvestments = investments.filter((investment) => investment.status === 'confirmed');
  const projectIds = [...new Set(activeInvestments.map((investment) => investment.project_id))];

  const byLocationMap = new Map<string, number>();
  const byProjectMap = new Map<string, number>();

  for (const investment of activeInvestments) {
    const location = investment.project?.location || 'Sin ubicacion';
    const title = investment.project?.title || 'Proyecto';
    const amount = Number(investment.amount) || 0;
    byLocationMap.set(location, (byLocationMap.get(location) ?? 0) + amount);
    byProjectMap.set(title, (byProjectMap.get(title) ?? 0) + amount);
  }

  const byLocation = Array.from(byLocationMap.entries()).map(([name, value]) => ({ name, value }));
  const byProject = Array.from(byProjectMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">
            Hola, {profile.full_name?.split(' ')[0] || 'Inversor'}
          </h1>
          <p className="mt-1 text-surface-500">Resumen de tu portafolio de inversiones</p>
        </div>
        <Link href="/wallet" className="btn-primary">
          <Wallet className="h-4 w-4" />
          Ir a mi billetera
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ServerStatCard title="Total Invertido" value={formatCurrency(Number(profile.total_invested || 0))} icon={Wallet} change="+2.3% este mes" changeType="positive" />
        <ServerStatCard title="Retornos" value={formatCurrency(Number(profile.total_returns || 0))} icon={TrendingUp} change="Acumulado" />
        <ServerStatCard title="Proyectos Activos" value={String(projectIds.length)} icon={Building2} />
        <ServerStatCard title="Inversiones" value={String(activeInvestments.length)} icon={FileText} />
      </div>

      {byLocation.length > 0 && <PortfolioCharts byLocation={byLocation} byProject={byProject} />}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title text-lg">Mis Inversiones</h2>
          <Link href="/marketplace" className="btn-ghost text-sm text-brand-500">
            Ver Marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {investments.length === 0 ? (
          <ServerEmptyState
            title="Sin inversiones aun"
            description="Explora el marketplace para encontrar tu primer proyecto"
            action={<Link href="/marketplace" className="btn-primary">Explorar Proyectos</Link>}
          />
        ) : (
          <div className="space-y-3">
            {investments.map((investment) => (
              <div key={investment.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-display truncate font-semibold text-surface-900">{investment.project?.title || 'Proyecto'}</h3>
                    <Badge variant={investment.status === 'confirmed' ? 'success' : investment.status === 'pending' ? 'warning' : 'danger'}>
                      {getStatusLabel(investment.status as any)}
                    </Badge>
                  </div>
                  <p className="text-sm text-surface-500">
                    {investment.tokens_purchased} tokens · {formatDate(investment.created_at)}
                  </p>
                  {investment.project && (
                    <ProgressBar value={investment.project.sold_tokens} max={investment.project.total_tokens} size="sm" className="mt-2 max-w-xs" />
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-display font-bold text-surface-900">{formatCurrency(Number(investment.amount))}</p>
                  {investment.project?.expected_return && (
                    <p className="text-xs text-brand-500">{investment.project.expected_return}% retorno esperado</p>
                  )}
                </div>

                <Link href={`/projects/${investment.project_id}`} className="btn-ghost shrink-0 text-xs">
                  Ver <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <div>
          <h2 className="section-title mb-4 text-lg">Ultimas Transacciones</h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-surface-500">Fecha</th>
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-surface-500">Proyecto</th>
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-surface-500">Tipo</th>
                  <th className="p-4 text-right text-xs font-medium uppercase tracking-wider text-surface-500">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-surface-200/50 last:border-0">
                    <td className="p-4 text-surface-600">{formatDate(transaction.created_at)}</td>
                    <td className="p-4 text-surface-900">{transaction.project?.title || '-'}</td>
                    <td className="p-4">
                      <Badge variant={transaction.type === 'return' ? 'success' : 'info'}>
                        {transaction.type === 'investment' ? 'Inversion' : transaction.type === 'return' ? 'Retorno' : transaction.type}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-mono font-medium text-surface-900">{formatCurrency(Number(transaction.amount))}</td>
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

function ServerStatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'positive' | 'neutral';
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-surface-600">{title}</p>
          <p className="font-display text-2xl font-bold text-surface-900">{value}</p>
          {change && <p className={changeType === 'positive' ? 'text-xs font-medium text-brand-500' : 'text-xs font-medium text-surface-500'}>{change}</p>}
        </div>
        <div className="rounded-xl bg-brand-500/10 p-3">
          <Icon className="h-5 w-5 text-brand-500" />
        </div>
      </div>
    </div>
  );
}

function ServerEmptyState({ title, description, action }: { title: string; description: string; action: ReactNode }) {
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

const demoInvestments: DashboardInvestment[] = [
  {
    id: 'demo-investment-001',
    investor_id: demoProfiles.investor.id,
    project_id: 'demo-project-asuncion',
    tokens_purchased: 5,
    amount: 500,
    status: 'confirmed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    project: {
      title: 'Torre Asuncion Eje',
      location: 'Asuncion, Paraguay',
      sold_tokens: 720,
      total_tokens: 1000,
      expected_return: 14.2,
    },
  },
  {
    id: 'demo-investment-002',
    investor_id: demoProfiles.investor.id,
    project_id: 'demo-project-cordoba',
    tokens_purchased: 12,
    amount: 1200,
    status: 'confirmed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    project: {
      title: 'Renta Cordoba Norte',
      location: 'Cordoba, Argentina',
      sold_tokens: 610,
      total_tokens: 1250,
      expected_return: 12.8,
    },
  },
];

const demoTransactions: DashboardTransaction[] = [
  {
    id: 'demo-transaction-001',
    type: 'investment',
    amount: 500,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    project: { title: 'Torre Asuncion Eje' },
  },
  {
    id: 'demo-transaction-002',
    type: 'return',
    amount: 42,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    project: { title: 'Renta Cordoba Norte' },
  },
];
