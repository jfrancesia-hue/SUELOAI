import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const demoRole = request.cookies.get('suelo_demo_role')?.value;
  const hasDemoSession = demoRole === 'investor' || demoRole === 'developer';

  // Rutas protegidas del dashboard
  const protectedRoutes = [
    '/investor',
    '/developer',
    '/projects',
    '/marketplace',
    '/wallet',
    '/ai-analyst',
    '/assistant',
    '/crm',
    '/invoicing',
    '/secondary-market',
  ];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // Si no está autenticado y quiere acceder a ruta protegida
  if (!user && !hasDemoSession && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasDemoSession && (pathname === '/login' || pathname === '/register')) {
    const destination = demoRole === 'developer' ? '/developer' : '/wallet';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Si está autenticado y va a login/register, redirigir al dashboard
  if (user && (pathname === '/login' || pathname === '/register')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const destination = profile?.role === 'developer' ? '/developer' : '/investor';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api/verify|verify/).*)',
  ],
};
