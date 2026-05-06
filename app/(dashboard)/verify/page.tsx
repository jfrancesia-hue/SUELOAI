'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { Search, ShieldCheck, ExternalLink } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [hash, setHash] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (hash.trim()) {
      window.open(`/verify/${hash.trim()}`, '_blank');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-brand-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-surface-900">
          Verificar Contrato
        </h1>
        <p className="text-surface-500 mt-2 max-w-md mx-auto">
          Ingresá el hash SHA-256 de un contrato para verificar su autenticidad e integridad.
        </p>
      </div>

      <form onSubmit={handleVerify} className="card">
        <Input
          id="hash"
          label="Hash del Contrato (SHA-256)"
          placeholder="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          hint="El hash se encuentra al final de tu contrato PDF"
        />
        <Button type="submit" className="w-full mt-4" icon={Search} disabled={!hash.trim()}>
          Verificar Autenticidad
        </Button>
      </form>

      <div className="card bg-surface-100/50">
        <h3 className="font-display font-semibold text-surface-800 text-sm mb-3">¿Cómo funciona?</h3>
        <div className="space-y-3 text-sm text-surface-600">
          <p>
            Cada contrato generado en Suelo incluye un hash criptográfico SHA-256 único que actúa como huella digital del documento.
          </p>
          <p>
            Al verificar, el sistema compara el hash con los registros almacenados para confirmar que el contrato es auténtico y no fue modificado.
          </p>
          <p>
            Esta verificación es pública y no requiere autenticación, permitiendo a cualquier parte confirmar la validez del contrato.
          </p>
        </div>
      </div>
    </div>
  );
}
