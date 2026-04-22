'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Sparkles, Building2, Shield, CheckCircle2,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Split manual: envuelve cada palabra en span con inline-block para poder animar
function splitWords(text: string, className = '') {
  return text.split(' ').map((word, i) => (
    <span
      key={i}
      className={`inline-block overflow-hidden align-top ${className}`}
    >
      <span className="hero-word inline-block">
        {word}
        {i < text.split(' ').length - 1 ? ' ' : ''}
      </span>
    </span>
  ));
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set('.hero-word', { y: 0, opacity: 1 });
        gsap.set('[data-hero-reveal]', { opacity: 1, y: 0 });
        return;
      }

      // 1) Cascade de palabras
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
      tl.fromTo(
        '.hero-word',
        { y: '120%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.04,
        },
        '-=0.4'
      );
      tl.fromTo(
        '[data-hero-reveal]',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
        },
        '-=0.6'
      );

      // 2) Parallax del background al scroll
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          y: '25%',
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
        });
      }

      // 3) Fade del contenido al scrollear
      gsap.to('.hero-content', {
        opacity: 0.15,
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom 60%',
          scrub: 0.8,
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background con parallax */}
      <div ref={bgRef} className="absolute inset-0 -top-20 bottom-0">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=2400&q=90&auto=format&fit=crop"
          alt="Arquitectura moderna"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.92)_0%,rgba(10,46,26,0.85)_45%,rgba(42,15,10,0.7)_100%)]" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.15]" />
      </div>

      {/* Mesh orbs */}
      <div className="absolute top-[20%] left-[15%] w-[520px] h-[520px] bg-brand-500/[0.12] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[45%] right-[10%] w-[420px] h-[420px] bg-terra-500/[0.10] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[35%] w-[380px] h-[380px] bg-earth-400/[0.08] rounded-full blur-[130px] pointer-events-none" />

      <div className="hero-content relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* AI Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-8 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]"
            style={{ opacity: 0 }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-400" />
            </span>
            <Sparkles className="w-3 h-3 text-brand-300" strokeWidth={1.75} />
            <span className="text-[10px] font-[520] text-white/85 tracking-[0.12em] uppercase">
              Analista IA Personal · 100% Activos Reales
            </span>
          </div>

          {/* Headline con split cascade */}
          <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-[680] tracking-[-0.035em] leading-[0.95] text-white">
            <span className="block">{splitWords('Invertí en')}</span>
            {/* Línea con gradient — no se splitea para preservar bg-clip-text continuo */}
            <span className="block overflow-hidden">
              <span
                className="hero-word inline-block font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-earth-200 to-terra-300"
              >
                lo que pisás
              </span>
            </span>
            <span className="block mt-1 text-[clamp(1.75rem,4vw,3.75rem)] font-[540] tracking-[-0.025em] text-white/75">
              {splitWords('potenciado por')}{' '}
              <span className="inline-block overflow-hidden align-top">
                <span className="hero-word inline-block italic font-serif font-[400] text-white/85">IA</span>
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            data-hero-reveal
            className="mt-9 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-[1.6] font-[440]"
            style={{ opacity: 0 }}
          >
            La primera plataforma latinoamericana de inversión inmobiliaria fraccionada.
            Desde USD 100 o 100 USDT, con un analista IA que te acompaña en cada decisión.
          </p>

          {/* CTAs */}
          <div
            data-hero-reveal
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-12"
            style={{ opacity: 0 }}
          >
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-b from-brand-400 to-brand-600 text-white text-[14px] font-[560] rounded-[12px] transition-all duration-200 w-full sm:w-auto
                         shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_0_0_1px_rgba(0,200,83,0.4),0_10px_30px_-8px_rgba(0,200,83,0.45)]
                         hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_0_0_1px_rgba(0,200,83,0.6),0_14px_36px_-6px_rgba(0,200,83,0.6)]
                         hover:-translate-y-px active:translate-y-0"
            >
              Probá tu Analista IA
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/[0.06] hover:bg-white/[0.1] text-white/90 text-[14px] font-[520] rounded-[12px] transition-all duration-200 backdrop-blur-md border border-white/[0.1] hover:border-white/[0.18] w-full sm:w-auto"
            >
              Ver proyectos
            </Link>
          </div>

          {/* Trust badges */}
          <div
            data-hero-reveal
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 mt-16"
            style={{ opacity: 0 }}
          >
            {[
              { icon: Building2, label: 'Proyectos reales', value: 'Activos tangibles' },
              { icon: Sparkles, label: 'Analista personal', value: 'IA 24/7' },
              { icon: Shield, label: 'Verificable', value: 'Blockchain anchoring' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="p-2 rounded-[10px] bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm">
                  <Icon className="w-4 h-4 text-brand-300" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-[560] text-white tracking-[-0.005em]">{value}</p>
                  <p className="text-[11px] text-white/55 tracking-wide">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div
            data-hero-reveal
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-2.5 max-w-3xl mx-auto"
            style={{ opacity: 0 }}
          >
            {[
              'Depositá en ARS, PYG, USD o USDT',
              'Contratos verificables públicamente',
              'Diversificación inteligente automatizada',
            ].map((text) => (
              <div
                key={text}
                className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm transition-colors hover:bg-white/[0.06] hover:border-white/[0.12]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" strokeWidth={2} />
                <span className="text-[13px] text-white/85 font-[440] leading-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="text-[10px] uppercase tracking-[0.2em] font-[500]">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
