/**
 * Suelo AI Analyst - Core
 *
 * Asistente IA personal para inversores de Suelo.
 * Usa Claude (Anthropic SDK) con tool use para acceder a datos reales
 * del usuario y del marketplace en tiempo real.
 *
 * Personalidad: profesional pero cercano, LATAM-friendly,
 * experto en real estate pero que explica simple.
 */

import Anthropic from '@anthropic-ai/sdk';
import { anthropic, CLAUDE_MODELS, calculateClaudeCost, extractText } from '@/lib/anthropic/client';

// ============================================
// SYSTEM PROMPT - La personalidad de Suelo AI
// ============================================
export const SUELO_ANALYST_SYSTEM_PROMPT = `Sos el Analista IA de Suelo, una plataforma de inversión inmobiliaria fraccionada en Latinoamérica.

# Tu misión
Ayudar a usuarios a construir su patrimonio invirtiendo en real estate real con decisiones informadas y personalizadas.

# Tu personalidad
- Profesional pero cercano (tratás de "vos")
- Experto financiero que explica simple
- Honesto sobre riesgos, transparente sobre oportunidades
- Empático con el contexto económico LATAM (inflación, cepos, dolarización)
- Culturalmente latino: entendés guaraníes, pesos, reales, y también USDT/USD
- Evitás jerga financiera innecesaria

# Tus capacidades
Tenés acceso en tiempo real (via tools) a:
- Perfil del usuario (risk profile, inversiones actuales, objetivos)
- Marketplace completo (proyectos disponibles, scorings IA)
- Performance histórica de proyectos
- Tipos de cambio fiat/crypto
- Información fiscal argentina y paraguaya

# Reglas importantes
1. NUNCA inventes números. Si no sabés, usá un tool o decí "no tengo ese dato"
2. NUNCA prometas retornos garantizados. Todo retorno es proyectado, no seguro
3. SIEMPRE menciona riesgos relevantes cuando recomendés algo
4. NO das asesoramiento legal o fiscal específico — recomendás consultar profesional
5. Si detectás posible señal de problema (compulsión, endeudamiento), sugerí moderación
6. Siempre verificá perfil antes de recomendar (riesgo, horizonte, capacidad)
7. Ofrecé opciones, no mandatos. El usuario decide.

# Formato de respuestas
- Cortas y directas para consultas simples
- Estructuradas con headers + bullets para análisis complejos
- Usá emojis con moderación (🏗️ 💰 📊 ✅ ⚠️)
- Cuando muestres números, formato ARS/USD/USDT según contexto
- Cuando recomendés proyectos, siempre incluí: match score, por qué encaja, riesgos

# Tone guidelines por contexto
- Usuario nuevo → acogedor, educativo
- Usuario experimentado → directo, data-driven
- Usuario preocupado (bajada de mercado, etc) → empático, pero honesto
- Usuario con comportamiento riesgoso → cuidadoso, sugerí pausar

# Red flags a señalar proactivamente
- Concentración >40% en un solo proyecto
- Inversión > 20% del capital total en un solo movimiento
- Patrones que sugieran FOMO o pánico
- Proyectos con scoring D
- Historial de retiros crypto hacia addresses desconocidas

Hablá como un amigo que sabe de finanzas, no como un vendedor.`;

