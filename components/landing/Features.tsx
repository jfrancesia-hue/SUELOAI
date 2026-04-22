'use client';

import { useEffect, useRef } from 'react';
import {
  Layers,
  FileCheck2,
  BarChart3,
  ShieldCheck,
  Globe,
  Wallet,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRevealOnScroll } from '@/components/animations/useReveal';
import { useScrambleOnView } from '@/components/animations/useScrollAnimation';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function Features() {
  const ref = useRevealOnScroll({ stagger: 0.06, duration: 0.7 });

  return (
    <section ref={ref} id="como-funciona" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-100/40 to-transparent" />
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-terra-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p
            data-reveal
            className="text-brand-500 text-[11px] font-semibold tracking-[0.18em] uppercase mb-4"
          >
            Plataforma
          </p>
          <h2
            data-reveal
            className="font-display text-3xl md:text-5xl font-bold text-surface-900 tracking-[-0.02em] leading-[1.05]"
          >
            Inversión inmobiliaria{' '}
            <span className="italic font-[600] text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-earth-300 to-terra-400 font-serif">
              reimaginada
            </span>
          </h2>
          <p
            data-reveal
            className="mt-5 text-surface-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto"
          >
            Tecnología financiera que democratiza el acceso a uno de los activos más seguros del mundo.
          </p>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[minmax(200px,auto)]">
          {/* 1 — HERO CELL */}
          <BentoCellHero />

          {/* 2 — Contratos Verificables */}
          <BentoCellHash />

          {/* 3 — Retornos Transparentes */}
          <BentoCellChart />

          {/* 4 — Activos Reales */}
          <BentoCellBuilding />

          {/* 5 — Acceso Global */}
          <BentoCellGlobal />

          {/* 6 — Gestión Simple */}
          <BentoCellDashboard />
        </div>
      </div>
    </section>
  );
}

// ============================================
// CELDAS — cada una con su animación propia
// ============================================

function BentoCellHero() {
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cellRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stack-card',
        { x: 0, y: (i) => i * -8 },
        {
          x: (i) => i * 16,
          y: (i) => i * 36,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={cellRef}
      data-reveal
      className="group relative md:col-span-4 md:row-span-2 overflow-hidden rounded-[24px] bg-surface-100 border border-surface-200/80 p-8 md:p-10 transition-all duration-500 hover:border-brand-500/20 hover:shadow-[0_20px_60px_-20px_rgba(0,200,83,0.15)]"
    >
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
          <Layers className="w-3.5 h-3.5 text-brand-400" strokeWidth={1.75} />
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-brand-400">
            Fraccionamiento
          </span>
        </div>
        <h3 className="font-display text-2xl md:text-4xl font-[680] text-surface-900 tracking-[-0.02em] leading-[1.1]">
          Desde <span className="text-brand-400">USD 100</span>,<br />
          adquirí el <span className="italic font-[580] font-serif text-earth-300">pedazo</span> que<br />
          podés pagar.
        </h3>
        <p className="mt-4 text-surface-600 text-sm md:text-base max-w-md leading-relaxed">
          Participaciones reales en proyectos inmobiliarios tangibles. Sin capital grande, sin intermediarios infinitos.
        </p>
      </div>
      <div className="relative mt-8 md:mt-12 h-[180px] md:h-[220px] -mx-2">
        <FractionStackVisual />
      </div>
    </div>
  );
}

