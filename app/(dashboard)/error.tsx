'use client';

/**
 * Error boundary específico del dashboard.
 * Mantiene el contexto visual del usuario (sin ir a página completa 500)
 * y permite retry sin perder la sesión.
 */

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[dashboard/error] unhandled:', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="card bg-red-500/5 border-red-500/20 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-500/10">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold text-surface-900">
              No pudimos cargar esta sección
            </h2>
            <p className="text-sm text-surface-600 mt-1">
              Reintentá en unos segundos. Si persiste, avisanos a soporte@suelo.ai.
            </p>
            {error.digest && (
              <p className="text-xs text-surface-400 mt-2 font-mono">ref: {error.digest}</p>
            )}
          </div>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    </div>
  );
}