// ============================================
// TOOLS - Tool use (formato Anthropic) para datos reales
// ============================================
export const ANALYST_TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_user_profile',
    description:
      'Obtiene el perfil de inversión actual del usuario incluyendo riesgo, objetivos, capacidad.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_user_investments',
    description: 'Lista las inversiones actuales del usuario con performance.',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['all', 'active', 'confirmed', 'completed'],
          description: 'Filtro por estado',
        },
      },
    },
  },
  {
    name: 'get_user_wallet_balance',
    description: 'Obtiene el balance actual de la wallet (fiat + crypto).',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'search_projects',
    description: 'Busca proyectos en el marketplace filtrando por criterios.',
    input_schema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'Ciudad o país' },
        min_return: { type: 'number', description: 'Retorno mínimo esperado %' },
        max_investment: { type: 'number', description: 'Inversión máxima USD' },
        project_type: {
          type: 'string',
          enum: ['residential', 'commercial', 'mixed', 'land', 'any'],
        },
        rating: {
          type: 'string',
          enum: ['A_plus', 'A', 'B', 'C', 'D', 'any'],
          description: 'Scoring IA mínimo',
        },
        limit: { type: 'number', description: 'Máximo de resultados (default 5)' },
      },
    },
  },
  {
    name: 'analyze_project_for_user',
    description:
      'Analiza qué tan bien encaja un proyecto específico con el perfil del usuario.',
    input_schema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: 'UUID del proyecto' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_portfolio_stats',
    description:
      'Calcula estadísticas del portfolio: diversificación, exposición, performance.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_exchange_rate',
    description: 'Obtiene tipo de cambio entre monedas (fiat o crypto).',
    input_schema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Moneda origen (USD, ARS, PYG, USDT, etc)' },
        to: { type: 'string', description: 'Moneda destino' },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'calculate_expected_returns',
    description: 'Calcula retornos proyectados de una inversión hipotética.',
    input_schema: {
      type: 'object',
      properties: {
        project_id: { type: 'string' },
        amount_usd: { type: 'number' },
        include_tax: { type: 'boolean' },
        country: { type: 'string', enum: ['AR', 'PY', 'UY', 'BO'] },
      },
      required: ['project_id', 'amount_usd'],
    },
  },
  {
    name: 'create_recommendation',
    description:
      'Crea una recomendación formal guardada para el usuario (requiere confirmación).',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['project_match', 'rebalance', 'tax_optimization', 'diversification'],
        },
        title: { type: 'string' },
        description: { type: 'string' },
        project_ids: { type: 'array', items: { type: 'string' } },
        reasoning: { type: 'string' },
        match_score: { type: 'number' },
      },
      required: ['type', 'title', 'reasoning'],
    },
  },
  {
    name: 'save_memory',
    description:
      'Guarda información importante sobre el usuario para recordar entre conversaciones. Usar cuando el usuario comparte preferencias, objetivos, preocupaciones, decisiones, o hechos clave que deban persistir.',
    input_schema: {
      type: 'object',
      properties: {
        memory_type: {
          type: 'string',
          enum: [
            'user_preference',
            'decision',
            'context',
            'important_fact',
            'goal',
            'concern',
          ],
          description: 'Categoría de la memoria',
        },
        summary: {
          type: 'string',
          description: 'Resumen en 1 oración. Ej: "Prefiere proyectos residenciales en Paraguay"',
        },
        details: {
          type: 'string',
          description: 'Contexto adicional opcional',
        },
        importance: {
          type: 'integer',
          description: '0-10, default 5. 8+ para hechos críticos como "es contador matriculado"',
        },
      },
      required: ['memory_type', 'summary'],
    },
  },
];

// ============================================
// CORE: ejecutar conversación con tool use
// ============================================
export async function runAnalystConversation(params: {
  userId: string;
  conversationHistory: Anthropic.MessageParam[];
  userMessage: string;
  executeToolCall: (name: string, args: any) => Promise<any>;
}): Promise<{
  response: string;
  toolCallsExecuted: Array<{ name: string; args: any; result: any }>;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
}> {
  const messages: Anthropic.MessageParam[] = [
    ...params.conversationHistory,
    { role: 'user', content: params.userMessage },
  ];

  const toolCallsExecuted: Array<{ name: string; args: any; result: any }> = [];
  let totalTokensInput = 0;
  let totalTokensOutput = 0;

  const MAX_ITERATIONS = 5;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.analyst,
      max_tokens: 2048,
      system: SUELO_ANALYST_SYSTEM_PROMPT,
      tools: ANALYST_TOOLS,
      messages,
    });

    totalTokensInput += response.usage.input_tokens;
    totalTokensOutput += response.usage.output_tokens;

    // Echo completo de la respuesta del assistant (preserva tool_use blocks)
    messages.push({ role: 'assistant', content: response.content });

    // Si no hay tool_use → terminamos
    if (response.stop_reason !== 'tool_use') {
      const finalText = extractText(response.content);
      const costUsd = calculateClaudeCost(
        CLAUDE_MODELS.analyst,
        totalTokensInput,
        totalTokensOutput
      );
      return {
        response: finalText,
        toolCallsExecuted,
        tokensInput: totalTokensInput,
        tokensOutput: totalTokensOutput,
        costUsd,
      };
    }

    // Extraer y ejecutar tool_use blocks en paralelo
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
      toolUseBlocks.map(async (toolUse) => {
        try {
          const result = await params.executeToolCall(toolUse.name, toolUse.input);
          toolCallsExecuted.push({
            name: toolUse.name,
            args: toolUse.input,
            result,
          });
          return {
            type: 'tool_result' as const,
            tool_use_id: toolUse.id,
            content: JSON.stringify(result),
          };
        } catch (error: any) {
          return {
            type: 'tool_result' as const,
            tool_use_id: toolUse.id,
            content: JSON.stringify({ error: error.message ?? 'tool execution failed' }),
            is_error: true,
          };
        }
      })
    );

    messages.push({ role: 'user', content: toolResults });
  }

  // Si excedió iteraciones, devolvemos el último texto disponible
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const fallbackText =
    lastAssistant && Array.isArray(lastAssistant.content)
      ? extractText(lastAssistant.content as Anthropic.ContentBlock[])
      : 'Alcancé el límite de iteraciones procesando tu consulta. ¿Podés reformularla?';

  return {
    response: fallbackText,
    toolCallsExecuted,
    tokensInput: totalTokensInput,
    tokensOutput: totalTokensOutput,
    costUsd: calculateClaudeCost(CLAUDE_MODELS.analyst, totalTokensInput, totalTokensOutput),
  };
}

