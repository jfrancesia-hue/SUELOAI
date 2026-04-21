'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Loader2, Sparkles,
  TrendingUp, Building2, Search, DollarSign,
} from 'lucide-react';
import { cn } from '@/utils/helpers';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const QUICK_PROMPTS = [
  { icon: Search, text: 'Mostrame proyectos recomendados', category: 'discover' },
  { icon: TrendingUp, text: '¿Cómo va mi portfolio?', category: 'portfolio' },
  { icon: Building2, text: '¿Qué invertir con USD 500?', category: 'invest' },
  { icon: DollarSign, text: 'Explicame los retornos', category: 'learn' },
];

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu analista personal de Suelo. Te puedo ayudar a entender proyectos, analizar tu portfolio, recomendarte inversiones o responder cualquier duda. ¿En qué te ayudo?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversation_id: conversationId }),
      });
      const data = await res.json();

      if (data.conversation_id) setConversationId(data.conversation_id);

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply || 'Disculpá, tuve un problema. ¿Podés intentar de nuevo?',
      }]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Disculpá, hay un problema de conexión. Intentá en unos segundos.',
      }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "w-14 h-14 rounded-2xl",
          "bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700",
          "flex items-center justify-center",
          "shadow-2xl shadow-brand-500/30",
          open && "hidden"
        )}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 flex items-center justify-center"
        >
          <Sparkles className="w-2 h-2 text-white" />
        </motion.div>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-4rem)] bg-surface-100 border border-surface-200 rounded-3xl shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-surface-200 bg-gradient-to-br from-brand-950/40 to-surface-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-400 border-2 border-surface-100" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900">Suelo AI</p>
                    <p className="text-xs text-surface-500">Tu analista personal · En línea</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-surface-200/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-surface-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-brand-500 text-white rounded-br-sm'
                        : 'bg-surface-200 text-surface-900 rounded-bl-sm'
                    )}
                  >
                    {msg.content.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-4"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-brand-500"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-surface-500">Analizando...</span>
                </motion.div>
              )}
            </div>

            {/* Quick prompts (solo al inicio) */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-[10px] uppercase tracking-wider text-surface-500 font-semibold mb-2">
                  Acciones rápidas
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((prompt) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={prompt.text}
                        onClick={() => sendMessage(prompt.text)}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-200/50 hover:bg-surface-200 text-left transition-colors group"
                      >
                        <Icon className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-surface-700 line-clamp-2">
                          {prompt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-surface-200">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Preguntá lo que necesites..."
                  className="flex-1 px-4 py-2.5 bg-surface-200 border border-surface-300 rounded-xl text-sm text-surface-900 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
              <p className="text-[10px] text-surface-500 text-center mt-2">
                Suelo AI puede cometer errores. Consultá antes de decisiones importantes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
