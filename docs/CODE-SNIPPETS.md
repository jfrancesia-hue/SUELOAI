# 📋 Suelo v2 — Code Snippets Library

Snippets listos para copiar en Claude Code. Cada uno contiene código production-ready.

---

## 🎨 SNIPPET 1: Hero rediseñado con imagen real

**File:** `components/landing/Hero.tsx`

```tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, Building2, Lock, CheckCircle2 } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background image layer */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=2400&q=90&auto=format&fit=crop"
          alt="Modern architecture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/60 to-brand-950/80" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
      </div>

      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8 backdrop-blur-sm"
          >
            <Lock className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-medium text-brand-400 tracking-wide uppercase">
              Verificación Criptográfica SHA-256
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]"
          >
            <span className="text-white">Invertí en</span><br />
            <span className="gradient-text">activos reales</span><br />
            <span className="text-white">con total transparencia</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Participaciones fraccionadas en proyectos inmobiliarios de primer nivel.
            Sin intermediarios, con contratos verificables públicamente.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-all shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 w-full sm:w-auto"
            >
              Empezar a Invertir
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all backdrop-blur-sm border border-white/20 w-full sm:w-auto"
            >
              Ver Proyectos
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-16"
          >
            {[
              { icon: Building2, label: 'Proyectos activos', value: '12+' },
              { icon: TrendingUp, label: 'Retorno promedio', value: '14.5%' },
              { icon: Shield, label: 'Contratos verificados', value: '500+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-display font-bold text-white">{value}</p>
                  <p className="text-xs text-white/60">{label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

---

## 🎨 SNIPPET 2: ProjectCard rediseñada

**File:** `components/marketplace/ProjectCard.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { formatCurrency, getProgressPercent } from '@/utils/helpers';
import { Badge } from '@/components/ui';
import type { Project, ProjectScore } from '@/types';

interface Props {
  project: Project & { score?: ProjectScore };
  index?: number;
}

const defaultImages = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
];

