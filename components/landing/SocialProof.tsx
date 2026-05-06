'use client';

import Image from 'next/image';
import { Award, Building2, CircleDollarSign, HandCoins, Quote, ShieldCheck, Star, Users } from 'lucide-react';
import { ActivityTicker } from '@/components/ui/activity-ticker';
import { useRevealOnScroll } from '@/components/animations/useReveal';
import { useCounterAnimation } from '@/components/animations/useScrollAnimation';

const stats = [
  { icon: Users, value: 12400, suffix: '', prefix: '', decimals: 0, label: 'Usuarios registrados', tone: 'text-emerald-300' },
  { icon: CircleDollarSign, value: 2.4, suffix: 'M', prefix: 'USD ', decimals: 1, label: 'Monto financiado', tone: 'text-cyan-300' },
  { icon: Building2, value: 38, suffix: '', prefix: '', decimals: 0, label: 'Proyectos activos', tone: 'text-[#F5C542]' },
  { icon: HandCoins, value: 184, suffix: 'k', prefix: 'USD ', decimals: 0, label: 'Rentas distribuidas', tone: 'text-violet-300' },
  { icon: ShieldCheck, value: 27, suffix: '', prefix: '', decimals: 0, label: 'Desarrolladoras verificadas', tone: 'text-emerald-300' },
  { icon: Award, value: 98.4, suffix: '%', prefix: '', decimals: 1, label: 'Contratos verificados', tone: 'text-cyan-300' },
];

const activity = [
  'Una inversora sumó USD 500 en Asunción',
  'Carlos recibió su primera renta mensual',
  'Torre Horizonte ya financió el 72%',
  'Desarrolladora verificada en Santa Cruz',
  'Contrato #8472 registrado con hash público',
  'Nuevo proyecto A+ disponible en Paraguay',
];

const testimonials = [
  {
    name: 'María Fernanda Ríos',
    role: 'Inversora, Asunción',
    text: 'Lo entendí en diez minutos: proyecto real, contrato verificable y una IA que me explicó el riesgo sin venderme humo.',
    coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85&auto=format&fit=crop',
    avatarImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=85&auto=format&fit=facearea&facepad=2',
  },
  {
    name: 'Carlos Aguilera',
    role: 'Desarrollador, Santa Cruz',
    text: 'Nos ayudó a presentar el proyecto con documentación, seguimiento y trazabilidad. Es mucho más claro que enviar archivos sueltos por WhatsApp.',
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=85&auto=format&fit=crop',
    avatarImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=85&auto=format&fit=facearea&facepad=2',
  },
  {
    name: 'Laura Méndez',
    role: 'Inversora, La Paz',
    text: 'Ver el avance, la renta estimada y el hash del contrato en el mismo lugar cambia totalmente la confianza.',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=85&auto=format&fit=crop',
    avatarImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=85&auto=format&fit=facearea&facepad=2',
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
              Mostramos inversiones, rentas, contratos verificados y desarrolladoras reales trabajando en una misma plataforma.
            </p>
          </div>

          <div data-reveal className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.055] shadow-[0_28px_90px_-46px_rgba(16,185,129,0.55)] backdrop-blur-xl">
            <div className="relative h-72">
              <Image
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=85&auto=format&fit=crop"
                alt="Obra inmobiliaria real con desarrolladoras trabajando"
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.10)_0%,rgba(7,17,31,0.28)_45%,rgba(7,17,31,0.88)_100%)]" />
              <div className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
                <p className="text-sm font-bold text-white">Obras y capital en movimiento</p>
                <p className="mt-1 text-xs text-white/58">Paraguay + Bolivia · proyectos verificables</p>
              </div>
              <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2">
                {[
                  ['72%', 'Funding'],
                  ['27', 'Developers'],
                  ['98%', 'Contratos'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/34 p-3 backdrop-blur-xl">
                    <p className="font-display text-xl font-bold text-white">{value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/45">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 p-4">
              <ActivityTicker items={activity} />
            </div>
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
              <div className="relative h-52">
                <Image
                  src={testimonial.coverImage}
                  alt={`Contexto inmobiliario de ${testimonial.role}`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.02)_0%,rgba(7,17,31,0.18)_58%,rgba(7,17,31,0.78)_100%)]" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/32 px-3 py-2 backdrop-blur-xl">
                  <Quote className="h-4 w-4 text-emerald-300" />
                  <span className="text-xs font-bold text-white">Opinión verificada</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-[#F5C542] text-[#F5C542]" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-white/76">“{testimonial.text}”</p>
                <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                  <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/10">
                    <Image
                      src={testimonial.avatarImage}
                      alt={testimonial.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                    <p className="mt-1 text-xs text-white/42">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
