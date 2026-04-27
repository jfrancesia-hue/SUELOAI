'use client';

import Image from 'next/image';
import { Award, Building2, CircleDollarSign, HandCoins, ShieldCheck, Users } from 'lucide-react';
import { ActivityTicker } from '@/components/ui/activity-ticker';
import { useRevealOnScroll } from '@/components/animations/useReveal';
import { useCounterAnimation } from '@/components/animations/useScrollAnimation';

const stats = [
  { icon: Users, value: 12400, suffix: '', prefix: '', decimals: 0, label: 'Usuarios registrados', tone: 'text-emerald-300' },
  { icon: CircleDollarSign, value: 2.4, suffix: 'M', prefix: 'USD ', decimals: 1, label: 'Monto financiado', tone: 'text-cyan-300' },
  { icon: Building2, value: 38, suffix: '', prefix: '', decimals: 0, label: 'Proyectos activos', tone: 'text-[#F5C542]' },
  { icon: HandCoins, value: 184, suffix: 'k', prefix: 'USD ', decimals: 0, label: 'Rentas distribuidas', tone: 'text-violet-300' },
  { icon: ShieldCheck, value: 27, suffix: '', prefix: '', decimals: 0, label: 'Developers verificados', tone: 'text-emerald-300' },
  { icon: Award, value: 98.4, suffix: '%', prefix: '', decimals: 1, label: 'Contratos verificados', tone: 'text-cyan-300' },
];

const activity = [
  'María invirtió USD 500 en Asunción',
  'Carlos recibió su primera renta mensual',
  'Torre Horizonte alcanzó 72% de funding',
  'Developer verificado en Córdoba',
  'Contrato #8472 registrado con hash público',
  'Nueva oportunidad A+ en Paraguay',
];

const testimonials = [
  {
    name: 'María Fernanda Ríos',
    role: 'Inversora, Asunción',
    text: 'Lo entendí en diez minutos: proyecto real, contrato verificable y una IA que me explicó el riesgo sin venderme humo.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&auto=format&fit=crop',
  },
  {
    name: 'Carlos Aguilera',
    role: 'Developer, Córdoba',
    text: 'Nos ayudó a ordenar la captación, documentación y seguimiento. Se siente mucho más serio que mandar PDFs por WhatsApp.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop',
  },
  {
    name: 'Laura Méndez',
    role: 'Inversora, Montevideo',
    text: 'Ver el avance, la renta estimada y el hash del contrato en el mismo lugar cambia totalmente la confianza.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&auto=format&fit=crop',
  },
];

function StatCard({ stat, index }: { stat: (typeof stats)[number]; index: number }) {
  const ref = useCounterAnimation(stat.value, { decimals: stat.decimals, duration: 1.4 + index * 0.06 });
  const Icon = stat.icon;

  return (
    <div data-reveal className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
      <Icon className={`mb-4 h-5 w-5 ${stat.tone}`} strokeWidth={1.7} />
      <div className="flex items-baseline gap-1">
        {stat.prefix && <span className="font-mono text-[11px] text-white/45">{stat.prefix}</span>}
        <span ref={ref} className="font-display text-3xl font-bold tracking-[-0.02em] text-white">
          0
        </span>
        {stat.suffix && <span className="font-display text-xl font-semibold text-white/70">{stat.suffix}</span>}
      </div>
      <p className="mt-2 text-xs leading-tight text-white/46">{stat.label}</p>
    </div>
  );
}

export function SocialProof() {
  const ref = useRevealOnScroll({ stagger: 0.05, duration: 0.7 });

  return (
    <section ref={ref} id="traccion" className="relative scroll-mt-24 overflow-hidden bg-[#07111F] py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_22%,rgba(16,185,129,0.13),transparent_34%),radial-gradient(circle_at_82%_52%,rgba(6,182,212,0.12),transparent_32%),linear-gradient(180deg,#07111F_0%,#111827_56%,#07111F_100%)]" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.055]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p data-reveal className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Tracción
            </p>
            <h2 data-reveal className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-white md:text-5xl">
              Señales de confianza{' '}
              <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-[#F5C542]">
                en tiempo real.
              </span>
            </h2>
            <p data-reveal className="mt-5 max-w-xl text-base leading-relaxed text-white/58 md:text-lg">
              La plataforma debe sentirse viva: inversiones, rentas, verificaciones y developers reales moviéndose en la misma infraestructura.
            </p>
          </div>

          <div data-reveal className="rounded-[26px] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
            <ActivityTicker items={activity} />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              data-reveal
              className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.055] shadow-[0_24px_80px_-44px_rgba(0,0,0,0.95)] backdrop-blur-xl"
            >
              <div className="relative h-44">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.12)_0%,rgba(7,17,31,0.82)_100%)]" />
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-white/72">“{testimonial.text}”</p>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="mt-1 text-xs text-white/42">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
