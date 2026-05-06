/**
 * POST /api/ai/onboarding
 *
 * Conversación de onboarding con Claude. Construye el perfil de inversión
 * conversacionalmente y persiste en ai_user_profiles cuando detecta el tool
 * save_user_profile.
 *
 * Cliente envía: { messages: [{role, content}...] }
 * Cliente recibe: { reply, onboarding_complete, profile? }
 */

import { createClient } from '@/lib/supabase-server';
import { anthropic, CLAUDE_MODELS, extractText } from '@/lib/anthropic/client';
import {
  ONBOARDING_SYSTEM_PROMPT,
  ONBOARDING_TOOLS,
} from '@/lib/ai/analyst/core';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const incoming: Array<{ role: 'user' | 'assistant'; content: string }> =
    body.messages || [];

  if (!Array.isArray(incoming) || incoming.length === 0) {
    return NextResponse.json({ error: 'messages requerido' }, { status: 400 });
  }

  // Sanitizar history al formato Anthropic
  const messages: Anthropic.MessageParam[] = incoming
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }));

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.analyst,
      max_tokens: 1024,
      system: ONBOARDING_SYSTEM_PROMPT,
      tools: ONBOARDING_TOOLS,
      messages,
    });

    // ¿La IA decidió guardar el perfil?
    const saveProfileBlock = response.content.find(
      (b): b is Anthropic.ToolUseBlock =>
        b.type === 'tool_use' && b.name === 'save_user_profile'
    );

    if (saveProfileBlock) {
      const profile = saveProfileBlock.input as any;

      // Upsert del perfil IA
      const { error } = await supabase
        .from('ai_user_profiles')
        .upsert(
          {
            user_id: user.id,
            risk_profile: profile.risk_profile,
            time_horizon: profile.time_horizon,
            experience_level: profile.experience_level,
            investment_goals: profile.investment_goals || [],
            monthly_capacity: profile.monthly_capacity || null,
            preferred_locations: profile.preferred_locations || [],
            preferred_project_types: profile.preferred_project_types || [],
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('[onboarding] upsert ai_user_profiles failed:', error.message);
      }

      return NextResponse.json({
        reply: profile.summary_for_user,
        onboarding_complete: true,
        profile: {
          risk_profile: profile.risk_profile,
          time_horizon: profile.time_horizon,
          experience_level: profile.experience_level,
          investment_goals: profile.investment_goals || [],
          monthly_capacity: profile.monthly_capacity,
          preferred_locations: profile.preferred_locations || [],
          preferred_project_types: profile.preferred_project_types || [],
        },
      });
    }

    return NextResponse.json({
      reply: extractText(response.content),
      onboarding_complete: false,
    });
  } catch (error: any) {
    console.error('[onboarding] failed:', error);
    return NextResponse.json(
      { error: error.message || 'Error en onboarding' },
      { status: 500 }
    );
  }
}
