'use client';

import { ShieldCheck, Lock, FileCheck2, Cpu, Link as LinkIcon } from 'lucide-react';
import { useScrambleOnView } from '@/components/animations/useScrollAnimation';
import { useRevealOnScroll } from '@/components/animations/useReveal';

const pillars = [
  {
    icon: FileCheck2,
    title: 'Contratos auditables',
    description: 'Cada inversión genera un PDF firmado con hash SHA-256 verificable públicamente.',
    accent: 'brand' as const,
  },
  {
    icon: LinkIcon,
    title: 'Anclado en Polygon',
    description: 'Los hashes se anclan on-chain de forma inmutable. Probá en polygonscan en cualquier momento.',
    accent: 'earth' as const,
  },
  {
    icon: ShieldCheck,
    title: 'KYC/AML certificado',
    description: 'Verificación de identidad con Didit. Cumplimiento completo LATAM.',
    accent: 'terra' as const,
  },
  {
    icon: Lock,
    title: 'Encriptación end-to-end',
    description: 'TLS 1.3, Row Level Security en Supabase, secrets rotados. Logs con redacción automática.',
    accent: 'brand' as const,
  },
  {
    icon: Cpu,
    title: 'Rate limiting & DDoS',
    description: 'Upstash Redis + fallback en memoria. Headers CSP estrictos. Sin huecos conocidos.',
    accent: 'earth' as const,
  },
];

const accentMap = {
  brand: { text: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
  earth: { text: 'text-earth-300', bg: 'bg-earth-500/10', border: 'border-earth-500/20' },
  terra: { text: 'text-terra-400', bg: 'bg-terra-500/10', border: 'border-terra-500/20' },
};

export function Security() {
  const ref = useRevealOnScroll({ stagger: 0.06, duration: 0.7 });
  const hashRef = useScrambleOnView(
    'a3f9b2c7d8e1f4a5b6c9d2e3f4a7b8c1d2e5f8a9b0c3d4e7f8a1b2c5d6e9f0a3',
    { duration: 1800 }
  );

  return (
    <section ref={ref} id="seguridad" className="relative py-24 md:py-32 overflow-hidden">
      {/* Ambient oscuro para sensación "serio" */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-100/40 to-transparent" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-brand-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-earth-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p
            data-reveal
            className="text-brand-500 text-[11px] font-semibold tracking-[0.18em] uppercase mb-4"
          >
            Seguridad
          </p>
          <h2
            data-reveal
            className="font-display text-3xl md:text-5xl font-bold text-surface-900 tracking-[-0.02em] leading-[1.05]"
          >
            Tu capital merece{' '}
            <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-earth-300">
              paranoia ingenieril.
            </span>
          </h2>
          <p
            data-reveal
            className="mt-5 text-surface-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto"
          >
            Cada decisión técnica está pensada para que duermas tranquilo.
          </p>
        </div>

        {/* SHA-256 live demo — centro visual */}
        <div data-reveal className="max-w-3xl mx-auto mb-16">
          <div className="relative rounded-[24px] bg-surface-100/80 border border-surface-200 backdrop-blur-sm p-6 md:p-8 overflow-hidden">
            {/* Corner glow */}
            <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
                  </div>
                  <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-brand-400 font-[600]">
                    Hash en vivo
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-earth-500/10 border border-earth-500/20">
                  <LinkIcon className="w-3 h-3 text-earth-300" strokeWidth={2} />
                  <span className="text-[10px] font-mono text-earth-300 tracking-wider">
                    POLYGON
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-surface-50 border border-surface-200/60 p-4">
                <p className="text-[10px] font-mono text-surface-500 tracking-wider uppercase mb-2">
                  SHA-256 del contrato #8472
                </p>
                <p
                  className="text-[11px] md:text-[13px] font-mono text-surface-800 break-all leading-relaxed font-[500]"
                >
                  <span ref={hashRef}>a3f9b2c7d8e1f4a5b6c9d2e3f4a7b8c1d2e5f8a9b0c3d4e7f8a1b2c5d6e9f0a3</span>
                </p>
              </div>

              <p className="mt-4 text-[13px] text-surface-600 leading-relaxed">
                Pegá el hash en{' '}
                <span className="font-mono text-brand-400">polygonscan.com</span> y confirmá
                que tu inversión existe on-chain. Sin intermediarios. Sin letra chica.
              </p>
            </div>
          </div>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map(({ icon: Icon, title, description, accent }, i) => {
            const tone = accentMap[accent];
            return (
              <div
                key={title}
                data-reveal
                className={`group relative rounded-[18px] bg-surface-100/60 border border-surface-200/60 backdrop-blur-sm p-6 transition-all duration-500 hover:${tone.border.replace('/20', '/40')} hover:-translate-y-0.5 ${i === pillars.length - 1 ? 'lg:col-start-2' : ''}`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-[10px] ${tone.bg} ${tone.border} border mb-4`}>
                  <Icon className={`w-4 h-4 ${tone.text}`} strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-[17px] font-[620] text-surface-900 tracking-[-0.01em]">
                  {title}
                </h3>
                <p className="mt-2 text-[13px] text-surface-600 leading-relaxed">
                  {description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
