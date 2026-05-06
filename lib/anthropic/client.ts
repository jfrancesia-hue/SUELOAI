/**
 * Anthropic Claude Client
 *
 * Reemplaza lib/openai/client.ts — toda la IA de Suelo corre sobre Claude:
 *   - Scoring de proyectos → Opus 4.7 (estructurado, JSON schema)
 *   - Extracción de facturas (Vision) → Opus 4.7 (mejor OCR / comprensión visual)
 *   - Asistente fiscal → Sonnet 4.6 (balance velocidad/calidad)
 *   - Reportes trimestrales → Sonnet 4.6
 *
 * Referencia: claude-api skill (Anthropic SDK oficial).
 */

import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ============================================
// MODELOS - configurables via env
// ============================================
export const CLAUDE_MODELS = {
  /** Opus 4.7 — scoring profundo, análisis complejo. $5/$25 por 1M tokens. */
  scoring: (process.env.ANTHROPIC_MODEL_SCORING || 'claude-opus-4-7') as 'claude-opus-4-7',
  /** Sonnet 4.6 — chat analyst, fiscal, reportes. $3/$15 por 1M tokens. */
  analyst: (process.env.ANTHROPIC_MODEL_ANALYST || 'claude-sonnet-4-6') as 'claude-sonnet-4-6',
  /** Haiku 4.5 — clasificación simple, onboarding. $1/$5 por 1M tokens. */
  fast: (process.env.ANTHROPIC_MODEL_FAST || 'claude-haiku-4-5') as 'claude-haiku-4-5',
  /** Vision (OCR de facturas) — Opus 4.7 es el mejor en high-res vision. */
  vision: (process.env.ANTHROPIC_MODEL_SCORING || 'claude-opus-4-7') as 'claude-opus-4-7',
} as const;

// Pricing por 1M tokens (USD). Fuente: platform.claude.com/pricing, cache 2026-04.
export const CLAUDE_PRICING: Record<string, { input: number; output: number }> = {
  'claude-opus-4-7': { input: 5.0, output: 25.0 },
  'claude-opus-4-6': { input: 5.0, output: 25.0 },
  'claude-sonnet-4-6': { input: 3.0, output: 15.0 },
  'claude-haiku-4-5': { input: 1.0, output: 5.0 },
};

export function calculateClaudeCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const price = CLAUDE_PRICING[model] ?? CLAUDE_PRICING['claude-sonnet-4-6'];
  return (inputTokens * price.input) / 1_000_000 + (outputTokens * price.output) / 1_000_000;
}

// ============================================
// HELPERS
// ============================================

/** Extrae todo el texto de los TextBlocks en la respuesta (ignora thinking/tool_use). */
export function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
}

/** Parsea JSON desde la respuesta de Claude, tolerando code fences y texto alrededor. */
export function parseJsonResponse<T = any>(text: string): T {
  // 1) Código dentro de ```json ... ```
  const fenceMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fenceMatch) return JSON.parse(fenceMatch[1]);

  // 2) Primer objeto JSON balanceado
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(text.slice(firstBrace, lastBrace + 1));
  }

  // 3) Fallback: parsear tal cual
  return JSON.parse(text);
}

// ============================================
// SCORING DE PROYECTOS
// Estructura JSON garantizada via json_schema.
// ============================================
export async function generateProjectScoring(projectData: {
  title: string;
  location: string;
  description: string;
  total_value: number;
  expected_return: number;
  return_period_months: number;
  developer_name: string;
  project_type?: string;
}) {
  const userPrompt = `Analizá este proyecto inmobiliario latinoamericano y devolveme un scoring detallado.

Proyecto: ${projectData.title}
Ubicación: ${projectData.location}
Descripción: ${projectData.description}
Valor total: USD ${projectData.total_value}
Retorno esperado: ${projectData.expected_return}% en ${projectData.return_period_months} meses
Desarrollador: ${projectData.developer_name}
Tipo: ${projectData.project_type || 'residencial'}`;

  const jsonInstruction = `Devolvé SOLO un JSON válido (sin texto adicional, sin code fences) con esta estructura exacta:
{
  "overall_score": <integer 0-100>,
  "rating": "<A_plus | A | B | C | D>",
  "location_score": <integer 0-100>,
  "developer_score": <integer 0-100>,
  "financial_score": <integer 0-100>,
  "documentation_score": <integer 0-100>,
  "market_score": <integer 0-100>,
  "risk_factors": ["<string>", "..."],
  "opportunities": ["<string>", "..."],
  "analysis": "<análisis ejecutivo 2-3 párrafos>"
}`;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODELS.scoring,
    max_tokens: 4096,
    system:
      'Sos un analista financiero experto en real estate LATAM (Argentina, Paraguay, Uruguay, Bolivia). Sos honesto sobre riesgos y oportunidades. Respondés SIEMPRE con JSON válido, sin texto adicional ni code fences.',
    messages: [{ role: 'user', content: `${userPrompt}\n\n${jsonInstruction}` }],
  });

  return parseJsonResponse(extractText(response.content));
}

