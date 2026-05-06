import type { ComponentType, ReactNode } from 'react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/utils/helpers';

export function DashboardHero({
  eyebrow,
  title,
  description,
  children,
  visual,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  visual?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(6,182,212,0.08)_42%,rgba(245,197,66,0.10))] p-6 shadow-[0_24px_80px_-50px_rgba(16,185,129,0.9)] md:p-8">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.08]" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />
      <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/68 md:text-lg">{description}</p>
          {children && <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{children}</div>}
        </div>
        {visual && <div className="relative">{visual}</div>}
      </div>
    </section>
  );
}

export function VisualMetricCard({
  title,
  value,
  icon: Icon,
  hint,
  tone = 'emerald',
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  hint?: string;
  tone?: 'emerald' | 'cyan' | 'gold' | 'violet';
}) {
  const tones = {
    emerald: 'from-emerald-300/20 to-emerald-500/5 text-emerald-300 border-emerald-300/20',
    cyan: 'from-cyan-300/20 to-cyan-500/5 text-cyan-300 border-cyan-300/20',
    gold: 'from-amber-300/20 to-amber-500/5 text-amber-300 border-amber-300/20',
    violet: 'from-violet-300/20 to-violet-500/5 text-violet-300 border-violet-300/20',
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_55px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className={cn('absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl', tones[tone])} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/52">{title}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-[-0.02em] text-white">{value}</p>
          {hint && <p className="mt-2 text-xs font-medium text-white/42">{hint}</p>}
        </div>
        <div className={cn('rounded-2xl border bg-white/[0.06] p-3', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function VisualActionCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl">
      <h2 className="font-display text-xl font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/56">{description}</p>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#07111F]/60 px-4 py-3 text-sm text-white/76">
            <span className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" /> {item}</span>
            <ArrowRight className="h-4 w-4 text-white/28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniBuildingVisual({ label = 'Proyecto en obra' }: { label?: string }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#07111F]/70 p-5 shadow-[0_22px_70px_-48px_rgba(16,185,129,0.9)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-xs text-white/44">Cimientos → estructura → renta</p>
        </div>
        <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-bold text-[#03130D]">PY + BO</span>
      </div>
      <div className="flex h-48 items-end justify-center gap-2 rounded-3xl bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
        {[44, 72, 108, 138, 92, 58].map((height, index) => (
          <div key={height + index} className="w-9 rounded-t-xl border border-white/10 bg-gradient-to-b from-white/28 to-white/[0.06]" style={{ height }}>
            <div className="grid grid-cols-2 gap-1 p-1.5">
              {Array.from({ length: Math.max(2, Math.floor(height / 24)) }).map((_, windowIndex) => (
                <span key={windowIndex} className="h-2 rounded-sm bg-emerald-200/45" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
