'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Coins, Home, Landmark, TrendingUp, WalletCards } from 'lucide-react';
import { useRevealOnScroll } from '@/components/animations/useReveal';

const profiles = [
  { label: 'Conservador', rate: 0.09, rent: 0.055, color: '#10B981', copy: 'Renta mensual + activos terminados' },
  { label: 'Balanceado', rate: 0.14, rent: 0.045, color: '#06B6D4', copy: 'Mix de renta y obra avanzada' },
  { label: 'Crecimiento', rate: 0.2, rent: 0.025, color: '#F5C542', copy: 'Mayor plusvalía y plazo largo' },
] as const;

function money(value: number) {
  return value.toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

function GrowthChart({ data, color }: { data: { month: number; value: number }[]; color: string }) {
  const width = 640;
  const height = 240;
  const padding = 18;
  const min = Math.min(...data.map((point) => point.value));
  const max = Math.max(...data.map((point) => point.value));
  const range = Math.max(1, max - min);
  const step = (width - padding * 2) / Math.max(1, data.length - 1);
  const points = data.map((point, index) => {
    const x = padding + index * step;
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
    return { ...point, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Proyección de crecimiento patrimonial">
      <defs>
        <linearGradient id="growthArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.42" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((row) => {
        const y = padding + row * ((height - padding * 2) / 3);
        return <line key={row} x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      <polygon points={area} fill="url(#growthArea)" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => (
        <circle key={point.month} cx={point.x} cy={point.y} r={index === points.length - 1 ? 5 : 3} fill={color} opacity={index % 2 === 0 || index === points.length - 1 ? 1 : 0.35} />
      ))}
      <g>
        <rect x={last.x - 92} y={Math.max(12, last.y - 52)} width="108" height="34" rx="10" fill="rgba(7,17,31,0.86)" stroke="rgba(255,255,255,0.12)" />
        <text x={last.x - 78} y={Math.max(34, last.y - 30)} fill="rgba(255,255,255,0.78)" fontSize="12" fontWeight="700">
          USD {money(last.value)}
        </text>
      </g>
    </svg>
  );
}

export function InvestmentCalculator() {
  const ref = useRevealOnScroll({ stagger: 0.07, duration: 0.7 });
  const [amount, setAmount] = useState(1000);
  const [months, setMonths] = useState(24);
  const [profile, setProfile] = useState<(typeof profiles)[number]>(profiles[1]);

  const projection = useMemo(() => {
    const years = months / 12;
    const final = Math.round(amount * Math.pow(1 + profile.rate, years));
    const gain = final - amount;
    const monthlyRent = Math.round((amount * profile.rent) / 12);
    const appreciation = Math.round(gain - monthlyRent * months);
    const data = Array.from({ length: Math.floor(months / 3) + 1 }, (_, index) => {
      const month = index * 3;
      const value = Math.round(amount * Math.pow(1 + profile.rate, month / 12));
      return { month, value };
    });
    return { final, gain, monthlyRent, appreciation, data };
  }, [amount, months, profile]);

  return (
    <section ref={ref} id="simulador" className="relative scroll-mt-24 overflow-hidden bg-[#07111F] py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,rgba(16,185,129,0.15),transparent_32%),radial-gradient(circle_at_78%_58%,rgba(245,197,66,0.12),transparent_32%),linear-gradient(180deg,#07111F_0%,#111827_50%,#07111F_100%)]" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.055]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p data-reveal className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5C542]">
            Simulador
          </p>
          <h2 data-reveal className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-white md:text-5xl">
            Visualizá tu patrimonio{' '}
            <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-[#F5C542]">
              creciendo.
            </span>
          </h2>
          <p data-reveal className="mt-5 text-base leading-relaxed text-white/58 md:text-lg">
            Ajustá monto, plazo y perfil. La simulación muestra renta mensual, plusvalía y valor estimado.
          </p>
        </div>

        <div data-reveal className="grid grid-cols-1 gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_30px_100px_-45px_rgba(16,185,129,0.38)] backdrop-blur-2xl md:p-7">
            <div className="space-y-8">
              <div>
                <div className="mb-3 flex items-end justify-between gap-4">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/45">Monto a invertir</label>
                  <p className="font-display text-3xl font-bold text-white">USD {money(amount)}</p>
                </div>
                <input
                  type="range"
                  min={100}
                  max={25000}
                  step={100}
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  className="suelo-range"
                  aria-label="Monto a invertir"
                />
              </div>

              <div>
                <div className="mb-3 flex items-end justify-between gap-4">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/45">Plazo</label>
                  <p className="font-display text-3xl font-bold text-white">{months} meses</p>
                </div>
                <input
                  type="range"
                  min={6}
                  max={60}
                  step={6}
                  value={months}
                  onChange={(event) => setMonths(Number(event.target.value))}
                  className="suelo-range suelo-range-earth"
                  aria-label="Plazo"
                />
              </div>

              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/45">Escenario</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {profiles.map((item) => {
                    const active = item.label === profile.label;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setProfile(item)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          active ? 'border-cyan-300/45 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(6,182,212,0.12)_inset]' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.055]'
                        }`}
                      >
                        <span className="text-sm font-semibold text-white">{item.label}</span>
                        <span className="mt-1 block text-xs leading-snug text-white/45">{item.copy}</span>
                        <span className="mt-3 block font-mono text-xs" style={{ color: item.color }}>
                          ~{Math.round(item.rate * 100)}% anual
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_30px_100px_-45px_rgba(6,182,212,0.38)] backdrop-blur-2xl md:p-7">
            <div className="absolute right-8 top-8 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { icon: WalletCards, label: 'Valor estimado', value: `USD ${money(projection.final)}`, tone: 'text-emerald-300' },
                { icon: Coins, label: 'Renta mensual', value: `USD ${money(projection.monthlyRent)}`, tone: 'text-cyan-300' },
                { icon: TrendingUp, label: 'Plusvalía esperada', value: `USD ${money(Math.max(0, projection.appreciation))}`, tone: 'text-[#F5C542]' },
                { icon: Landmark, label: 'Ganancia total', value: `USD ${money(projection.gain)}`, tone: 'text-violet-300' },
              ].map(({ icon: Icon, label, value, tone }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-[#07111F]/54 p-4">
                  <Icon className={`mb-3 h-4 w-4 ${tone}`} strokeWidth={1.8} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/40">{label}</p>
                  <p className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-5 h-72 rounded-[26px] border border-white/10 bg-[#07111F]/62 p-4">
              <div className="absolute bottom-6 right-8 hidden h-28 w-28 items-center justify-center rounded-[28px] border border-emerald-300/18 bg-emerald-300/10 md:flex">
                <Home className="h-12 w-12 text-emerald-200" strokeWidth={1.4} />
              </div>
              <GrowthChart data={projection.data} color={profile.color} />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs leading-relaxed text-white/45">
                Proyección estimada. Invertí con información, no con intuición. Las inversiones tienen riesgo.
              </p>
              <Link
                href="/register"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-500 px-5 py-3 text-sm font-semibold text-[#03130D] transition-transform hover:-translate-y-px"
              >
                Invertir USD {money(amount)}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
