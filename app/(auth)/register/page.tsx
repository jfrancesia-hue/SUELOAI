'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { Button, Input, Select } from '@/components/ui';
import { PasswordField } from '@/components/ui/password-field';
import { CheckCircle2, Circle, Info, UserPlus } from 'lucide-react';

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

  const passwordChecks = [
    { label: 'Al menos 6 caracteres', valid: form.password.length >= 6 },
    { label: 'Incluye una letra', valid: /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(form.password) },
    { label: 'Incluye un número', valid: /\d/.test(form.password) },
  ];

  const selectedRoleHelp =
    form.role === 'developer'
      ? 'Para desarrolladoras que quieren presentar proyectos, cargar documentación y hacer seguimiento comercial.'
      : 'Para personas que quieren analizar proyectos, invertir y seguir sus participaciones desde el panel.';

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!form.full_name.trim()) {
      setError('Escribí tu nombre completo.');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.full_name.trim(),
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
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15">
          <UserPlus className="h-8 w-8 text-brand-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-surface-900">¡Registro exitoso!</h2>
        <p className="mt-3 leading-relaxed text-surface-500">
          Te enviamos un email de confirmación. Revisá tu bandeja de entrada para activar tu cuenta.
        </p>
        <Link href="/login" className="btn-primary mt-8 inline-flex">
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-surface-900">Creá tu cuenta</h2>
      <p className="mt-2 text-surface-500">
        Completá estos datos para entrar a Suelo. Después vas a poder verificar identidad y cargar saldo.
      </p>

      <form onSubmit={handleRegister} className="mt-8 space-y-5">
        <Input
          id="full_name"
          label="Nombre completo"
          placeholder="Juan Pérez"
          autoComplete="name"
          hint="Usá tu nombre real. Lo vamos a usar para documentos y verificación."
          value={form.full_name}
          onChange={(event) => setForm({ ...form, full_name: event.target.value })}
          required
        />

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          hint="Te enviaremos la confirmación de cuenta a este correo."
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />

        <PasswordField
          id="password"
          label="Contraseña"
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          hint="Tocá el ícono del ojo para revisar la contraseña antes de crear la cuenta."
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />

        <div className="rounded-2xl border border-surface-200 bg-surface-100/70 p-4">
          <p className="mb-3 text-sm font-medium text-surface-800">Tu contraseña debería tener:</p>
          <div className="space-y-2">
            {passwordChecks.map((check) => {
              const Icon = check.valid ? CheckCircle2 : Circle;
              return (
                <div
                  key={check.label}
                  className={check.valid ? 'flex items-center gap-2 text-sm text-brand-500' : 'flex items-center gap-2 text-sm text-surface-500'}
                >
                  <Icon className="h-4 w-4" />
                  <span>{check.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Select
          id="role"
          label="Tipo de cuenta"
          hint="Elegí el perfil que mejor describe cómo vas a usar Suelo. Podés ajustarlo después con soporte."
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value })}
          options={[
            { value: 'investor', label: 'Inversor' },
            { value: 'developer', label: 'Desarrollador de proyectos' },
          ]}
        />

        <div className="flex gap-3 rounded-2xl border border-brand-500/15 bg-brand-500/10 p-4 text-sm leading-relaxed text-surface-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
          <p>{selectedRoleHelp}</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" loading={loading} icon={UserPlus} className="w-full">
          Crear cuenta
        </Button>

        <p className="text-center text-xs leading-relaxed text-surface-500">
          Al crear tu cuenta aceptás operar con información real. Las inversiones tienen riesgo y cada proyecto debe revisarse antes de invertir.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="font-medium text-brand-500 hover:text-brand-400">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
