'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase-browser';
import { DEMO_PASSWORD, getDemoRoleFromEmail, isDemoPassword } from '@/lib/demo-session';

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

    const demoRole = getDemoRoleFromEmail(form.email);
    if (demoRole) {
      if (!isDemoPassword(form.password)) {
        setError('Email o contraseña incorrectos');
        setLoading(false);
        return;
      }

      await loginDemo(form.email, form.password, demoRole);
      return;
    }

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
      const destination = getRedirectTarget() || (profile?.role === 'developer' ? '/developer' : '/investor');
      router.push(destination);
      router.refresh();
    }
  };

  async function loginDemo(email: string, password = DEMO_PASSWORD, role = getDemoRoleFromEmail(email)) {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/demo/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'No pudimos iniciar el modo demo');
        setLoading(false);
        return;
      }

      router.push(getRedirectTarget() || data.redirect || (role === 'developer' ? '/developer' : '/wallet'));
      router.refresh();
    } catch {
      setError('No pudimos iniciar el modo demo');
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-surface-900">Bienvenido de vuelta</h2>
      <p className="mt-2 text-surface-500">Ingresá a tu cuenta para continuar</p>

      <div className="mt-6 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4">
        <p className="text-sm font-semibold text-surface-900">Acceso demo listo</p>
        <p className="mt-1 text-xs text-surface-500">Usá estas credenciales para entrar ahora y probar la billetera.</p>
        <div className="mt-3 grid gap-2 text-xs">
          <button
            type="button"
            onClick={() => loginDemo('inversor@demo.suelo.ai')}
            className="rounded-xl border border-surface-200 bg-white px-3 py-2 text-left font-mono text-surface-700 transition-colors hover:border-brand-500/30"
          >
            Entrar como inversor
          </button>
          <button
            type="button"
            onClick={() => loginDemo('developer@demo.suelo.ai')}
            className="rounded-xl border border-surface-200 bg-white px-3 py-2 text-left font-mono text-surface-700 transition-colors hover:border-brand-500/30"
          >
            Entrar como developer
          </button>
        </div>
        <p className="mt-3 text-[11px] text-surface-500">
          Manual: inversor@demo.suelo.ai / {DEMO_PASSWORD}. También sirve contraseña: demo.
        </p>
      </div>

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />

        <Input
          id="password"
          label="Contraseña"
          type="password"
          placeholder="Minimo 6 caracteres"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />

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
