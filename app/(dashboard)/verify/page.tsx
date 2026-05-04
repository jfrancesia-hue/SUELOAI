'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { ArrowUpRight, CheckCircle2, CopyCheck, FileSearch, Fingerprint, Hash, ShieldCheck } from 'lucide-react';

const sampleHash = 'demo-contract-asuncion';

export default function VerifyPage() {
  const [hash, setHash] = useState('');

  const handleVerify = (event: React.FormEvent) => {
    event.preventDefault();
    if (hash.trim()) window.open(`/verify/${hash.trim()}`, '_blank');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#07111F] p-6 text-white shadow-[0_34px_100px_-58px_rgba(6,182,212,0.6)] md:p-8">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(7,17,31,0.92), rgba(7,17,31,0.62), rgba(7,17,31,0.9)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <div className="liquid-glass mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm text-white/90">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
              Verificación pública de contratos
            </div>
            <h1 className="font-serif text-6xl italic leading-[0.86] tracking-[-3px] text-white md:text-7xl">
              Confirmá que el contrato es real.
            </h1>
            <p className="mt-5 max-w-2xl font-body text-base font-light leading-snug text-white/78">
              Pegá el hash SHA-256 del PDF y Suelo abre una prueba pública con inversión, proyecto, fecha y trazabilidad.
            </p>
          </div>

          <div className="liquid-glass rounded-[1.5rem] p-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Fingerprint, label: 'Hash único' },
                { icon: CopyCheck, label: 'Registro público' },
                { icon: CheckCircle2, label: 'Integridad' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-center">
                  <Icon className="mx-auto h-5 w-5 text-cyan-200" strokeWidth={1.8} />
                  <p className="mt-2 text-[11px] leading-tight text-white/72">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <form onSubmit={handleVerify} className="card p-6 md:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10">
              <Hash className="h-5 w-5 text-cyan-200" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-surface-900">Ingresar hash</h2>
              <p className="mt-1 text-sm leading-relaxed text-surface-500">
                También podés probar con el hash demo si estás navegando el entorno demo.
              </p>
            </div>
          </div>

          <Input
            id="hash"
            label="Hash del contrato"
            placeholder="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            value={hash}
            onChange={(event) => setHash(event.target.value)}
            hint="El hash aparece al final del contrato PDF o en el comprobante de inversión."
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="flex-1" icon={FileSearch} disabled={!hash.trim()}>
              Verificar autenticidad
            </Button>
            <button
              type="button"
              onClick={() => setHash(sampleHash)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-300 bg-surface-150 px-4 py-3 text-sm font-medium text-surface-800 hover:border-cyan-300/30"
            >
              Usar demo
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </form>

        <aside className="card p-6 md:p-7">
          <h3 className="font-display text-lg font-bold text-surface-900">Cómo funciona</h3>
          <div className="mt-5 space-y-4">
            {[
              ['1', 'Suelo genera una huella SHA-256 única para el contrato.'],
              ['2', 'El hash se guarda junto al proyecto y la inversión.'],
              ['3', 'Cualquier persona puede verificar que el documento no cambió.'],
            ].map(([step, text]) => (
              <div key={step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                  {step}
                </span>
                <p className="text-sm leading-relaxed text-surface-600">{text}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
