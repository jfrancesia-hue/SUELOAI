/**
 * POST /api/ai/analyze-project
 *
 * Genera (o regenera) el scoring IA de un proyecto y lo persiste en project_scores.
 * Acceso: developer dueño del proyecto o admin.
 */

import { createClient } from '@/lib/supabase-server';
import { generateProjectScoring } from '@/lib/anthropic/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { project_id } = await request.json();
  if (!project_id || typeof project_id !== 'string') {
    return NextResponse.json({ error: 'project_id requerido' }, { status: 400 });
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*, developer:profiles!developer_id(full_name, company_name)')
    .eq('id', project_id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  // Autorización: developer del proyecto o admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isOwner = project.developer_id === user.id;
  const isAdmin = profile?.role === 'admin';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }

  try {
    const scoring = await generateProjectScoring({
      title: project.title,
      location: project.location,
      description: project.description || '',
      total_value: Number(project.total_value),
      expected_return: Number(project.expected_return),
      return_period_months: project.return_period_months,
      developer_name:
        (project.developer as any)?.company_name ||
        (project.developer as any)?.full_name ||
        'Desarrollador',
      project_type: project.project_type,
    });

    // Upsert en project_scores
    const { data: saved, error } = await supabase
      .from('project_scores')
      .upsert(
        {
          project_id,
          overall_score: scoring.overall_score,
          rating: scoring.rating,
          location_score: scoring.location_score,
          developer_score: scoring.developer_score,
          financial_score: scoring.financial_score,
          documentation_score: scoring.documentation_score,
          market_score: scoring.market_score,
          risk_factors: scoring.risk_factors,
          opportunities: scoring.opportunities,
          ai_analysis: scoring.analysis,
          generated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' }
      )
      .select()
      .single();

    if (error) {
      // Si la tabla no tiene UNIQUE(project_id), fallback a insert simple
      console.error('[analyze-project] upsert error, fallback to insert:', error.message);
      const fallback = await supabase
        .from('project_scores')
        .insert({
          project_id,
          overall_score: scoring.overall_score,
          rating: scoring.rating,
          location_score: scoring.location_score,
          developer_score: scoring.developer_score,
          financial_score: scoring.financial_score,
          documentation_score: scoring.documentation_score,
          market_score: scoring.market_score,
          risk_factors: scoring.risk_factors,
          opportunities: scoring.opportunities,
          ai_analysis: scoring.analysis,
        })
        .select()
        .single();

      return NextResponse.json({ data: fallback.data, scoring });
    }

    return NextResponse.json({ data: saved, scoring });
  } catch (error: any) {
    console.error('[analyze-project] failed:', error);
    return NextResponse.json(
      { error: error.message || 'Error generando análisis' },
      { status: 500 }
    );
  }
}
