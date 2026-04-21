'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Button, Input } from '@/components/ui';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos'
        : authError.message);
      setLoading(false);
      return;
    }

    // Obtener rol del usuario para redirigir
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const destination = profile?.role === 'developer' ? '/developer' : '/investor';
      router.push(destination);
      router.refresh();
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-surface-900">Bienvenido de vuelta</h2>
      <p className="text-surface-500 mt-2">Ingresá a tu cuenta para continuar</p>

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <Input
          id="password"
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" loading={loading} icon={LogIn} className="w-full">
          Iniciar Sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="text-brand-500 hover:text-brand-400 font-medium">
          Registrate
        </Link>
      </p>
    </div>
  );
}