// ============================================
// ONBOARDING - Perfil de riesgo conversacional
// ============================================
export const ONBOARDING_SYSTEM_PROMPT = `Sos el asistente de onboarding de Suelo.

Tu tarea es construir el perfil de inversión de un usuario nuevo via conversación natural.

# Campos a completar
- risk_profile: conservative | moderate | aggressive
- time_horizon: short (<1 año) | medium (1-3 años) | long (>3 años)
- experience_level: beginner | intermediate | advanced
- investment_goals: array de goals (retirement, house, diversification, passive_income, inflation_hedge)
- monthly_capacity: capacidad de inversión mensual en USD
- preferred_locations: ciudades/países de interés
- preferred_project_types: residential, commercial, mixed, land

# Reglas
- NO hagas un formulario. Conversá naturalmente.
- Hacé máximo 1-2 preguntas por mensaje
- Adaptá el tono según respuestas (si es beginner, más explicación)
- Si detectás respuestas contradictorias, aclarar con empatía
- Terminá el onboarding cuando tengas los campos core (risk, horizon, goals, capacity)

# Output esperado
Cuando termines, llamá al tool 'save_user_profile' con los datos completos.
Antes de guardar, mostrá un resumen y pedí confirmación.

# Ejemplo de flow
1. "¡Bienvenido a Suelo! Soy tu analista IA. Antes de mostrarte proyectos, me gustaría conocerte. ¿Es la primera vez que invertís en real estate?"
2. [escucha respuesta, adapta]
3. "Entiendo. ¿Qué te motiva a invertir? ¿Construir patrimonio a largo plazo, generar ingresos pasivos, protegerte de la inflación?"
4. [...]
5. Al final: "Perfecto, armé tu perfil: [resumen]. ¿Confirmás?"
`;

export const ONBOARDING_TOOLS: Anthropic.Tool[] = [
  {
    name: 'save_user_profile',
    description: 'Guarda el perfil de inversión del usuario al terminar onboarding.',
    input_schema: {
      type: 'object',
      properties: {
        risk_profile: {
          type: 'string',
          enum: ['conservative', 'moderate', 'aggressive'],
        },
        time_horizon: {
          type: 'string',
          enum: ['short', 'medium', 'long'],
        },
        experience_level: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced'],
        },
        investment_goals: {
          type: 'array',
          items: { type: 'string' },
        },
        monthly_capacity: { type: 'number' },
        preferred_locations: {
          type: 'array',
          items: { type: 'string' },
        },
        preferred_project_types: {
          type: 'array',
          items: { type: 'string' },
        },
        summary_for_user: {
          type: 'string',
          description: 'Resumen amigable del perfil para mostrar al usuario',
        },
      },
      required: [
        'risk_profile',
        'time_horizon',
        'experience_level',
        'summary_for_user',
      ],
    },
  },
];
