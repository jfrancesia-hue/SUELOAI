'use client';

import { UserPlus, Search, CreditCard, FileText, CheckCircle } from 'lucide-react';
import { useRevealOnScroll } from '@/components/animations/useReveal';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Registrate',
    description: 'Creá tu cuenta como inversor o desarrollador en menos de 2 minutos.',
    accent: 'brand' as const,
  },
  {
    icon: Search,
    step: '02',
    title: 'Explorá Proyectos',
    description: 'Navegá el marketplace y encontrá proyectos que se ajusten a tu perfil.',
    accent: 'earth' as const,
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Invertí',
    description: 'Elegí cuántas participaciones querés y confirmá tu inversión.',
    accent: 'brand' as const,
  },
  {
    icon: FileText,
    step: '04',
    title: 'Contrato Digital',
    description: 'Se genera un contrato PDF con hash SHA-256 verificable públicamente.',
    accent: 'terra' as const,
  },
  {
    icon: CheckCircle,
    step: '05',
    title: 'Recibí Retornos',
    description: 'Seguí el progreso del proyecto y recibí los rendimientos.',
    accent: 'brand' as const,
  },
];

const accentMap = {
  brand: {
    text: 'text-brand-400',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/25',
    borderHover: 'hover:border-brand-500/45',
    ring: 'ring-brand-500/15',
    glow: 'hover:shadow-[0_12px_28px_-10px_rgba(0,200,83,0.35)]',
  },
  earth: {
    text: 'text-earth-300',
    bg: 'bg-earth-500/10',
    border: 'border-earth-500/25',
    borderHover: 'hover:border-earth-500/45',
    ring: 'ring-earth-500/15',
    glow: 'hover:shadow-[0_12px_28px_-10px_rgba(184,145,90,0.35)]',
  },
  terra: {
    text: 'text-terra-400',
    bg: 'bg-terra-500/10',
    border: 'border-terra-500/25',
    borderHover: 'hover:border-terra-500/45',
    ring: 'ring-terra-500/15',
    glow: 'hover:shadow-[0_12px_28px_-10px_rgba(224,127,74,0.35)]',
  },
};

export function HowItWorks() {
  const ref = useRevealOnScroll({ stagger: 0.08, duration: 0.7 });

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Ambient mesh */}
      <div className="absolute inset-0 bg-surface-50/40" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-earth-400/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-brand-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p
            data-reveal
            className="text-brand-500 text-[11px] font-semibold tracking-[0.18em] uppercase mb-4"
          >
            Proceso
          </p>
          <h2
            data-reveal
            className="font-display text-3xl md:text-5xl font-bold text-surface-900 tracking-[-0.02em] leading-[1.05]"
          >
            Así de simple{' '}
            <span className="italic font-serif font-[400] text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-earth-300">
              funciona.
            </span>
          </h2>
        </div>

        {/* Timeline vertical refinado */}
        <div className="relative max-w-4xl mx-auto">
          {/* Línea central con gradient — dashed delicado */}
          <div
            className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, rgba(0,200,83,0.3) 0%, rgba(184,145,90,0.25) 50%, rgba(224,127,74,0.3) 100%)',
            }}
          />

          <div className="space-y-10 md:space-y-14">
            {steps.map(({ icon: Icon, step, title, description, accent }, i) => {
              const tone = accentMap[accent];
              const alignRight = i % 2 === 0;
              return (
                <div
                  key={step}
                  data-reveal
                  className={`relative flex items-start gap-6 md:gap-12 ${
                    alignRight ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content card */}
                  <div
                    className={`flex-1 ml-16 md:ml-0 ${alignRight ? 'md:text-right' : 'md:text-left'}`}
                  >
                    <div
                      className={`inline-block text-left rounded-[20px] bg-surface-100/80 border border-surface-200 backdrop-blur-sm p-6 md:p-7 transition-all duration-300 ${tone.borderHover} hover:-translate-y-0.5 ${tone.glow}`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className={`text-[10px] font-mono tracking-[0.15em] uppercase ${tone.text}`}
                        >
                          Paso
                        </span>
                        <span
                          className={`text-[11px] font-mono font-[600] tracking-wider tabular-nums ${tone.text}`}
                        >
                          · {step}
                        </span>
                      </div>
                      <h3 className="font-display text-xl md:text-2xl font-[640] text-surface-900 tracking-[-0.015em]">
                        {title}
                      </h3>
                      <p className="text-sm md:text-[15px] text-surface-600 mt-2 leading-relaxed max-w-md">
                        {description}
                      </p>
                    </div>
                  </div>

                  {/* Node — pastilla con icon */}
                  <div
                    className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 w-[48px] h-[48px] rounded-[14px] ${tone.bg} ${tone.border} border-[1.5px] flex items-center justify-center z-10 backdrop-blur-sm ring-4 ${tone.ring} ring-offset-0`}
                  >
                    <Icon className={`w-[18px] h-[18px] ${tone.text}`} strokeWidth={1.75} />
                  </div>

                  {/* Spacer */}
                  <div className="hidden md:block flex-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
