import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, Scale, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { demoProjects, isDemoMode } from '@/lib/demo';
import { formatCurrency, getProgressPercent } from '@/utils/helpers';
import type { Project } from '@/types';

export const dynamic = 'force-dynamic';

type ComparePageProps = {
  searchParams?: { projects?: string };
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const selectedIds = (searchParams?.projects || '').split(',').map((item) => item.trim()).filter(Boolean);
  let projects: Project[] = [];

  if (isDemoMode()) {
    projects = selectedIds.length > 0 ? demoProjects.filter((project) => selectedIds.includes(project.id) || selectedIds.includes(project.slug)) : demoProjects.slice(0, 3);
    if (projects.length < 2) projects = demoProjects.slice(0, 3);
  } else {
    const supabase = createClient();
    const query = supabase.from('projects').select('*, developer:profiles(full_name, company_name)').in('status', ['funding', 'funded', 'in_progress']).limit(3);
    const { data } = selectedIds.length > 0 ? await query.in('id', selectedIds) : await query;
    projects = (data || []) as Project[];
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(6,182,212,0.08),rgba(245,197,66,0.10))] p-6 md:p-8">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.08]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
              <Scale className="h-3.5 w-3.5" /> Comparador IA
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-white md:text-6xl">Compará proyectos lado a lado.</h1>
            <p className="mt-4 max-w-3xl text-white/68">Riesgo, avance, documentación, retorno, plazo y Suelo Score en una sola vista para decidir mejor.</p>
          </div>
          <Link href="/marketplace" className="btn-primary">Elegir otros proyectos <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {projects.map((project) => {
          const progress = getProgressPercent(project.sold_tokens, project.total_tokens);
          const score = Math.min(96, Math.round(78 + progress / 5));
          return (
            <article key={project.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] backdrop-blur-xl">
              <div className="relative h-52 bg-surface-200">
                {project.image_url && <Image src={project.image_url} alt={project.title} fill quality={74} sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-transparent to-black/10" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="font-display text-2xl font-bold text-white">{project.title}</h2>
                  <p className="mt-1 text-sm text-white/62">{project.location}</p>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <CompareRow icon={ShieldCheck} label="Suelo Score" value={`${score}/100`} highlight />
                <CompareRow icon={TrendingUp} label="Retorno objetivo" value={`${project.expected_return}%`} />
                <CompareRow icon={BarChart3} label="Avance funding" value={`${progress}%`} />
                <CompareRow icon={Sparkles} label="Ticket mínimo" value={formatCurrency(project.min_investment)} />
                <CompareRow icon={CheckCircle2} label="Documentación" value={project.documents_url ? 'Disponible' : 'En revisión'} />
                <Link href={`/projects/${project.id}`} className="btn-secondary mt-4 w-full">Ver ficha completa</Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function CompareRow({ icon: Icon, label, value, highlight = false }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#07111F]/54 p-3">
      <span className="flex items-center gap-2 text-sm text-white/58"><Icon className="h-4 w-4 text-emerald-300" /> {label}</span>
      <span className={highlight ? 'font-display text-lg font-bold text-emerald-300' : 'font-semibold text-white'}>{value}</span>
    </div>
  );
}
