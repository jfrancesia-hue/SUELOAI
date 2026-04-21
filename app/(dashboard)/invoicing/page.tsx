'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText, Trash2, Send, DollarSign, Calendar } from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  EmptyState,
  LoadingSpinner,
  StatCard,
} from '@/components/ui';

interface Invoice {
  id: string;
  invoice_type: 'A' | 'B' | 'C' | 'FE';
  invoice_number: string;
  point_of_sale: number;
  recipient_name: string;
  recipient_tax_id: string | null;
  recipient_condition: string;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'cancelled' | 'failed';
  cae: string | null;
  cae_expiry: string | null;
  notes: string | null;
}

const STATUS_VARIANT: Record<Invoice['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> =
  {
    draft: 'default',
    issued: 'info',
    paid: 'success',
    cancelled: 'default',
    failed: 'danger',
  };

export default function InvoicingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({ count: 0, total: 0, tax: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [form, setForm] = useState({
    invoice_type: 'C',
    recipient_name: '',
    recipient_tax_id: '',
    recipient_condition: 'consumidor_final',
    subtotal: '',
    tax_amount: '',
    total: '',
    currency: 'ARS',
    notes: '',
  });

  const fetchInvoices = async () => {
    setLoading(true);
    const url = filter === 'all' ? '/api/invoicing' : `/api/invoicing?status=${filter}`;
    const res = await fetch(url);
    const data = await res.json();
    setInvoices(data.data || []);
    setStats(data.stats || { count: 0, total: 0, tax: 0 });
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = Number(form.subtotal);
    const taxAmount = Number(form.tax_amount || 0);
    const total = Number(form.total || subtotal + taxAmount);

    const res = await fetch('/api/invoicing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        subtotal,
        tax_amount: taxAmount,
        total,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({
        invoice_type: 'C',
        recipient_name: '',
        recipient_tax_id: '',
        recipient_condition: 'consumidor_final',
        subtotal: '',
        tax_amount: '',
        total: '',
        currency: 'ARS',
        notes: '',
      });
      fetchInvoices();
    }
  };

  const handleIssue = async (id: string) => {
    if (!confirm('¿Emitir factura (llama a AFIP)? No se puede revertir.')) return;
    const res = await fetch('/api/invoicing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'issue' }),
    });
    const body = await res.json();
    if (res.ok) {
      alert(`Emitida. CAE: ${body.afip?.cae || '(stub)'}`);
      fetchInvoices();
    } else {
      alert(`Error: ${body.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar/cancelar factura?')) return;
    await fetch(`/api/invoicing?id=${id}`, { method: 'DELETE' });
    fetchInvoices();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900">Facturación</h1>
          <p className="text-surface-600 mt-1">
            Emitir facturas electrónicas AFIP (Argentina) y SIFEN (Paraguay)
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm((v) => !v)}>
          Nueva factura
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Facturas" value={String(stats.count)} icon={FileText} />
        <StatCard title="Total facturado" value={`$${stats.total.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="IVA del período" value={`$${stats.tax.toLocaleString()}`} icon={DollarSign} />
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'draft', 'issued', 'paid', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === s
                ? 'bg-brand-500 text-white'
                : 'bg-surface-200 text-surface-700 hover:bg-surface-300'
            }`}
          >
            {s === 'all'
              ? 'Todas'
              : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-display font-semibold text-lg">Nueva factura</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo"
              value={form.invoice_type}
              onChange={(e) => setForm({ ...form, invoice_type: e.target.value })}
              options={[
                { value: 'A', label: 'A (responsable a responsable)' },
                { value: 'B', label: 'B (responsable a consumidor final)' },
                { value: 'C', label: 'C (monotributo)' },
                { value: 'FE', label: 'FE (SIFEN Paraguay)' },
              ]}
            />
            <Select
              label="Condición receptor"
              value={form.recipient_condition}
              onChange={(e) => setForm({ ...form, recipient_condition: e.target.value })}
              options={[
                { value: 'consumidor_final', label: 'Consumidor final' },
                { value: 'responsable_inscripto', label: 'Responsable inscripto' },
                { value: 'monotributo', label: 'Monotributo' },
                { value: 'exento', label: 'Exento' },
              ]}
            />
            <Input
              label="Nombre receptor *"
              value={form.recipient_name}
              onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
              required
            />
            <Input
              label="CUIT/RUC receptor"
              value={form.recipient_tax_id}
              onChange={(e) => setForm({ ...form, recipient_tax_id: e.target.value })}
            />
            <Input
              label="Subtotal *"
              type="number"
              step="0.01"
              value={form.subtotal}
              onChange={(e) => setForm({ ...form, subtotal: e.target.value })}
              required
            />
            <Input
              label="IVA"
              type="number"
              step="0.01"
              value={form.tax_amount}
              onChange={(e) => setForm({ ...form, tax_amount: e.target.value })}
            />
            <Input
              label="Total"
              type="number"
              step="0.01"
              value={form.total}
              onChange={(e) => setForm({ ...form, total: e.target.value })}
              hint="Auto-calculado si queda vacío"
            />
            <Select
              label="Moneda"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              options={[
                { value: 'ARS', label: 'ARS' },
                { value: 'USD', label: 'USD' },
                { value: 'PYG', label: 'PYG' },
              ]}
            />
          </div>
          <Textarea
            label="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-3">
            <Button type="submit">Guardar borrador</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sin facturas todavía"
          description="Creá tu primera factura (queda en draft hasta que la emitas a AFIP/SIFEN)."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-surface-600 border-b border-surface-200">
              <tr>
                <th className="py-2 px-3">Número</th>
                <th className="py-2 px-3">Tipo</th>
                <th className="py-2 px-3">Receptor</th>
                <th className="py-2 px-3">Fecha</th>
                <th className="py-2 px-3">Total</th>
                <th className="py-2 px-3">Estado</th>
                <th className="py-2 px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-surface-100">
                  <td className="py-3 px-3 font-mono text-xs">{inv.invoice_number}</td>
                  <td className="py-3 px-3">
                    <Badge variant="info">{inv.invoice_type}</Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-medium">{inv.recipient_name}</p>
                      {inv.recipient_tax_id && (
                        <p className="text-xs text-surface-500">{inv.recipient_tax_id}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-surface-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {inv.issue_date}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium">
                    {inv.currency} {Number(inv.total).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={STATUS_VARIANT[inv.status]}>{inv.status}</Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      {inv.status === 'draft' && (
                        <button
                          onClick={() => handleIssue(inv.id)}
                          className="p-1.5 rounded hover:bg-brand-500/10 text-brand-500"
                          title="Emitir"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-400"
                        title="Cancelar/eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
