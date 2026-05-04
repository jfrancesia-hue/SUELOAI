import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { demoProjects } from '@/lib/demo-data';
import { normalizeDemoRole } from '@/lib/demo-session';
import { slugify } from '@/utils/helpers';

// GET /api/projects - Listar proyectos públicos
export async function GET(request: NextRequest) {
  const demoRole = normalizeDemoRole(cookies().get('suelo_demo_role')?.value);
  if (demoRole) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20');

    let data = [...demoProjects];
    if (status) data = data.filter((project) => project.status === status);
    if (featured === 'true') data = data.filter((project) => project.featured);

    return NextResponse.json({ data: data.slice(0, limit), mode: 'demo' });
  }

  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const featured = searchParams.get('featured');
  const limit = parseInt(searchParams.get('limit') || '20');

  let query = supabase
    .from('projects')
    .select('*, developer:profiles(full_name, company_name)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);
  if (featured === 'true') query = query.eq('featured', true);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/projects - Crear proyecto (developers only)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'developer') {
    return NextResponse.json({ error: 'Solo desarrolladores pueden crear proyectos' }, { status: 403 });
  }

  const body = await request.json();
  const slug = slugify(body.title) + '-' + Date.now().toString(36);

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...body,
      slug,
      developer_id: user.id,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
