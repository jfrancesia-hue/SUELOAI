import Link from 'next/link';
import { Sprout, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-brand-500/10">
          <Sprout className="w-10 h-10 text-brand-500" />
        </div>
        <div>
          <h1 className="font-display text-5xl font-black text-surface-900">404</h1>
          <p className="mt-3 text-lg text-surface-700 font-medium">
            Esta página no existe
          </p>
          <p className="mt-2 text-sm text-surface-500">
            Puede que se haya movido o que nunca haya existido.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-200 hover:bg-surface-300 text-surface-700 font-medium rounded-xl transition-colors"
          >
            <Search className="w-4 h-4" />
            Ver proyectos
          </Link>
        </div>
      </div>
    </div>
  );
}
