'use client';

import { TrendingUp, Users, Building2, Award } from 'lucide-react';
import { useCounterAnimation } from '@/components/animations/useScrollAnimation';
import { useRevealOnScroll } from '@/components/animations/useReveal';

const stats = [
  { icon: TrendingUp, value: 2.4, suffix: 'M', prefix: 'USD ', decimals: 1, label: 'Capital invertido' },
  { icon: Building2, value: 847, suffix: '', prefix: '', decimals: 0, label: 'Proyectos financiados' },
  { icon: Users, value: 12400, suffix: '', prefix: '', decimals: 0, label: 'Inversores activos' },
  { icon: Award, value: 98.4, suffix: '%', prefix: '', decimals: 1, label: 'Tasa de éxito' },
];

const partners = [
  'Mercado Pago',
  'Didit KYC',
  'Polygon',
  'Twilio',
  'Resend',
  'Supabase',
  'Anthropic',
  'Mercado Pago',
  'Didit KYC',
  'Polygon',
];

const testimonials = [
  {
    name: 'María Fernanda Ríos',
    role: 'Inversora, Asunción',
    text: 'Empecé con USD 100 el año pasado. Hoy tengo participaciones en 4 proyectos y el analista IA me avisó cuándo conviene rebalancear. Transparente de verdad.',
    avatar: 'MR',
    color: 'from-brand-400 to-brand-600',
  },
  {
    name: 'Carlos Aguilera',
    role: 'Desarrollador inmobiliario, Córdoba',
    text: 'Levanté capital para dos proyectos en 11 días. La plataforma me trajo inversores fraccionados que nunca hubiera alcanzado solo. Cambio de juego.',
    avatar: 'CA',
    color: 'from-earth-400 to-earth-600',
  },
  {
    name: 'Laura Méndez',
    role: 'Inversora, Montevideo',
    text: 'Lo que más valoro es poder verificar cada contrato en Polygon. Paso el hash a mi contador y se termina la discusión. Serio y moderno.',
    avatar: 'LM',
    color: 'from-terra-400 to-terra-600',
  },
];

function Stat({ stat, index }: { stat: typeof stats[number]; index: number }) {
  const ref = useCounterAnimation(stat.value, { decimals: stat.decimals, duration: 1.6 + index * 0.1 });
  const Icon = stat.icon;
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-brand-500/5 via-transparent to-terra-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-6 md:p-7 rounded-[20px] bg-surface-100/60 border border-surface-200/60 backdrop-blur-sm transition-all duration-500 hover:border-brand-500/20 hover:-translate-y-0.5">
        <Icon className="w-5 h-5 text-brand-400 mb-4" strokeWidth={1.5} />
        <div className="flex items-baseline gap-0.5">
          <span className="text-[11px] font-mono text-surface-500 mb-1">{stat.prefix}</span>
          <span
            ref={ref}
            className="font-display text-3xl md:text-4xl font-[680] text-surface-900 tabular-nums tracking-[-0.02em]"
          >
            0
          </span>
          <span className="text-xl md:text-2xl font-display font-[620] text-surface-700">
            {stat.suffix}
          </span>
        </div>
        <p className="mt-2 text-[13px] text-surface-600 leading-tight">{stat.label}</p>
      </div>
    </div>
  );
}

export function SocialProof() {
  const ref = useRevealOnScroll({ stagger: 0.07, duration: 0.7 });

  return (
    <section ref={ref} id="traccion" className="relative py-24 md:py-28 overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p
            data-reveal
            className="text-brand-500 text-[11px] font-semibold tracking-[0.18em] uppercase mb-4"
          >
            Tracción
          </p>
          <h2
            data-reveal
            className="font-display text-3xl md:text-5xl font-bold text-surface-900 tracking-[-0.02em] leading-[1.05]"
          >
            Miles de latinoamericanos{' '}
            <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-earth-300 to-terra-400">
              ya pisan firme.
            </span>
          </h2>
        </div>

        {/* Stats grid */}
        <div data-reveal className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-20">
          {stats.map((stat, i) => (
            <Stat key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Partners marquee */}
        <div data-reveal className="mb-20">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-surface-500 text-center mb-6">
            Con el respaldo de
          </p>
          <div className="relative overflow-hidden py-2 mask-fade-x">
            <div className="flex gap-12 animate-marquee whitespace-nowrap">
              {[...partners, ...partners].map((p, i) => (
                <span
                  key={`${p}-${i}`}
                  className="text-lg md:text-xl font-display font-[580] text-surface-500/80 tracking-[-0.01em] shrink-0"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              data-reveal
              className="group relative rounded-[20px] bg-surface-100/60 border border-surface-200/60 backdrop-blur-sm p-6 md:p-7 transition-all duration-500 hover:border-brand-500/20 hover:-translate-y-0.5"
            >
              {/* Quote icon subtil */}
              <svg
                className="absolute top-6 right-6 w-8 h-8 text-surface-300/40"
                viewBox="0 0 32 32"
                fill="currentColor"
              >
                <path d="M10 8C5.58 8 2 11.58 2 16v8h8v-8H6c0-2.21 1.79-4 4-4V8zm12 0c-4.42 0-8 3.58-8 8v8h8v-8h-4c0-2.21 1.79-4 4-4V8z" />
              </svg>

              <p className="text-[14px] md:text-[15px] text-surface-800 leading-[1.6] font-[440] relative z-10">
                {t.text}
              </p>

              <div className="mt-6 pt-5 border-t border-surface-200/60 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-[13px] font-[620]`}
                >
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-[560] text-surface-900 truncate">{t.name}</p>
                  <p className="text-[11px] text-surface-500 truncate">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
