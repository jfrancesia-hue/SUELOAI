/**
 * Conversation Manager (Claude / Anthropic)
 *
 * Gestiona conversaciones persistentes con el Analista IA.
 * - Mantiene contexto entre mensajes (hasta 20 turnos previos)
 * - Persiste en Supabase (ai_conversations + ai_messages)
 * - Usa tool use de Claude para ejecutar acciones sobre datos reales
 * - Calcula costos y tokens con pricing de Anthropic
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  anthropic,
  CLAUDE_MODELS,
  calculateClaudeCost,
  extractText,
} from '@/lib/anthropic/client';
import { ANALYST_SYSTEM_PROMPT, buildUserContext } from './prompts';
import { buildMemoryContext, saveMemory, type MemoryType } from '@/lib/ai/memory';

interface ConversationContext {
  userId: string;
  userName: string;
  userRole: string;
  totalInvested?: number;
  walletBalance?: number;
  riskProfile?: string;
}

// ============================================
// TOOLS (Anthropic format) — acciones del asistente
// ============================================
const ANALYST_FUNCTIONS: Anthropic.Tool[] = [
  {
    name: 'search_projects',
    description: 'Buscar proyectos disponibles en Suelo según filtros',
    input_schema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'Ciudad o país' },
        min_return: { type: 'number', description: 'Retorno mínimo esperado (%)' },
        max_token_price: { type: 'number', description: 'Precio máximo por token (USD)' },
        status: { type: 'string', enum: ['funding', 'all'] },
      },
    },
  },
  {
    name: 'get_project_details',
    description: 'Obtener detalles completos de un proyecto específico',
    input_schema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: 'UUID del proyecto' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_user_portfolio',
    description: 'Obtener el portfolio actual del usuario',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'calculate_investment_return',
    description: 'Calcular retorno proyectado de una inversión',
    input_schema: {
      type: 'object',
      properties: {
        amount_usd: { type: 'number' },
        expected_return_percent: { type: 'number' },
        period_months: { type: 'number' },
      },
      required: ['amount_usd', 'expected_return_percent', 'period_months'],
    },
  },
  {
    name: 'get_ai_recommendations',
    description: 'Obtener recomendaciones personalizadas de la IA según el perfil',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'save_memory',
    description:
      'Guardar información importante sobre el usuario para recordar entre conversaciones. Usar cuando comparte preferencias, objetivos, decisiones o hechos clave.',
    input_schema: {
      type: 'object',
      properties: {
        memory_type: {
          type: 'string',
          enum: ['user_preference', 'decision', 'context', 'important_fact', 'goal', 'concern'],
        },
        summary: { type: 'string', description: 'Resumen en 1 oración' },
        details: { type: 'string' },
        importance: { type: 'integer', description: '0-10' },
      },
      required: ['memory_type', 'summary'],
    },
  },
];

// ============================================
// MAIN — Enviar mensaje y recibir respuesta
// ============================================
export async function sendMessage(params: {
  conversationId: string;
  userMessage: string;
  userContext: ConversationContext;
  supabaseClient: any;
}): Promise<{
  reply: string;
  functionCalls?: any[];
  tokensUsed: number;
  costUsd: number;
  messageId: string;
}> {
  const { conversationId, userMessage, userContext, supabaseClient } = params;

  // Cargar historial (últimos 20 turnos)
  const { data: history } = await supabaseClient
    .from('ai_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20);

  // Filtrar a roles user/assistant válidos (el schema puede tener otros roles)
  const validHistory: Anthropic.MessageParam[] = (history || [])
    .filter((m: any) => m.role === 'user' || m.role === 'assistant')
    .map((m: any) => ({ role: m.role, content: m.content as string }));

  const messages: Anthropic.MessageParam[] = [
    ...validHistory,
    { role: 'user', content: userMessage },
  ];

  // Guardar mensaje del usuario
  await supabaseClient.from('ai_messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: userMessage,
  });

  // Cargar memorias persistentes del usuario para este turno
  const memoryBlock = await buildMemoryContext(supabaseClient, userContext.userId);

  let totalInput = 0;
  let totalOutput = 0;
  const functionCallsLog: any[] = [];
  const functionResultsLog: any[] = [];

  // Loop de tool use (max 5 iteraciones)
  const MAX_ITERATIONS = 5;
  let finalText = '';

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.analyst,
      max_tokens: 1024,
      system: `${ANALYST_SYSTEM_PROMPT}\n\n${buildUserContext({
        name: userContext.userName,
        role: userContext.userRole,
        totalInvested: userContext.totalInvested,
        walletBalance: userContext.walletBalance,
        riskProfile: userContext.riskProfile,
      })}${memoryBlock}`,
      tools: ANALYST_FUNCTIONS,
      messages,
    });

    totalInput += response.usage.input_tokens;
    totalOutput += response.usage.output_tokens;

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason !== 'tool_use') {
      finalText = extractText(response.content);
      break;
    }

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    );

    const results: Anthropic.ToolResultBlockParam[] = await Promise.all(
      toolUseBlocks.map(async (tc) => {
        try {
          const result = await executeFunctionCall(
            tc.name,
            tc.input as any,
            userContext,
            supabaseClient
          );
          functionCallsLog.push({ name: tc.name, input: tc.input });
          functionResultsLog.push({ name: tc.name, result });
          return {
            type: 'tool_result' as const,
            tool_use_id: tc.id,
            content: JSON.stringify(result),
          };
        } catch (error: any) {
          return {
            type: 'tool_result' as const,
            tool_use_id: tc.id,
            content: JSON.stringify({ error: error.message ?? 'tool error' }),
            is_error: true,
          };
        }
      })
    );

    messages.push({ role: 'user', content: results });
  }

  const cost = calculateClaudeCost(CLAUDE_MODELS.analyst, totalInput, totalOutput);

  const { data: assistantMsg } = await supabaseClient
    .from('ai_messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: finalText,
      function_calls: functionCallsLog.length > 0 ? functionCallsLog : null,
      function_results: functionResultsLog.length > 0 ? functionResultsLog : null,
      tokens_input: totalInput,
      tokens_output: totalOutput,
      model: CLAUDE_MODELS.analyst,
      cost_usd: cost,
    })
    .select()
    .single();

  return {
    reply: finalText,
    functionCalls: functionCallsLog.length > 0 ? functionCallsLog : undefined,
    tokensUsed: totalInput + totalOutput,
    costUsd: cost,
    messageId: assistantMsg?.id,
  };
}

// ============================================
// EJECUTAR UN TOOL CALL
// ============================================
async function executeFunctionCall(
  name: string,
  args: any,
  userContext: ConversationContext,
  supabase: any
): Promise<any> {
  switch (name) {
    case 'search_projects': {
      let query = supabase
        .from('projects')
        .select(
          'id, title, location, token_price, expected_return, return_period_months, sold_tokens, total_tokens, status'
        )
        .eq('status', 'funding')
        .limit(10);
      if (args.location) query = query.ilike('location', `%${args.location}%`);
      if (args.min_return) query = query.gte('expected_return', args.min_return);
      if (args.max_token_price) query = query.lte('token_price', args.max_token_price);
      const { data } = await query;
      return { projects: data || [] };
    }

    case 'get_project_details': {
      const { data } = await supabase
        .from('projects')
        .select('*, developer:profiles!developer_id(full_name, company_name)')
        .eq('id', args.project_id)
        .single();
      return { project: data };
    }

    case 'get_user_portfolio': {
      const { data } = await supabase
        .from('investments')
        .select('*, project:projects(title, location, expected_return)')
        .eq('investor_id', userContext.userId)
        .eq('status', 'confirmed');
      const totalInvested = (data || []).reduce(
        (sum: number, i: any) => sum + Number(i.amount),
        0
      );
      return {
        investments: data || [],
        total_invested: totalInvested,
        count: (data || []).length,
      };
    }

    case 'calculate_investment_return': {
      const total = args.amount_usd * (1 + args.expected_return_percent / 100);
      const profit = total - args.amount_usd;
      const monthly = profit / args.period_months;
      return {
        initial_investment: args.amount_usd,
        total_return: total,
        profit,
        monthly_avg: monthly,
        annualized_return: (args.expected_return_percent / args.period_months) * 12,
      };
    }

    case 'get_ai_recommendations': {
      const { data } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', userContext.userId)
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .limit(3);
      return { recommendations: data || [] };
    }

    case 'save_memory': {
      const saved = await saveMemory(supabase, userContext.userId, {
        memory_type: args.memory_type as MemoryType,
        summary: args.summary,
        details: args.details,
        importance: args.importance,
      });
      return saved
        ? { saved: true, memory_id: saved.id, summary: saved.summary }
        : { saved: false, error: 'no se pudo guardar' };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ============================================
// CREAR CONVERSACIÓN
// ============================================
export async function createConversation(params: {
  userId: string;
  channel?: 'web' | 'whatsapp' | 'email';
  title?: string;
  supabaseClient: any;
}): Promise<string> {
  const { data } = await params.supabaseClient
    .from('ai_conversations')
    .insert({
      user_id: params.userId,
      channel: params.channel || 'web',
      title: params.title || 'Nueva conversación',
    })
    .select('id')
    .single();

  return data.id;
}

// ============================================
// OBTENER O CREAR CONVERSACIÓN ACTIVA
// ============================================
export async function getOrCreateActiveConversation(params: {
  userId: string;
  supabaseClient: any;
}): Promise<string> {
  const { data: existing } = await params.supabaseClient
    .from('ai_conversations')
    .select('id')
    .eq('user_id', params.userId)
    .eq('channel', 'web')
    .eq('archived', false)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (existing && existing.id) return existing.id;

  return createConversation({
    userId: params.userId,
    supabaseClient: params.supabaseClient,
  });
}
