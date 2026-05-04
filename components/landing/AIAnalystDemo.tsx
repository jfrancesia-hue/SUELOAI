'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  GitCompareArrows,
  Radar,
  ShieldAlert,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import { useRevealOnScroll } from '@/components/animations/useReveal';

const quickActions = [
  { icon: Radar, label: 'Analizar mi cartera' },
  { icon: Sparkles, label: 'Recomendar inversión' },
  { icon: ShieldAlert, label: 'Explicar riesgo' },
  { icon: GitCompareArrows, label: 'Comparar proyectos' },
  { icon: WalletCards, label: 'Simular USD 1.000' },
];

const recommendations = [
  {
    type: 'Oportunidad sugerida',
    title: 'Torre Asunción Eje',
    detail: 'Encaja con tu perfil balanceado y mejora exposición a Paraguay.',
    score: '94',
    tone: 'emerald',
  },
  {
    type: 'Riesgo detectado',
    title: 'Alta concentración AR',
    detail: 'Tenés 62% de cartera en Argentina. Conviene diversificar moneda y país.',
    score: 'Medio',
    tone: 'gold',
  },
  {
    type: 'Rebalanceo recomendado',
    title: '+15% renta mensual',
    detail: 'Podés sumar activos estabilizados sin subir demasiado el riesgo.',
    score: '+11%',
    tone: 'cyan',
  },
];

function HolographicAvatar() {
  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center md:h-64 md:w-64">
      <div className="absolute inset-0 rounded-full border border-emerald-300/15 bg-[radial-gradient(circle,rgba(16,185,129,0.16),transparent_62%)] blur-sm" />
      <div className="absolute h-[78%] w-[78%] animate-[spin_18s_linear_infinite] rounded-full border border-dashed border-cyan-300/22" />
      <div className="absolute h-[56%] w-[56%] animate-[spin_12s_linear_infinite_reverse] rounded-full border border-emerald-300/24" />
      <div className="absolute h-20 w-20 rounded-full bg-gradient-to-br from-emerald-300 via-cyan-300 to-violet-400 opacity-70 blur-2xl" />
      <div className="relative flex h-28 w-28 items-center justify-center rounded-[34px] border border-white/14 bg-white/[0.08] shadow-[0_24px_80px_-26px_rgba(16,185,129,0.7)] backdrop-blur-xl">
        <Brain className="h-12 w-12 text-emerald-200" strokeWidth={1.5} />
      </div>
      {[
        { label: 'Riesgo', x: '8%', y: '20%' },
        { label: 'Renta', x: '72%', y: '18%' },
        { label: 'Score', x: '76%', y: '72%' },
        { label: 'País', x: '10%', y: '76%' },
      ].map((node) => (
        <div
          key={node.label}
          className="absolute rounded-full border border-white/10 bg-[#07111F]/70 px-3 py-1 text-[10px] font-semibold text-white/62 backdrop-blur-xl"
          style={{ left: node.x, top: node.y }}
        >
          {node.label}
        </div>
      ))}
    </div>
  );
}

function TypedLine({ text }: { text: string }) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setShown(text);
      return;
    }
    setShown('');
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(timer);
    }, 14);
    return () => window.clearInterval(timer);
  }, [text]);

  return <>{shown}</>;
}

