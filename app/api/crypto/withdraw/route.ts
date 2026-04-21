import { createClient } from '@/lib/supabase-server';
import { isValidAddress } from '@/lib/crypto/hd-wallet';
import { getExchangeRate } from '@/lib/crypto/rates';
import { NextRequest, NextResponse } from 'next/server';
import type { CryptoNetwork, CryptoToken } from '@/types/crypto';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'no-reply@suelo.ai';
const ADMIN_EMAILS = (process.env.ADMIN_NOTIFY_EMAILS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Verificar KYC
  const { data: profile } = await supabase
    .from('profiles')
    .select('kyc_status')
    .eq('id', user.id)
    .single();

  if (profile?.kyc_status !== 'approved') {
    return NextResponse.json({
      error: 'KYC requerido para retiros crypto',
      action: 'complete_kyc',
    }, { status: 403 });
  }

  const {
    amount_usd,
    network,
    token,
    destination_address,
    memo,
  } = await request.json();

  // Validaciones
  if (!amount_usd || amount_usd < 10) {
    return NextResponse.json({ error: 'Monto mínimo: USD 10' }, { status: 400 });
  }

  if (!isValidAddress(destination_address, network)) {
    return NextResponse.json({ error: 'Address destino inválida' }, { status: 400 });
  }

  // Obtener wallet y verificar saldo
  const { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance_available')
    .eq('user_id', user.id)
    .single();

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet no encontrada' }, { status: 404 });
  }

  // Fee de plataforma (1% en retiros crypto)
  const platformFeeUsd = Math.max(2, amount_usd * 0.01);
  // Fee de red estimado
  const networkFeeUsd = network === 'polygon' ? 0.1 :
                       network === 'tron' ? 2 :
                       network === 'ethereum' ? 15 : 1;

  const totalDebitUsd = amount_usd + platformFeeUsd + networkFeeUsd;

  if (Number(wallet.balance_available) < totalDebitUsd) {
    return NextResponse.json({
      error: `Saldo insuficiente. Necesitás $${totalDebitUsd.toFixed(2)} (incluye fees)`,
    }, { status: 400 });
  }

  // Convertir USD a crypto (stablecoin = 1:1)
  const rate = await getExchangeRate('USD', token, supabase);
  const amountCrypto = amount_usd / rate;

  // Crear withdrawal request (requiere aprobación si > threshold)
  const requiresApproval = amount_usd > 1000;
  const confirmationToken = randomBytes(32).toString('hex');

  const { data: withdrawal, error } = await supabase
    .from('crypto_withdrawal_requests')
    .insert({
      user_id: user.id,
      wallet_id: wallet.id,
      amount_usd,
      amount_crypto: amountCrypto,
      network,
      token,
      destination_address,
      memo: memo || null,
      status: requiresApproval ? 'pending_approval' : 'pending',
      network_fee_estimated: networkFeeUsd,
      platform_fee_usd: platformFeeUsd,
      total_debit_usd: totalDebitUsd,
      email_verified: false,
      confirmation_token: confirmationToken,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notificaciones (no bloquean la respuesta al usuario)
  const userEmail = user.email;

  // 1) Email de confirmación al usuario
  if (resend && userEmail) {
    const confirmUrl = `${APP_URL}/api/crypto/withdraw/confirm?token=${confirmationToken}&id=${withdrawal.id}`;
    resend.emails
      .send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `Confirmá tu retiro de ${amountCrypto.toFixed(2)} ${token}`,
        html: buildConfirmEmail({
          amountCrypto,
          token,
          network,
          destination: destination_address,
          confirmUrl,
        }),
      })
      .catch((err) => console.error('[withdraw] resend user email failed:', err));
  }

  // 2) Si requiere aprobación → notificar admins
  if (requiresApproval && resend && ADMIN_EMAILS.length > 0) {
    resend.emails
      .send({
        from: FROM_EMAIL,
        to: ADMIN_EMAILS,
        subject: `[Suelo] Retiro requiere aprobación: USD ${amount_usd}`,
        html: buildAdminEmail({
          withdrawalId: withdrawal.id,
          userId: user.id,
          userEmail: userEmail || '(sin email)',
          amountUsd: amount_usd,
          token,
          network,
          destination: destination_address,
        }),
      })
      .catch((err) => console.error('[withdraw] resend admin email failed:', err));
  }

  return NextResponse.json({
    data: withdrawal,
    message: requiresApproval
      ? 'Solicitud creada. Requiere aprobación manual (montos >$1000). Te avisamos por email.'
      : 'Solicitud creada. Revisá tu email para confirmar el retiro.',
  });
}

function buildConfirmEmail(p: {
  amountCrypto: number;
  token: string;
  network: string;
  destination: string;
  confirmUrl: string;
}): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="color:#00C853;">Confirmá tu retiro en Suelo</h2>
      <p>Recibimos una solicitud para retirar desde tu wallet:</p>
      <ul>
        <li><b>Monto:</b> ${p.amountCrypto.toFixed(6)} ${p.token}</li>
        <li><b>Red:</b> ${p.network}</li>
        <li><b>Destino:</b> <code>${p.destination}</code></li>
      </ul>
      <p>Si fuiste vos, confirmá el retiro:</p>
      <p><a href="${p.confirmUrl}" style="background:#00C853;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Confirmar retiro</a></p>
      <p style="color:#888;font-size:13px;margin-top:24px;">Si no solicitaste este retiro, ignorá este email y revisá la seguridad de tu cuenta.</p>
    </div>`;
}

function buildAdminEmail(p: {
  withdrawalId: string;
  userId: string;
  userEmail: string;
  amountUsd: number;
  token: string;
  network: string;
  destination: string;
}): string {
  return `
    <div style="font-family:system-ui,sans-serif;">
      <h3>Retiro pendiente de aprobación</h3>
      <ul>
        <li><b>Withdrawal ID:</b> ${p.withdrawalId}</li>
        <li><b>User ID:</b> ${p.userId} (${p.userEmail})</li>
        <li><b>Monto:</b> USD ${p.amountUsd.toFixed(2)} (${p.token} en ${p.network})</li>
        <li><b>Destino:</b> <code>${p.destination}</code></li>
      </ul>
      <p>Revisar en el panel de admin.</p>
    </div>`;
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data } = await supabase
    .from('crypto_withdrawal_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({ data });
}
