'use client';

import Image from 'next/image';
import { FileCheck2, Fingerprint, LockKeyhole, QrCode, ShieldCheck } from 'lucide-react';
import { useRevealOnScroll } from '@/components/animations/useReveal';

const trustItems = [
  { icon: FileCheck2, label: 'Contrato', detail: 'PDF firmado' },
  { icon: Fingerprint, label: 'Hash', detail: 'SHA-256 público' },
  { icon: ShieldCheck, label: 'Developer', detail: 'Verificado' },
  { icon: LockKeyhole, label: 'Documentos', detail: 'Permisos y auditoría' },
];

function VerificationQr() {
  return (
    <div className="grid h-28 w-28 grid-cols-5 grid-rows-5 gap-1 rounded-2xl border border-white/10 bg-white p-3 shadow-[0_20px_55px_-24px_rgba(0,0,0,0.8)]">
      {Array.from({ length: 25 }).map((_, index) => {
        const active = [0, 1, 3, 4, 5, 7, 9, 10, 12, 13, 15, 16, 18, 20, 21, 22, 24].includes(index);
        return <span key={index} className={active ? 'rounded-[2px] bg-[#07111F]' : 'rounded-[2px] bg-transparent'} />;
      })}
    </div>
  );
}

export function TrustExperience() {
  const ref = useRevealOnScroll({ stagger: 0.07, duration: 0.7 });

  return (
    <section ref={ref} id="confianza" className="relative scroll-mt-24 overflow-hidden bg-[#07111F] py-24 md:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#07111F_0%,#111827_55%,#07111F_100%)]" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.06]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8">
        <div>
          <p data-reveal className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Centro de confianza
          </p>
          <h2 data-reveal className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-white md:text-5xl">
            Cada proyecto tiene documentación, trazabilidad y{' '}
            <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-[#F5C542]">
              verificación pública.
            </span>
          </h2>
          <p data-reveal className="mt-5 max-w-xl text-base leading-relaxed text-white/62 md:text-lg">
            Tu participación, tus documentos, tu trazabilidad. La experiencia visual tiene que mostrar seguridad antes de pedir inversión.
          </p>

          <div data-reveal className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trustItems.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10">
                  <Icon className="h-4 w-4 text-emerald-300" strokeWidth={1.8} />
                </div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-1 text-xs text-white/48">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div data-reveal className="relative min-h-[520px] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_30px_100px_-44px_rgba(6,182,212,0.45)] backdrop-blur-2xl">
          <Image
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=85&auto=format&fit=crop"
            alt="Documentación y revisión profesional de proyectos inmobiliarios"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover opacity-[0.42]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,17,31,0.94)_0%,rgba(7,17,31,0.66)_52%,rgba(17,24,39,0.88)_100%)]" />

          <div className="relative h-full min-h-[480px]">
            <div className="absolute left-4 top-6 w-[72%] rotate-[-4deg] rounded-2xl border border-white/12 bg-white/[0.09] p-5 shadow-[0_26px_80px_-38px_rgba(0,0,0,1)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-300">Contrato #8472</p>
                  <p className="mt-1 text-lg font-semibold text-white">Torre Asunción Eje</p>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-300" strokeWidth={2} />
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full rounded-full bg-white/18" />
                <div className="h-2 w-10/12 rounded-full bg-white/12" />
                <div className="h-2 w-8/12 rounded-full bg-white/12" />
              </div>
              <div className="mt-6 rounded-xl border border-emerald-300/18 bg-emerald-300/10 p-3">
                <p className="font-mono text-[11px] leading-relaxed text-emerald-100/80">
                  a3f9b2c7...d6e9f0a3
                </p>
              </div>
            </div>

            <div className="absolute bottom-8 right-4 w-[58%] rotate-[5deg] rounded-2xl border border-white/12 bg-[#07111F]/72 p-5 shadow-[0_26px_80px_-38px_rgba(0,0,0,1)] backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10">
                  <QrCode className="h-4 w-4 text-cyan-300" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">QR de verificación</p>
                  <p className="text-xs text-white/45">Escaneable y público</p>
                </div>
              </div>
              <VerificationQr />
            </div>

            <div className="absolute bottom-7 left-5 rounded-2xl border border-[#F5C542]/20 bg-[#F5C542]/10 px-4 py-3 text-sm font-semibold text-[#F5C542] backdrop-blur-xl">
              Auditoría legal completa
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
