'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, TrendingUp, Building2, Brain } from 'lucide-react';
import { useRevealOnScroll } from '@/components/animations/useReveal';

type Message = {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  toolResult?: string;
};

const CONVERSATION: Message[] = [
  {
    role: 'user',
    content: 'Tengo USD 800 para invertir. No quiero riesgo extremo. ¿Qué me sugerís?',
  },
  {
    role: 'tool',
    toolName: 'search_projects',
    content: 'Buscando proyectos con perfil conservador-balanceado en tu región...',
    toolResult: '7 proyectos encontrados · PY (3) · AR (4)',
  },
  {
    role: 'tool',
    toolName: 'analyze_risk',
    content: 'Cruzando con tu historial y tu perfil de riesgo...',
    toolResult: 'Perfil: balanceado · Rentabilidad esperada: 11-14% anual',
  },
  {
    role: 'assistant',
    content:
      'Con USD 800 te sugiero diversificar en 3 participaciones. Vi dos proyectos que encajan con tu perfil: **Edificio Córdoba Norte** (entregado, renta mensual, 10% anual) y **Torre Asunción Eje** (obra avanzada, 14% esperado). Te reservo el análisis completo — ¿querés que te lo envíe?',
  },
];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-[bounce_1.2s_ease-in-out_infinite]" />
      <span
        className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-[bounce_1.2s_ease-in-out_infinite]"
        style={{ animationDelay: '0.15s' }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-[bounce_1.2s_ease-in-out_infinite]"
        style={{ animationDelay: '0.3s' }}
      />
    </span>
  );
}

function ToolBubble({ toolName, content, toolResult }: Message) {
  const icon = {
    search_projects: Building2,
    analyze_risk: TrendingUp,
  }[toolName ?? 'search_projects'] || Brain;
  const Icon = icon;

  return (
    <div className="flex items-start gap-2.5 max-w-full">
      <div className="w-7 h-7 rounded-lg bg-earth-500/10 border border-earth-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-earth-300" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0 rounded-xl bg-earth-950/30 border border-earth-500/15 px-3.5 py-2.5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-earth-300 mb-1">
          {toolName}
        </p>
        <p className="text-[12.5px] text-surface-700 leading-snug">{content}</p>
        {toolResult && (
          <p className="mt-1.5 text-[11px] font-mono text-surface-600 tabular-nums">
            → {toolResult}
          </p>
        )}
      </div>
    </div>
  );
}

function AssistantBubble({ content, animating }: { content: string; animating: boolean }) {
  const [shown, setShown] = useState(animating ? '' : content);

  useEffect(() => {
    if (!animating) {
      setShown(content);
      return;
    }
    setShown('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setShown(content.slice(0, i));
      if (i >= content.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [content, animating]);

  return (
    <div className="flex items-start gap-2.5 max-w-full">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_1px_rgba(0,200,83,0.4),0_4px_12px_-2px_rgba(0,200,83,0.4)]">
        <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0 rounded-xl bg-surface-100 border border-surface-200 px-3.5 py-2.5">
        <p
          className="text-[13px] text-surface-900 leading-[1.55]"
          dangerouslySetInnerHTML={{
            __html: shown.replace(/\*\*(.+?)\*\*/g, '<strong class="font-[580] text-brand-400">$1</strong>'),
          }}
        />
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-xl bg-brand-500/10 border border-brand-500/20 px-3.5 py-2.5">
        <p className="text-[13px] text-surface-800 leading-snug">{content}</p>
      </div>
    </div>
  );
}

function ChatMock() {
  const [step, setStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const timings = [600, 1800, 3400, 4800];
          timings.forEach((t, i) => {
            setTimeout(() => setStep(i + 1), t);
          });
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [step]);

  return (
    <div className="relative rounded-[24px] bg-surface-100/80 border border-surface-200 backdrop-blur-sm overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[12px] font-[580] text-surface-900">Analista IA</p>
            <p className="text-[10px] text-surface-500">Con memoria persistente</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-[10px] font-mono text-surface-500 tracking-wider">
            EN VIVO
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="px-5 py-4 space-y-3 min-h-[360px] max-h-[420px] overflow-y-auto scrollbar-thin"
      >
        {step >= 1 && <UserBubble content={CONVERSATION[0].content} />}
        {step >= 2 && <ToolBubble {...CONVERSATION[1]} />}
        {step >= 3 && <ToolBubble {...CONVERSATION[2]} />}
        {step >= 4 && (
          <AssistantBubble content={CONVERSATION[3].content} animating />
        )}
        {step > 0 && step < 4 && (
          <div className="flex items-center gap-2 pl-10 pt-1">
            <TypingDots />
            <span className="text-[11px] text-surface-500">Analista pensando...</span>
          </div>
        )}
      </div>

      {/* Input mock */}
      <div className="border-t border-surface-200/60 px-5 py-3 flex items-center gap-2 bg-surface-50/40">
        <div className="flex-1 h-9 rounded-lg bg-surface-100 border border-surface-200 flex items-center px-3">
          <span className="text-[12px] text-surface-500">Preguntale lo que quieras...</span>
        </div>
        <button className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
          <Send className="w-3.5 h-3.5 text-white" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export function AIAnalystDemo() {
  const ref = useRevealOnScroll({ stagger: 0.08, duration: 0.7 });

  return (
    <section ref={ref} id="analista-ia" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-brand-500/[0.05] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[450px] h-[450px] bg-earth-500/[0.04] rounded-full blur-[130px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div>
            <p
              data-reveal
              className="text-brand-500 text-[11px] font-semibold tracking-[0.18em] uppercase mb-4"
            >
              Analista IA
            </p>
            <h2
              data-reveal
              className="font-display text-3xl md:text-5xl font-bold text-surface-900 tracking-[-0.02em] leading-[1.05]"
            >
              Un asesor de inversión{' '}
              <span className="font-serif italic font-[400] text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-earth-300 to-terra-400">
                que aprende de vos.
              </span>
            </h2>
            <p
              data-reveal
              className="mt-5 text-surface-600 text-base md:text-lg leading-relaxed max-w-xl"
            >
              No es un chatbot. Es un agente con memoria persistente que analiza proyectos,
              cruza tu perfil y sugiere acciones concretas. En español, 24/7, sin conflicto de interés.
            </p>

            <div data-reveal className="mt-8 space-y-3">
              {[
                { label: 'Recuerda tus decisiones anteriores y aprende de ellas' },
                { label: 'Busca proyectos en vivo cruzando tu perfil de riesgo' },
                { label: 'Calcula proyecciones con datos históricos reales' },
                { label: 'Te avisa si algo requiere tu atención' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-brand-400" strokeWidth={2.5} />
                  </div>
                  <p className="text-[14px] text-surface-700 leading-relaxed">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat mock */}
          <div data-reveal>
            <ChatMock />
          </div>
        </div>
      </div>
    </section>
  );
}
