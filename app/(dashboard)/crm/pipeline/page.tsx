'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Plus, DollarSign } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '@/components/ui';

interface Stage {
  id: string;
  name: string;
  order_index: number;
  color: string;
  is_win_stage: boolean;
  is_lost_stage: boolean;
}

interface Deal {
  id: string;
  title: string;
  value_usd: number;
  probability: number;
  stage_id: string;
  expected_close_date: string | null;
  contact?: { full_name: string; company: string | null } | null;
}

function DealCard({ deal, dragging }: { deal: Deal; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
  });
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging || dragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 rounded-lg bg-surface-0 border border-surface-200 hover:border-brand-500/50 cursor-grab active:cursor-grabbing space-y-2 shadow-sm"
    >
      <h4 className="font-medium text-surface-900 text-sm leading-tight">{deal.title}</h4>
      {deal.contact && (
        <p className="text-xs text-surface-600">
          {deal.contact.full_name}
          {deal.contact.company && ` · ${deal.contact.company}`}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-brand-500 flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          {Number(deal.value_usd).toLocaleString()}
        </span>
        <span className="text-xs text-surface-500">{deal.probability}%</span>
      </div>
    </div>
  );
}

function StageColumn({
  stage,
  deals,
  onAddDeal,
}: {
  stage: Stage;
  deals: Deal[];
  onAddDeal: (stageId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = deals.reduce((s, d) => s + Number(d.value_usd || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-surface-100 rounded-xl p-3 space-y-3 transition ${
        isOver ? 'ring-2 ring-brand-500/50' : ''
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: stage.color }}
          />
          <h3 className="font-display font-semibold text-sm text-surface-900">{stage.name}</h3>
          <span className="text-xs text-surface-500">({deals.length})</span>
        </div>
        <button
          onClick={() => onAddDeal(stage.id)}
          className="p-1 rounded hover:bg-surface-200"
          title="Agregar deal"
        >
          <Plus className="w-3.5 h-3.5 text-surface-600" />
        </button>
      </div>
      <p className="text-xs text-surface-500 px-1">USD {total.toLocaleString()}</p>
      <div className="space-y-2 min-h-[60px]">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', value_usd: '' });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/crm/deals');
    const data = await res.json();
    setStages(data.stages || []);
    setDeals(data.deals || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;
    const dealId = e.active.id as string;
    const newStageId = e.over.id as string;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage_id === newStageId) return;

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage_id: newStageId } : d))
    );

    await fetch('/api/crm/deals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: dealId, stage_id: newStageId }),
    });
  };

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showForm) return;
    await fetch('/api/crm/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        value_usd: form.value_usd ? Number(form.value_usd) : 0,
        stage_id: showForm,
      }),
    });
    setShowForm(null);
    setForm({ title: '', value_usd: '' });
    fetchData();
  };

  const activeDeal = deals.find((d) => d.id === activeId);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-surface-900">Pipeline</h1>
        <p className="text-surface-600 mt-1">Arrastrá deals entre etapas para actualizar su estado</p>
      </div>

      {showForm && (
        <form onSubmit={handleAddDeal} className="card space-y-3">
          <h3 className="font-display font-semibold text-surface-900">Nuevo deal</h3>
          <Input
            label="Título *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="Ej: Venta 50 tokens Residencial Asunción"
          />
          <Input
            label="Valor USD"
            type="number"
            value={form.value_usd}
            onChange={(e) => setForm({ ...form, value_usd: e.target.value })}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm">Crear</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                deals={deals.filter((d) => d.stage_id === stage.id)}
                onAddDeal={(sid) => setShowForm(sid)}
              />
            ))}
          </div>
          <DragOverlay>{activeDeal ? <DealCard deal={activeDeal} /> : null}</DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
