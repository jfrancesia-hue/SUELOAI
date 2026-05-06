import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase-server';
import { ensureWallet } from '@/lib/wallet/server';

export async function GET() {
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
