'use client';

import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Send, Trash2 } from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  EmptyState,
  LoadingSpinner,
} from '@/components/ui';

interface Campaign {
  id: string;
  name: string;
  channel: 'whatsapp' | 'email' | 'sms';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  message_template: string;
  recipients_filter: any;
  stats: { sent?: number; failed?: number; delivered?: number };
  created_at: string;
  sent_at: string | null;
}

const STATUS_VARIANT: Record<Campaign['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> =
  {
    draft: 'default',
    scheduled: 'info',
    sending: 'warning',
    sent: 'success',
    failed: 'danger',
    cancelled: 'default',
  };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    channel: 'whatsapp',
    message_template:
      '¡Hola {{first_name}}! Te saluda el equipo de Suelo. Tenemos un nuevo proyecto que podría interesarte. ¿Podemos contarte más?',
    tags: '',
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    const res = await fetch('/api/crm/campaigns');
    const data = await res.json();
    setCampaigns(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = form.tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch('/api/crm/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        channel: form.channel,
        message_template: form.message_template,
        recipients_filter: tags.length > 0 ? { tags } : {},
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ ...form, name: '', tags: '' });
      fetchCampaigns();
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm('¿Enviar campaña ahora a los destinatarios matcheados?')) return;
    const res = await fetch('/api/crm/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'send_now' }),
    });
    const body = await res.json();
    if (res.ok) {
      alert(`Campaña enviada. ${body.sent || 0} enviados, ${body.failed || 0} fallaron.`);
      fetchCampaigns();
    } else {
      alert(`Error: ${body.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar campaña?')) return;
    await fetch(`/api/crm/campaigns?id=${id}`, { method: 'DELETE' });
    fetchCampaigns();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900">Campañas</h1>
          <p className="text-surface-600 mt-1">
            Envíos masivos por WhatsApp con templates dinámicos
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm((v) => !v)}>
          Nueva campaña
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-display font-semibold text-lg">Nueva campaña</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ej: Lanzamiento Residencial Asunción"
            />
            <Select
              label="Canal"
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
              options={[
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'email', label: 'Email (próximamente)' },
                { value: 'sms', label: 'SMS (próximamente)' },
              ]}
            />
          </div>
          <Input
            label="Tags destinatarios (separados por coma — vacío = todos los contactos con teléfono)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="inversor, vip"
          />
          <Textarea
            label="Mensaje (usá {{first_name}}, {{full_name}}, {{company}})"
            value={form.message_template}
            onChange={(e) => setForm({ ...form, message_template: e.target.value })}
            required
          />
          <div className="flex gap-3">
            <Button type="submit">Crear borrador</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Sin campañas todavía"
          description="Creá tu primera campaña y enviala por WhatsApp a tus contactos."
        />
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold">{c.name}</h3>
                    <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                    <Badge variant="info">{c.channel}</Badge>
                  </div>
                  <p className="text-sm text-surface-500 mt-1">
                    {c.recipients_filter?.tags?.length
                      ? `Tags: ${c.recipients_filter.tags.join(', ')}`
                      : 'Todos los contactos con teléfono'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {c.status === 'draft' && (
                    <Button size="sm" icon={Send} onClick={() => handleSend(c.id)}>
                      Enviar
                    </Button>
                  )}
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 rounded hover:bg-red-500/10 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-surface-700 bg-surface-100 rounded-lg p-3 whitespace-pre-wrap">
                {c.message_template}
              </div>
              {c.stats && (c.stats.sent || c.stats.failed) ? (
                <div className="flex gap-4 text-xs text-surface-600">
                  <span>✅ {c.stats.sent || 0} enviados</span>
                  <span>❌ {c.stats.failed || 0} fallaron</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
