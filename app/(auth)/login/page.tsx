'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, BadgeCheck, Building2, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase-browser';
import { DEMO_PASSWORD, getDemoRoleFromEmail, isDemoModeEnabled, isDemoPassword } from '@/lib/demo-session';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const demoEnabled = isDemoModeEnabled();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const demoRole = getDemoRoleFromEmail(form.email);
    if (demoEnabled && demoRole) {
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
      <div className="mb-7">
        <div className="liquid-glass mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-body text-xs font-medium text-white/88">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
          Acceso seguro a Suelo
        </div>
        <h2 className="font-serif text-5xl italic leading-[0.88] tracking-[-2px] text-white sm:text-6xl">
          Bienvenido
          <br />
          de vuelta
        </h2>
        <p className="mt-4 max-w-sm font-body text-sm font-light leading-snug text-white/72">
          Entrá a tu wallet, proyectos, contratos y analista IA desde un panel privado.
        </p>
      </div>

      {demoEnabled && (
        <div className="liquid-glass rounded-[1.35rem] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-body text-sm font-semibold text-white">Acceso demo listo</p>
              <p className="mt-1 font-body text-xs font-light leading-snug text-white/62">
                Probá la experiencia completa sin conectar cuentas reales.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 font-body text-[11px] font-semibold text-black">
              Demo
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => loginDemo('jfrancesia@gmail.com')}
              className="liquid-glass rounded-[1rem] p-3 text-left transition-transform hover:-translate-y-0.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
                <UserRound className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="mt-3 block font-body text-sm font-semibold text-white">Inversor</span>
              <span className="mt-1 block font-body text-xs text-white/58">Wallet, portfolio y marketplace</span>
            </button>
            <button
              type="button"
              onClick={() => loginDemo('developer@demo.suelo.ai')}
              className="liquid-glass rounded-[1rem] p-3 text-left transition-transform hover:-translate-y-0.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
                <Building2 className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="mt-3 block font-body text-sm font-semibold text-white">Developer</span>
              <span className="mt-1 block font-body text-xs text-white/58">Proyectos, CRM y funding</span>
            </button>
          </div>
          <p className="mt-3 font-mono text-[11px] text-white/48">
            Manual: jfrancesia@gmail.com / {DEMO_PASSWORD}
          </p>
        </div>
      )}

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          className="h-12 rounded-full border-white/10 bg-white/[0.08] px-5 text-white placeholder:text-white/34 focus:border-white/30 focus:ring-white/20"
          required
        />

        <Input
          id="password"
          label="Contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          className="h-12 rounded-full border-white/10 bg-white/[0.08] px-5 text-white placeholder:text-white/34 focus:border-white/30 focus:ring-white/20"
          required
        />

        {error && (
          <div className="rounded-[1rem] border border-red-300/20 bg-red-500/10 p-3">
            <p className="font-body text-sm text-red-100">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          icon={LogIn}
          className="liquid-glass-strong h-12 w-full rounded-full bg-white/10 font-body text-sm font-semibold text-white shadow-none hover:bg-white/15"
        >
          Iniciar sesión
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-body text-xs text-white/50">
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck className="h-3.5 w-3.5 text-white/70" strokeWidth={1.8} />
          Sesión protegida
        </span>
        <span>Contratos verificables</span>
        <span>IA privada</span>
      </div>

      <p className="mt-6 text-center font-body text-sm text-white/58">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="inline-flex items-center gap-1 font-medium text-white hover:text-white/80">
          Registrate
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
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
