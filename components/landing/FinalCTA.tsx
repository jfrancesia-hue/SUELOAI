'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRevealOnScroll } from '@/components/animations/useReveal';

export function FinalCTA() {
  const ref = useRevealOnScroll({ stagger: 0.09, duration: 0.8 });

  return (
    <section ref={ref} id="cta-final" className="relative py-28 md:py-36 overflow-hidden">
      {/* Mesh gradient background — tierra → brand */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,200,83,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(224,127,74,0.1),transparent_55%),radial-gradient(ellipse_at_center,rgba(184,145,90,0.08),transparent_60%)] bg-surface-50" />

      {/* Orbs animados por capas */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-terra-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-earth-400/[0.08] rounded-full blur-[120px] pointer-events-none" />

      {/* Grid sutil */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.08]" />

      {/* Contenido */}
      <div className="relative max-w-3xl mx-auto px-4 text-center">
        {/* Badge premium */}
        <div
          data-reveal
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-3 h-3 text-brand-400" strokeWidth={1.75} />
          <span className="text-[10px] font-[540] text-white/80 tracking-[0.15em] uppercase">
            Cuenta gratuita · Sin tarjeta
          </span>
        </div>

        {/* Headline con serif italic */}
        <h2
          data-reveal
          className="font-display text-4xl md:text-6xl lg:text-7xl font-[680] text-surface-900 tracking-[-0.03em] leading-[0.98]"
        >
          Empezá a construir
          <br />
          tu{' '}
          <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-earth-300 to-terra-400">
            portafolio inmobiliario.
          </span>
        </h2>

        {/* Subtitle */}
        <p
          data-reveal
          className="mt-8 text-base md:text-lg text-surface-600 max-w-xl mx-auto leading-[1.6] font-[440]"
        >
          Uníte a una nueva generación de inversores que acceden a activos reales con total transparencia.
        </p>

        {/* CTAs */}
        <div
          data-reveal
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-b from-brand-400 to-brand-600 text-white text-[15px] font-[560] rounded-[14px] transition-all duration-200 w-full sm:w-auto
                       shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_0_0_1px_rgba(0,200,83,0.4),0_12px_32px_-8px_rgba(0,200,83,0.5)]
                       hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_0_0_1px_rgba(0,200,83,0.6),0_16px_40px_-6px_rgba(0,200,83,0.65)]
                       hover:-translate-y-px active:translate-y-0"
          >
            Crear Cuenta Gratis
            <ArrowRight
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface-100 hover:bg-surface-150 text-surface-900 text-[15px] font-[520] rounded-[14px] transition-all duration-200 border border-surface-200 hover:border-surface-300 w-full sm:w-auto"
          >
            Explorar proyectos
          </Link>
        </div>

        {/* Footer microtext */}
        <p
          data-reveal
          className="mt-10 text-xs text-surface-500 tracking-wide"
        >
          Disponible en PY · AR · UY · BO — Próximamente en toda LATAM
        </p>
      </div>
    </section>
  );
}
