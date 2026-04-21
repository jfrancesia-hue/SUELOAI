import { createClient } from '@/lib/supabase-server';
import { formatCurrency, getProgressPercent } from '@/utils/helpers';
import { Badge, ProgressBar, EmptyState } from '@/components/ui';
import { Building2, MapPin, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

/** Color del badge según rating IA (A+ = verde, D = rojo). */
function ratingVariant(rating: string | null): 'success' | 'info' | 'warning' | 'danger' | 'default' {
  if (!rating) return 'default';
  if (rating === 'A_plus' || rating === 'A') return 'success';
  if (rating === 'B') return 'info';
  if (rating === 'C') return 'warning';
  if (rating === 'D') return 'danger';
  return 'default';
}

function ratingLabel(rating: string | null): string {
  if (!rating) return 'Sin scoring';
  if (rating === 'A_plus') return 'A+';
  return rating;
}

export default async function MarketplacePage() {
  const supabase = createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      developer:profiles(full_name, company_name),
      score:project_scores(rating, overall_score, ai_analysis)
    `)
    .in('status', ['funding', 'funded', 'in_progress'])
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Marketplace</h1>
        <p className="text-surface-500 mt-1">Explorá proyectos inmobiliarios disponibles para inversión</p>
      </div>

      {/* Projects grid */}
      {!projects || projects.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hay proyectos disponibles"
          description="Pronto se publicarán nuevos proyectos de inversión"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const progress = getProgressPercent(project.sold_tokens, project.total_tokens);
            const available = project.total_tokens - project.sold_tokens;
            const scoreRow = Array.isArray((project as any).score)
              ? (project as any).score[0]
              : (project as any).score;
            const aiRating = scoreRow?.rating ?? null;
            const aiScore = scoreRow?.overall_score ?? null;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="card-interactive group relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                  {aiRating && (
                    <Badge variant={ratingVariant(aiRating)} className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      IA {ratingLabel(aiRating)}
                      {aiScore != null && <span className="opacity-70">· {aiScore}</span>}
                    </Badge>
                  )}
                  {project.featured && <Badge variant="success">Destacado</Badge>}
                </div>

                {/* Project image placeholder */}
                <div className="h-40 -mx-6 -mt-6 mb-4 bg-gradient-to-br from-surface-200 to-surface-300 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-surface-400" />
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-display font-bold text-surface-900 group-hover:text-brand-500 transition-colors">
                      {project.title}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-surface-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      {project.location}
                    </p>
                  </div>

                  {project.developer && (
                    <p className="text-xs text-surface-500">
                      por {(project.developer as any).company_name || (project.developer as any).full_name}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-surface-200">
                    <div>
                      <p className="text-[10px] text-surface-500 uppercase tracking-wider">Valor</p>
                      <p className="text-sm font-bold text-surface-900 mt-0.5">
                        {formatCurrency(project.total_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-surface-500 uppercase tracking-wider">Token</p>
                      <p className="text-sm font-bold text-surface-900 mt-0.5">
                        {formatCurrency(project.token_price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-surface-500 uppercase tracking-wider">Retorno</p>
                      <p className="text-sm font-bold text-brand-500 mt-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {project.expected_return}%
                      </p>
                    </div>
                  </div>

                  <ProgressBar value={project.sold_tokens} max={project.total_tokens} size="sm" />

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-500">
                      {available} tokens disponibles
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-brand-500 group-hover:gap-2 transition-all">
                      Ver detalle <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
