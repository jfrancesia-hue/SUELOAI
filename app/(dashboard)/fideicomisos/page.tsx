'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Landmark,
  LockKeyhole,
  MessageCircle,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Badge, Button, Input, ProgressBar, Select, Textarea } from '@/components/ui';
import { cn, formatCurrency } from '@/utils/helpers';
import {
  demoTrusts,
  trustCountries,
  trustSecurityTools,
  trustStages,
  type DemoTrust,
  type TrustCountry,
} from '@/lib/demo-trusts';

type AdvisorMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const countryOptions = Object.entries(trustCountries).map(([value, item]) => ({
  value,
  label: item.label,
}));

const quickPrompts = [
  'Que estructura conviene para este pais?',
  'Que documentos faltan antes de publicar?',
  'Como protegemos al inversor?',
  'Cual es el proximo paso operativo?',
];

const statusTone: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  draft: 'default',
  compliance: 'warning',
  legal_review: 'info',
  fiduciary_assigned: 'success',
  signature: 'warning',
  active: 'success',
};

export default function TrustsPage() {
  const [country, setCountry] = useState<TrustCountry>('paraguay');
  const [selectedTrustId, setSelectedTrustId] = useState(demoTrusts[0].id);
  const [advisorInput, setAdvisorInput] = useState('');
  const [form, setForm] = useState({
    name: 'Fideicomiso Nuevo Proyecto LATAM',
    asset: 'Terreno y derechos economicos del proyecto',
    fiduciary: 'Fiduciaria autorizada pendiente',
    targetAmount: '750000',
    purpose: 'Administrar aportes, documentos y desembolsos por hitos.',
  });
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      role: 'assistant',
      content:
        'Soy el asesor fiduciario IA de Suelo. Te ayudo a elegir estructura, armar checklist, detectar riesgos y preparar el expediente para revision legal.',
    },
  ]);

  const countryInfo = trustCountries[country];
  const trustsByCountry = demoTrusts.filter((trust) => trust.country === country);
  const selectedTrust = demoTrusts.find((trust) => trust.id === selectedTrustId) || trustsByCountry[0] || demoTrusts[0];
  const selectedStageIndex = Math.max(0, trustStages.findIndex((stage) => stage.key === selectedTrust.status));

  const completion = useMemo(() => {
    const required = selectedTrust.checklist.filter((item) => item.required).length;
    const simulatedDone = Math.max(2, Math.min(required, selectedStageIndex + 3));
    return Math.round((simulatedDone / required) * 100);
  }, [selectedStageIndex, selectedTrust]);

  function sendAdvisorMessage(text = advisorInput) {
    const content = text.trim();
    if (!content) return;

    const reply = buildAdvisorReply(content, country, selectedTrust);
    setMessages((prev) => [...prev, { role: 'user', content }, { role: 'assistant', content: reply }]);
    setAdvisorInput('');
  }

  function handleWizardSubmit(event: FormEvent) {
    event.preventDefault();
    const reply = [
      `Estructura demo creada: ${form.name}.`,
      `Pais: ${countryInfo.label}. Vehiculo sugerido: ${countryInfo.bestVehicle}.`,
      `Siguiente paso: validar fiduciario, subir data room minimo y pedir memo legal local antes de ofrecer la oportunidad.`,
    ].join(' ');
    setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#07111F] p-6 text-white shadow-[0_28px_95px_-52px_rgba(16,185,129,0.5)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_82%_26%,rgba(6,182,212,0.15),transparent_34%),linear-gradient(135deg,#07111F,#111827_62%,#07111F)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/72 backdrop-blur-xl">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Trust desk multi-pais
            </div>
            <h1 className="font-display text-4xl font-bold tracking-[-0.035em] md:text-6xl">
              Fideicomisos con asesor IA para proteger cada inversion.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/64 md:text-lg">
              Crea expedientes fiduciarios para Paraguay, Bolivia y Argentina, arma data rooms, controla compliance y guia al cliente con un asesor virtual durante todo el proceso.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.16em] text-white/42">Cobertura demo</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Object.entries(trustCountries).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCountry(key as TrustCountry);
                    const first = demoTrusts.find((trust) => trust.country === key);
                    if (first) setSelectedTrustId(first.id);
                  }}
                  className={cn(
                    'rounded-2xl border px-3 py-3 text-left transition-all',
                    country === key
                      ? 'border-emerald-300/30 bg-emerald-300/12 text-emerald-100'
                      : 'border-white/10 bg-white/[0.045] text-white/62 hover:bg-white/[0.075]'
                  )}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-[10px] opacity-70">Checklist</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.68fr_0.32fr]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard icon={Landmark} label="Vehiculos demo" value={String(demoTrusts.length)} detail="por pais y proyecto" />
            <MetricCard icon={Users} label="Inversores protegidos" value="172" detail="en expedientes demo" />
            <MetricCard icon={FileCheck2} label="Data rooms" value="18" detail="documentos/versiones" />
          </div>

          <div className="rounded-[26px] border border-surface-200 bg-surface-100 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400">Jurisdiccion activa</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-surface-900">{countryInfo.label}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-500">{countryInfo.fiduciaryRule}</p>
              </div>
              <Badge variant="info">{countryInfo.regulator}</Badge>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <InfoBox icon={Scale} title="Vehiculo recomendado" text={countryInfo.bestVehicle} />
              <InfoBox icon={AlertTriangle} title="Cuidado regulatorio" text={countryInfo.caution} warning />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[26px] border border-surface-200 bg-surface-100 p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-surface-900">Expedientes demo</h2>
                  <p className="mt-1 text-sm text-surface-500">Selecciona uno para ver etapa, checklist y riesgos.</p>
                </div>
              </div>

              <div className="space-y-3">
                {trustsByCountry.map((trust) => (
                  <button
                    key={trust.id}
                    onClick={() => setSelectedTrustId(trust.id)}
                    className={cn(
                      'w-full rounded-2xl border p-4 text-left transition-all',
                      selectedTrust.id === trust.id
                        ? 'border-brand-500/35 bg-brand-500/10'
                        : 'border-surface-200 bg-surface-50 hover:border-brand-500/20'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-surface-900">{trust.name}</p>
                        <p className="mt-1 text-xs text-surface-500">{trust.project}</p>
                      </div>
                      <Badge variant={statusTone[trust.status] || 'default'}>{stageLabel(trust.status)}</Badge>
                    </div>
                    <div className="mt-4">
                      <ProgressBar value={trust.fundedAmount} max={trust.targetAmount} size="sm" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-surface-200 bg-surface-100 p-5 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-surface-900">{selectedTrust.name}</h2>
                  <p className="mt-1 text-sm text-surface-500">{selectedTrust.purpose}</p>
                </div>
                <Badge variant={selectedTrust.riskLevel === 'Bajo' ? 'success' : selectedTrust.riskLevel === 'Medio' ? 'warning' : 'danger'}>
                  Riesgo {selectedTrust.riskLevel}
                </Badge>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniMetric label="Objetivo" value={formatCurrency(selectedTrust.targetAmount)} />
                <MiniMetric label="Fondeado" value={formatCurrency(selectedTrust.fundedAmount)} highlight />
                <MiniMetric label="Inversores" value={String(selectedTrust.investors)} />
                <MiniMetric label="Fiduciario" value={selectedTrust.fiduciary} />
              </div>

              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-surface-500">Pipeline</p>
                <div className="grid gap-2">
                  {trustStages.map((stage, index) => {
                    const done = index <= selectedStageIndex;
                    return (
                      <div key={stage.key} className="grid grid-cols-[26px_1fr] gap-3">
                        <div className={cn('mt-1 flex h-6 w-6 items-center justify-center rounded-full border', done ? 'border-brand-500 bg-brand-500 text-white' : 'border-surface-300 bg-surface-150 text-surface-500')}>
                          {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-surface-900">{stage.label}</p>
                          <p className="text-xs text-surface-500">{stage.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4">
                <p className="text-sm font-semibold text-surface-900">Siguiente paso</p>
                <p className="mt-1 text-sm leading-relaxed text-surface-600">{selectedTrust.nextStep}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={handleWizardSubmit} className="rounded-[26px] border border-surface-200 bg-surface-100 p-5 md:p-6">
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold text-surface-900">Crear estructura demo</h2>
                <p className="mt-1 text-sm text-surface-500">No constituye legalmente el fideicomiso; prepara el expediente para revision profesional.</p>
              </div>

              <div className="space-y-4">
                <Select
                  id="country"
                  label="Pais"
                  value={country}
                  options={countryOptions}
                  onChange={(event) => setCountry(event.target.value as TrustCountry)}
                />
                <Input id="name" label="Nombre del fideicomiso" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                <Input id="asset" label="Activo / patrimonio" value={form.asset} onChange={(event) => setForm({ ...form, asset: event.target.value })} />
                <Input id="fiduciary" label="Fiduciario" value={form.fiduciary} onChange={(event) => setForm({ ...form, fiduciary: event.target.value })} />
                <Input id="targetAmount" label="Monto objetivo" type="number" value={form.targetAmount} onChange={(event) => setForm({ ...form, targetAmount: event.target.value })} />
                <Textarea id="purpose" label="Finalidad" value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} />
                <Button type="submit" icon={Sparkles} className="w-full">
                  Generar expediente demo
                </Button>
              </div>
            </form>

            <div className="rounded-[26px] border border-surface-200 bg-surface-100 p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-surface-900">Checklist del expediente</h2>
                  <p className="mt-1 text-sm text-surface-500">{completion}% de requisitos demo cubiertos.</p>
                </div>
                <ClipboardCheck className="h-5 w-5 text-brand-500" />
              </div>
              <ProgressBar value={completion} max={100} />
              <div className="mt-5 space-y-3">
                {selectedTrust.checklist.map((item, index) => {
                  const done = index < Math.max(2, selectedStageIndex + 3);
                  return (
                    <div key={item.id} className="flex gap-3 rounded-2xl border border-surface-200 bg-surface-50 p-4">
                      <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', done ? 'bg-brand-500/15 text-brand-500' : 'bg-surface-200 text-surface-500')}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{item.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-surface-500">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-surface-200 bg-surface-100 p-5 md:p-6">
            <div className="mb-5">
              <h2 className="font-display text-xl font-bold text-surface-900">Herramientas de seguridad para el cliente</h2>
              <p className="mt-1 text-sm text-surface-500">Capas de confianza que deberia ver cualquier inversor antes de poner capital.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {trustSecurityTools.map((tool) => (
                <div key={tool.title} className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
                  <LockKeyhole className="mb-3 h-4 w-4 text-brand-500" />
                  <p className="text-sm font-semibold text-surface-900">{tool.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-surface-500">{tool.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#07111F] text-white shadow-[0_24px_90px_-52px_rgba(0,0,0,1)]">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10">
                  <Bot className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold">Asesor fiduciario IA</h2>
                  <p className="text-xs text-white/45">Contexto: {countryInfo.label} / {selectedTrust.project}</p>
                </div>
              </div>
            </div>

            <div className="max-h-[560px] space-y-3 overflow-y-auto p-5">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      message.role === 'user'
                        ? 'rounded-br-md bg-emerald-300 text-[#03130D]'
                        : 'rounded-bl-md border border-white/10 bg-white/[0.065] text-white/72'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendAdvisorMessage(prompt)}
                    className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-left text-[11px] font-semibold text-white/66 transition-colors hover:bg-white/[0.09]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendAdvisorMessage();
                }}
                className="flex gap-2"
              >
                <input
                  value={advisorInput}
                  onChange={(event) => setAdvisorInput(event.target.value)}
                  placeholder="Preguntale al asesor..."
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none placeholder:text-white/34 focus:border-emerald-300/35"
                />
                <button
                  type="submit"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-300 text-[#03130D] transition-colors hover:bg-emerald-200"
                  aria-label="Enviar consulta"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-3 text-center text-[10px] leading-relaxed text-white/34">
                Demo informativa. La constitucion real requiere revision legal/fiduciaria local.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function buildAdvisorReply(input: string, country: TrustCountry, trust: DemoTrust) {
  const text = input.toLowerCase();
  const info = trustCountries[country];

  if (text.includes('estructura') || text.includes('conviene') || text.includes('pais')) {
    return `${info.label}: usaria como base ${info.bestVehicle}. La regla operativa es: ${info.fiduciaryRule} Antes de publicar, dejaria claro si es colocacion privada, oferta publica o expediente interno.`;
  }

  if (text.includes('document') || text.includes('faltan') || text.includes('publicar')) {
    const missing = trust.checklist.slice(0, 4).map((item) => item.label).join(', ');
    return `Para publicar ${trust.project}, no avanzaria sin estos bloques: ${missing}. Ademas, pediria memo legal local, contrato final del fiduciario y matriz de beneficiarios finales.`;
  }

  if (text.includes('prote') || text.includes('seguridad') || text.includes('inversor')) {
    return 'Para seguridad del inversor pondria 6 capas visibles: fiduciario validado, cuenta separada/escrow, desembolsos por hitos, data room con hashes, KYC/KYB y alertas de cambios materiales.';
  }

  if (text.includes('proximo') || text.includes('paso')) {
    return `Proximo paso recomendado: ${trust.nextStep} Luego generaria version 0.1 del contrato, checklist de compliance y pagina publica de verificacion documental.`;
  }

  return `Para ${trust.name}, mi recomendacion es no vender la oportunidad hasta cerrar fiduciario, data room minimo, reglas economicas y validacion regulatoria en ${info.label}. Puedo ayudarte a convertir eso en checklist operativo.`;
}

function stageLabel(status: string) {
  return trustStages.find((stage) => stage.key === status)?.label || status;
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: any; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-surface-100 p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10">
        <Icon className="h-4 w-4 text-brand-500" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-surface-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-surface-900">{value}</p>
      <p className="mt-1 text-xs text-surface-500">{detail}</p>
    </div>
  );
}

function InfoBox({ icon: Icon, title, text, warning = false }: { icon: any; title: string; text: string; warning?: boolean }) {
  return (
    <div className={cn('rounded-2xl border p-4', warning ? 'border-amber-500/20 bg-amber-500/10' : 'border-brand-500/20 bg-brand-500/10')}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn('h-4 w-4', warning ? 'text-amber-500' : 'text-brand-500')} />
        <p className="text-sm font-semibold text-surface-900">{title}</p>
      </div>
      <p className="text-sm leading-relaxed text-surface-600">{text}</p>
    </div>
  );
}

function MiniMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-surface-500">{label}</p>
      <p className={cn('mt-2 text-sm font-semibold leading-tight', highlight ? 'text-brand-500' : 'text-surface-900')}>{value}</p>
    </div>
  );
}
