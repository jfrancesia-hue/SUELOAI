import { createAdminClient, createClient } from '@/lib/supabase-server';
import type { Profile } from '@/types';

export async function getCurrentProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile: profile as Profile | null };
}

export async function requireAdminProfile() {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) return { error: 'No autorizado', status: 401 as const, user: null, profile: null };
  if (profile.role !== 'admin') return { error: 'Solo admins', status: 403 as const, user, profile };
  return { user, profile, admin: createAdminClient() };
}
