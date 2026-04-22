'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wallet, Search, FileCheck2, TrendingUp, type LucideIcon } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Scene = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  icon: LucideIcon;
  accent: 'brand' | 'earth' | 'terra';
};

const scenes: Scene[] = [
  {
    eyebrow: '01 — Elegí',
    title: 'Explorá proyectos',
    titleAccent: 'curados.',
    description: 'Cada proyecto pasa por scoring IA + auditoría humana antes de aparecer en el marketplace.',
    icon: Search,
    accent: 'brand',
  },
  {
    eyebrow: '02 — Invertí',
    title: 'Depositá desde',
    titleAccent: 'USD 100.',
    description: 'En ARS, PYG, USD o USDT. El contrato se firma digitalmente y queda anclado on-chain.',
    icon: Wallet,
    accent: 'earth',
  },
  {
    eyebrow: '03 — Verificá',
    title: 'Tu SHA-256,',
    titleAccent: 'público.',
    description: 'Cada contrato genera un hash anclado en Polygon. Verificable en polygonscan en segundos.',
    icon: FileCheck2,
    accent: 'terra',
  },
  {
    eyebrow: '04 — Crecé',
    title: 'Retornos',
    titleAccent: 'trazables.',
    description: 'Seguí el progreso y recibí rendimientos. El Analista IA te acompaña en cada decisión.',
    icon: TrendingUp,
    accent: 'brand',
  },
];

const accentColors = {
  brand: { text: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/25', orb: 'bg-brand-500/20' },
  earth: { text: 'text-earth-300', bg: 'bg-earth-500/10', border: 'border-earth-500/25', orb: 'bg-earth-500/20' },
  terra: { text: 'text-terra-400', bg: 'bg-terra-500/10', border: 'border-terra-500/25', orb: 'bg-terra-500/20' },
};

export function StickyStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scenesRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      scenesRef.current.forEach((el) => {
        if (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.position = 'relative';
        }
      });
      return;
    }

    const ctx = gsap.context(() => {
      const panels = scenesRef.current.filter(Boolean) as HTMLDivElement[];
      // Inicial: todos invisibles excepto el primero
      gsap.set(panels, { opacity: 0, y: 30 });
      gsap.set(panels[0], { opacity: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: `+=${panels.length * 100}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      // Barra de progreso
      tl.to(
        progressRef.current,
        { scaleX: 1, ease: 'none', duration: panels.length },
        0
      );

      // Orb que cambia de color y posición
      panels.forEach((panel, i) => {
        if (i === 0) return;
        tl.to(panels[i - 1], { opacity: 0, y: -30, duration: 0.5 }, i - 0.5);
        tl.fromTo(panel, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, i - 0.5);
      });

      // Orb path (suave mueve de izquierda a derecha)
      tl.to(
        orbRef.current,
        {
          x: '40vw',
          ease: 'none',
          duration: panels.length,
        },
        0
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      id="proceso"
      className="relative h-screen overflow-hidden bg-surface-50"
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.08] pointer-events-none" />

      {/* Orb de color que cambia */}
      <div
        ref={orbRef}
        className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[140px] pointer-events-none"
      />

      {/* Contenido */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Eyebrow fijo */}
          <div className="mb-8">
            <p className="text-brand-500 text-[11px] font-semibold tracking-[0.18em] uppercase">
              Tu inversión, paso a paso
            </p>
          </div>

          {/* Escenas apiladas */}
          <div className="relative min-h-[400px]">
            {scenes.map((scene, i) => {
              const Icon = scene.icon;
              const tone = accentColors[scene.accent];
              return (
                <div
                  key={i}
                  ref={(el) => {
                    scenesRef.current[i] = el;
                  }}
                  className="absolute inset-0"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Texto */}
                    <div>
                      <p className={`text-[13px] font-mono tracking-[0.2em] uppercase ${tone.text} mb-4`}>
                        {scene.eyebrow}
                      </p>
                      <h3 className="font-display text-5xl md:text-7xl font-[680] tracking-[-0.03em] leading-[0.95] text-surface-900">
                        {scene.title}
                        <br />
                        <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-earth-300 to-terra-400">
                          {scene.titleAccent}
                        </span>
                      </h3>
                      <p className="mt-6 text-base md:text-lg text-surface-600 leading-relaxed max-w-lg">
                        {scene.description}
                      </p>
                    </div>

                    {/* Visual grande: icono contenido en card */}
                    <div className="flex justify-center lg:justify-end">
                      <div
                        className={`relative w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-[32px] ${tone.bg} ${tone.border} border-[1.5px] flex items-center justify-center backdrop-blur-sm`}
                      >
                        <Icon className={`w-20 h-20 md:w-24 md:h-24 ${tone.text}`} strokeWidth={1.25} />
                        {/* Número gigante de fondo */}
                        <span
                          className={`absolute -top-4 -right-4 md:-top-6 md:-right-6 font-display text-[120px] md:text-[160px] font-[800] ${tone.text} opacity-[0.08] leading-none pointer-events-none select-none`}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra de progreso */}
          <div className="mt-16 relative h-px w-full bg-surface-200 overflow-hidden">
            <div
              ref={progressRef}
              className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-gradient-to-r from-brand-400 via-earth-300 to-terra-400"
            />
          </div>

          {/* Indicadores de escena */}
          <div className="mt-6 flex items-center justify-between">
            {scenes.map((_, i) => (
              <span
                key={i}
                className="text-[10px] font-mono tracking-[0.15em] text-surface-500 uppercase"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
