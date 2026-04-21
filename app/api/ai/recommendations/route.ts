/**
 * GET  /api/ai/recommendations  → lista recomendaciones activas del usuario
 * POST /api/ai/recommendations  → genera nuevas recomendaciones personalizadas con Claude
 *
 * La generación cruza el perfil IA del usuario, su cartera actual y los
 * proyectos disponibles para producir matches con match_score.
 */

import { createClient } from '@/lib/supabase-server';
import { anthropic, CLAUDE_MODELS, parseJsonResponse, extractText } from '@/lib/anthropic/client';
import { limitByIp } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data } = await supabase
    .from('ai_recommendations')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('match_score', { ascending: false })
    .limit(10);

  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest) {
  // Rate limit agresivo: generar recs con Claude Opus cuesta tokens
  const rl = await limitByIp(request, 'ai-recs', { requests: 5, window: 3600 });
  if (!rl.success) return rl.response;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // 1) Cargar perfil IA + cartera + proyectos disponibles
  const [profileRes, investmentsRes, projectsRes] = await Promise.all([
    supabase.from('ai_user_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('investments')
      .select('amount, project:projects(id, title, location, project_type)')
      .eq('investor_id', user.id)
      .eq('status', 'confirmed'),
    supabase
      .from('projects')
      .select(
        `id, title, location, project_type, token_price, expected_return,
         return_period_months, sold_tokens, total_tokens,
         score:project_scores(rating, overall_score)`
      )
      .in('status', ['funding', 'funded'])
      .limit(30),
  ]);

  if (!profileRes.data) {
    return NextResponse.json(
      {
        error:
          'Perfil de inversión no encontrado. Completá el onboarding primero.',
        action: 'start_onboarding',
      },
      { status: 400 }
    );
  }

  const profile = profileRes.data;
  const investments = investmentsRes.data || [];
  const projects = projectsRes.data || [];

  if (projects.length === 0) {
    return NextResponse.json({
      data: [],
      message: 'No hay proyectos disponibles en este momento.',
    });
  }

  // 2) Pedir a Claude que genere matches
  const userPrompt = `PERFIL DEL INVERSOR:
- Risk profile: ${profile.risk_profile}
- Horizonte: ${profile.time_horizon}
- Experiencia: ${profile.experience_level}
- Capacidad mensual USD: ${profile.monthly_capacity || 'no declarada'}
- Ubicaciones preferidas: ${profile.preferred_locations?.join(', ') || 'cualquiera'}
- Tipos preferidos: ${profile.preferred_project_types?.join(', ') || 'cualquiera'}

CARTERA ACTUAL (${investments.length} inversiones):
${
  investments.length === 0
    ? '(vacía)'
    : investments
        .map(
          (i: any) =>
            `- ${i.project?.title} (${i.project?.location}, ${i.project?.project_type}): USD ${i.amount}`
        )
        .join('\n')
}

PROYECTOS DISPONIBLES:
${projects
  .map(
    (p: any) => `
ID: ${p.id}
Título: ${p.title}
Ubicación: ${p.location}
Tipo: ${p.project_type}
Retorno: ${p.expected_return}% en ${p.return_period_months} meses
Precio token USD: ${p.token_price}
Rating IA: ${(p.score as any)?.[0]?.rating || 'sin rating'} (score ${
      (p.score as any)?.[0]?.overall_score || 'N/A'
    })
`
  )
  .join('\n')}

Generá hasta 5 recomendaciones ordenadas por match_score (0-100).

Devolvé SOLO un JSON válido (sin texto adicional, sin code fences) con esta forma:
{
  "recommendations": [
    {
      "project_id": "<uuid>",
      "match_score": <integer 0-100>,
      "rank": <integer>,
      "reasoning": "<por qué matchea, 2-3 oraciones>",
      "suggested_amount_usd": <number>,
      "risk_alert": "<alerta o string vacío>",
      "highlight": "<fortaleza clave>"
    }
  ],
  "overall_advice": "<consejo general 2 oraciones>",
  "diversification_alert": "<alerta si hay concentración, o string vacío>"
}`;

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.scoring,
      max_tokens: 3000,
      system:
        'Sos el analista IA de Suelo. Matcheás inversores con proyectos de real estate LATAM considerando riesgo, horizonte, diversificación y rating IA. Respondés SIEMPRE con JSON válido, sin texto adicional ni code fences.',
      messages: [{ role: 'user', content: userPrompt }],
    });

    const parsed = parseJsonResponse<{
      recommendations: Array<{
        project_id: string;
        match_score: number;
        rank: number;
        reasoning: string;
        suggested_amount_usd?: number;
        risk_alert?: string;
        highlight: string;
      }>;
      overall_advice: string;
      diversification_alert?: string;
    }>(extractText(response.content));

    // 3) Invalidar recomendaciones activas previas y persistir las nuevas
    await supabase
      .from('ai_recommendations')
      .update({ status: 'expired' })
      .eq('user_id', user.id)
      .eq('status', 'active');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const toInsert = parsed.recommendations.map((r) => ({
      user_id: user.id,
      type: 'project_match',
      title: r.highlight,
      description: r.reasoning,
      project_ids: [r.project_id],
      reasoning: r.reasoning,
      match_score: r.match_score,
      suggested_amount_usd: r.suggested_amount_usd || null,
      risk_alert: r.risk_alert || null,
      status: 'active',
      expires_at: expiresAt,
    }));

    const { data: saved } = await supabase
      .from('ai_recommendations')
      .insert(toInsert)
      .select();

    return NextResponse.json({
      data: saved || [],
      overall_advice: parsed.overall_advice,
      diversification_alert: parsed.diversification_alert || null,
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
    });
  } catch (error: any) {
    console.error('[recommendations] failed:', error);
    return NextResponse.json(
      { error: error.message || 'Error generando recomendaciones' },
      { status: 500 }
    );
  }
}
