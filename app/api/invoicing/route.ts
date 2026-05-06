/**
 * /api/invoicing
 *
 * GET    -> lista facturas del issuer (con filtros)
 * POST   -> crea factura en draft
 * PATCH  -> actualiza factura. La acci?n "issue" exige proveedor fiscal real.
 * DELETE -> soft-cancel si status != issued/paid
 *
 * Producci?n Paraguay/Bolivia: no se emiten comprobantes mock.
 * Conectar SIFEN/DNIT (PY) o SIN (BO) antes de habilitar emisi?n fiscal.
 */

import { createClient } from '@/lib/supabase-server';
import { getFiscalProvider } from '@/lib/fiscal/providers';
import { getDefaultCountry, getMarket, isSupportedCountry } from '@/lib/config/markets';
import { NextRequest, NextResponse } from 'next/server';

function nextInvoiceNumber(pointOfSale: number, lastNumber?: number): string {
  const next = (lastNumber || 0) + 1;
  return `${String(pointOfSale).padStart(5, '0')}-${String(next).padStart(8, '0')}`;
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabase
    .from('invoices')
    .select('*, project:projects(id, title), investment:investments(id)')
    .eq('issuer_id', user.id)
    .order('issue_date', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);
  if (from) query = query.gte('issue_date', from);
  if (to) query = query.lte('issue_date', to);

  const { data, error } = await query.limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Agregados: totales del perÃ­odo
  const stats = (data || []).reduce(
    (acc, inv) => {
      acc.count += 1;
      acc.total += Number(inv.total || 0);
      acc.tax += Number(inv.tax_amount || 0);
      return acc;
    },
    { count: 0, total: 0, tax: 0 }
  );

  return NextResponse.json({ data: data ?? [], stats });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  if (!body.recipient_name || body.total == null) {
    return NextResponse.json(
      { error: 'recipient_name y total requeridos' },
      { status: 400 }
    );
  }

  const pointOfSale = body.point_of_sale || 1;

  // Buscar Ãºltimo nÃºmero emitido en ese punto de venta
  const { data: last } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('issuer_id', user.id)
    .eq('point_of_sale', pointOfSale)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastNum = last?.invoice_number
    ? parseInt(String(last.invoice_number).split('-')[1] || '0', 10)
    : 0;

  const invoiceNumber = nextInvoiceNumber(pointOfSale, lastNum);

  const subtotal = Number(body.subtotal || 0);
  const taxAmount = Number(body.tax_amount || 0);
  const total = Number(body.total || subtotal + taxAmount);

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      issuer_id: user.id,
      invoice_type: body.invoice_type || 'C',
      invoice_number: invoiceNumber,
      point_of_sale: pointOfSale,
      country: isSupportedCountry(body.country) ? body.country : getDefaultCountry(),
      recipient_name: body.recipient_name,
      recipient_tax_id: body.recipient_tax_id || null,
      recipient_condition: body.recipient_condition || 'consumidor_final',
      recipient_email: body.recipient_email || null,
      issue_date: body.issue_date || new Date().toISOString().split('T')[0],
      due_date: body.due_date || null,
      currency: body.currency || process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'USD',
      subtotal,
      tax_amount: taxAmount,
      total,
      status: 'draft',
      project_id: body.project_id || null,
      investment_id: body.investment_id || null,
      line_items: Array.isArray(body.line_items) ? body.line_items : [],
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  // Acci?n: emitir. Se delega a proveedor fiscal real por pa?s; sin API configurada devuelve 501/503.
  if (body.action === 'issue') {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', body.id)
      .eq('issuer_id', user.id)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }
    if (invoice.status !== 'draft') {
      return NextResponse.json(
        { error: `Solo se pueden emitir facturas en draft (actual: ${invoice.status})` },
        { status: 400 }
      );
    }

    const country = isSupportedCountry(invoice.country) ? invoice.country : getDefaultCountry();
    const market = getMarket(country);
    const provider = getFiscalProvider(country);

    try {
      const result = await provider.issue({
        invoiceId: invoice.id,
        issuerId: user.id,
        country: market.code,
        recipientName: invoice.recipient_name,
        recipientTaxId: invoice.recipient_tax_id,
        invoiceNumber: invoice.invoice_number,
        invoiceType: invoice.invoice_type,
        currency: invoice.currency,
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.tax_amount),
        total: Number(invoice.total),
        issueDate: invoice.issue_date,
        lineItems: invoice.line_items || [],
      });

      const { data: updated, error: updErr } = await supabase
        .from('invoices')
        .update({
          status: result.status === 'issued' ? 'issued' : 'draft',
          cae: result.fiscalCode,
          cae_expiry: result.fiscalCodeExpiry || null,
          notes: `Fiscal provider: ${result.provider}`,
        })
        .eq('id', body.id)
        .eq('issuer_id', user.id)
        .select()
        .single();

      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
      return NextResponse.json({ data: updated, fiscal: result });
    } catch (err: any) {
      return NextResponse.json(
        {
          error: err.message || 'Emisi?n fiscal no configurada para producci?n',
          detail: 'Conect? SIFEN/DNIT para Paraguay o SIN para Bolivia en lib/fiscal/providers.ts.',
        },
        { status: provider.isConfigured() ? 502 : 501 }
      );
    }
  }

  // Update normal
  const patch: Record<string, any> = {};
  for (const key of [
    'recipient_name',
    'recipient_tax_id',
    'recipient_condition',
    'recipient_email',
    'due_date',
    'subtotal',
    'tax_amount',
    'total',
    'currency',
    'line_items',
    'notes',
    'status',
  ]) {
    if (key in body) patch[key] = body[key];
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(patch)
    .eq('id', body.id)
    .eq('issuer_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  // Solo draft pueden borrarse; issued/paid van a status=cancelled (nota de crÃ©dito en un futuro)
  const { data: invoice } = await supabase
    .from('invoices')
    .select('status')
    .eq('id', id)
    .eq('issuer_id', user.id)
    .single();

  if (!invoice) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });

  if (invoice.status === 'draft') {
    await supabase.from('invoices').delete().eq('id', id).eq('issuer_id', user.id);
  } else {
    await supabase
      .from('invoices')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('issuer_id', user.id);
  }

  return NextResponse.json({ ok: true });
}

