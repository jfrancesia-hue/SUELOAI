'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { Button, Input, Select } from '@/components/ui';
import { ArrowUpRight, UserPlus } from 'lucide-react';

const fieldClassName =
  'h-12 rounded-full border-white/10 bg-white/[0.08] px-5 text-white placeholder:text-white/34 focus:border-white/30 focus:ring-white/20';

export default function RegisterPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'investor',
  });

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: form.role,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="liquid-glass mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.25rem]">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <h2 className="font-serif text-5xl italic tracking-[-2px] text-white">Registro exitoso</h2>
        <p className="mt-3 leading-relaxed text-white/68">
          Te enviamos un email de confirmación. Revisá tu bandeja de entrada para activar tu cuenta.
        </p>
        <Link href="/login" className="liquid-glass-strong mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white">
          Ir a iniciar sesión
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-5xl italic leading-[0.9] tracking-[-2px] text-white">Creá tu cuenta</h2>
      <p className="mt-3 font-body text-sm font-light text-white/68">Empezá a invertir en minutos</p>

      <form onSubmit={handleRegister} className="mt-8 space-y-5">
        <Input
          id="full_name"
          label="Nombre completo"
          placeholder="Juan Pérez"
          value={form.full_name}
          onChange={(event) => setForm({ ...form, full_name: event.target.value })}
          className={fieldClassName}
          required
        />

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          className={fieldClassName}
          required
        />

        <Input
          id="password"
          label="Contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          className={fieldClassName}
          required
        />

        <Select
          id="role"
          label="Tipo de cuenta"
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value })}
          className={`${fieldClassName} text-white`}
          options={[
            { value: 'investor', label: 'Inversor' },
            { value: 'developer', label: 'Desarrollador de Proyectos' },
          ]}
        />

        {error && (
          <div className="rounded-xl border border-red-300/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-100">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          icon={UserPlus}
          className="liquid-glass-strong h-12 w-full rounded-full bg-white/10 font-body text-sm font-semibold text-white shadow-none hover:bg-white/15"
        >
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/58">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="font-medium text-white hover:text-white/80">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
