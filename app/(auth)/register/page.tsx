'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Button, Input, Select } from '@/components/ui';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-6">
          <UserPlus className="w-8 h-8 text-brand-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-surface-900">¡Registro exitoso!</h2>
        <p className="text-surface-500 mt-3 leading-relaxed">
          Te enviamos un email de confirmación. Revisá tu bandeja de entrada para activar tu cuenta.
        </p>
        <Link href="/login" className="btn-primary mt-8 inline-flex">
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-surface-900">Creá tu cuenta</h2>
      <p className="text-surface-500 mt-2">Empezá a invertir en minutos</p>

      <form onSubmit={handleRegister} className="mt-8 space-y-5">
        <Input
          id="full_name"
          label="Nombre completo"
          placeholder="Juan Pérez"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />

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
          placeholder="Mínimo 6 caracteres"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <Select
          id="role"
          label="Tipo de cuenta"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          options={[
            { value: 'investor', label: 'Inversor' },
            { value: 'developer', label: 'Desarrollador de Proyectos' },
          ]}
        />

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" loading={loading} icon={UserPlus} className="w-full">
          Crear Cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="text-brand-500 hover:text-brand-400 font-medium">
          Iniciá Sesión
        </Link>
      </p>
    </div>
  );
}
