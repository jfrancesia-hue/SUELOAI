'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Calculator,
  ExternalLink,
  Home,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  WalletCards,
  X,
} from 'lucide-react';
import { cn } from '@/utils/helpers';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: Home, label: 'Invertir USD 500', text: 'Tengo USD 500. ¿Qué proyecto me recomendarías y por qué?' },
  { icon: WalletCards, label: 'Revisar billetera', text: 'Ayudame a entender mi billetera y cómo cargar saldo para invertir.' },
  { icon: Calculator, label: 'Simular retorno', text: 'Simulá una inversión de USD 1.000 con perfil balanceado.' },
  { icon: Sparkles, label: 'Explicar riesgo', text: 'Explicame el riesgo de invertir en proyectos inmobiliarios fraccionados.' },
];

function getWhatsAppHref(message: string) {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const digits = configured.replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hola, soy tu Asesor IA de Suelo. Puedo ayudarte a elegir proyectos, simular retornos, entender riesgos, cargar saldo o avanzar paso a paso con una inversión.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const whatsappMessage = useMemo(() => {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content;
    const context = typeof window !== 'undefined' ? window.location.pathname : '/';
    return [
      'Hola Suelo, quiero hablar con el Asesor IA.',
      lastUserMessage ? `Mi consulta: ${lastUserMessage}` : 'Quiero asesoramiento para invertir en ladrillo real desde USD 100.',
      `Estoy viendo: ${context}`,
    ].join('\n');
  }, [messages]);

  const whatsappHref = getWhatsAppHref(whatsappMessage);

  async function send(text = input) {
    const content = text.trim();
    if (!content || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, conversation_id: conversationId }),
      });
      const data = await res.json();

      if (data.conversation_id) setConversationId(data.conversation_id);

      if (res.status === 401) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Para asesorarte con datos de tu cartera necesito que inicies sesion. Tambien podes tocar WhatsApp y seguimos con un asesor de Suelo con tu consulta ya prellenada.',
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply || data.response || data.error || 'No pude responder ahora. Probá de nuevo en unos segundos.',
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'No pude conectarme con el agente web. Si preferís, tocá WhatsApp y seguimos por ahí con tu consulta prellenada.',
          timestamp: new Date(),
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      {!open && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="group hidden items-center gap-2 rounded-2xl border border-emerald-300/20 bg-[#25D366] px-4 py-3 text-sm font-bold text-[#04140A] shadow-[0_18px_38px_-20px_rgba(37,211,102,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-20px_rgba(37,211,102,1)] sm:flex"
              aria-label="Hablar por WhatsApp con el asesor de Suelo"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2.4} />
              WhatsApp
              <ExternalLink className="h-3.5 w-3.5 opacity-70" strokeWidth={2} />
            </a>
          )}

          <button
            onClick={() => setOpen(true)}
            className="group relative flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-emerald-300 via-cyan-300 to-emerald-500 text-[#03130D] shadow-[0_22px_50px_-20px_rgba(16,185,129,0.95)] transition-all hover:-translate-y-1 active:translate-y-0"
            aria-label="Abrir asesor IA"
          >
            <Bot className="h-7 w-7" strokeWidth={2} />
            <span className="absolute -right-1 -top-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-200 opacity-60" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-[#07111F] bg-emerald-300" />
            </span>
          </button>
        </div>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[680px] max-h-[calc(100vh-2.5rem)] w-[430px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#07111F] shadow-[0_28px_90px_-38px_rgba(0,0,0,1)]">
          <div className="relative border-b border-white/10 p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_84%_30%,rgba(6,182,212,0.16),transparent_32%)]" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10">
                  <Sparkles className="h-5 w-5 text-emerald-200" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Asesor IA Suelo</p>
                  <p className="text-xs text-white/45">Inversión, wallet, riesgo y proyectos</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Cerrar asesor"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="relative mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/assistant"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/78 transition-colors hover:bg-white/[0.09]"
              >
                Pantalla completa
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-[#04140A] transition-transform hover:-translate-y-px"
                >
                  WhatsApp
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
              ) : (
                <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-center text-[11px] text-amber-200">
                  Configurá WhatsApp
                </div>
              )}
            </div>
          </div>

          <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
            {messages.map((msg, index) => (
              <div key={`${msg.timestamp.getTime()}-${index}`} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[86%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'rounded-br-md bg-emerald-300 text-[#03130D]'
                      : 'rounded-bl-md border border-white/10 bg-white/[0.065] text-white/82'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-white/48">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-300" />
                Analizando tu consulta...
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="border-t border-white/10 px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/38">Acciones rápidas</p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map(({ icon: Icon, label, text }) => (
                  <button
                    key={label}
                    onClick={() => send(text)}
                    className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.055] p-3 text-left text-xs font-semibold text-white/72 transition-colors hover:border-emerald-300/22 hover:bg-white/[0.085]"
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" strokeWidth={2} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
            className="border-t border-white/10 p-3"
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Decime qué querés hacer..."
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none placeholder:text-white/34 focus:border-emerald-300/35"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-300 text-[#03130D] transition-colors hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Enviar mensaje"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={2.2} />}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] leading-relaxed text-white/34">
              No es asesoramiento financiero/legal. Te ayuda a decidir con más información.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
