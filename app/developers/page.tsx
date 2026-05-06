import Link from 'next/link';
import { ArrowRight, BarChart3, Building2, CheckCircle2, FileCheck2, Users } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const benefits = [
  ['Capital ordenado', 'Presentá proyectos con información clara, avance de fondeo y trazabilidad.'],
  ['Documentación centralizada', 'Contratos, permisos, presupuesto y actualizaciones en un solo lugar.'],
  ['CRM comercial', 'Seguimiento de leads, campañas, pipeline e inversores interesados.'],
  ['Confianza para inversores', 'Sellos, scoring IA y centro de confianza para reducir dudas antes de invertir.'],
];

const requiredDocuments = [
  'Título, boleto o derecho verificable sobre el terreno o activo',
  'Permisos municipales, planos y documentación técnica disponible',
  'Presupuesto de obra, cronograma, hitos y uso del capital',
  'Datos legales de la desarrolladora y responsables del proyecto',
  'Fotos, avance de obra, ubicación y evidencia comercial',
  'Riesgos principales, plan de salida y contrato modelo',
];

export default function DevelopersLandingPage() {
  return (
    <main className="min-h-screen bg-[#07111F] text-white">
      <Navbar />
      <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_75%_18%,rgba(245,197,66,0.12),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Para desarrolladoras</p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] md:text-6xl">
              Levantá capital inmobiliario con una presentación seria y verificable.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/72">
              Suelo ayuda a constructoras y desarrolladoras de Paraguay y Bolivia a ordenar documentación, captar inversores y dar seguimiento transparente al proyecto.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="btn-primary">Presentar proyecto <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/trust" className="btn-secondary">Ver requisitos</Link>
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl">
            <Building2 className="mb-6 h-10 w-10 text-emerald-300" />
            <div className="grid gap-3">
              {['Crear ficha del proyecto', 'Subir documentación', 'Validar scoring y riesgos', 'Captar inversores', 'Reportar avances'].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl bg-[#07111F]/65 p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-300 text-sm font-bold text-[#03130D]">{index + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-24 sm:px-6 md:grid-cols-2 lg:px-8">
        {benefits.map(([title, text], index) => {
          const icons = [BarChart3, FileCheck2, Users, CheckCircle2];
          const Icon = icons[index];
          return (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.055] p-6">
              <Icon className="mb-5 h-7 w-7 text-emerald-300" />
              <h2 className="font-display text-xl font-bold">{title}</h2>
              <p className="mt-3 leading-relaxed text-white/68">{text}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[32px] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl md:p-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">Checklist para publicar</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.02em]">
              Qué debe preparar una desarrolladora antes de salir a captar capital.
            </h2>
            <p className="mt-4 leading-relaxed text-white/66">
              La idea es reducir preguntas repetidas, acelerar la revisión y mostrarle al inversor información clara sin prometer retornos garantizados.
            </p>
          </div>
          <div className="grid gap-3">
            {requiredDocuments.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-[#07111F]/65 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <span className="leading-relaxed text-white/78">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
