import { ArrowLeft, BadgeCheck, Landmark, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { FadingVideo } from '@/components/landing/FadingVideo';

export const dynamic = 'force-dynamic';

const AUTH_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4';

const trustMetrics = [
  { value: 'USD 100', label: 'ticket minimo' },
  { value: 'A+', label: 'scoring IA' },
  { value: '24/7', label: 'analista activo' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <FadingVideo
        src={AUTH_VIDEO}
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="liquid-glass flex h-11 w-11 items-center justify-center rounded-full">
              <span className="font-serif text-3xl italic leading-none text-white">s</span>
            </span>
            <span className="font-serif text-2xl italic tracking-tight text-white">
              Suelo
            </span>
          </Link>

          <Link
            href="/"
            className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-medium text-white/90"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            Volver
          </Link>
        </header>

        <section className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-8 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-0">
          <div className="hidden max-w-2xl lg:block">
            <div className="liquid-glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-medium text-white/90">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              Plataforma privada de inversion inmobiliaria
            </div>

            <h1 className="font-serif text-[5.6rem] italic leading-[0.82] tracking-[-4px] text-white xl:text-[6.6rem]">
              Entrá con claridad.
              <br />
              Invertí con criterio.
            </h1>

            <p className="mt-7 max-w-xl font-body text-lg font-light leading-snug text-white/82">
              Un entorno visual, financiero y legal para analizar proyectos reales, mover capital y verificar contratos sin perder de vista el riesgo.
            </p>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {trustMetrics.map((metric) => (
                <div key={metric.label} className="liquid-glass rounded-[1.25rem] p-5">
                  <p className="font-serif text-4xl italic leading-none tracking-[-1px] text-white">
                    {metric.value}
                  </p>
                  <p className="mt-2 font-body text-xs font-light uppercase tracking-[0.12em] text-white/72">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: ShieldCheck, label: 'KYC y trazabilidad' },
                { icon: Landmark, label: 'Fideicomisos LATAM' },
                { icon: BadgeCheck, label: 'Contratos verificables' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="liquid-glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 font-body text-xs text-white/88">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[500px]">
            <div className="liquid-glass rounded-[2rem] p-3 shadow-[0_40px_120px_-56px_rgba(0,0,0,1)]">
              <div className="rounded-[1.6rem] bg-black/36 p-5 backdrop-blur-2xl sm:p-7">
                {children}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
