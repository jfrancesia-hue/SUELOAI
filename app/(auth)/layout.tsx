import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SueloLogo } from '@/components/branding/SueloLogo';

// Páginas de auth dependen de cookies de sesión: nunca prerenderables.
export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-0 items-center justify-center p-12">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[100px]" />

        <div className="relative max-w-md text-center">
          <SueloLogo
            className="mx-auto mb-8 justify-center"
            iconClassName="h-16 w-16 rounded-[24px]"
            textClassName="text-4xl"
            dark
            showTagline
          />
          <p className="text-surface-600 text-lg leading-relaxed">
            Inversión inmobiliaria fraccionada para Paraguay y Bolivia, con contratos verificables y seguimiento claro.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: 'PY + BO', label: 'Foco inicial' },
              { value: 'USD 100', label: 'Entrada mínima' },
              { value: 'Hash', label: 'Contratos verificables' },
            ].map(({ value, label }) => (
              <div key={label} className="p-4 rounded-xl bg-surface-100/50 border border-surface-200/50">
                <p className="font-display font-bold text-lg text-brand-500">{value}</p>
                <p className="text-xs text-surface-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-100/70 px-4 py-2 text-sm font-medium text-surface-600 transition-colors hover:border-brand-500/30 hover:text-brand-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex lg:hidden">
            <SueloLogo iconClassName="h-10 w-10 rounded-[15px]" textClassName="text-2xl" dark />
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}
