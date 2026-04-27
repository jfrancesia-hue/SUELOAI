'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useRevealOnScroll } from '@/components/animations/useReveal';
import { FundingBar } from '@/components/ui/funding-bar';
import { RiskBadge } from '@/components/ui/risk-badge';
import { SueloScoreBadge } from '@/components/ui/suelo-score-badge';

const projects = [
  {
    title: 'Torre Asunción Eje',
    location: 'Asunción, Paraguay',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85&auto=format&fit=crop',
    score: 'A+',
    scoreValue: 94,
    risk: 'Bajo' as const,
    funded: 72,
    minTicket: '100 USDT',
    expectedReturn: '14.2%',
    stage: 'Obra avanzada',
    developer: 'Alto Parana Developments',
    thesis: 'Zona corporativa con preventa validada y demanda de alquiler ejecutivo.',
    metrics: ['USD 1.8M objetivo', '21 meses', 'Polygon hash ready'],
    accent: 'brand' as const,
  },
  {
    title: 'Edificio Cordoba Norte',
    location: 'Cordoba, Argentina',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85&auto=format&fit=crop',
    score: 'A',
    scoreValue: 88,
    risk: 'Bajo' as const,
    funded: 58,
    minTicket: 'USD 100',
    expectedReturn: '10.8%',
    stage: 'Renta mensual',
    developer: 'Norte Urbano',
    thesis: 'Activo estabilizado, foco conservador y flujo mensual proyectado.',
    metrics: ['USD 920k objetivo', '12 meses', 'Renta desde mes 2'],
    accent: 'earth' as const,
  },
  {
    title: 'Residencias Punta Carretas',
    location: 'Montevideo, Uruguay',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85&auto=format&fit=crop',
    score: 'B+',
    scoreValue: 81,
    risk: 'Medio' as const,
    funded: 43,
    minTicket: 'USD 250',
    expectedReturn: '12.6%',
    stage: 'Preventa',
    developer: 'Costa Capital',
    thesis: 'Ubicación premium con upside comercial y salida flexible.',
    metrics: ['USD 2.4M objetivo', '30 meses', 'Salida secundaria'],
    accent: 'terra' as const,
  },
];

const accentMap = {
  brand: {
    text: 'text-brand-400',
    border: 'border-brand-500/25',
    badge: 'bg-brand-500/10 border-brand-500/25 text-brand-300',
  },
  earth: {
    text: 'text-earth-300',
    border: 'border-earth-500/25',
    badge: 'bg-earth-500/10 border-earth-500/25 text-earth-200',
  },
  terra: {
    text: 'text-terra-300',
    border: 'border-terra-500/25',
    badge: 'bg-terra-500/10 border-terra-500/25 text-terra-200',
  },
};

export function FeaturedProjects() {
  const ref = useRevealOnScroll({ stagger: 0.06, duration: 0.7 });

  return (
    <section ref={ref} id="proyectos" className="relative scroll-mt-24 py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(17,17,17,0.74)_40%,transparent_100%)]" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.05]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <p
              data-reveal
              className="text-brand-500 text-[11px] font-semibold tracking-[0.18em] uppercase mb-4"
            >
              Proyectos destacados
            </p>
            <h2
              data-reveal
              className="font-display text-3xl md:text-5xl font-bold text-surface-900 tracking-[-0.02em] leading-[1.05]"
            >
              Oportunidades listas para{' '}
              <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-earth-300 to-terra-400">
                mirar con lupa.
              </span>
            </h2>
            <p
              data-reveal
              className="mt-5 text-surface-600 text-base md:text-lg leading-relaxed max-w-xl"
            >
              Cada card combina activo real, avance de fondeo y scoring IA para decidir con contexto.
            </p>
          </div>

          <Link
            data-reveal
            href="/marketplace"
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-surface-300 bg-surface-100 px-5 py-3 text-sm font-[560] text-surface-900 transition-all duration-200 hover:border-brand-500/30 hover:bg-surface-150"
          >
            Ver marketplace
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const tone = accentMap[project.accent];

            return (
              <Link
                key={project.title}
                data-reveal
                href="/marketplace"
                className={`group relative overflow-hidden rounded-[20px] border ${tone.border} bg-surface-100/70 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-brand-500/30 hover:bg-surface-100`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-200">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.05)_0%,rgba(10,10,10,0.78)_100%)]" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <SueloScoreBadge score={project.score} value={project.scoreValue} className={tone.badge} />
                    <RiskBadge risk={project.risk} />
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/35 px-2.5 py-1 text-[11px] font-[560] text-white/85 backdrop-blur-sm">
                      <CheckCircle2 className="h-3 w-3 text-brand-300" strokeWidth={2} />
                      {project.stage}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display text-2xl font-[680] leading-tight tracking-[-0.015em] text-white">
                      {project.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/75">
                      <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {project.location}
                    </p>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-surface-500">
                        Developer
                      </p>
                      <p className="mt-1 text-sm font-[560] text-surface-900">
                        {project.developer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-surface-500">
                        Retorno
                      </p>
                      <p className={`mt-1 flex items-center justify-end gap-1 text-lg font-[680] ${tone.text}`}>
                        <TrendingUp className="h-4 w-4" strokeWidth={2} />
                        {project.expectedReturn}
                      </p>
                    </div>
                  </div>

                  <p className="min-h-[48px] text-[13px] leading-relaxed text-surface-600">
                    {project.thesis}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-y border-surface-200/70 py-4">
                    {project.metrics.map((metric) => (
                      <div key={metric} className="min-w-0">
                        <p className="truncate text-[11px] leading-tight text-surface-500">
                          {metric}
                        </p>
                      </div>
                    ))}
                  </div>

                  <FundingBar
                    value={project.funded}
                    tone={project.accent === 'brand' ? 'emerald' : project.accent === 'earth' ? 'gold' : 'cyan'}
                    className="mt-5"
                  />

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[12px] text-surface-600">
                      <Building2 className="h-4 w-4 text-surface-500" strokeWidth={1.75} />
                      Min. {project.minTicket}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[12px] font-[600] text-brand-400 transition-all duration-200 group-hover:gap-2">
                      Analizar
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div
          data-reveal
          className="mt-6 flex flex-col gap-3 rounded-[18px] border border-surface-200/70 bg-surface-100/55 p-5 backdrop-blur-sm md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-500/10">
              <ShieldCheck className="h-4 w-4 text-brand-400" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-[600] text-surface-900">
                Scoring IA con trazabilidad
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-surface-600">
                La calificación cruza ubicación, developer, documentación, finanzas y mercado. Siempre muestra riesgos, no solo upside.
              </p>
            </div>
          </div>
          <Link
            href="/assistant"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-[560] text-white transition-all duration-200 hover:bg-brand-600"
          >
            Preguntar al analista
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
