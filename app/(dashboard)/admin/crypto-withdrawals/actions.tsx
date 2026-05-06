'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export function WithdrawalActions({ id, disabled }: { id: string; disabled?: boolean }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(action: 'approve' | 'reject') {
    setLoading(action);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/crypto-withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: action === 'reject' ? 'Rechazado desde panel admin' : undefined,
        }),
      });
      const data = await res.json();
      setMessage(res.ok ? data.message || 'Actualizado' : data.error || 'No se pudo actualizar');
    } catch {
      setMessage('No se pudo conectar con el servidor');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || Boolean(loading)}
          onClick={() => submit('approve')}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {loading === 'approve' ? 'Aprobando...' : 'Aprobar'}
        </button>
        <button
          type="button"
          disabled={disabled || Boolean(loading)}
          onClick={() => submit('reject')}
          className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XCircle className="h-3.5 w-3.5" />
          {loading === 'reject' ? 'Rechazando...' : 'Rechazar'}
        </button>
      </div>
      {message && <p className="text-xs font-medium text-surface-500">{message}</p>}
    </div>
  );
}
