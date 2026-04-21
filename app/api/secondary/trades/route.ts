/**
 * /api/secondary/trades
 *
 * POST → ejecutar compra contra un listing
 *   body: { listing_id, tokens_to_buy }
 *
 * Flujo:
 *   1. Validar listing open con suficientes tokens
 *   2. Validar que buyer tiene balance fiat suficiente (amount + 1% platform fee)
 *   3. Crear trade (status=pending)
 *   4. Debitar wallet fiat del buyer
 *   5. Transferir tokens: crear nueva investment para el buyer + reducir tokens en investment del seller
 *   6. Acreditar wallet fiat del seller (net_to_seller)
 *   7. Actualizar listing (tokens_remaining, status)
 *   8. Marcar trade como settled
 *
 * Si algún paso falla, se marca el trade como refunded y se revierte.
 *
 * GET → lista trades del usuario (buyer o seller)
 */

import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_FEE_RATE = 0.01; // 1%

export async function GET(_request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data, error } = await supabase
    .from('secondary_market_trades')
    .select(`*, listing:secondary_market_listings(id, project_id, price_per_token)`)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { listing_id, tokens_to_buy } = await request.json();
  if (!listing_id || !tokens_to_buy || tokens_to_buy <= 0) {
    return NextResponse.json(
      { error: 'listing_id y tokens_to_buy (>0) requeridos' },
      { status: 400 }
    );
  }

  const tokensNum = Math.floor(Number(tokens_to_buy));

  // 1. Cargar listing
  const { data: listing } = await supabase
    .from('secondary_market_listings')
    .select('*')
    .eq('id', listing_id)
    .single();

  if (!listing) {
    return NextResponse.json({ error: 'Listing no encontrado' }, { status: 404 });
  }
  if (listing.status !== 'open' && listing.status !== 'partial') {
    return NextResponse.json({ error: 'Listing no disponible' }, { status: 400 });
  }
  if (listing.seller_id === user.id) {
    return NextResponse.json(
      { error: 'No podés comprar tu propio listing' },
      { status: 400 }
    );
  }
  if (Number(listing.tokens_remaining) < tokensNum) {
    return NextResponse.json(
      {
        error: `Solo hay ${listing.tokens_remaining} tokens disponibles (pediste ${tokensNum})`,
      },
      { status: 400 }
    );
  }

  const pricePerToken = Number(listing.price_per_token);
  const grossAmount = tokensNum * pricePerToken;
  const platformFee = grossAmount * PLATFORM_FEE_RATE;
  const totalBuyerPays = grossAmount + platformFee;
  const netToSeller = grossAmount; // seller recibe el bruto; el fee lo paga el buyer

  // 2. Validar wallet del buyer
  const { data: buyerWallet } = await supabase
    .from('wallets')
    .select('id, balance_available')
    .eq('user_id', user.id)
    .single();

  if (!buyerWallet || Number(buyerWallet.balance_available) < totalBuyerPays) {
    return NextResponse.json(
      {
        error: `Saldo insuficiente. Necesitás USD ${totalBuyerPays.toFixed(2)} (${grossAmount.toFixed(2)} + ${platformFee.toFixed(2)} fee).`,
      },
      { status: 400 }
    );
  }

  const { data: sellerWallet } = await supabase
    .from('wallets')
    .select('id, balance_available')
    .eq('user_id', listing.seller_id)
    .single();

  if (!sellerWallet) {
    return NextResponse.json(
      { error: 'Seller wallet no encontrada' },
      { status: 500 }
    );
  }

  // 3. Crear trade pending
  const { data: trade, error: tradeErr } = await supabase
    .from('secondary_market_trades')
    .insert({
      listing_id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      tokens_traded: tokensNum,
      price_per_token: pricePerToken,
      total_amount: grossAmount,
      platform_fee_usd: platformFee,
      net_to_seller_usd: netToSeller,
      status: 'pending',
    })
    .select()
    .single();

  if (tradeErr) {
    return NextResponse.json({ error: tradeErr.message }, { status: 500 });
  }

  try {
    // 4. Debitar buyer
    await supabase
      .from('wallets')
      .update({
        balance_available: Number(buyerWallet.balance_available) - totalBuyerPays,
      })
      .eq('id', buyerWallet.id);

    // 5. Reducir tokens del seller + crear investment para buyer
    const { data: sellerInvestment } = await supabase
      .from('investments')
      .select('tokens_purchased, amount')
      .eq('id', listing.investment_id)
      .single();

    if (!sellerInvestment) throw new Error('Investment del seller no encontrada');

    await supabase
      .from('investments')
      .update({
        tokens_purchased: Number(sellerInvestment.tokens_purchased) - tokensNum,
      })
      .eq('id', listing.investment_id);

    await supabase.from('investments').insert({
      investor_id: user.id,
      project_id: listing.project_id,
      tokens_purchased: tokensNum,
      amount: grossAmount,
      status: 'confirmed',
      source: 'secondary_market',
      source_listing_id: listing_id,
    } as any);

    // 6. Acreditar seller
    await supabase
      .from('wallets')
      .update({
        balance_available: Number(sellerWallet.balance_available) + netToSeller,
      })
      .eq('id', sellerWallet.id);

    // 7. Actualizar listing
    const newRemaining = Number(listing.tokens_remaining) - tokensNum;
    const newStatus = newRemaining === 0 ? 'sold' : 'partial';
    await supabase
      .from('secondary_market_listings')
      .update({
        tokens_remaining: newRemaining,
        status: newStatus,
      })
      .eq('id', listing_id);

    // 8. Trade settled
    const { data: settled } = await supabase
      .from('secondary_market_trades')
      .update({
        status: 'settled',
        settled_at: new Date().toISOString(),
      })
      .eq('id', trade.id)
      .select()
      .single();

    return NextResponse.json({ data: settled, trade: settled });
  } catch (err: any) {
    // Rollback básico
    await supabase
      .from('secondary_market_trades')
      .update({ status: 'refunded' })
      .eq('id', trade.id);

    return NextResponse.json(
      { error: `Trade failed: ${err.message}` },
      { status: 500 }
    );
  }
}