export function ProjectCard({ project, index = 0 }: Props) {
  const progress = getProgressPercent(project.sold_tokens, project.total_tokens);
  const raised = project.sold_tokens * project.token_price;
  const available = project.total_tokens - project.sold_tokens;
  const imageUrl = project.hero_image_url || defaultImages[index % defaultImages.length];
  const score = project.score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="group block bg-surface-100 border border-white/[0.06] rounded-2xl overflow-hidden hover:border-brand-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1"
      >
        {/* Hero image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {score && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                <Sparkles className="w-3 h-3 text-brand-400" />
                <span className="text-xs font-bold text-white">
                  Score {score.rating.replace('_plus', '+')}
                </span>
              </div>
            )}
            {project.featured && (
              <Badge variant="success" className="ml-auto backdrop-blur-sm border border-brand-500/30">
                Destacado
              </Badge>
            )}
          </div>

          {/* Bottom title */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-display font-bold text-lg leading-tight">
              {project.title}
            </h3>
            <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {project.location}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-white/[0.06]">
            <div>
              <p className="text-[10px] text-surface-500 uppercase tracking-wider font-medium">Token</p>
              <p className="text-sm font-bold text-surface-900 mt-0.5">
                {formatCurrency(project.token_price)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-surface-500 uppercase tracking-wider font-medium">Retorno</p>
              <p className="text-sm font-bold text-brand-500 mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {project.expected_return}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-surface-500 uppercase tracking-wider font-medium">Disponible</p>
              <p className="text-sm font-bold text-surface-900 mt-0.5">
                {available}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="pt-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-surface-600">{progress}% financiado</span>
              <span className="text-surface-500 font-mono">
                {formatCurrency(raised)} / {formatCurrency(project.total_value)}
              </span>
            </div>
            <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-surface-500">
              {available > 0 ? `${available} tokens disponibles` : 'Agotado'}
            </span>
            <span className="text-xs font-medium text-brand-500 flex items-center gap-1 group-hover:gap-2 transition-all">
              Ver detalle
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
```

---

## 🎨 SNIPPET 3: ScoreBadge con ramp de colores

**File:** `components/scoring/ScoreBadge.tsx`

```tsx
'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/helpers';
import type { ScoringRating } from '@/types';

interface Props {
  rating: ScoringRating;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const ratingConfig = {
  A_plus: { label: 'A+', gradient: 'from-emerald-400 to-emerald-600', text: 'text-white' },
  A: { label: 'A', gradient: 'from-brand-400 to-brand-600', text: 'text-white' },
  B: { label: 'B', gradient: 'from-amber-400 to-amber-600', text: 'text-white' },
  C: { label: 'C', gradient: 'from-orange-400 to-orange-600', text: 'text-white' },
  D: { label: 'D', gradient: 'from-red-400 to-red-600', text: 'text-white' },
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function ScoreBadge({ rating, size = 'md', showIcon = true, className }: Props) {
  const config = ratingConfig[rating];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold bg-gradient-to-r shadow-lg',
        config.gradient,
        config.text,
        sizes[size],
        className
      )}
    >
      {showIcon && <Sparkles className="w-3 h-3" />}
      <span>{config.label}</span>
    </div>
  );
}
```

---

## 🎨 SNIPPET 4: ScoreDetail con Radar Chart

**File:** `components/scoring/ScoreDetail.tsx`

```tsx
'use client';

import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip
} from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';
import type { ProjectScore } from '@/types';

interface Props {
  score: ProjectScore;
}

export function ScoreDetail({ score }: Props) {
  const data = [
    { dimension: 'Ubicación', value: score.location_score || 0 },
    { dimension: 'Developer', value: score.developer_score || 0 },
    { dimension: 'Financiero', value: score.financial_score || 0 },
    { dimension: 'Documentación', value: score.documentation_score || 0 },
    { dimension: 'Mercado', value: score.market_score || 0 },
  ];

  const risks = (score.risk_factors as string[]) || [];
  const opportunities = (score.opportunities as string[]) || [];

  return (
    <div className="card space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ScoreBadge rating={score.rating} size="lg" />
            <div>
              <p className="text-sm text-surface-500">Score Global</p>
              <p className="font-display font-bold text-2xl text-surface-900">
                {score.overall_score}/100
              </p>
            </div>
          </div>
          <p className="text-xs text-surface-500">
            Analizado con IA · {new Date(score.computed_at).toLocaleDateString('es-AR')}
          </p>
        </div>
      </div>

      {/* Radar chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#999', fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#666', fontSize: 10 }} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#00C853"
              fill="#00C853"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: '#111',
                border: '1px solid #333',
                borderRadius: 12,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Analysis */}
      {score.ai_analysis && (
        <div className="p-4 rounded-xl bg-surface-200/50 border border-surface-300">
          <h4 className="text-sm font-semibold text-surface-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            Análisis Ejecutivo
          </h4>
          <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-wrap">
            {score.ai_analysis}
          </p>
        </div>
      )}

      {/* Risks & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {risks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Factores de Riesgo
            </h4>
            <ul className="space-y-1.5">
              {risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-surface-600">
                  <span className="text-red-400 mt-0.5">•</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {opportunities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-500" />
              Oportunidades
            </h4>
            <ul className="space-y-1.5">
              {opportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-surface-600">
                  <span className="text-brand-500 mt-0.5">•</span>
                  {opp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🎨 SNIPPET 5: CRM Pipeline Kanban

**File:** `components/crm/PipelineBoard.tsx`

```tsx
'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { LeadCard } from './LeadCard';
import type { Lead, LeadStatus } from '@/types';

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'Nuevo', color: 'bg-surface-300' },
  { id: 'contacted', label: 'Contactado', color: 'bg-blue-500/20' },
  { id: 'qualified', label: 'Calificado', color: 'bg-purple-500/20' },
  { id: 'interested', label: 'Interesado', color: 'bg-amber-500/20' },
  { id: 'invested', label: 'Invirtió', color: 'bg-brand-500/20' },
];

interface Props {
  leads: Lead[];
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
}

export function PipelineBoard({ leads, onUpdateStatus }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeLead = leads.find((l) => l.id === activeId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const newStatus = over.id as LeadStatus;
      onUpdateStatus(active.id.toString(), newStatus);
    }
  };

  return (
    <DndContext
      onDragStart={(e: DragStartEvent) => setActiveId(e.active.id.toString())}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
        {COLUMNS.map((column) => {
          const columnLeads = leads.filter((l) => l.status === column.id);
          const totalValue = columnLeads.reduce(
            (sum, l) => sum + (l.budget_max || 0),
            0
          );

          return (
            <div
              key={column.id}
              id={column.id}
              className="min-w-[240px] bg-surface-100 rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-sm text-surface-900">
                    {column.label}
                  </h3>
                  <span className="text-xs text-surface-500">({columnLeads.length})</span>
                </div>
              </div>

              <div className="space-y-2">
                {columnLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>

              {columnLeads.length === 0 && (
                <p className="text-xs text-surface-500 text-center py-4">Sin leads</p>
              )}
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeLead && <LeadCard lead={activeLead} />}
      </DragOverlay>
    </DndContext>
  );
}
```

---

## 🎨 SNIPPET 6: API route para Scoring IA

**File:** `app/api/scoring/analyze/route.ts`

```typescript
import { createClient } from '@/lib/supabase-server';
import { generateProjectScoring } from '@/lib/openai/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { project_id } = await request.json();

  // Obtener proyecto con developer info
  const { data: project } = await supabase
    .from('projects')
    .select('*, developer:profiles!developer_id(full_name, company_name)')
    .eq('id', project_id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  // Solo el developer del proyecto puede re-analizar
  if (project.developer_id !== user.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    // Generar scoring con IA
    const analysis = await generateProjectScoring({
      title: project.title,
      location: project.location,
      description: project.description,
      total_value: project.total_value,
      expected_return: project.expected_return,
      return_period_months: project.return_period_months,
      developer_name: (project.developer as any)?.company_name || (project.developer as any)?.full_name,
      project_type: project.project_type,
    });

    // Guardar en project_scores
    const { data: score, error } = await supabase
      .from('project_scores')
      .insert({
        project_id,
        rating: analysis.rating,
        overall_score: analysis.overall_score,
        location_score: analysis.location_score,
        developer_score: analysis.developer_score,
        financial_score: analysis.financial_score,
        documentation_score: analysis.documentation_score,
        market_score: analysis.market_score,
        risk_factors: analysis.risk_factors,
        opportunities: analysis.opportunities,
        ai_analysis: analysis.analysis,
        ai_model: 'gpt-4o-mini',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: score });
  } catch (error: any) {
    console.error('Scoring error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 🎨 SNIPPET 7: Asistente Fiscal IA flotante

**File:** `components/invoicing/FiscalAssistant.tsx`

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  '¿Cuánto IVA debo este mes?',
  '¿Qué facturas están pendientes?',
  'Explicame la diferencia entre factura A y B',
  '¿Cuándo vence la próxima DDJJ?',
];

export function FiscalAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente fiscal. Puedo ayudarte con facturación, IVA, AFIP y dudas fiscales en general. ¿En qué te ayudo?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/invoicing/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error al procesar la pregunta' }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-2xl shadow-brand-500/30 z-40"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <Sparkles className="w-3 h-3 text-white absolute top-2 right-2" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-surface-100 border border-surface-200 rounded-2xl shadow-2xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-surface-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900">Asistente Fiscal</p>
                  <p className="text-xs text-surface-500">Powered by GPT-4</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-surface-200 rounded-lg">
                <X className="w-4 h-4 text-surface-500" />
              </button>
            </div>

            {/* Messages */}
            <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-200 text-surface-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Pensando...
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-2.5 py-1 rounded-full bg-surface-200 text-surface-700 hover:bg-surface-300 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-surface-200 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Preguntá lo que necesites..."
                className="flex-1 input-field text-sm py-2"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="p-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## 🎨 SNIPPET 8: Hook useNotifications con Realtime

**File:** `hooks/useNotifications.ts`

```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import type { Notification } from '@/types';

export function useNotifications(userId: string) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Load initial
    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.read).length);
    }
    load();

    // Subscribe to realtime
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((c) => c + 1);

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotif.title, {
              body: newNotif.body || '',
              icon: '/icon-192.png',
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllAsRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
```

---

## 🛠️ Setup inicial comandos

```bash
# Instalar nuevas dependencies
npm install framer-motion openai mercadopago afip.ts resend zod react-hook-form @hookform/resolvers twilio @dnd-kit/core @dnd-kit/sortable

# Aplicar migraciones
# (Ejecutar 002_extensions.sql en SQL Editor de Supabase)

# Variables de entorno
cp .env.local.example .env.local
# Completar con todas las keys

# Dev
npm run dev
```

---

## 📝 Order recomendado para implementar

1. Setup dependencies + env vars + migraciones
2. Rediseño Landing (Hero, Features, How It Works, Footer)
3. Actualizar Sidebar con todos los items
4. Rediseño Marketplace (cards con imágenes)
5. Rediseño Detalle de Proyecto (galería, scoring)
6. Sistema de Scoring IA (API + UI)
7. Notifications con Realtime
8. CRM completo (pipeline kanban es lo más "wow")
9. Facturación + AFIP + Asistente IA
10. Secondary Market
11. KYC integration
12. Referidos
13. Deploy + testing
