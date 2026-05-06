/**
 * Implementación de los tools que el AI Analyst puede llamar
 *
 * Cada tool ejecuta queries reales a Supabase y devuelve datos estructurados.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================
// TOOL: get_user_profile
// ============================================
export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: aiProfile } = await supabase
    .from('ai_user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return {
    basic: {
      name: profile?.full_name,
      email: profile?.email,
      role: profile?.role,
      kyc_verified: profile?.kyc_verified,
      total_invested: profile?.total_invested,
      total_returns: profile?.total_returns,
      country: profile?.country || 'AR',
    },
    ai_profile: aiProfile ? {
      risk_profile: aiProfile.risk_profile,
      time_horizon: aiProfile.time_horizon,
      experience_level: aiProfile.experience_level,
      investment_goals: aiProfile.investment_goals,
      monthly_capacity: aiProfile.monthly_capacity,
      preferred_locations: aiProfile.preferred_locations,
      preferred_project_types: aiProfile.preferred_project_types,
      onboarding_completed: aiProfile.onboarding_completed,
    } : null,
  };
}

// ============================================
// TOOL: get_user_investments
// ============================================
export async function getUserInvestments(
  supabase: SupabaseClient,
  userId: string,
  status: string = 'all'
) {
  let query = supabase
    .from('investments')
    .select(`
      id, tokens_purchased, amount, status, created_at, contract_hash,
      project:projects(id, title, location, expected_return, return_period_months, status, sold_tokens, total_tokens)
    `)
    .eq('investor_id', userId)
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data } = await query;

  return {
    count: data?.length || 0,
    total_invested_usd: data?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0,
    investments: data?.map((inv) => ({
      id: inv.id,
      amount_usd: Number(inv.amount),
      tokens: inv.tokens_purchased,
      status: inv.status,
      date: inv.created_at,
      project_title: (inv.project as any)?.title,
      project_location: (inv.project as any)?.location,
      expected_return: (inv.project as any)?.expected_return,
      project_status: (inv.project as any)?.status,
      has_contract: !!inv.contract_hash,
    })),
  };
}

// ============================================
// TOOL: get_user_wallet_balance
// ============================================
export async function getUserWalletBalance(supabase: SupabaseClient, userId: string) {
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: cryptoAddresses } = await supabase
    .from('crypto_addresses')
    .select('network, token, address')
    .eq('user_id', userId)
    .eq('is_active', true);

  return {
    fiat: {
      available: Number(wallet?.balance_available || 0),
      locked: Number(wallet?.balance_locked || 0),
      returns: Number(wallet?.balance_returns || 0),
      total: Number(wallet?.balance_available || 0) + Number(wallet?.balance_locked || 0) + Number(wallet?.balance_returns || 0),
      currency: wallet?.currency || 'USD',
    },
    crypto_addresses: cryptoAddresses?.length || 0,
    supported_tokens: ['USDT', 'USDC'],
    supported_networks: ['tron', 'polygon'],
  };
}

// ============================================
// TOOL: search_projects
// ============================================
export async function searchProjects(
  supabase: SupabaseClient,
  filters: {
    location?: string;
    min_return?: number;
    max_investment?: number;
    project_type?: string;
    rating?: string;
    limit?: number;
  }
) {
  let query = supabase
    .from('projects')
    .select(`
      id, title, location, total_value, token_price, expected_return,
      return_period_months, sold_tokens, total_tokens, status, project_type,
      score:project_scores(rating, overall_score, ai_analysis)
    `)
    .in('status', ['funding', 'funded'])
    .order('featured', { ascending: false })
    .limit(filters.limit || 5);

  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters.min_return) {
    query = query.gte('expected_return', filters.min_return);
  }
  if (filters.max_investment) {
    query = query.lte('token_price', filters.max_investment);
  }
  if (filters.project_type && filters.project_type !== 'any') {
    query = query.eq('project_type', filters.project_type);
  }

  const { data } = await query;

  return {
    count: data?.length || 0,
    projects: data?.map((p) => ({
      id: p.id,
      title: p.title,
      location: p.location,
      type: p.project_type,
      total_value_usd: Number(p.total_value),
      token_price_usd: Number(p.token_price),
      expected_return_percent: Number(p.expected_return),
      return_period_months: p.return_period_months,
      tokens_available: p.total_tokens - p.sold_tokens,
      progress_percent: Math.round((p.sold_tokens / p.total_tokens) * 100),
      ai_rating: (p.score as any)?.[0]?.rating || 'not_rated',
      ai_score: (p.score as any)?.[0]?.overall_score || null,
      status: p.status,
    })),
  };
}

// ============================================
// TOOL: analyze_project_for_user
// ============================================
export async function analyzeProjectForUser(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
) {
  const [userRes, projectRes, portfolioRes] = await Promise.all([
    supabase.from('ai_user_profiles').select('*').eq('user_id', userId).single(),
    supabase
      .from('projects')
      .select('*, score:project_scores(rating, overall_score, ai_analysis, risk_factors, opportunities)')
      .eq('id', projectId)
      .single(),
    supabase
      .from('investments')
      .select('project:projects(location, project_type)')
      .eq('investor_id', userId)
      .eq('status', 'confirmed'),
  ]);

  const userProfile = userRes.data;
  const project = projectRes.data;
  const currentPortfolio = portfolioRes.data || [];

  if (!project) return { error: 'Proyecto no encontrado' };

  // Calcular match score basado en criterios
  let matchScore = 50;
  const reasons: string[] = [];

  if (userProfile) {
    // Match por ubicación preferida
    if (userProfile.preferred_locations?.some((loc: string) =>
      project.location.toLowerCase().includes(loc.toLowerCase())
    )) {
      matchScore += 15;
      reasons.push('Ubicación coincide con tus preferencias');
    }

    // Match por tipo de proyecto
    if (userProfile.preferred_project_types?.includes(project.project_type)) {
      matchScore += 10;
      reasons.push('Tipo de proyecto que preferís');
    }

    // Match por horizonte temporal
    const horizonMonths = userProfile.time_horizon === 'short' ? 12 :
                         userProfile.time_horizon === 'medium' ? 36 : 60;
    if (project.return_period_months <= horizonMonths) {
      matchScore += 10;
      reasons.push('Plazo coincide con tu horizonte');
    }

    // Match por capacity
    if (userProfile.monthly_capacity && Number(project.token_price) <= Number(userProfile.monthly_capacity)) {
      matchScore += 10;
      reasons.push('Ticket mínimo dentro de tu capacidad');
    }

    // Match por risk profile vs rating IA
    const aiRating = (project.score as any)?.[0]?.rating;
    if (aiRating) {
      if (userProfile.risk_profile === 'conservative' && ['A_plus', 'A'].includes(aiRating)) {
        matchScore += 15;
        reasons.push('Rating IA compatible con tu perfil conservador');
      } else if (userProfile.risk_profile === 'moderate' && ['A_plus', 'A', 'B'].includes(aiRating)) {
        matchScore += 10;
        reasons.push('Rating IA compatible con tu perfil moderado');
      } else if (userProfile.risk_profile === 'aggressive') {
        matchScore += 5;
      }

      if (userProfile.risk_profile === 'conservative' && ['C', 'D'].includes(aiRating)) {
        matchScore -= 20;
        reasons.push('⚠️ Rating bajo para tu perfil conservador');
      }
    }
  }

  // Check diversificación
  const sameLocationCount = currentPortfolio.filter((inv: any) =>
    inv.project?.location === project.location
  ).length;
  if (sameLocationCount >= 2) {
    matchScore -= 10;
    reasons.push('⚠️ Ya tenés concentración en esta ubicación');
  }

  matchScore = Math.max(0, Math.min(100, matchScore));

  return {
    project: {
      id: project.id,
      title: project.title,
      location: project.location,
      expected_return: project.expected_return,
      ai_rating: (project.score as any)?.[0]?.rating,
      ai_analysis: (project.score as any)?.[0]?.ai_analysis,
      risk_factors: (project.score as any)?.[0]?.risk_factors,
      opportunities: (project.score as any)?.[0]?.opportunities,
    },
    match_score: matchScore,
    match_reasons: reasons,
    recommendation: matchScore >= 70 ? 'highly_recommended' :
                   matchScore >= 50 ? 'recommended' :
                   matchScore >= 30 ? 'neutral' : 'not_recommended',
  };
}

// ============================================
// TOOL: get_portfolio_stats
// ============================================
export async function getPortfolioStats(supabase: SupabaseClient, userId: string) {
  const { data: investments } = await supabase
    .from('investments')
    .select(`
      amount, status, created_at,
      project:projects(location, project_type, expected_return, return_period_months)
    `)
    .eq('investor_id', userId)
    .eq('status', 'confirmed');

  if (!investments || investments.length === 0) {
    return { empty: true, message: 'Sin inversiones todavía' };
  }

  const total = investments.reduce((s, i) => s + Number(i.amount), 0);

  // Diversificación por ubicación
  const byLocation: Record<string, number> = {};
  const byType: Record<string, number> = {};

  investments.forEach((inv) => {
    const location = (inv.project as any)?.location || 'Unknown';
    const type = (inv.project as any)?.project_type || 'Unknown';
    byLocation[location] = (byLocation[location] || 0) + Number(inv.amount);
    byType[type] = (byType[type] || 0) + Number(inv.amount);
  });

  const weightedReturn = investments.reduce((s, i) =>
    s + (Number(i.amount) * Number((i.project as any)?.expected_return || 0) / total), 0
  );

  // Detectar concentración
  const maxLocationPct = Math.max(...Object.values(byLocation).map(v => v / total * 100));
  const maxTypePct = Math.max(...Object.values(byType).map(v => v / total * 100));

  const alerts: string[] = [];
  if (maxLocationPct > 50) alerts.push(`⚠️ Alta concentración geográfica: ${maxLocationPct.toFixed(0)}%`);
  if (maxTypePct > 60) alerts.push(`⚠️ Alta concentración por tipo: ${maxTypePct.toFixed(0)}%`);
  if (investments.length < 3) alerts.push('💡 Considerá diversificar con más proyectos');

  return {
    total_invested_usd: total,
    investment_count: investments.length,
    weighted_expected_return: weightedReturn,
    diversification: {
      by_location: Object.entries(byLocation).map(([loc, amt]) => ({
        location: loc,
        amount: amt,
        percent: (amt / total * 100).toFixed(1),
      })),
      by_type: Object.entries(byType).map(([type, amt]) => ({
        type,
        amount: amt,
        percent: (amt / total * 100).toFixed(1),
      })),
    },
    alerts,
  };
}

// ============================================
// TOOL: calculate_expected_returns
// ============================================
export async function calculateExpectedReturns(
  supabase: SupabaseClient,
  params: { projectId: string; amountUsd: number; country?: string; includeTax?: boolean }
) {
  const { data: project } = await supabase
    .from('projects')
    .select('title, expected_return, return_period_months, token_price')
    .eq('id', params.projectId)
    .single();

  if (!project) return { error: 'Proyecto no encontrado' };

  const tokens = Math.floor(params.amountUsd / Number(project.token_price));
  const actualInvestment = tokens * Number(project.token_price);
  const grossReturn = actualInvestment * (Number(project.expected_return) / 100);
  const totalAfterReturn = actualInvestment + grossReturn;

  // Fiscalidad básica (simplificada)
  let taxRate = 0;
  let taxNote = '';
  if (params.includeTax) {
    if (params.country === 'AR') {
      taxRate = 0.15; // Aproximado ganancias personas físicas
      taxNote = 'Aproximado Impuesto a las Ganancias Argentina (15%)';
    } else if (params.country === 'PY') {
      taxRate = 0.10; // Paraguay IRPF
      taxNote = 'Aproximado IRPF Paraguay (10%)';
    }
  }

  const taxAmount = grossReturn * taxRate;
  const netReturn = grossReturn - taxAmount;

  return {
    investment: {
      amount_requested_usd: params.amountUsd,
      tokens_purchased: tokens,
      actual_investment_usd: actualInvestment,
    },
    returns: {
      expected_return_percent: Number(project.expected_return),
      period_months: project.return_period_months,
      gross_return_usd: grossReturn,
      tax_amount_usd: taxAmount,
      tax_note: taxNote,
      net_return_usd: netReturn,
      total_value_at_end_usd: actualInvestment + netReturn,
      annualized_return_percent:
        Number(project.expected_return) * (12 / project.return_period_months),
    },
    disclaimer: 'Retornos proyectados no garantizados. Consultá con tu contador para cálculo fiscal exacto.',
  };
}

// ============================================
// TOOL: create_recommendation
// ============================================
export async function createRecommendation(
  supabase: SupabaseClient,
  userId: string,
  params: {
    type: string;
    title: string;
    description?: string;
    project_ids?: string[];
    reasoning: string;
    match_score?: number;
  }
) {
  const { data, error } = await supabase
    .from('ai_recommendations')
    .insert({
      user_id: userId,
      type: params.type,
      title: params.title,
      description: params.description,
      project_ids: params.project_ids || [],
      reasoning: params.reasoning,
      match_score: params.match_score,
      status: 'active',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  return {
    recommendation_id: data.id,
    saved: true,
    action_url: `/recommendations/${data.id}`,
  };
}

// ============================================
// DISPATCHER - enruta tool calls a implementaciones
// ============================================
export async function executeToolCall(
  supabase: SupabaseClient,
  userId: string,
  toolName: string,
  args: any
): Promise<any> {
  switch (toolName) {
    case 'get_user_profile':
      return getUserProfile(supabase, userId);
    case 'get_user_investments':
      return getUserInvestments(supabase, userId, args.status);
    case 'get_user_wallet_balance':
      return getUserWalletBalance(supabase, userId);
    case 'search_projects':
      return searchProjects(supabase, args);
    case 'analyze_project_for_user':
      return analyzeProjectForUser(supabase, userId, args.project_id);
    case 'get_portfolio_stats':
      return getPortfolioStats(supabase, userId);
    case 'calculate_expected_returns':
      return calculateExpectedReturns(supabase, {
        projectId: args.project_id,
        amountUsd: args.amount_usd,
        country: args.country,
        includeTax: args.include_tax,
      });
    case 'create_recommendation':
      return createRecommendation(supabase, userId, args);
    default:
      return { error: `Tool desconocido: ${toolName}` };
  }
}
