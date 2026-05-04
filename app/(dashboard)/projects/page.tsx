'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Button, Input, Textarea, Select, EmptyState } from '@/components/ui';
import { slugify, formatCurrency, getStatusLabel, getProgressPercent } from '@/utils/helpers';
import type { Project, CreateProjectInput } from '@/types';
import { Building2, FolderPlus, Save, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(searchParams.get('new') === 'true');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<CreateProjectInput>({
    title: '',
    description: '',
    location: '',
    address: '',
    total_value: 0,
    token_price: 0,
    total_tokens: 0,
    min_investment: 100,
    expected_return: 0,
    return_period_months: 12,
  });

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const response = await fetch('/api/projects', { cache: 'no-store' });
      const data = await response.json();
      setProjects(data.data || []);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('developer_id', user.id)
      .order('created_at', { ascending: false });

    setProjects(data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('No estás autenticado');
      setSaving(false);
      return;
    }

    const slug = slugify(form.title) + '-' + Date.now().toString(36);

    const { data, error: insertError } = await supabase
      .from('projects')
      .insert({
        ...form,
        slug,
        developer_id: user.id,
        status: 'draft',
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setShowForm(false);
    setForm({
      title: '', description: '', location: '', address: '',
      total_value: 0, token_price: 0, total_tokens: 0,
      min_investment: 100, expected_return: 0, return_period_months: 12,
    });
    await loadProjects();
    setSaving(false);

    if (data) {
      router.push(`/projects/${data.id}`);
    }
  }

  const updateField = (field: keyof CreateProjectInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Mis Proyectos</h1>
          <p className="text-surface-500 mt-1">Gestioná tus proyectos inmobiliarios</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} icon={FolderPlus}>
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold text-surface-900">
              Crear Nuevo Proyecto
            </h2>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-surface-200 rounded-lg">
              <X className="w-4 h-4 text-surface-500" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                id="title"
                label="Nombre del Proyecto"
                placeholder="Edificio Riviera Park"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
              <Input
                id="location"
                label="Ubicación"
                placeholder="Buenos Aires, Argentina"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                required
              />
            </div>

            <Textarea
              id="description"
              label="Descripción"
              placeholder="Descripción detallada del proyecto..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              required
            />

            <Input
              id="address"
              label="Dirección (opcional)"
              placeholder="Av. Corrientes 1234"
              value={form.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Input
                id="total_value"
                label="Valor Total (USD)"
                type="number"
                min={0}
                step={1000}
                value={form.total_value || ''}
                onChange={(e) => updateField('total_value', Number(e.target.value))}
                required
              />
              <Input
                id="token_price"
                label="Precio por Token (USD)"
                type="number"
                min={0}
                step={10}
                value={form.token_price || ''}
                onChange={(e) => updateField('token_price', Number(e.target.value))}
                required
              />
              <Input
                id="total_tokens"
                label="Total de Tokens"
                type="number"
                min={1}
                value={form.total_tokens || ''}
                onChange={(e) => updateField('total_tokens', Number(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Input
                id="min_investment"
                label="Inversión Mínima (USD)"
                type="number"
                min={0}
                value={form.min_investment || ''}
                onChange={(e) => updateField('min_investment', Number(e.target.value))}
              />
              <Input
                id="expected_return"
                label="Retorno Esperado (%)"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={form.expected_return || ''}
                onChange={(e) => updateField('expected_return', Number(e.target.value))}
              />
              <Input
                id="return_period_months"
                label="Período de Retorno (meses)"
                type="number"
                min={1}
                value={form.return_period_months || ''}
                onChange={(e) => updateField('return_period_months', Number(e.target.value))}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving} icon={Save}>
                Crear Proyecto
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Projects grid */}
      {projects.length === 0 && !showForm ? (
        <EmptyState
          icon={Building2}
          title="Sin proyectos aún"
          description="Creá tu primer proyecto para empezar a recibir inversiones"
          action={
            <Button onClick={() => setShowForm(true)} icon={FolderPlus}>
              Crear Proyecto
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="card-interactive"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-surface-900">{project.title}</h3>
                <span className={`badge ${
                  project.status === 'funding' ? 'bg-brand-500/15 text-brand-400' :
                  project.status === 'draft' ? 'bg-surface-300 text-surface-700' :
                  'bg-amber-500/15 text-amber-400'
                }`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              <p className="text-xs text-surface-500 mb-3">{project.location}</p>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-surface-600">
                  {formatCurrency(project.sold_tokens * project.token_price)} / {formatCurrency(project.total_value)}
                </span>
                <span className="font-mono text-surface-500">
                  {getProgressPercent(project.sold_tokens, project.total_tokens)}%
                </span>
              </div>
              <div className="w-full bg-surface-200 rounded-full h-1.5">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${getProgressPercent(project.sold_tokens, project.total_tokens)}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
