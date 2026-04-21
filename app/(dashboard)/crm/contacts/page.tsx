'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Mail, Phone, Building2, Trash2, Users } from 'lucide-react';
import { Button, Input, Textarea, Badge, EmptyState, LoadingSpinner } from '@/components/ui';

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  country: string | null;
  tags: string[] | null;
  source: string | null;
  notes: string | null;
  created_at: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    tags: '',
    notes: '',
  });

  const fetchContacts = async (q?: string) => {
    setLoading(true);
    const url = q ? `/api/crm/contacts?q=${encodeURIComponent(q)}` : '/api/crm/contacts';
    const res = await fetch(url);
    const data = await res.json();
    setContacts(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...form,
      tags: form.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const res = await fetch('/api/crm/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({
        full_name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        tags: '',
        notes: '',
      });
      fetchContacts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar contacto?')) return;
    await fetch(`/api/crm/contacts?id=${id}`, { method: 'DELETE' });
    fetchContacts();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900">Contactos</h1>
          <p className="text-surface-600 mt-1">Gestioná tu base de contactos y prospectos</p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm((v) => !v)}>
          Nuevo contacto
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input
            placeholder="Buscar por nombre, email o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchContacts(search)}
            className="pl-10"
          />
        </div>
        <Button variant="secondary" onClick={() => fetchContacts(search)}>
          Buscar
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-display font-semibold text-lg text-surface-900">
            Agregar contacto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre completo *"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Teléfono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+54 9 11 ..."
            />
            <Input
              label="Empresa"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <Input
              label="Cargo"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
            <Input
              label="Tags (separados por coma)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="inversor, ar, vip"
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
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin contactos todavía"
          description="Creá tu primer contacto para empezar a gestionar tu base de clientes."
          action={
            <Button icon={Plus} onClick={() => setShowForm(true)}>
              Nuevo contacto
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => (
            <div key={c.id} className="card space-y-3 relative group">
              <button
                onClick={() => handleDelete(c.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div>
                <h3 className="font-display font-semibold text-surface-900">{c.full_name}</h3>
                {c.position && c.company && (
                  <p className="text-sm text-surface-600">
                    {c.position} · {c.company}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 text-sm">
                {c.email && (
                  <div className="flex items-center gap-2 text-surface-600">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2 text-surface-600">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.company && !c.position && (
                  <div className="flex items-center gap-2 text-surface-600">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{c.company}</span>
                  </div>
                )}
              </div>
              {c.tags && c.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <Badge key={t} variant="info">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