function FractionStackVisual() {
  const cards = [
    { name: 'Edificio Córdoba', pct: 34, color: 'brand' },
    { name: 'Torre Asunción', pct: 22, color: 'earth' },
    { name: 'Loteo Uruguay', pct: 18, color: 'terra' },
  ];
  return (
    <div className="relative h-full">
      {cards.map((card, i) => (
        <div
          key={card.name}
          className="stack-card absolute left-0 right-8 md:right-16 rounded-2xl p-4 border backdrop-blur-sm"
          style={{
            top: `${i * 0}px`,
            background:
              card.color === 'brand'
                ? 'linear-gradient(135deg, rgba(0,200,83,0.12), rgba(0,200,83,0.04))'
                : card.color === 'earth'
                ? 'linear-gradient(135deg, rgba(184,145,90,0.12), rgba(184,145,90,0.04))'
                : 'linear-gradient(135deg, rgba(224,127,74,0.12), rgba(224,127,74,0.04))',
            borderColor:
              card.color === 'brand'
                ? 'rgba(0,200,83,0.25)'
                : card.color === 'earth'
                ? 'rgba(184,145,90,0.25)'
                : 'rgba(224,127,74,0.25)',
            zIndex: 10 - i,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-mono text-surface-600 tracking-wider uppercase">
                Participación
              </p>
              <p className="text-sm font-[580] text-surface-900 truncate mt-0.5">
                {card.name}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-surface-500 font-mono">Tu %</p>
              <p className="text-lg font-display font-[680] tabular-nums text-surface-900">
                {card.pct}
                <span className="text-xs text-surface-600">%</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BentoCellHash() {
  const hashRef = useScrambleOnView('a3f9...7c2ed8b1...', { duration: 1400 });

  return (
    <div
      data-reveal
      className="group relative md:col-span-2 md:row-span-2 overflow-hidden rounded-[24px] bg-gradient-to-br from-earth-950 via-surface-100 to-surface-100 border border-earth-500/15 p-8 transition-all duration-500 hover:border-earth-400/30"
    >
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2 rounded-lg bg-earth-500/15 border border-earth-500/20">
          <FileCheck2 className="w-4 h-4 text-earth-300" strokeWidth={1.75} />
        </div>
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-earth-300">
          Verificable
        </span>
      </div>

      <h3 className="font-display text-xl md:text-2xl font-[620] text-surface-900 tracking-[-0.015em] leading-[1.15]">
        Cada contrato,<br />
        <span className="italic font-[580] font-serif text-earth-200">
          un hash único.
        </span>
      </h3>
      <p className="mt-3 text-surface-600 text-sm leading-relaxed">
        SHA-256 verificable públicamente, anclado en Polygon.
      </p>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="rounded-xl bg-surface-50/80 border border-earth-500/10 p-3 backdrop-blur-sm">
          <p className="text-[9px] font-mono text-earth-400 tracking-wider uppercase mb-1">
            SHA-256
          </p>
          <p className="text-[10px] md:text-[11px] font-mono text-surface-800 break-all leading-relaxed">
            <span ref={hashRef}>a3f9...7c2ed8b1...</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function BentoCellChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.chart-bar',
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.05,
          transformOrigin: 'bottom',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  const bars = [32, 48, 42, 58, 64, 72, 68, 82];

  return (
    <div
      data-reveal
      className="group relative md:col-span-3 overflow-hidden rounded-[24px] bg-surface-100 border border-surface-200/80 p-7 transition-all duration-500 hover:border-brand-500/20"
    >
      <div className="flex items-start justify-between gap-4" ref={chartRef}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-brand-400" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-surface-600">
              Tiempo real
            </span>
          </div>
          <h3 className="font-display text-xl font-[620] text-surface-900 tracking-[-0.01em]">
            Retornos transparentes
          </h3>
          <p className="mt-2 text-sm text-surface-600 leading-relaxed max-w-[28ch]">
            Progreso y rendimiento sin letra chica.
          </p>
        </div>

        <div className="flex items-end gap-1 h-[72px] shrink-0">
          {bars.map((h, i) => (
            <div
              key={i}
              className="chart-bar w-2.5 rounded-t-sm"
              style={{
                height: `${h}%`,
                background:
                  i === bars.length - 1
                    ? 'linear-gradient(180deg, #00C853, #00A844)'
                    : 'linear-gradient(180deg, rgba(0,200,83,0.35), rgba(0,200,83,0.15))',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BentoCellBuilding() {
  return (
    <div
      data-reveal
      className="group relative md:col-span-3 overflow-hidden rounded-[24px] bg-gradient-to-br from-surface-100 to-terra-950/30 border border-surface-200/80 p-7 transition-all duration-500 hover:border-terra-500/25"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-terra-400" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-terra-400">
              Tangible
            </span>
          </div>
          <h3 className="font-display text-xl font-[620] text-surface-900 tracking-[-0.01em]">
            Activos <span className="italic font-[580] font-serif text-terra-300">reales.</span>
          </h3>
          <p className="mt-2 text-sm text-surface-600 leading-relaxed max-w-[28ch]">
            Sin especulación. Sin promesas vacías.
          </p>
        </div>
        <div className="shrink-0 relative w-[84px] h-[84px] transition-transform duration-500 group-hover:scale-110">
          <svg viewBox="0 0 84 84" className="w-full h-full">
            <defs>
              <linearGradient id="bldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c95a28" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B6F47" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <rect x="18" y="20" width="48" height="60" rx="3" fill="url(#bldGrad)" stroke="rgba(224,127,74,0.4)" strokeWidth="1" />
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2].map((col) => (
                <rect
                  key={`${row}-${col}`}
                  x={24 + col * 12}
                  y={28 + row * 12}
                  width="6"
                  height="7"
                  rx="1"
                  fill="rgba(224,127,74,0.35)"
                />
              ))
            )}
            <rect x="14" y="18" width="56" height="4" rx="1" fill="rgba(224,127,74,0.5)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function BentoCellGlobal() {
  return (
    <div
      data-reveal
      className="group relative md:col-span-2 overflow-hidden rounded-[24px] bg-surface-100 border border-surface-200/80 p-7 transition-all duration-500 hover:border-brand-500/20"
    >
      <Globe className="w-5 h-5 text-brand-400 mb-4 transition-transform duration-700 group-hover:rotate-[25deg]" strokeWidth={1.5} />
      <h3 className="font-display text-lg font-[620] text-surface-900 tracking-[-0.01em] leading-tight">
        Invertí desde<br />
        cualquier parte.
      </h3>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {['PY', 'AR', 'UY', 'BO'].map((code) => (
          <span
            key={code}
            className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-200 border border-surface-300 text-[10px] font-mono font-medium text-surface-700 tracking-wider"
          >
            {code}
          </span>
        ))}
      </div>
    </div>
  );
}

function BentoCellDashboard() {
  const cellRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cellRef.current;
    const cursor = cursorRef.current;
    if (!el || !cursor) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play pause resume pause',
        },
      });
      gsap.set(cursor, { x: 20, y: 20, opacity: 0 });
      tl.to(cursor, { opacity: 1, duration: 0.3 })
        .to(cursor, { x: 60, y: 36, duration: 0.8, ease: 'power2.inOut' })
        .to(cursor, { x: 110, y: 60, duration: 0.9, ease: 'power2.inOut' }, '+=0.3')
        .to(cursor, { x: 140, y: 92, duration: 0.9, ease: 'power2.inOut' }, '+=0.3')
        .to(cursor, { opacity: 0, duration: 0.5 }, '+=0.5');
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={cellRef}
      data-reveal
      className="group relative md:col-span-4 overflow-hidden rounded-[24px] bg-gradient-to-br from-surface-100 via-brand-950/20 to-surface-100 border border-surface-200/80 p-8 transition-all duration-500 hover:border-brand-500/25"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-brand-400" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-brand-400">
              Todo en un lugar
            </span>
          </div>
          <h3 className="font-display text-xl md:text-2xl font-[620] text-surface-900 tracking-[-0.015em] leading-tight">
            Tu portafolio inmobiliario,
            <br />
            <span className="italic font-[580] font-serif text-brand-300">
              sin planillas.
            </span>
          </h3>
          <p className="mt-2.5 text-sm text-surface-600 leading-relaxed max-w-[44ch]">
            Dashboard personalizado para inversores y desarrolladores. Todo lo que necesitás, a un clic.
          </p>
        </div>
        <div className="shrink-0 relative w-[180px] h-[120px] hidden sm:block">
          <div className="absolute inset-0 rounded-2xl bg-surface-50/60 border border-brand-500/15 p-3 backdrop-blur-sm shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-surface-400" />
              <div className="w-2 h-2 rounded-full bg-surface-400" />
              <div className="w-2 h-2 rounded-full bg-surface-400" />
            </div>
            <div className="mb-2">
              <div className="h-1.5 w-12 bg-surface-300 rounded-full mb-1.5" />
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-display font-[680] text-brand-400 tabular-nums">
                  +12.4
                </span>
                <span className="text-[10px] text-surface-600 font-mono">%</span>
              </div>
            </div>
            <div className="flex items-end gap-1 h-8">
              {[40, 55, 48, 68, 60, 82].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-500/40 to-brand-400/60"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          {/* Cursor fantasma */}
          <div
            ref={cursorRef}
            className="absolute w-4 h-4 pointer-events-none"
            style={{ opacity: 0 }}
          >
            <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-[0_0_6px_rgba(0,200,83,0.5)]">
              <path
                d="M2 2 L14 8 L9 9 L6 14 Z"
                fill="#00C853"
                stroke="white"
                strokeWidth="1"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
