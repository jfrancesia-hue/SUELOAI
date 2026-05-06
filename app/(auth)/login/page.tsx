'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HelpCircle, LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { PasswordField } from '@/components/ui/password-field';
import { createClient } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : authError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      const hasOnboarding = typeof window !== 'undefined' && window.localStorage.getItem('suelo_onboarding');
      const destination = getRedirectTarget() || (profile?.role === 'developer' ? '/developer' : hasOnboarding ? '/investor' : '/onboarding');
      router.push(destination);
      router.refresh();
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-surface-900">Bienvenido de vuelta</h2>
      <p className="mt-2 text-surface-500">Ingresá con el email y la contraseña que usaste al registrarte.</p>

      <div className="mt-6 rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 via-white to-amber-500/10 p-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-surface-900">
              Ver plataforma completa
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-surface-600">
              Acceso libre temporal para mostrar Suelo AI completo sin crear cuenta ni cargar contrase?a.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Link
            href="/api/demo/access?role=admin&redirect=/admin"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-3 py-2 text-sm font-bold text-white hover:bg-brand-600"
          >
            Demo completa
          </Link>
          <Link
            href="/api/demo/access?role=investor&redirect=/investor"
            className="inline-flex items-center justify-center rounded-xl border border-surface-300 bg-white px-3 py-2 text-sm font-semibold text-surface-800 hover:bg-surface-100"
          >
            Inversor
          </Link>
          <Link
            href="/api/demo/access?role=developer&redirect=/developer"
            className="inline-flex items-center justify-center rounded-xl border border-surface-300 bg-white px-3 py-2 text-sm font-semibold text-surface-800 hover:bg-surface-100"
          >
            Desarrollador
          </Link>
        </div>
      </div>

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          hint="Usá el mismo email con el que creaste tu cuenta."
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />

        <PasswordField
          id="password"
          label="Contraseña"
          placeholder="Escribí tu contraseña"
          autoComplete="current-password"
          hint="Podés tocar el ícono del ojo para revisar lo que escribiste antes de entrar."
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-brand-500 hover:text-brand-400">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="grid gap-3 rounded-2xl border border-surface-200 bg-surface-100/70 p-4 text-sm text-surface-600">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            <p>Tu sesión se valida con Supabase Auth y cookies seguras.</p>
          </div>
          <div className="flex gap-3">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-surface-500" />
            <p>Si no recordás la contraseña, el siguiente paso recomendado es habilitar recuperación por email.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" loading={loading} icon={LogIn} className="w-full">
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="font-medium text-brand-500 hover:text-brand-400">
          Registrate
        </Link>
      </p>
    </div>
  );
}

function getRedirectTarget() {
  if (typeof window === 'undefined') return null;
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  return redirect?.startsWith('/') ? redirect : null;
}
