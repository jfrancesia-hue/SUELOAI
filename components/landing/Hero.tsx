'use client';

import Link from 'next/link';
import {
  ArrowRight, Sparkles, Building2, Shield, CheckCircle2,
} from 'lucide-react';
import { useReveal } from '@/components/animations/useReveal';

export function Hero() {
  const ref = useReveal({ stagger: 0.1, duration: 0.9 });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=2400&q=90&auto=format&fit=crop"
          alt="Arquitectura moderna"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/60 to-brand-950/80" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
      </div>

      {/* Decorative glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-700/20 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* AI Badge */}
          <div data-reveal className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/15 border border-brand-500/30 mb-8 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-medium text-brand-400 tracking-wide uppercase">
              Con Analista IA Personal · 100% Activos Reales
            </span>
          </div>

          {/* Headline */}
          <h1 data-reveal className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
            <span className="text-white">Invertí en</span><br />
            <span className="gradient-text">lo que pisás</span><br />
            <span className="text-white/90 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">potenciado por IA</span>
          </h1>

          {/* Subtitle */}
          <p data-reveal className="mt-8 text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
            La primera plataforma latinoamericana de inversión inmobiliaria fraccionada.
            Desde USD 100 o 100 USDT, con un analista IA que te acompaña en cada decisión.
          </p>

          {/* CTAs */}
          <div data-reveal className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 w-full sm:w-auto"
            >
              Probá tu Analista IA
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all backdrop-blur-sm border border-white/20 w-full sm:w-auto"
            >
              Ver proyectos
            </Link>
          </div>

          {/* Trust badges */}
          <div data-reveal className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-16">
            {[
              { icon: Building2, label: 'Proyectos reales', value: 'Activos tangibles' },
              { icon: Sparkles, label: 'Analista personal', value: 'IA 24/7' },
              { icon: Shield, label: 'Verificable', value: 'Blockchain anchoring' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{value}</p>
                  <p className="text-xs text-white/60">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div data-reveal className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {[
              'Depositá en ARS, PYG, USD o USDT',
              'Contratos verificables públicamente',
              'Diversificación inteligente automatizada',
            ].map((text) => (
              <div
                key={text}
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="text-sm text-white/85">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-pulse">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
