import { NextRequest, NextResponse } from 'next/server';
import { demoProfiles, getDemoRoleFromEmail, isDemoPassword } from '@/lib/demo-session';

export async function POST(request: NextRequest) {
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