// ============================================
// EXTRACCIÓN DE FACTURAS (VISION)
// ============================================
export async function extractInvoiceData(imageUrl: string) {
  const jsonInstruction = `Extraé los datos de la factura y devolvé SOLO un JSON válido (sin texto adicional, sin code fences) con esta forma:
{
  "supplier_name": "<razón social>",
  "supplier_cuit": "<CUIT/RUC>",
  "invoice_number": "<número>",
  "issue_date": "<YYYY-MM-DD>",
  "total": <number>,
  "tax_amount": <number>,
  "category": "<construccion | servicios | honorarios | impuestos | comercial | otro>",
  "confidence": <number 0-1>,
  "items": [{"description": "<string>", "amount": <number>}]
}
Si no podés leer algún campo, dejalo como cadena vacía ("").`;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODELS.vision,
    max_tokens: 2048,
    system:
      'Extraés datos estructurados de facturas argentinas (AFIP) y paraguayas (SIFEN) con máxima precisión. Respondés SIEMPRE con JSON válido, sin texto adicional ni code fences.',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'url', url: imageUrl },
          },
          { type: 'text', text: jsonInstruction },
        ],
      },
    ],
  });

  return parseJsonResponse(extractText(response.content));
}

// ============================================
// ASISTENTE FISCAL CONVERSACIONAL
// ============================================
export async function askFiscalAssistant(
  question: string,
  context: { totalInvoicedMonth: number; totalTaxMonth: number; invoiceCount: number }
): Promise<string> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODELS.analyst,
    max_tokens: 1024,
    system: `Sos un asistente fiscal para desarrolladores inmobiliarios en Argentina y Paraguay.
Contexto actual del usuario:
- Facturado este mes: $${context.totalInvoicedMonth} ARS
- IVA del mes: $${context.totalTaxMonth} ARS
- Facturas emitidas: ${context.invoiceCount}

Respondé de forma clara, concisa y práctica. Si no sabés algo, recomendá consultar con un contador matriculado. Nunca des consejos legales vinculantes.`,
    messages: [{ role: 'user', content: question }],
  });

  return extractText(response.content);
}

// ============================================
// REPORTE TRIMESTRAL PARA INVERSORES
// ============================================
export async function generateInvestorReport(projectData: {
  title: string;
  progress: number;
  milestones_completed: string[];
  total_raised: number;
  target: number;
  period: string;
}): Promise<string> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODELS.analyst,
    max_tokens: 2048,
    system:
      'Sos un comunicador profesional que escribe reportes trimestrales claros, transparentes y respetuosos para inversores de real estate. Tono: profesional, transparente, optimista pero realista.',
    messages: [
      {
        role: 'user',
        content: `Generá un reporte trimestral profesional para los inversores de ${projectData.title}.

Datos:
- Progreso: ${projectData.progress}%
- Hitos completados: ${projectData.milestones_completed.join(', ') || '(ninguno todavía)'}
- Recaudado: USD ${projectData.total_raised} de USD ${projectData.target}
- Período: ${projectData.period}

Estructura:
1. Resumen ejecutivo (2-3 oraciones)
2. Avance del proyecto
3. Hitos alcanzados
4. Próximos pasos
5. Mensaje al inversor`,
      },
    ],
  });

  return extractText(response.content);
}

// ============================================
// GENERADOR DE DESCRIPCIÓN DE PROYECTO (para developers)
// ============================================
export async function generateProjectDescription(projectData: {
  title: string;
  location: string;
  total_value: number;
  expected_return: number;
  return_period_months: number;
  project_type?: string;
  [key: string]: any;
}) {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODELS.analyst,
    max_tokens: 1500,
    system:
      'Escribís copy profesional para marketplaces inmobiliarios. Español latinoamericano natural. Sin hype ni clichés de marketing. Respondés SIEMPRE con JSON válido, sin texto adicional ni code fences.',
    messages: [
      {
        role: 'user',
        content: `Escribí una descripción atractiva y profesional para este proyecto inmobiliario en el marketplace de Suelo.

DATOS:
${JSON.stringify(projectData, null, 2)}

REQUISITOS:
- Español latinoamericano natural
- 3-4 párrafos de 2-3 oraciones
- Profesional pero humano, inspirador sin ser vendedor
- Datos concretos (ubicación, tipo)
- 3 beneficios únicos
- Cerrar con call-to-action sutil
- NADA de lenguaje hiper-marketing ("¡Oportunidad única!")
- No inventes datos que no están en la info

Devolvé SOLO un JSON válido con esta forma:
{
  "tagline": "<máx 10 palabras>",
  "description": "<3-4 párrafos>",
  "key_benefits": ["<string>", "<string>", "<string>"],
  "meta_description": "<máx 160 caracteres para SEO>"
}`,
      },
    ],
  });

  return parseJsonResponse(extractText(response.content));
}
