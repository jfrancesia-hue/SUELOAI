/**
 * Layout del dashboard.
 *
 * Todo lo que cuelga de (dashboard) depende de la sesión del usuario
 * y lee Supabase via cookies — por eso forzamos renderizado dinámico
 * y no cacheamos fetches entre usuarios.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Sidebar } from '@/components/layout/Sidebar';
import { createClient } from '@/lib/supabase-server';
import { demoProfiles } from '@/lib/demo-session';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const demoRole = cookies().get('suelo_demo_role')?.value;

  if (!user && (demoRole === 'investor' || demoRole === 'developer')) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Sidebar profile={demoProfiles[demoRole]} />
        <main className="px-4 pb-10 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8">{children}</main>
      </div>
    );
  }

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar profile={profile} />
      <main className="px-4 pb-10 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
