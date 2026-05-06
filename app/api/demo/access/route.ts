import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function publicDemoEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_PUBLIC_DEMO_ACCESS !== 'false';
}

export async function GET(request: NextRequest) {
  if (!publicDemoEnabled()) {
    return NextResponse.redirect(new URL('/login?demo=disabled', request.url));
  }

  const redirectTo = request.nextUrl.searchParams.get('redirect');
  const role = request.nextUrl.searchParams.get('role') || 'admin';
  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : role === 'developer'
        ? '/developer'
        : role === 'investor'
          ? '/investor'
          : '/admin';

  const response = NextResponse.redirect(new URL(safeRedirect, request.url));
  response.cookies.set('suelo_public_demo', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
  response.cookies.set('suelo_public_demo_role', role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}
