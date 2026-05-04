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
import { demoProfiles, normalizeDemoRole } from '@/lib/demo-session';

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
  const demoRole = normalizeDemoRole(cookies().get('suelo_demo_role')?.value);

  if (!user && demoRole) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-surface-50">
        <DashboardAtmosphere />
        <Sidebar profile={demoProfiles[demoRole]} />
        <main className="relative px-4 pb-10 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8">{children}</main>
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
    <div className="relative min-h-screen overflow-hidden bg-surface-50">
      <DashboardAtmosphere />
      <Sidebar profile={profile} />
      <main className="relative px-4 pb-10 pt-20 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}

function DashboardAtmosphere() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[360px] opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(10,10,10,0.05), #0a0a0a 88%), url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1800&q=75&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-[linear-gradient(120deg,rgba(16,185,129,0.12),transparent_38%,rgba(6,182,212,0.08)_72%,transparent)]" />
    </>
  );
}
