'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRevealOnScroll } from '@/components/animations/useReveal';

const MIN_AMOUNT = 100;
const MAX_AMOUNT = 10000;
const MIN_MONTHS = 6;
const MAX_MONTHS = 60;

// Retornos históricos estimados por perfil de proyecto (anualizados)
const PROFILES = [
  { label: 'Conservador', rate: 0.09, color: 'brand', description: 'Activos terminados + renta' },
  { label: 'Balanceado', rate: 0.14, color: 'earth', description: 'Mix obra + renta' },
  { label: 'Crecimiento', rate: 0.22, color: 'terra', description: 'Desarrollos emergentes' },
] as const;

function fmt(n: number) {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

export function InvestmentCalculator() {
  const ref = useRevealOnScroll({ stagger: 0.07, duration: 0.7 });
  const [amount, setAmount] = useState(1000);
  const [months, setMonths] = useState(24);
  const [profile, setProfile] = useState<typeof PROFILES[number]>(PROFILES[1]);

  const projection = useMemo(() => {
    const years = months / 12;
    const final = amount * Math.pow(1 + profile.rate, years);
    const gain = final - amount;
    const roi = (gain / amount) * 100;
    return { final: Math.round(final), gain: Math.round(gain), roi: roi.toFixed(1) };
  }, [amount, months, profile.rate]);

  return (
    <section ref={ref} id="calculadora" className="relative py-24 md:py-32 overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/[0.05] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-earth-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p
            data-reveal
            className="text-brand-500 text-[11px] font-semibold tracking-[0.18em] uppercase mb-4"
          >
            Calculadora
          </p>
          <h2
            data-reveal
            className="font-display text-3xl md:text-5xl font-bold text-surface-900 tracking-[-0.02em] leading-[1.05]"
          >
            Simulá tu{' '}
            <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-terra-400">
              crecimiento
            </span>{' '}
            en segundos.
          </h2>
        </div>

        {/* Card */}
        <div
          data-reveal
          className="relative rounded-[28px] bg-surface-100/70 border border-surface-200 backdrop-blur-sm p-6 md:p-10 overflow-hidden"
        >
          {/* Corner glow */}
          <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-brand-500/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Controles */}
            <div className="lg:col-span-3 space-y-8">
              {/* Monto */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <label className="text-[11px] font-semibold tracking-[0.15em] uppercase text-surface-600">
                    Monto a invertir
                  </label>
                  <div className="font-display text-2xl font-[680] tabular-nums text-surface-900">
                    USD <span className="text-brand-400">{fmt(amount)}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step={50}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="suelo-range suelo-range-brand"
                />
                <div className="flex justify-between text-[10px] font-mono text-surface-500 mt-1.5 tracking-wider">
                  <span>USD {fmt(MIN_AMOUNT)}</span>
                  <span>USD {fmt(MAX_AMOUNT)}+</span>
                </div>
              </div>

              {/* Plazo */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <label className="text-[11px] font-semibold tracking-[0.15em] uppercase text-surface-600">
                    Plazo
                  </label>
                  <div className="font-display text-2xl font-[680] tabular-nums text-surface-900">
                    <span className="text-earth-300">{months}</span>{' '}
                    <span className="text-lg text-surface-600">meses</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={MIN_MONTHS}
                  max={MAX_MONTHS}
                  step={6}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="suelo-range suelo-range-earth"
                />
                <div className="flex justify-between text-[10px] font-mono text-surface-500 mt-1.5 tracking-wider">
                  <span>{MIN_MONTHS} meses</span>
                  <span>{MAX_MONTHS} meses</span>
                </div>
              </div>

              {/* Perfil */}
              <div>
                <label className="text-[11px] font-semibold tracking-[0.15em] uppercase text-surface-600 block mb-3">
                  Perfil de riesgo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PROFILES.map((p) => {
                    const active = profile.label === p.label;
                    return (
                      <button
                        key={p.label}
                        onClick={() => setProfile(p)}
                        className={`relative p-3 rounded-[12px] border text-left transition-all duration-200 ${
                          active
                            ? `bg-${p.color}-500/10 border-${p.color}-500/40`
                            : 'bg-surface-100 border-surface-200 hover:border-surface-300'
                        }`}
                      >
                        <p
                          className={`text-[12px] font-[580] ${
                            active ? `text-${p.color}-400` : 'text-surface-800'
                          }`}
                        >
                          {p.label}
                        </p>
                        <p className="text-[10px] text-surface-500 mt-0.5 leading-tight hidden sm:block">
                          {p.description}
                        </p>
                        <p
                          className={`text-[11px] font-mono font-[600] mt-1 tabular-nums ${
                            active ? `text-${p.color}-400` : 'text-surface-500'
                          }`}
                        >
                          ~{(p.rate * 100).toFixed(0)}% anual
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="rounded-[20px] bg-gradient-to-br from-brand-950/40 via-surface-50 to-earth-950/20 border border-brand-500/15 p-6 md:p-7 flex-1">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-brand-400" strokeWidth={2} />
                  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-brand-400">
                    Proyección
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-[11px] font-mono text-surface-500 uppercase tracking-wider mb-1">
                    Valor final estimado
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[13px] font-mono text-surface-600">USD</span>
                    <span className="font-display text-[44px] md:text-[56px] font-[680] text-surface-900 tabular-nums leading-none tracking-[-0.03em]">
                      {fmt(projection.final)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 border-t border-surface-200/60 pt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] text-surface-600">Ganancia estimada</span>
                    <span className="font-display text-xl font-[620] text-brand-400 tabular-nums">
                      +USD {fmt(projection.gain)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] text-surface-600">ROI total</span>
                    <span className="font-display text-xl font-[620] text-earth-300 tabular-nums">
                      +{projection.roi}%
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className="mt-4 group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-b from-brand-400 to-brand-600 text-white text-[14px] font-[560] rounded-[12px] transition-all
                           shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_0_0_1px_rgba(0,200,83,0.4),0_8px_20px_-4px_rgba(0,200,83,0.4)]
                           hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_0_0_1px_rgba(0,200,83,0.6),0_12px_28px_-4px_rgba(0,200,83,0.55)]
                           hover:-translate-y-px"
              >
                Empezar con USD {fmt(amount)}
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>

              <p className="mt-3 text-[10px] text-surface-500 text-center leading-relaxed">
                Proyección estimada basada en históricos. Las inversiones tienen riesgo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
