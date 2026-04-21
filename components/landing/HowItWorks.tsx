'use client';

import { UserPlus, Search, CreditCard, FileText, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Registrate',
    description: 'Creá tu cuenta como inversor o desarrollador en menos de 2 minutos.',
  },
  {
    icon: Search,
    step: '02',
    title: 'Explorá Proyectos',
    description: 'Navegá el marketplace y encontrá proyectos que se ajusten a tu perfil.',
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Invertí',
    description: 'Elegí cuántas participaciones querés y confirmá tu inversión.',
  },
  {
    icon: FileText,
    step: '04',
    title: 'Contrato Digital',
    description: 'Se genera un contrato PDF con hash SHA-256 verificable públicamente.',
  },
  {
    icon: CheckCircle,
    step: '05',
    title: 'Recibí Retornos',
    description: 'Seguí el progreso del proyecto y recibí los rendimientos.',
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 md:py-32 bg-surface-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-brand-500 text-sm font-semibold tracking-wider uppercase mb-3">
            Proceso
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-surface-900">
            Así de simple funciona
          </h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-surface-300 md:-translate-x-px" />

          <div className="space-y-12">
            {steps.map(({ icon: Icon, step, title, description }, i) => (
              <div
                key={step}
                className={`relative flex items-start gap-6 md:gap-12 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ml-16 md:ml-0 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <span className="text-xs font-mono text-brand-500 tracking-wider">
                    PASO {step}
                  </span>
                  <h3 className="font-display text-xl font-bold text-surface-900 mt-1">
                    {title}
                  </h3>
                  <p className="text-sm text-surface-600 mt-2 leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Node */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-12 h-12 rounded-xl bg-surface-100 border-2 border-brand-500/30 flex items-center justify-center z-10 shadow-lg shadow-black/10">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>

                {/* Spacer for alternate side */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
