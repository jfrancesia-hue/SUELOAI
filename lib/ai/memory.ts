/**
 * AI Memory Manager — memoria persistente del analyst entre sesiones.
 *
 * Flujo:
 *  1. Antes de cada conversación, el analyst recupera top N memorias activas
 *     (por importancia + frescura) y las inyecta en su system prompt.
 *  2. Durante la conversación, el analyst puede llamar al tool `save_memory`
 *     para persistir nuevo contexto relevante.
 *  3. Las memorias se auto-priorizan por `accessed_count` — cuanto más
 *     se usan, más alta su utilidad real.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type MemoryType =
  | 'user_preference'
  | 'decision'
  | 'context'
  | 'important_fact'
  | 'goal'
  | 'concern';

export interface AiMemory {
  id: string;
  user_id: string;
  memory_type: MemoryType;
  summary: string;
  details: string | null;
  importance: number;
  accessed_count: number;
  last_accessed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

/**
 * Recupera las top N memorias relevantes para el usuario, priorizando por
 * importancia y frescura.
 */
export async function getRelevantMemories(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 10
): Promise<AiMemory[]> {
  const { data } = await supabase
    .from('ai_memories')
    .select('*')
    .eq('user_id', userId)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('importance', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  return (data || []) as AiMemory[];
}

/**
 * Construye un bloque de texto para inyectar al system prompt con las
 * memorias activas del usuario, organizadas por tipo.
 */
export async function buildMemoryContext(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const memories = await getRelevantMemories(supabase, userId, 15);
  if (memories.length === 0) return '';

  // Agrupar por tipo para mejor lectura del modelo
  const groups: Record<MemoryType, AiMemory[]> = {
    user_preference: [],
    goal: [],
    concern: [],
    important_fact: [],
    decision: [],
    context: [],
  };
  for (const m of memories) groups[m.memory_type]?.push(m);

  const labels: Record<MemoryType, string> = {
    user_preference: '🎯 Preferencias',
    goal: '🏁 Objetivos',
    concern: '⚠️ Preocupaciones',
    important_fact: '📌 Hechos clave',
    decision: '✅ Decisiones pasadas',
    context: '📋 Contexto',
  };

  const sections: string[] = [];
  for (const [type, items] of Object.entries(groups)) {
    if (items.length === 0) continue;
    const lines = items.map((m) => `  - ${m.summary}`).join('\n');
    sections.push(`${labels[type as MemoryType]}:\n${lines}`);
  }

  if (sections.length === 0) return '';

  return `\n\n# MEMORIA DEL USUARIO (acumulada en conversaciones previas)
${sections.join('\n\n')}

Usá esta memoria para personalizar tu respuesta sin mencionarla explícitamente
(ej: no digas "veo que tu preferencia es..." — solo actuá acorde).`;
}

/**
 * Guarda una nueva memoria. Si ya existe una muy similar (mismo tipo + summary),
 * actualiza su importancia en vez de duplicar.
 */
export async function saveMemory(
  supabase: SupabaseClient,
  userId: string,
  params: {
    memory_type: MemoryType;
    summary: string;
    details?: string;
    importance?: number;
    source_conversation_id?: string;
    related_project_id?: string;
    expires_at?: string | null;
  }
): Promise<AiMemory | null> {
  // Búsqueda aproximada de duplicados (mismo tipo, summary similar)
  const { data: existing } = await supabase
    .from('ai_memories')
    .select('id, importance')
    .eq('user_id', userId)
    .eq('memory_type', params.memory_type)
    .ilike('summary', `%${params.summary.slice(0, 40)}%`)
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Reforzar memoria existente (incrementar importancia, actualizar timestamp)
    const newImportance = Math.min(10, Math.max(existing.importance, params.importance ?? 5) + 1);
    const { data } = await supabase
      .from('ai_memories')
      .update({ importance: newImportance, details: params.details ?? null })
      .eq('id', existing.id)
      .select()
      .single();
    return data as AiMemory;
  }

  const { data, error } = await supabase
    .from('ai_memories')
    .insert({
      user_id: userId,
      memory_type: params.memory_type,
      summary: params.summary,
      details: params.details ?? null,
      importance: params.importance ?? 5,
      source_conversation_id: params.source_conversation_id ?? null,
      related_project_id: params.related_project_id ?? null,
      expires_at: params.expires_at ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('[ai/memory] saveMemory failed:', error.message);
    return null;
  }

  return data as AiMemory;
}

/**
 * Marca memorias como accedidas (incrementa counter) — útil para analytics
 * y para priorizar memorias frecuentemente útiles.
 */
export async function touchMemories(
  supabase: SupabaseClient,
  memoryIds: string[]
): Promise<void> {
  if (memoryIds.length === 0) return;
  await Promise.all(
    memoryIds.map((id) => supabase.rpc('touch_ai_memory', { p_memory_id: id }))
  );
}

/** Borrar una memoria (ej: el usuario pidió olvidarla) */
export async function forgetMemory(
  supabase: SupabaseClient,
  userId: string,
  memoryId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('ai_memories')
    .delete()
    .eq('id', memoryId)
    .eq('user_id', userId);
  return !error;
}

/** Listar memorias (para UI de gestión) */
export async function listMemories(
  supabase: SupabaseClient,
  userId: string,
  opts?: { type?: MemoryType; limit?: number }
): Promise<AiMemory[]> {
  let query = supabase
    .from('ai_memories')
    .select('*')
    .eq('user_id', userId)
    .order('importance', { ascending: false });

  if (opts?.type) query = query.eq('memory_type', opts.type);
  if (opts?.limit) query = query.limit(opts.limit);

  const { data } = await query;
  return (data || []) as AiMemory[];
}
