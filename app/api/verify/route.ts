import { createAdminClient } from '@/lib/supabase-server';
import { demoProjects } from '@/lib/demo-data';
import { demoProfiles, isDemoModeEnabled } from '@/lib/demo-session';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/verify?hash=xxx - Verificar hash público (no requiere auth)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ error: 'Hash requerido' }, { status: 400 });
  }

  // Usar admin client porque es endpoint público
  if (isDemoModeEnabled() && hash.startsWith('demo-')) {
    const project = demoProjects.find((item) => hash.includes(item.slug)) || demoProjects[0];
    return NextResponse.json({
      verified: true,
      algorithm: 'SHA-256',
      created_at: new Date().toISOString(),
      record_id: 'demo-hash-record',
      contract: {
        investor: demoProfiles.investor.full_name,
        project: project.title,
        location: project.location,
        amount: project.token_price,
        tokens: 1,
        expected_return: project.expected_return,
        return_period_months: project.return_period_months,
        date: new Date().toISOString(),
        status: 'confirmed',
      },
      mode: 'demo',
    });
  }

  const supabase = createAdminClient();

  const { data: record, error } = await supabase
    .from('hash_records')
    .select(`
      id, hash, algorithm, verified, created_at, data_snapshot,
      investment:investments(
        id, amount, tokens_purchased, created_at, status,
        investor:profiles(full_name),
        project:projects(title, location, expected_return, return_period_months)
      )
    `)
    .eq('hash', hash)
    .single();

  if (error || !record) {
    return NextResponse.json({
      verified: false,
      message: 'No se encontró un registro con este hash',
    }, { status: 404 });
  }

  const investment = record.investment as any;
  const project = investment?.project;

  return NextResponse.json({
    verified: record.verified,
    algorithm: record.algorithm,
    created_at: record.created_at,
    record_id: record.id,
    contract: {
      investor: investment?.investor?.full_name || 'N/A',
      project: project?.title || 'N/A',
      location: project?.location || 'N/A',
      amount: investment?.amount || 0,
      tokens: investment?.tokens_purchased || 0,
      expected_return: project?.expected_return || 0,
      return_period_months: project?.return_period_months || 0,
      date: investment?.created_at || null,
      status: investment?.status || 'unknown',
    },
  });
}
