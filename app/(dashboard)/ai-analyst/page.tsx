'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase-browser';
import {
  Sparkles, Send, Loader2, Plus, Clock, TrendingUp,
  Search, Building2, DollarSign, MessageCircle,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { formatDate } from '@/utils/helpers';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  message_count: number;
  last_message_at: string | null;
}

const EXAMPLE_PROMPTS = [
  {
    icon: Search,
    title: 'Descubrir proyectos',
    description: 'Encontrá oportunidades que se ajusten a tu perfil',
    prompt: 'Mostrame los 3 mejores proyectos disponibles según mi perfil de riesgo',
  },
  {
    icon: TrendingUp,
    title: 'Analizar mi portfolio',
    description: 'Evaluá el estado actual de tus inversiones',
    prompt: '¿Cómo está distribuido mi portfolio y qué debería mejorar?',
  },
  {
    icon: Building2,
    title: 'Estrategia con X monto',
    description: 'Planificá la mejor inversión con lo que tenés',
    prompt: 'Tengo USD 1000 para invertir este mes, ¿cuál es la mejor estrategia?',
  },
  {
    icon: DollarSign,
    title: 'Consulta fiscal',
    description: 'Entendé el impacto impositivo de tus inversiones',
    prompt: '¿Cómo tributan los retornos de mis inversiones en Suelo?',
  },
];

export default function AIAnalystPage() {
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConv) loadMessages(activeConv);
  }, [activeConv]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages]);

  async function loadConversations() {
    setInitialLoading(true);
    const res = await fetch('/api/ai/chat');
    const data = await res.json();
    setConversations(data.conversations || []);
    if (data.conversations?.length > 0) {
      setActiveConv(data.conversations[0].id);
    }
    setInitialLoading(false);
  }

  async function loadMessages(convId: string) {
    const res = await fetch(`/api/ai/chat?conversation_id=${convId}`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversation_id: activeConv }),
      });
      const data = await res.json();

      if (data.conversation_id && !activeConv) {
        setActiveConv(data.conversation_id);
        loadConversations();
      }

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply,
        id: data.message_id,
      }]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Error de conexión. Intentá en unos segundos.',
      }]);
    }
    setLoading(false);
  }

  function newConversation() {
    setActiveConv(null);
    setMessages([]);
  }

  return (
    <div className="max-w-7xl mx-auto -mx-4 -my-4 sm:-mx-6 sm:-my-6 lg:-mx-8 lg:-my-8 h-[calc(100vh-3.5rem)] lg:h-screen flex">
      {/* Sidebar de conversaciones */}
      <aside className="hidden lg:flex w-72 bg-surface-100 border-r border-surface-200 flex-col">
        <div className="p-4 border-b border-surface-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-surface-900">Suelo AI</h1>
              <p className="text-xs text-surface-500">Tu analista personal</p>
            </div>
          </div>
          <button
            onClick={newConversation}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva conversación
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-[10px] uppercase tracking-wider text-surface-500 font-semibold px-2 py-2">
            Historial
          </p>
          {conversations.length === 0 ? (
            <p className="text-xs text-surface-500 px-2 py-4 text-center">
              Sin conversaciones aún
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv.id)}
                  className={cn(
                    'w-full flex items-start gap-2 px-3 py-2 rounded-lg text-left transition-colors',
                    activeConv === conv.id
                      ? 'bg-brand-500/10 text-brand-400'
                      : 'hover:bg-surface-200/50 text-surface-700'
                  )}
                >
                  <MessageCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{conv.title}</p>
                    {conv.last_message_at && (
                      <p className="text-[10px] text-surface-500">
                        {formatDate(conv.last_message_at)} · {conv.message_count} msgs
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Chat principal */}
      <main className="flex-1 flex flex-col">
        {/* Header mobile */}
        <div className="lg:hidden flex items-center gap-2 p-4 border-b border-surface-200">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-surface-900">Suelo AI</h1>
          </div>
        </div>

        {/* Empty state o messages */}
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-500/20">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-display text-3xl font-bold text-surface-900 mb-3">
                  Hola, soy tu analista de Suelo
                </h2>
                <p className="text-surface-600 max-w-lg mx-auto">
                  Te ayudo a entender proyectos, analizar tu cartera, planear inversiones
                  y responder cualquier duda sobre real estate inteligente.
                </p>
              </motion.div>

              {/* Ejemplos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXAMPLE_PROMPTS.map((example, i) => {
                  const Icon = example.icon;
                  return (
                    <motion.button
                      key={example.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => sendMessage(example.prompt)}
                      className="p-4 rounded-2xl bg-surface-100 border border-surface-200 hover:border-brand-500/30 hover:bg-surface-150 text-left transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-brand-500/10 w-fit mb-3 group-hover:bg-brand-500/15 transition-colors">
                        <Icon className="w-4 h-4 text-brand-500" />
                      </div>
                      <p className="font-semibold text-surface-900 text-sm mb-1">
                        {example.title}
                      </p>
                      <p className="text-xs text-surface-500 leading-relaxed">
                        {example.description}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div ref={messagesRef} className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                    msg.role === 'user'
                      ? 'bg-surface-300'
                      : 'bg-gradient-to-br from-brand-400 to-brand-700'
                  )}>
                    {msg.role === 'user' ? (
                      <span className="text-xs text-surface-900 font-bold">Vos</span>
                    ) : (
                      <Sparkles className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-sm'
                      : 'bg-surface-200 text-surface-900 rounded-tl-sm'
                  )}>
                    {msg.content.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-surface-200 rounded-2xl px-4 py-3 rounded-tl-sm">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-2 h-2 rounded-full bg-brand-500"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-surface-200 p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu pregunta..."
                className="flex-1 px-5 py-3 bg-surface-100 border border-surface-300 rounded-2xl text-surface-900 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-medium disabled:opacity-40 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Enviar</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-surface-500 text-center mt-2">
              Suelo AI puede cometer errores. Verificá información importante.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
