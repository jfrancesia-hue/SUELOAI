import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { demoMovements, demoProfiles, demoWallet, normalizeDemoRole } from '@/lib/demo-session';
import { createAdminClient, createClient } from '@/lib/supabase-server';
import { ensureWallet } from '@/lib/wallet/server';

export async function GET() {
  const demoRole = normalizeDemoRole(cookies().get('suelo_demo_role')?.value);
  if (demoRole) {
    const balance = Number(cookies().get('suelo_demo_wallet_balance')?.value || (demoRole === 'investor' ? 10000 : 2500));
    return NextResponse.json({
      wallet: demoWallet(demoRole, balance),
      movements: demoMovements(demoRole, balance),
      profile: {
        ...demoProfiles[demoRole],
        kyc_status: 'approved',
        investor_level: demoRole === 'investor' ? 'gold' : 'operator',
      },
      paymentMethods: [],
      mode: 'demo',
    });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createAdminClient();
  const wallet = await ensureWallet(admin as any, user.id);

  const [movementsRes, profileRes, paymentMethodsRes] = await Promise.all([
    admin
      .from('wallet_movements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(80),
    admin
      .from('profiles')
      .select('id, email, full_name, kyc_verified, kyc_status, investor_level')
      .eq('id', user.id)
      .single(),
    admin
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  if (movementsRes.error) {
    return NextResponse.json({ error: movementsRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    wallet,
    movements: movementsRes.data || [],
    profile: profileRes.data || null,
    paymentMethods: paymentMethodsRes.data || [],
  });
}
