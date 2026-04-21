/**
 * GET    /api/ai/memories       → listar todas las memorias del usuario
 * POST   /api/ai/memories       → crear memoria manual
 * DELETE /api/ai/memories?id=X  → borrar memoria ("olvidar")
 *
 * Las memorias también pueden crearse indirectamente cuando el analyst
 * llama al tool `save_memory` en una conversación.
 */

import { createClient } from '@/lib/supabase-server';
import { listMemories, saveMemory, forgetMemory, type MemoryType } from '@/lib/ai/memory';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as MemoryType | null;

  const memories = await listMemories(supabase, user.id, {
    type: type ?? undefined,
    limit: 100,
  });

  return NextResponse.json({ data: memories });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  if (!body.summary || !body.memory_type) {
    return NextResponse.json(
      { error: 'summary y memory_type requeridos' },
      { status: 400 }
    );
  }

  const saved = await saveMemory(supabase, user.id, {
    memory_type: body.memory_type,
    summary: body.summary,
    details: body.details,
    importance: body.importance,
    related_project_id: body.related_project_id,
  });

  if (!saved) {
    return NextResponse.json({ error: 'No se pudo guardar la memoria' }, { status: 500 });
  }

  return NextResponse.json({ data: saved }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  const ok = await forgetMemory(supabase, user.id, id);
  if (!ok) return NextResponse.json({ error: 'No se pudo borrar' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
