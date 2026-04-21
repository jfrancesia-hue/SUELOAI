/**
 * /api/invoicing
 *
 * GET    → lista facturas del issuer (con filtros)
 * POST   → crea factura en draft
 * PATCH  → update factura (incluye acción "issue" que llama al stub AFIP)
 * DELETE → soft-cancel si status != issued/paid
 *
 * La emisión real a AFIP/SIFEN usa el stub `lib/afip/client.ts`.
 * Reemplazar por SDK real antes de producción.
 */

import { createClient } from '@/lib/supabase-server';
import {
  createAfipClient,
  issueInvoice,
  type AfipInvoiceType,
} from '@/lib/afip/client';
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

  // Agregados: totales del período
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

  // Buscar último número emitido en ese punto de venta
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
      country: body.country || 'AR',
      recipient_name: body.recipient_name,
      recipient_tax_id: body.recipient_tax_id || null,
      recipient_condition: body.recipient_condition || 'consumidor_final',
      recipient_email: body.recipient_email || null,
      issue_date: body.issue_date || new Date().toISOString().split('T')[0],
      due_date: body.due_date || null,
      currency: body.currency || 'ARS',
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

  // Acción: emitir (llamar AFIP stub)
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

    try {
      // Nota: en producción real, issuer cert/key vienen de un secret por tenant.
      const client = createAfipClient({
        cuit: process.env.AFIP_DEFAULT_CUIT || '20000000000',
        certificate: process.env.AFIP_DEFAULT_CERT || 'stub-cert',
        privateKey: process.env.AFIP_DEFAULT_KEY || 'stub-key',
        production: process.env.AFIP_PRODUCTION === 'true',
      });

      const result = await issueInvoice(client, {
        invoiceType: invoice.invoice_type as AfipInvoiceType,
        total: Number(invoice.total),
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.tax_amount),
        recipientCuit: invoice.recipient_tax_id,
        recipientName: invoice.recipient_name,
        pointOfSale: invoice.point_of_sale,
      });

      const { data: updated, error: updErr } = await supabase
        .from('invoices')
        .update({
          status: 'issued',
          cae: result.cae,
          cae_expiry: result.caeExpiry
            ? `${result.caeExpiry.slice(0, 4)}-${result.caeExpiry.slice(4, 6)}-${result.caeExpiry.slice(6, 8)}`
            : null,
        })
        .eq('id', body.id)
        .eq('issuer_id', user.id)
        .select()
        .single();

      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
      return NextResponse.json({ data: updated, afip: result });
    } catch (err: any) {
      await supabase
        .from('invoices')
        .update({ status: 'failed', notes: `AFIP error: ${err.message}` })
        .eq('id', body.id)
        .eq('issuer_id', user.id);

      return NextResponse.json(
        { error: err.message || 'Error emitiendo factura' },
        { status: 500 }
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

  // Solo draft pueden borrarse; issued/paid van a status=cancelled (nota de crédito en un futuro)
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
