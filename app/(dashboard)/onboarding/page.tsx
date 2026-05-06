'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, CheckCircle2, CircleDollarSign, MapPin, ShieldCheck, Target } from 'lucide-react';
import { Button } from '@/components/ui';
import { DashboardHero, MiniBuildingVisual, PhotoStrip } from '@/components/dashboard/visual-shell';
import { createClient } from '@/lib/supabase-browser';
import { isDemoMode } from '@/lib/demo';

const countries = [
  { code: 'PY', label: 'Paraguay', currency: 'PYG / USD / USDT' },
  { code: 'BO', label: 'Bolivia', currency: 'BOB / USD / USDT' },
] as const;
const goals = ['Renta mensual', 'Crecimiento a mediano plazo', 'Diversificar en USD/USDT'] as const;
const riskProfiles = [
  { key: 'conservative', label: 'Conservador', detail: 'Prefiero menor riesgo y proyectos más avanzados.' },
  { key: 'balanced', label: 'Balanceado', detail: 'Busco equilibrio entre retorno y seguridad.' },
  { key: 'growth', label: 'Crecimiento', detail: 'Acepto más plazo si el potencial es mayor.' },
] as const;
const amounts = ['USD 100 - 500', 'USD 500 - 2.000', 'USD 2.000 - 10.000', 'Más de USD 10.000'] as const;

type FormState = {
  country: string;
  goal: string;
  risk: string;
  amount: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const demoMode = isDemoMode();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<FormState>({
    country: 'PY',
    goal: goals[0],
    risk: 'balanced',
    amount: amounts[1],
  });

  const selectedCountry = countries.find((country) => country.code === form.country) || countries[0];
  const summary = useMemo(
    () => [selectedCountry.label, form.goal, riskProfiles.find((item) => item.key === form.risk)?.label, form.amount].filter(Boolean),
    [selectedCountry.label, form]
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      country: form.country,
      goal: form.goal,
      risk_profile: form.risk,
      planned_amount: form.amount,
      completed_at: new Date().toISOString(),
    };
    localStorage.setItem('suelo_onboarding', JSON.stringify(payload));

    const { data: { user } } = demoMode ? { data: { user: null } } : await supabase.auth.getUser();
    if (user && !demoMode) {
      await supabase.from('ai_user_profiles').upsert({
        user_id: user.id,
        risk_profile: form.risk,
        preferred_locations: [form.country],
        investment_goals: [form.goal],
        updated_at: new Date().toISOString(),
      } as any).then(() => null);
      await supabase.from('profiles').update({ country: form.country } as any).eq('id', user.id).then(() => null);
    }

    setDone(true);
    setSaving(false);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15">
          <CheckCircle2 className="h-8 w-8 text-brand-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-surface-900">Tu perfil inicial está listo</h1>
        <p className="mx-auto mt-3 max-w-xl text-surface-500">
          Ya tenemos contexto para que el Analista IA pueda orientarte mejor desde el primer mensaje.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {summary.map((item) => <span key={item} className="rounded-full bg-brand-500/10 px-3 py-1 text-sm font-semibold text-brand-500">{item}</span>)}
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => router.push('/marketplace')} icon={Building2}>Ver proyectos</Button>
          <Button onClick={() => router.push('/assistant')} variant="secondary" icon={ArrowRight}>Hablar con el analista</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <DashboardHero
        eyebrow="Onboarding"
        title="Configuremos tu perfil en 2 minutos"
        description="No es un test financiero. Es una guía inicial para que la plataforma y el agente entiendan país, objetivo, riesgo y monto estimado."
        visual={<MiniBuildingVisual label="Perfil para recomendar mejor" />}
      />

      <PhotoStrip />

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <StepCard icon={MapPin} title="1. País principal">
            <div className="grid gap-3 sm:grid-cols-2">
              {countries.map((country) => (
                <Choice key={country.code} active={form.country === country.code} onClick={() => setForm({ ...form, country: country.code })}>
                  <span className="font-semibold">{country.label}</span>
                  <span className="mt-1 block text-sm text-surface-500">Monedas: {country.currency}</span>
                </Choice>
              ))}
            </div>
          </StepCard>

          <StepCard icon={Target} title="2. Objetivo principal">
            <div className="grid gap-3 sm:grid-cols-3">
              {goals.map((goal) => (
                <Choice key={goal} active={form.goal === goal} onClick={() => setForm({ ...form, goal })}>{goal}</Choice>
              ))}
            </div>
          </StepCard>

          <StepCard icon={ShieldCheck} title="3. Perfil de riesgo">
            <div className="grid gap-3 md:grid-cols-3">
              {riskProfiles.map((risk) => (
                <Choice key={risk.key} active={form.risk === risk.key} onClick={() => setForm({ ...form, risk: risk.key })}>
                  <span className="font-semibold">{risk.label}</span>
                  <span className="mt-1 block text-sm text-surface-500">{risk.detail}</span>
                </Choice>
              ))}
            </div>
          </StepCard>

          <StepCard icon={CircleDollarSign} title="4. Monto estimado inicial">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {amounts.map((amount) => (
                <Choice key={amount} active={form.amount === amount} onClick={() => setForm({ ...form, amount })}>{amount}</Choice>
              ))}
            </div>
          </StepCard>
        </div>

        <aside className="card h-fit lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold text-surface-900">Resumen</h2>
          <div className="mt-4 space-y-3 text-sm">
            <SummaryRow label="País" value={selectedCountry.label} />
            <SummaryRow label="Objetivo" value={form.goal} />
            <SummaryRow label="Riesgo" value={riskProfiles.find((item) => item.key === form.risk)?.label || 'Balanceado'} />
            <SummaryRow label="Monto" value={form.amount} />
          </div>
          <Button type="submit" loading={saving} icon={CheckCircle2} className="mt-6 w-full">Guardar perfil</Button>
          <p className="mt-3 text-sm leading-relaxed text-surface-500">
            Vas a poder cambiar estos datos más adelante. No bloquea tu cuenta.
          </p>
        </aside>
      </form>
    </div>
  );
}

function StepCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-brand-500/10 p-2"><Icon className="h-5 w-5 text-brand-500" /></div>
        <h2 className="font-display text-lg font-bold text-surface-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? 'rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4 text-left text-surface-900 ring-2 ring-brand-500/15' : 'rounded-2xl border border-surface-200 bg-surface-100 p-4 text-left text-surface-700 transition-colors hover:border-brand-500/20 hover:bg-brand-500/5'}
    >
      {children}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 rounded-xl bg-surface-100 px-3 py-2"><span className="text-surface-500">{label}</span><span className="font-semibold text-surface-900">{value}</span></div>;
}
