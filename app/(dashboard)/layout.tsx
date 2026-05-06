/**
 * Layout del dashboard.
 *
 * Todo lo que cuelga de (dashboard) depende de la sesión del usuario
 * y lee Supabase via cookies; por eso forzamos renderizado dinámico
 * y no cacheamos fetches entre usuarios.
 */

import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { demoProfiles, isDemoMode } from '@/lib/demo';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isDemoMode()) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#06101D]">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(6,182,212,0.11),transparent_30%),linear-gradient(180deg,#06101D_0%,#08111F_48%,#05080D_100%)]" />
        <div className="pointer-events-none fixed inset-0 bg-grid-pattern bg-grid opacity-[0.05]" />
        <Sidebar profile={demoProfiles.admin} />
        <main className="relative px-4 pb-10 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101D]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(6,182,212,0.11),transparent_30%),linear-gradient(180deg,#06101D_0%,#08111F_48%,#05080D_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern bg-grid opacity-[0.05]" />
      <Sidebar profile={profile} />
      <main className="relative px-4 pb-10 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