export function AIAnalystDemo() {
  const ref = useRevealOnScroll({ stagger: 0.07, duration: 0.7 });

  return (
    <section ref={ref} id="analista-ia" className="relative scroll-mt-24 overflow-hidden bg-[#07111F] py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(139,92,246,0.14),transparent_32%),radial-gradient(circle_at_75%_45%,rgba(6,182,212,0.13),transparent_34%),linear-gradient(180deg,#07111F_0%,#111827_55%,#07111F_100%)]" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.06]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p data-reveal className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Analista IA
            </p>
            <h2 data-reveal className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-white md:text-5xl">
              Tu analista personal de{' '}
              <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300">
                inversión inmobiliaria.
              </span>
            </h2>
            <p data-reveal className="mt-5 max-w-xl text-base leading-relaxed text-white/62 md:text-lg">
              La IA te ayuda a invertir según tu perfil, no según moda. Compara proyectos, explica riesgos y simula escenarios antes de mover capital.
            </p>

            <div data-reveal className="mt-8 flex flex-wrap gap-2">
              {quickActions.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3.5 py-2 text-xs font-semibold text-white/76 backdrop-blur-xl transition-colors hover:border-cyan-300/28 hover:bg-white/[0.08]"
                >
                  <Icon className="h-3.5 w-3.5 text-cyan-300" strokeWidth={1.8} />
                  {label}
                </button>
              ))}
            </div>

            <Link
              data-reveal
              href="/assistant"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-cyan-300 to-emerald-400 px-5 py-3 text-sm font-semibold text-[#03130D] shadow-[0_16px_38px_-18px_rgba(6,182,212,0.72)] transition-transform hover:-translate-y-px"
            >
              Abrir analista IA
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>

          <div data-reveal className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_30px_100px_-42px_rgba(139,92,246,0.42)] backdrop-blur-2xl md:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_22%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_80%_42%,rgba(139,92,246,0.18),transparent_34%)]" />

            <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-[0.82fr_1.18fr]">
              <div className="rounded-[26px] border border-white/10 bg-[#07111F]/60 p-5 backdrop-blur-xl">
                <HolographicAvatar />
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Cartera simulada</span>
                    <span className="font-mono text-[11px] text-emerald-300">+12.4%</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      ['PY', 38, 'bg-emerald-300'],
                      ['AR', 31, 'bg-cyan-300'],
                      ['UY', 22, 'bg-[#F5C542]'],
                      ['BO', 9, 'bg-violet-300'],
                    ].map(([label, value, color]) => (
                      <div key={label as string} className="grid grid-cols-[32px_1fr_38px] items-center gap-2 text-xs">
                        <span className="font-mono text-white/50">{label}</span>
                        <span className="h-2 overflow-hidden rounded-full bg-white/10">
                          <span className={`block h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                        </span>
                        <span className="text-right font-mono text-white/50">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[26px] border border-white/10 bg-[#07111F]/70 p-5 backdrop-blur-xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10">
                      <Sparkles className="h-4 w-4 text-emerald-300" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Analista Suelo</p>
                      <p className="text-xs text-white/45">Memoria, tools y scoring</p>
                    </div>
                  </div>
                  <div className="mb-3 flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-br-md bg-emerald-300 px-4 py-3 text-sm font-medium leading-relaxed text-[#03130D] shadow-[0_18px_38px_-24px_rgba(16,185,129,0.9)]">
                      Tengo USD 1.000. Quiero empezar sin asumir demasiado riesgo.
                    </div>
                  </div>

                  <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.055] p-4 text-sm leading-relaxed text-white/72">
                    <TypedLine text="Te conviene dividirlo: 60% en renta mensual y 40% en obra avanzada A+. Evitaria concentrar mas en Argentina hasta balancear riesgo pais." />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      ['Renta', '60%'],
                      ['Obra A+', '40%'],
                      ['Riesgo', 'Bajo'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
                        <p className="text-[10px] text-white/42">{label}</p>
                        <p className="mt-1 font-mono text-xs font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {recommendations.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/42">{item.type}</p>
                        <span className={`rounded-lg border px-2 py-1 font-mono text-[11px] ${
                          item.tone === 'emerald'
                            ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-300'
                            : item.tone === 'gold'
                            ? 'border-[#F5C542]/20 bg-[#F5C542]/10 text-[#F5C542]'
                            : 'border-cyan-300/20 bg-cyan-300/10 text-cyan-300'
                        }`}>
                          {item.score}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/52">{item.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                    <BarChart3 className="mb-3 h-4 w-4 text-emerald-300" strokeWidth={1.8} />
                    <p className="text-2xl font-bold text-white">7</p>
                    <p className="text-xs text-white/45">proyectos filtrados</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                    <Building2 className="mb-3 h-4 w-4 text-cyan-300" strokeWidth={1.8} />
                    <p className="text-2xl font-bold text-white">3</p>
                    <p className="text-xs text-white/45">países sugeridos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
