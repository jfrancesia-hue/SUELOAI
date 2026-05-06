'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, MailCheck, RotateCcw } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase-browser';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const redirectTo = `${window.location.origin}/api/auth/callback?next=/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15">
          <MailCheck className="h-8 w-8 text-brand-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-surface-900">Revisá tu email</h2>
        <p className="mt-3 leading-relaxed text-surface-500">
          Si existe una cuenta con ese correo, vas a recibir un enlace seguro para crear una nueva contraseña.
        </p>
        <Link href="/login" className="btn-primary mt-8 inline-flex">
          Volver al login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-900">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>
      <h2 className="font-display text-2xl font-bold text-surface-900">Recuperar contraseña</h2>
      <p className="mt-2 text-surface-500">
        Escribí tu email y te enviamos un enlace para crear una contraseña nueva.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Input
          id="email"
          label="Email de tu cuenta"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          hint="Por seguridad no mostramos si el email existe o no."
          required
        />

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} icon={RotateCcw} className="w-full">
          Enviar enlace seguro
        </Button>
      </form>
    </div>
  );
}
