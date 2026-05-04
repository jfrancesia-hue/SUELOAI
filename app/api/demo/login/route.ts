import { NextRequest, NextResponse } from 'next/server';
import { demoProfiles, getDemoRoleFromEmail, isDemoModeEnabled, isDemoPassword } from '@/lib/demo-session';

export async function POST(request: NextRequest) {
  if (!isDemoModeEnabled()) {
    return NextResponse.json({ error: 'Modo demo deshabilitado' }, { status: 404 });
  }

  const { email, password } = await request.json();
  const role = getDemoRoleFromEmail(String(email || ''));

  if (!role || !isDemoPassword(String(password || ''))) {
    return NextResponse.json({ error: 'Credenciales demo invalidas' }, { status: 401 });
  }

  const response = NextResponse.json({
    ok: true,
    role,
    profile: demoProfiles[role],
    redirect: role === 'developer' ? '/developer' : '/wallet',
  });

  response.cookies.set('suelo_demo_role', role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set('suelo_demo_wallet_balance', role === 'investor' ? '10000' : '2500', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
