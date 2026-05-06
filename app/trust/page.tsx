import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileCheck2, Fingerprint, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const pillars = [
  ['Proyecto revisado', 'Titularidad, ubicación, permisos, desarrollador y estructura financiera.'],
  ['Contrato verificable', 'Cada participación puede generar documento y hash público para confirmar integridad.'],
  ['KYC/AML', 'Identidad y controles básicos antes de operar con dinero real.'],
  ['Riesgo explicado', 'Mostramos riesgos, plazos y supuestos. No prometemos retornos garantizados.'],
];

const docs = ['Título o derecho sobre el activo', 'Permisos y documentación técnica', 'Presupuesto y cronograma', 'Datos de la desarrolladora', 'Contrato modelo', 'Plan de salida o renta'];

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-[#07111F] text-white">
      <Navbar />
      <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_78%_20%,rgba(6,182,212,0.14),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Centro de confianza</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold tracking-[-0.03em] md:text-6xl">
            Antes de invertir, tenés que poder entender y verificar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/74">
            Suelo organiza documentos, riesgos, contratos y trazabilidad para que cada oportunidad se pueda revisar con claridad en Paraguay y Bolivia.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/marketplace" className="btn-primary">Ver proyectos <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/assistant" className="btn-secondary">Preguntar al analista</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-2 lg:px-8">
        {pillars.map(([title, text], index) => {
          const icons = [ShieldCheck, Fingerprint, LockKeyhole, FileCheck2];
          const Icon = icons[index];
          return (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl">
              <Icon className="mb-5 h-7 w-7 text-emerald-300" />
              <h2 className="font-display text-xl font-bold">{title}</h2>
              <p className="mt-3 leading-relaxed text-white/68">{text}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.055] p-6 md:p-8">
          <h2 className="font-display text-3xl font-bold">Documentos mínimos por proyecto</h2>
          <p className="mt-3 max-w-2xl text-white/66">Una oportunidad no debería publicarse sin información suficiente para tomar una decisión informada.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {docs.map((doc) => (
              <div key={doc} className="flex items-center gap-3 rounded-2xl bg-[#07111F]/65 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
