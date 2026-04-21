/**
 * POST /api/ai/generate-content
 *
 * Genera contenido asistido por IA para developers:
 *   - type="project_description" → copy de marketplace (tagline, descripción, bullets, meta)
 *   - type="investor_report"     → reporte trimestral para inversores
 *
 * Acceso: usuarios autenticados con role=developer.
 */

import { createClient } from '@/lib/supabase-server';
import {
  generateProjectDescription,
  generateInvestorReport,
} from '@/lib/anthropic/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { type } = body;

  if (!type || typeof type !== 'string') {
    return NextResponse.json({ error: 'type requerido' }, { status: 400 });
  }

  try {
    switch (type) {
      case 'project_description': {
        const { project_data } = body;
        if (!project_data || typeof project_data !== 'object') {
          return NextResponse.json({ error: 'project_data requerido' }, { status: 400 });
        }
        const content = await generateProjectDescription(project_data);
        return NextResponse.json({ data: content });
      }

      case 'investor_report': {
        const { project_data } = body;
        if (!project_data) {
          return NextResponse.json({ error: 'project_data requerido' }, { status: 400 });
        }
        const report = await generateInvestorReport({
          title: project_data.title,
          progress: Number(project_data.progress || 0),
          milestones_completed: project_data.milestones_completed || [],
          total_raised: Number(project_data.total_raised || 0),
          target: Number(project_data.target || 0),
          period: project_data.period || 'Q1 2026',
        });
        return NextResponse.json({ data: { report } });
      }

      default:
        return NextResponse.json(
          { error: `type no soportado: ${type}. Usá "project_description" o "investor_report".` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[generate-content] failed:', error);
    return NextResponse.json(
      { error: error.message || 'Error generando contenido' },
      { status: 500 }
    );
  }
}
