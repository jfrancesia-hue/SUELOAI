'use client';

/**
 * Modal KYC reusable. Uso:
 *
 *   const [open, setOpen] = useState(false);
 *   <Button onClick={() => setOpen(true)}>Verificar identidad</Button>
 *   <KycModal open={open} onClose={() => setOpen(false)} onVerified={() => {}} />
 *
 * Funciona con Didit si DIDIT_API_KEY + DIDIT_WORKFLOW_ID están configurados,
 * sino entra en modo manual (crea KYC request pending para revisión admin).
 */

import { useEffect, useState } from 'react';
import { Shield, X, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';

interface KycState {
  request: any;
  profile_status: string;
  verified: boolean;
}

export function KycModal({
  open,
  onClose,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
}) {
  const [state, setState] = useState<KycState | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  const fetchState = async () => {
    setLoading(true);
    const res = await fetch('/api/kyc');
    const data = await res.json();
    setState(data);
    setLoading(false);
    if (data.verified) onVerified?.();
  };

  useEffect(() => {
    if (open) fetchState();
  }, [open]);

  const handleStart = async () => {
    setStarting(true);
    const res = await fetch('/api/kyc', { method: 'POST' });
    const data = await res.json();
    if (data.verification_url) setVerificationUrl(data.verification_url);
    fetchState();
    setStarting(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-0 rounded-2xl shadow-2xl max-w-md w-full border border-surface-200">
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/10">
              <Shield className="w-5 h-5 text-brand-500" />
            </div>
            <h2 className="font-display font-bold text-lg text-surface-900">
              Verificación de identidad (KYC)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-200 text-surface-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : state?.verified ? (
            <div className="flex flex-col items-center text-center py-4 space-y-3">
              <div className="p-3 rounded-full bg-brand-500/15">
                <CheckCircle2 className="w-10 h-10 text-brand-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-surface-900">Verificado</h3>
                <p className="text-sm text-surface-600 mt-1">
                  Tu identidad ya está verificada. Podés operar sin restricciones.
                </p>
              </div>
            </div>
          ) : state?.request ? (
            <div className="space-y-4">
              <StatusBanner status={state.request.status} />
              {verificationUrl && (
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Abrir verificación <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <p className="text-xs text-surface-500 text-center">
                Proveedor: {state.request.provider === 'didit' ? 'Didit' : 'Manual (revisión interna)'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-surface-700 leading-relaxed">
                Para operar crypto y montos mayores a USD 1000, necesitamos verificar tu identidad.
                El proceso toma menos de 5 minutos.
              </p>
              <ul className="text-sm text-surface-600 space-y-1.5 pl-4 list-disc">
                <li>Documento de identidad (DNI / pasaporte)</li>
                <li>Selfie de validación</li>
                <li>Confirmación de datos personales</li>
              </ul>
              <Button onClick={handleStart} loading={starting} className="w-full">
                Iniciar verificación
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBanner({ status }: { status: string }) {
  const config = {
    pending: { icon: Clock, color: 'text-amber-500 bg-amber-500/10', text: 'Pendiente de revisión' },
    in_progress: { icon: Clock, color: 'text-blue-500 bg-blue-500/10', text: 'En proceso' },
    approved: { icon: CheckCircle2, color: 'text-brand-500 bg-brand-500/10', text: 'Aprobado' },
    rejected: { icon: AlertCircle, color: 'text-red-500 bg-red-500/10', text: 'Rechazado' },
    expired: { icon: AlertCircle, color: 'text-red-500 bg-red-500/10', text: 'Expirado' },
  }[status] || {
    icon: Clock,
    color: 'text-surface-500 bg-surface-200',
    text: status,
  };

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl ${config.color}`}>
      <Icon className="w-5 h-5" />
      <p className="font-medium text-sm">{config.text}</p>
    </div>
  );
}
