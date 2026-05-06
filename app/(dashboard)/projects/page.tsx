'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Button, Input, Textarea, Select, EmptyState } from '@/components/ui';
import { DashboardHero, MiniBuildingVisual, PhotoStrip, VisualActionCard } from '@/components/dashboard/visual-shell';
import { demoProjects, isDemoMode } from '@/lib/demo';
import { slugify, formatCurrency, getStatusLabel, getProgressPercent } from '@/utils/helpers';
import type { Project, CreateProjectInput } from '@/types';
import { Building2, FolderPlus, Save, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoMode = isDemoMode();
  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(searchParams?.get('new') === 'true');
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

  const loadProjects = useCallback(async () => {
    if (demoMode) {
      setProjects(demoProjects);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('developer_id', user.id)
      .order('created_at', { ascending: false });

    setProjects(data || []);
    setLoading(false);
  }, [demoMode, supabase]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (demoMode) {
      const newProject = {
        id: `demo-${Date.now()}`,
        developer_id: 'demo-developer',
        slug: slugify(form.title) + '-' + Date.now().toString(36),
        status: 'draft',
        sold_tokens: 0,
        image_url: null,
        gallery_urls: [],
        documents_url: null,
        featured: false,
        latitude: null,
        longitude: null,
        start_date: null,
        end_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        address: form.address || null,
        ...form,
      } as Project;
      setProjects((prev) => [newProject, ...prev]);
      setShowForm(false);
      setSaving(false);
      return;
    }

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
      <DashboardHero
        eyebrow="Mis proyectos"
        title="Armá una ficha que venda confianza, no solo metros cuadrados."
        description="Cargá datos, ubicación, números, riesgos y documentación para que el inversor entienda rápido qué está mirando."
        visual={<MiniBuildingVisual label="Ficha visual del proyecto" />}
      >
        {!showForm && (
          <Button onClick={() => setShowForm(true)} icon={FolderPlus}>
            Nuevo Proyecto
          </Button>
        )}
      </DashboardHero>

      <PhotoStrip />

      {showForm && (
        <VisualActionCard
          title="Información que más convence a un inversor"
          description="Mientras cargás el proyecto, mantené estos puntos completos y simples."
          items={['Ubicación y etapa de obra', 'Uso exacto del capital', 'Documentos disponibles', 'Riesgos y salida esperada']}
        />
      )}

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
              className="card-interactive overflow-hidden p-0"
            >
              <div className="relative h-44 bg-surface-200">
                {project.image_url ? (
                  <Image src={project.image_url} alt={project.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Building2 className="h-9 w-9 text-surface-500" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-100 via-transparent to-black/20" />
              </div>
              <div className="p-6">
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
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
