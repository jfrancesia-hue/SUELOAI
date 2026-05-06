import { Shield } from 'lucide-react';
import Link from 'next/link';

// Páginas de auth dependen de cookies de sesión — nunca prerenderables.
export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-0 items-center justify-center p-12">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[100px]" />

        <div className="relative max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-surface-900 mb-4">
            Su<span className="text-brand-500">elo</span>
          </h1>
          <p className="text-surface-600 text-lg leading-relaxed">
            Inversión inmobiliaria fraccionada con trazabilidad criptográfica y contratos verificables.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: '14.5%', label: 'Retorno promedio' },
              { value: 'USD 100', label: 'Inversión mínima' },
              { value: '500+', label: 'Contratos' },
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
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-surface-900">
              Su<span className="text-brand-500">elo</span>
            </span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}
