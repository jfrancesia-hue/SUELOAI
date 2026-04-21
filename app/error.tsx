'use client';

/**
 * Error boundary global (app/error.tsx).
 * Se activa cuando cualquier page/layout fuera de un error.tsx más específico
 * lanza un error no capturado.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log estructurado — se captura en Vercel Runtime Logs
    console.error('[app/error] unhandled:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-red-500/10">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900">
            Algo salió mal
          </h1>
          <p className="mt-2 text-surface-600">
            Tuvimos un problema procesando tu solicitud. El equipo ya fue notificado.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-surface-400 font-mono">ref: {error.digest}</p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-200 hover:bg-surface-300 text-surface-700 font-medium rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
