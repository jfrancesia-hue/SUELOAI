import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase-server';
import { buildMovementHash, ensureWallet, walletNumber } from '@/lib/wallet/server';
import { createContractSnapshot, generateHash } from '@/utils/hash';

export async function GET(_request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('investments')
    .select('*, project:projects(title, location, token_price, expected_return, status)')
    .eq('investor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { project_id, tokens_purchased } = await request.json();
  const tokens = Math.floor(Number(tokens_purchased));

  if (!project_id || !tokens || tokens < 1) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 });
  }

  const admin = createAdminClient();

  const [{ data: profile }, { data: project }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', user.id).single(),
    admin
      .from('projects')
      .select('*, developer:profiles(full_name, company_name)')
      .eq('id', project_id)
      .single(),
  ]);

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  if (profile.role !== 'investor') {
    return NextResponse.json({ error: 'Solo los inversores pueden invertir' }, { status: 403 });
  }

  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  if (project.status !== 'funding') {
    return NextResponse.json({ error: 'Proyecto no acepta inversiones actualmente' }, { status: 400 });
  }

  const availableTokens = Number(project.total_tokens) - Number(project.sold_tokens);
  if (tokens > availableTokens) {
    return NextResponse.json({ error: `Solo quedan ${availableTokens} tokens disponibles` }, { status: 400 });
  }

  const amount = Math.round(tokens * Number(project.token_price) * 100) / 100;
  if (amount < Number(project.min_investment)) {
    return NextResponse.json({ error: `Inversion minima: USD ${project.min_investment}` }, { status: 400 });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const snapshot = createContractSnapshot({
    investorName: profile.full_name,
    investorDni: profile.dni || '',
    projectTitle: project.title,
    amount,
    tokens,
    date: dateStr,
  });
  const contractHash = await generateHash(snapshot);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/verify/${contractHash}`;

  let executed: unknown = null;
  const { data: rpcData, error } = await admin.rpc('execute_primary_investment', {
    p_user_id: user.id,
    p_project_id: project_id,
    p_tokens: tokens,
    p_contract_hash: contractHash,
    p_snapshot: JSON.parse(snapshot),
    p_verification_url: verificationUrl,
  });

  if (error) {
    const missingRpc = error.message?.toLowerCase().includes('execute_primary_investment');
    if (missingRpc) {
      try {
        executed = await executePrimaryInvestmentFallback({
          admin,
          userId: user.id,
          project,
          projectId: project_id,
          tokens,
          amount,
          contractHash,
          snapshot: JSON.parse(snapshot),
          verificationUrl,
        });
      } catch (fallbackError: any) {
        const message = fallbackError.message || 'No pudimos confirmar la inversion';
        const insufficientFunds = message.toLowerCase().includes('saldo insuficiente');

        return NextResponse.json(
          {
            error: message,
            code: insufficientFunds ? 'INSUFFICIENT_FUNDS' : 'INVESTMENT_FAILED',
          },
          { status: insufficientFunds ? 402 : 400 }
        );
      }
    } else {
    const message = error.message || 'No pudimos confirmar la inversion';
    const insufficientFunds = message.toLowerCase().includes('saldo insuficiente');

    return NextResponse.json(
      {
        error: message,
        code: insufficientFunds ? 'INSUFFICIENT_FUNDS' : 'INVESTMENT_FAILED',
      },
      { status: insufficientFunds ? 402 : 400 }
    );
    }
  } else {
    executed = rpcData;
  }

  const payload = executed as {
    investment?: Record<string, unknown>;
    wallet_movement?: Record<string, unknown>;
    verification_url?: string;
  };

  return NextResponse.json(
    {
      data: {
        ...(payload.investment || {}),
        contract_hash: contractHash,
        verification_url: payload.verification_url || verificationUrl,
        wallet_movement: payload.wallet_movement,
      },
    },
    { status: 201 }
  );
}

async function executePrimaryInvestmentFallback({
  admin,
  userId,
  project,
  projectId,
  tokens,
  amount,
  contractHash,
  snapshot,
  verificationUrl,
}: {
  admin: ReturnType<typeof createAdminClient>;
  userId: string;
  project: any;
  projectId: string;
  tokens: number;
  amount: number;
  contractHash: string;
  snapshot: Record<string, unknown>;
  verificationUrl: string;
}) {
  const wallet = await ensureWallet(admin as any, userId);
  const available = walletNumber(wallet.balance_available);

  if (!wallet.is_active) {
    throw new Error('La billetera esta inactiva');
  }

  if (available < amount) {
    throw new Error(`Saldo insuficiente. Necesitas USD ${amount.toFixed(2)} y tenes USD ${available.toFixed(2)}`);
  }

  const { data: investment, error: investmentError } = await admin
    .from('investments')
    .insert({
      investor_id: userId,
      project_id: projectId,
      tokens_purchased: tokens,
      amount,
      status: 'confirmed',
      contract_hash: contractHash,
      notes: 'Ejecutada desde wallet Suelo',
    })
    .select('*')
    .single();

  if (investmentError) throw investmentError;

  try {
    const movementHash = await buildMovementHash({
      user_id: userId,
      type: 'investment',
      amount,
      project_id: projectId,
      investment_id: investment.id,
    });

    const { data: movement, error: movementError } = await admin
      .from('wallet_movements')
      .insert({
        wallet_id: wallet.id,
        user_id: userId,
        type: 'investment',
        status: 'completed',
        amount,
        balance_before: available,
        balance_after: available - amount,
        currency: wallet.currency || 'USD',
        provider: 'internal',
        provider_reference: `INV-${String(investment.id).slice(0, 10).toUpperCase()}`,
        provider_metadata: { tokens, project_title: project.title, mode: 'api_fallback' },
        description: `Inversion en ${project.title}`,
        hash: movementHash,
        related_investment_id: investment.id,
        related_project_id: projectId,
      })
      .select('*')
      .single();

    if (movementError) throw movementError;

    await admin.from('hash_records').insert({
      investment_id: investment.id,
      project_id: projectId,
      hash: contractHash,
      algorithm: 'SHA-256',
      data_snapshot: snapshot,
      verified: true,
      verification_url: verificationUrl,
      created_by: userId,
    });

    await admin.from('transactions').insert({
      user_id: userId,
      investment_id: investment.id,
      project_id: projectId,
      type: 'investment',
      amount,
      description: `Inversion de ${tokens} tokens en ${project.title}`,
    });

    await admin.from('notifications').insert({
      user_id: userId,
      type: 'investment_confirmed',
      title: 'Inversion confirmada',
      body: `Tu inversion en ${project.title} fue confirmada y ya tiene hash verificable.`,
      link: `/verify/${contractHash}`,
      metadata: {
        investment_id: investment.id,
        project_id: projectId,
        amount,
        tokens,
        hash: contractHash,
      },
    });

    return {
      investment,
      wallet_movement: movement,
      verification_url: verificationUrl,
    };
  } catch (error) {
    await admin.from('investments').update({ status: 'cancelled' }).eq('id', investment.id);
    throw error;
  }
}
