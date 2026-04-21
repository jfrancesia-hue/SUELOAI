/**
 * Layout del dashboard.
 *
 * Todo lo que cuelga de (dashboard) depende de la sesión del usuario
 * y lee Supabase via cookies — por eso forzamos renderizado dinámico
 * y no cacheamos fetches entre usuarios.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
