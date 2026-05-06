import { NextResponse } from 'next/server';
import { requireAdminProfile } from '@/lib/auth/server';
import { features } from '@/lib/config/features';
import { markets } from '@/lib/config/markets';

async function safeCount(admin: any, table: string, filter?: (q: any) => any) {
  let query = admin.from(table).select('id', { count: 'exact', head: true });
  if (filter) query = filter(query);
  const { count, error } = await query;
  if (error) return { count: 0, error: error.message };
  return { count: count || 0, error: null };
}

export async function GET() {
  const auth = await requireAdminProfile();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = auth.admin;
  const [users, developers, investors, projects, fundingProjects, investments, pendingKyc, pendingWallet, leads, contacts, conversations, invoices] = await Promise.all([
    safeCount(admin, 'profiles'),
    safeCount(admin, 'profiles', (q) => q.eq('role', 'developer')),
    safeCount(admin, 'profiles', (q) => q.eq('role', 'investor')),
    safeCount(admin, 'projects'),
    safeCount(admin, 'projects', (q) => q.eq('status', 'funding')),
    safeCount(admin, 'investments'),
    safeCount(admin, 'kyc_verifications', (q) => q.eq('status', 'pending')),
    safeCount(admin, 'wallet_movements', (q) => q.eq('status', 'pending')),
    safeCount(admin, 'crm_leads'),
    safeCount(admin, 'crm_contacts'),
    safeCount(admin, 'ai_conversations'),
    safeCount(admin, 'invoices'),
  ]);

  return NextResponse.json({
    markets,
    features,
    counts: {
      users: users.count,
      developers: developers.count,
      investors: investors.count,
      projects: projects.count,
      fundingProjects: fundingProjects.count,
      investments: investments.count,
      pendingKyc: pendingKyc.count,
      pendingWallet: pendingWallet.count,
      leads: leads.count,
      contacts: contacts.count,
      conversations: conversations.count,
      invoices: invoices.count,
    },
    warnings: [users, developers, investors, projects, fundingProjects, investments, pendingKyc, pendingWallet, leads, contacts, conversations, invoices]
      .filter((x) => x.error)
      .map((x) => x.error),
  });
}
