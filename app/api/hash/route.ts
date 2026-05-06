import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { generateHash } from '@/utils/hash';

// POST /api/hash - Generar hash de datos arbitrarios
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { data, project_id, document_id } = body;

  if (!data) {
    return NextResponse.json({ error: 'Datos requeridos para generar hash' }, { status: 400 });
  }

  const hash = await generateHash(data);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Registrar en hash_records
  const { data: record, error } = await supabase
    .from('hash_records')
    .insert({
      hash,
      algorithm: 'SHA-256',
      data_snapshot: typeof data === 'object' ? data : { raw: data },
      project_id: project_id || null,
      document_id: document_id || null,
      verified: true,
      verification_url: `${appUrl}/verify/${hash}`,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    // Hash duplicado = ya existe
    if (error.code === '23505') {
      return NextResponse.json({
        hash,
        verification_url: `${appUrl}/verify/${hash}`,
        message: 'Hash ya registrado previamente',
        exists: true,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    hash,
    record_id: record.id,
    verification_url: `${appUrl}/verify/${hash}`,
    exists: false,
  }, { status: 201 });
}
