'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRevealOnScroll } from '@/components/animations/useReveal';

const faqs = [
  {
    q: '¿Desde cuánto puedo invertir?',
    a: 'Desde USD 100 o 100 USDT. Podés elegir una o varias participaciones en el mismo proyecto, o diversificar entre varios.',
  },
  {
    q: '¿Cómo recibo mis retornos?',
    a: 'Los retornos se acreditan en tu billetera Suelo en la moneda del proyecto (USD, USDT, ARS o PYG). Desde ahí podés retirar a tu cuenta bancaria, a Mercado Pago, o mantener invertido.',
  },
  {
    q: '¿Qué pasa si un proyecto no genera los retornos esperados?',
    a: 'Cada proyecto tiene un prospecto con escenarios y riesgos auditables. El Analista IA te avisa si un proyecto entra en zona de riesgo y sugiere acciones. Además, los contratos son anclados on-chain: siempre podés recuperar la participación o venderla en el mercado secundario.',
  },
  {
    q: '¿Los contratos son legales en mi país?',
    a: 'Suelo opera bajo la jurisdicción de cada país (PY, AR, UY, BO próximamente). Los contratos cumplen con normativa local y emiten facturación fiscal automática. En Argentina, generamos CAE con AFIP; en Paraguay, timbrado SET.',
  },
  {
    q: '¿Quién audita los proyectos?',
    a: 'Cada proyecto pasa por scoring IA + auditoría humana de Nativos Consultora. Validamos titularidad del activo, permisos de obra, solvencia del desarrollador y estructura de capital.',
  },
  {
    q: '¿Cómo es la comisión?',
    a: 'No cobramos comisión de entrada al inversor. Cobramos un 2% anual sobre retornos generados (performance fee) y un 3% al desarrollador sobre el capital levantado. Sin sorpresas.',
  },
  {
    q: '¿Puedo vender mi participación antes del plazo?',
    a: 'Sí. El mercado secundario te permite listar tu participación a un precio que vos definís. Otro inversor puede comprarla y la transferencia queda anclada on-chain automáticamente.',
  },
  {
    q: '¿Qué hace exactamente el Analista IA?',
    a: 'Analiza tu perfil de riesgo, tu portafolio actual y las condiciones del mercado para sugerir acciones: diversificar, rebalancear, salir de una posición, o aprovechar un proyecto nuevo que encaje con tus objetivos. Tiene memoria persistente — aprende de tus decisiones previas.',
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      data-reveal
      className={`group border-b border-surface-200 last:border-b-0 ${open ? 'border-brand-500/20' : ''}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-6 py-6 md:py-7 text-left transition-colors"
      >
        <span className="flex items-start gap-4 flex-1 min-w-0">
          <span className="text-[11px] font-mono text-surface-500 mt-1.5 tabular-nums shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="font-display text-[17px] md:text-[19px] font-[580] text-surface-900 tracking-[-0.01em] leading-snug">
            {q}
          </span>
        </span>
        <span
          className={`relative shrink-0 w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center mt-0.5 ${
            open
              ? 'bg-brand-500/10 border-brand-500/30 rotate-45'
              : 'bg-surface-100 border-surface-200 group-hover:border-surface-300'
          }`}
        >
          <Plus
            className={`w-4 h-4 transition-colors ${open ? 'text-brand-400' : 'text-surface-600'}`}
            strokeWidth={2}
          />
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100 pb-7' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-[14px] md:text-[15px] text-surface-600 leading-[1.65] pl-10 pr-10 max-w-[62ch]">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const ref = useRevealOnScroll({ stagger: 0.05, duration: 0.6 });

  return (
    <section ref={ref} id="faq" className="relative py-24 md:py-32">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p
            data-reveal
            className="text-brand-500 text-[11px] font-semibold tracking-[0.18em] uppercase mb-4"
          >
            Preguntas frecuentes
          </p>
          <h2
            data-reveal
            className="font-display text-3xl md:text-5xl font-bold text-surface-900 tracking-[-0.02em] leading-[1.05]"
          >
            Todo lo que querés{' '}
            <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-earth-300 to-terra-400">
              saber antes.
            </span>
          </h2>
        </div>

        <div className="border-t border-surface-200">
          {faqs.map((f, i) => (
            <FAQItem key={f.q} q={f.q} a={f.a} index={i} />
          ))}
        </div>

        <div data-reveal className="mt-12 text-center">
          <p className="text-[14px] text-surface-600">
            ¿Más preguntas?{' '}
            <a
              href="mailto:hola@suelo.ai"
              className="text-brand-400 hover:text-brand-300 font-[520] underline-offset-4 hover:underline"
            >
              Hablá con el equipo
            </a>{' '}
            directamente.
          </p>
        </div>
      </div>
    </section>
  );
}
