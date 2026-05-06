'use client';

import { useEffect, useState } from 'react';
import { Plus, Target, DollarSign, Trash2 } from 'lucide-react';
import { Button, Input, Textarea, Select, Badge, EmptyState, LoadingSpinner } from '@/components/ui';

interface Lead {
  id: string;
  title: string;
  source: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  budget_usd: number | null;
  notes: string | null;
  created_at: string;
  contact?: { id: string; full_name: string; email: string | null; company: string | null } | null;
}

const STATUS_VARIANT: Record<Lead['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  new: 'info',
  contacted: 'warning',
  qualified: 'success',
  unqualified: 'danger',
  converted: 'success',
};

const STATUS_LABEL: Record<Lead['status'], string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Calificado',
  unqualified: 'No calificado',
  converted: 'Convertido',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [form, setForm] = useState({
    title: '',
    source: '',
    budget_usd: '',
    status: 'new',
    notes: '',
  });

  const fetchLeads = async (status = filter) => {
    setLoading(true);
    const url = status === 'all' ? '/api/crm/leads' : `/api/crm/leads?status=${status}`;
    const res = await fetch(url);
    const data = await res.json();
    setLeads(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads(filter);
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...form,
      budget_usd: form.budget_usd ? Number(form.budget_usd) : null,
    };
    const res = await fetch('/api/crm/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ title: '', source: '', budget_usd: '', status: 'new', notes: '' });
      fetchLeads();
    }
  };

  const handleChangeStatus = async (id: string, status: string) => {
    await fetch('/api/crm/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchLeads();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar lead?')) return;
    await fetch(`/api/crm/leads?id=${id}`, { method: 'DELETE' });
    fetchLeads();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900">Leads</h1>
          <p className="text-surface-600 mt-1">Oportunidades antes de entrar al pipeline</p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm((v) => !v)}>
          Nuevo lead
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'new', 'contacted', 'qualified', 'unqualified', 'converted'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === s
                ? 'bg-brand-500 text-white'
                : 'bg-surface-200 text-surface-700 hover:bg-surface-300'
            }`}
          >
            {s === 'all' ? 'Todos' : STATUS_LABEL[s as Lead['status']]}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-display font-semibold text-lg text-surface-900">Agregar lead</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Título *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Inversor interesado en Asunción"
              required
            />
            <Input
              label="Fuente"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="Web, WhatsApp, referido..."
            />
            <Input
              label="Presupuesto USD"
              type="number"
              value={form.budget_usd}
              onChange={(e) => setForm({ ...form, budget_usd: e.target.value })}
            />
            <Select
              label="Estado"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
            />
          </div>
          <Textarea
            label="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-3">
            <Button type="submit">Guardar</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Sin leads todavía"
          description="Los leads son oportunidades que todavía no califican como deals en tu pipeline."
        />
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="card flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-semibold text-surface-900">{lead.title}</h3>
                  <Badge variant={STATUS_VARIANT[lead.status]}>{STATUS_LABEL[lead.status]}</Badge>
                </div>
                {lead.contact && (
                  <p className="text-sm text-surface-600">
                    👤 {lead.contact.full_name}
                    {lead.contact.company && ` · ${lead.contact.company}`}
                  </p>
                )}
                <div className="flex gap-4 text-sm text-surface-600">
                  {lead.budget_usd && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      USD {Number(lead.budget_usd).toLocaleString()}
                    </span>
                  )}
                  {lead.source && <span>📍 {lead.source}</span>}
                </div>
                {lead.notes && <p className="text-sm text-surface-500 mt-1">{lead.notes}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <select
                  value={lead.status}
                  onChange={(e) => handleChangeStatus(lead.id, e.target.value)}
                  className="text-xs px-2 py-1 rounded bg-surface-200"
                >
                  {Object.entries(STATUS_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(lead.id)}
                  className="p-1.5 rounded hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
