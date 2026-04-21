import { createClient } from '@/lib/supabase-server';
import { sendMessage, getOrCreateActiveConversation } from '@/lib/ai/analyst/conversation-manager';
import { limitByIp } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Rate limit primero (antes de verificar auth) — protege contra abuso anónimo
  const rl = await limitByIp(request, 'ai-chat', { requests: 20, window: 60 });
  if (!rl.success) return rl.response;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { message, conversation_id } = await request.json();

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
  }

  const [profileRes, walletRes, investmentsRes, aiProfileRes] = await Promise.all([
    supabase.from('profiles').select('full_name, role').eq('id', user.id).single(),
    supabase.from('wallets').select('balance_available').eq('user_id', user.id).single(),
    supabase.from('investments').select('amount').eq('investor_id', user.id).eq('status', 'confirmed'),
    supabase.from('ai_user_profiles').select('risk_profile').eq('user_id', user.id).maybeSingle(),
  ]);

  const totalInvested = (investmentsRes.data || []).reduce((sum: number, i: any) => sum + Number(i.amount), 0);

  const conversationId = conversation_id || await getOrCreateActiveConversation({
    userId: user.id,
    supabaseClient: supabase,
  });

  try {
    const result = await sendMessage({
      conversationId,
      userMessage: message,
      userContext: {
        userId: user.id,
        userName: profileRes.data?.full_name || 'Usuario',
        userRole: profileRes.data?.role || 'investor',
        totalInvested,
        walletBalance: Number(walletRes.data?.balance_available || 0),
        riskProfile: aiProfileRes.data?.risk_profile,
      },
      supabaseClient: supabase,
    });

    return NextResponse.json({
      reply: result.reply,
      conversation_id: conversationId,
      message_id: result.messageId,
      tokens_used: result.tokensUsed,
      cost_usd: result.costUsd,
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversation_id');

  if (!conversationId) {
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(20);
    return NextResponse.json({ conversations: data || [] });
  }

  const { data: messages } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return NextResponse.json({ messages: messages || [] });
}
