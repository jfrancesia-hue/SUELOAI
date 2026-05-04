import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDemoProject } from '@/lib/demo-data';
import { normalizeDemoRole } from '@/lib/demo-session';
import { createClient } from '@/lib/supabase-server';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const demoRole = normalizeDemoRole(cookies().get('suelo_demo_role')?.value);
  if (demoRole) {
    const project = getDemoProject(params.id);
    if (!project) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    return NextResponse.json({ data: project, mode: 'demo' });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, developer:profiles(full_name, email, company_name)')
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}
