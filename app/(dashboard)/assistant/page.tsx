'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Button, LoadingSpinner } from '@/components/ui';
import {
  Sparkles, Send, Loader2, Plus, MessageCircle,
  TrendingUp, Building2, Wallet, Search, Calculator,
} from 'lucide-react';
import { formatDate } from '@/utils/helpers';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  created_at: string;
  tool_calls?: any;
}

interface Conversation {
  id: string;
  title: string;
  message_count: number;
  last_message_at: string;
}

const SUGGESTED_PROMPTS = [
  { icon: Search, text: '¿Qué proyectos me recomendás según mi perfil?' },
  { icon: TrendingUp, text: 'Analizá mi portfolio actual y dame insights' },
  { icon: Building2, text: 'Buscá proyectos en Asunción con retorno > 12%' },
  { icon: Calculator, text: 'Si invierto USD 1000, ¿cuánto gano en 12 meses?' },
  { icon: Wallet, text: '¿Cómo está mi diversificación?' },
];

export default function AssistantPage() {
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => {
    if (activeConversation) loadMessages(activeConversation);
    else setMessages([]);
  }, [activeConversation]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    setLoading(true);
    const res = await fetch('/api/ai/chat');
    const data = await res.json();
    setConversations(data.conversations || []);
    setLoading(false);
  }

  async function loadMessages(convId: string) {
    const res = await fetch(`/api/ai/chat?conversation_id=${convId}`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function sendMessage(text?: string) {
    const messageText = text || input;
    if (!messageText.trim() || sending) return;

    setSending(true);
    setInput('');

    // Optimistic UI
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversation_id: activeConversation,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `Error: ${data.error}`,
            created_at: new Date().toISOString(),
          },
        ]);
      } else {
        if (!activeConversation) {
          setActiveConversation(data.conversation_id);
          await loadConversations();
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.response,
            created_at: new Date().toISOString(),
            tool_calls: data.tool_calls,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  }

  function startNewConversation() {
    setActiveConversation(null);
    setMessages([]);
    setInput('');
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex gap-4">
      {/* Sidebar de conversaciones */}
      <div className="hidden md:flex w-72 flex-col card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-surface-900">Conversaciones</h2>
          <button
            onClick={startNewConversation}
            className="p-1.5 rounded-lg hover:bg-surface-200 text-surface-600 hover:text-surface-900"
            title="Nueva conversación"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {loading ? (
            <LoadingSpinner />
          ) : conversations.length === 0 ? (
            <p className="text-xs text-surface-500 text-center py-8">
              Empezá una conversación
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeConversation === conv.id
                    ? 'bg-brand-500/10 text-surface-900'
                    : 'hover:bg-surface-200 text-surface-600'
                }`}
              >
                <p className="text-sm font-medium truncate">{conv.title || 'Sin título'}</p>
                <p className="text-xs text-surface-500 mt-0.5">
                  {conv.message_count} mensajes · {formatDate(conv.last_message_at)}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col card overflow-hidden p-0">
        {/* Header */}
        <div className="p-4 border-b border-surface-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-surface-900">
              Mi Analista Suelo
            </h1>
            <p className="text-xs text-surface-500">Tu analista IA personal · Powered by GPT-4o</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <WelcomeScreen onSelectPrompt={sendMessage} />
          ) : (
            <>
              {messages.filter((m) => m.role !== 'tool').map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-surface-500 pt-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Pensando...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-surface-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Preguntá lo que quieras sobre tus inversiones..."
              className="flex-1 input-field"
              disabled={sending}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              icon={Send}
            >
              Enviar
            </Button>
          </div>
          <p className="text-xs text-surface-500 mt-2">
            💡 Tu analista tiene acceso a tu portfolio, proyectos del marketplace y datos de mercado en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// WELCOME SCREEN
// ============================================
function WelcomeScreen({ onSelectPrompt }: { onSelectPrompt: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-2xl shadow-brand-500/30 mb-6">
        <Sparkles className="w-10 h-10 text-white" />
      </div>

      <h2 className="font-display text-3xl font-bold text-surface-900 mb-3">
        Hola, soy tu Analista Suelo
      </h2>
      <p className="text-surface-600 mb-8 max-w-lg">
        Puedo analizar tu portfolio, recomendar proyectos según tu perfil, calcular retornos proyectados y responder cualquier duda sobre tus inversiones.
      </p>

      <div className="w-full max-w-2xl space-y-2">
        <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">
          Probá con estas preguntas
        </p>
        {SUGGESTED_PROMPTS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            onClick={() => onSelectPrompt(text)}
            className="w-full text-left p-4 rounded-xl bg-surface-100 border border-surface-200 hover:border-brand-500/30 hover:bg-surface-150 transition-all group flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0 group-hover:bg-brand-500/20 transition-colors">
              <Icon className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-sm text-surface-700 group-hover:text-surface-900">{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MESSAGE BUBBLE
// ============================================
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-surface-300'
            : 'bg-gradient-to-br from-brand-500 to-brand-700'
        }`}
      >
        {isUser ? (
          <span className="text-xs font-bold text-surface-900">Yo</span>
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-brand-500 text-white'
              : 'bg-surface-200 text-surface-900'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>

          {message.tool_calls && message.tool_calls.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
              {message.tool_calls.map((tc: any, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/10"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {tc.name.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
