import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/contracts - Obtener datos para generar contrato (client-side rendering con jsPDF)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { investment_id } = await request.json();

  if (!investment_id) {
    return NextResponse.json({ error: 'ID de inversión requerido' }, { status: 400 });
  }

  // Obtener inversión con relaciones
  const { data: investment, error } = await supabase
    .from('investments')
    .select(`
      *,
      investor:profiles!investor_id(full_name, email, dni),
      project:projects(
        title, location, token_price, expected_return, return_period_months,
        developer:profiles!developer_id(full_name, company_name)
      )
    `)
    .eq('id', investment_id)
    .single();

  if (error || !investment) {
    return NextResponse.json({ error: 'Inversión no encontrada' }, { status: 404 });
  }

  // Verificar que el usuario es participante
  const isInvestor = investment.investor_id === user.id;
  const isDeveloper = (investment.project as any)?.developer?.id === user.id;

  if (!isInvestor && !isDeveloper) {
    return NextResponse.json({ error: 'No autorizado a ver este contrato' }, { status: 403 });
  }

  const project = investment.project as any;
  const investor = investment.investor as any;
  const developer = project?.developer as any;

  return NextResponse.json({
    data: {
      investorName: investor?.full_name || '',
      investorDni: investor?.dni || '',
      investorEmail: investor?.email || '',
      projectTitle: project?.title || '',
      projectLocation: project?.location || '',
      developerName: developer?.company_name || developer?.full_name || '',
      amount: investment.amount,
      tokens: investment.tokens_purchased,
      tokenPrice: project?.token_price || 0,
      expectedReturn: project?.expected_return || 0,
      returnPeriod: project?.return_period_months || 0,
      contractHash: investment.contract_hash || '',
      date: new Date(investment.created_at).toISOString().split('T')[0],
      investmentId: investment.id,
    },
  });
}
