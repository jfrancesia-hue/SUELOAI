'use client';

import {
  Layers,
  FileCheck2,
  BarChart3,
  ShieldCheck,
  Globe,
  Wallet,
} from 'lucide-react';
import { useRevealOnScroll } from '@/components/animations/useReveal';

const features = [
  {
    icon: Layers,
    title: 'Inversión Fraccionada',
    description:
      'Adquirí participaciones desde USD 100 en proyectos inmobiliarios reales. Sin necesidad de grandes capitales.',
  },
  {
    icon: FileCheck2,
    title: 'Contratos Verificables',
    description:
      'Cada contrato genera un hash SHA-256 único que puede ser verificado públicamente en cualquier momento.',
  },
  {
    icon: BarChart3,
    title: 'Retornos Transparentes',
    description:
      'Seguí el progreso de tus inversiones en tiempo real. Reportes claros sobre avance y rendimiento.',
  },
  {
    icon: ShieldCheck,
    title: 'Activos Reales',
    description:
      'Cada participación está respaldada por un activo inmobiliario tangible. Sin especulación, sin promesas vacías.',
  },
  {
    icon: Globe,
    title: 'Acceso Global',
    description:
      'Invertí en proyectos de cualquier ubicación desde tu computadora o celular. Sin fronteras.',
  },
  {
    icon: Wallet,
    title: 'Gestión Simple',
    description:
      'Panel personalizado para inversores y desarrolladores. Todo en un solo lugar.',
  },
];

export function Features() {
  const ref = useRevealOnScroll({ stagger: 0.08, duration: 0.6 });
  return (
    <section ref={ref} id="como-funciona" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p data-reveal className="text-brand-500 text-sm font-semibold tracking-wider uppercase mb-3">
            Plataforma
          </p>
          <h2 data-reveal className="font-display text-3xl md:text-4xl font-bold text-surface-900">
            Inversión inmobiliaria reimaginada
          </h2>
          <p data-reveal className="mt-4 text-surface-600 text-lg">
            Tecnología financiera que democratiza el acceso a uno de los activos más seguros del mundo.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              data-reveal
              className="group card hover:border-brand-500/20 hover:bg-surface-150"
            >
              <div className="p-3 rounded-xl bg-brand-500/10 w-fit mb-4 group-hover:bg-brand-500/15 transition-colors">
                <Icon className="w-5 h-5 text-brand-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-surface-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-surface-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
