'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui';
import { PasswordField } from '@/components/ui/password-field';
import { isDemoMode } from '@/lib/demo';
import { createClient } from '@/lib/supabase-browser';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    if (isDemoMode()) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15">
          <CheckCircle2 className="h-8 w-8 text-brand-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-surface-900">Contraseña actualizada</h2>
        <p className="mt-3 leading-relaxed text-surface-500">Ya podés ingresar con tu nueva contraseña.</p>
        <Link href="/login" className="btn-primary mt-8 inline-flex">Ir al login</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-surface-900">Crear nueva contraseña</h2>
      <p className="mt-2 text-surface-500">Usá una contraseña que puedas recordar y no compartas con otras plataformas.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <PasswordField
          id="password"
          label="Nueva contraseña"
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <PasswordField
          id="confirm"
          label="Repetir contraseña"
          placeholder="Escribila otra vez"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
        />
        {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
        <Button type="submit" loading={loading} icon={KeyRound} className="w-full">Guardar contraseña</Button>
      </form>
    </div>
  );
}
