/**
 * /api/crm/campaigns
 *
 * GET   → lista campañas del usuario
 * POST  → crea campaña (status=draft por default)
 * PATCH → update + acción "send_now" que dispara WhatsApp via Twilio
 * DELETE → borra campaña
 *
 * action=send_now en PATCH:
 *   - Toma contactos que matchean recipients_filter.tags
 *   - Envía el template (con {{full_name}} reemplazado) por Twilio WhatsApp
 *   - Actualiza stats
 */

import { createClient } from '@/lib/supabase-server';
import { limitByIp } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

function renderTemplate(template: string, contact: any): string {
  return template
    .replace(/\{\{full_name\}\}/g, contact.full_name || '')
    .replace(/\{\{first_name\}\}/g, (contact.full_name || '').split(' ')[0] || '')
    .replace(/\{\{company\}\}/g, contact.company || '')
    .replace(/\{\{email\}\}/g, contact.email || '');
}

async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    console.warn('[campaigns] Twilio no configurado — mensaje simulado');
    return false;
  }

  try {
    const twilio = (await import('twilio')).default(accountSid, authToken);
    await twilio.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      body,
    });
    return true;
  } catch (err) {
    console.error('[campaigns] Twilio send failed:', err);
    return false;
  }
}

export async function GET(_request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data, error } = await supabase
    .from('crm_campaigns')
    .select('*')
    .eq('owner_id', user.id)
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

  const body = await request.json();
  if (!body.name || !body.message_template) {
    return NextResponse.json(
      { error: 'name y message_template requeridos' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('crm_campaigns')
    .insert({
      owner_id: user.id,
      name: body.name,
      channel: body.channel || 'whatsapp',
      status: 'draft',
      message_template: body.message_template,
      recipients_filter: body.recipients_filter || {},
      scheduled_at: body.scheduled_at || null,
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

  // Acción: enviar ahora — rate limit muy agresivo (protege contra spam masivo WhatsApp)
  if (body.action === 'send_now') {
    const rl = await limitByIp(request, 'crm-send', { requests: 3, window: 3600 });
    if (!rl.success) return rl.response;
    const { data: campaign } = await supabase
      .from('crm_campaigns')
      .select('*')
      .eq('id', body.id)
      .eq('owner_id', user.id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    if (campaign.channel !== 'whatsapp') {
      return NextResponse.json(
        { error: 'Solo WhatsApp soportado en esta versión.' },
        { status: 400 }
      );
    }

    // Obtener contactos target (por tags o all)
    const filter = campaign.recipients_filter || {};
    let contactsQuery = supabase
      .from('crm_contacts')
      .select('id, full_name, email, company, phone')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .not('phone', 'is', null);

    if (filter.tags && Array.isArray(filter.tags) && filter.tags.length > 0) {
      contactsQuery = contactsQuery.overlaps('tags', filter.tags);
    }

    const { data: contacts } = await contactsQuery.limit(500);

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: 'Sin contactos con teléfono para la campaña.' },
        { status: 400 }
      );
    }

    // Marcar como sending
    await supabase
      .from('crm_campaigns')
      .update({ status: 'sending' })
      .eq('id', body.id);

    // Enviar en paralelo con cap de concurrencia básica
    let sent = 0;
    let failed = 0;
    for (const contact of contacts) {
      const msg = renderTemplate(campaign.message_template, contact);
      const ok = await sendWhatsAppMessage(contact.phone!, msg);
      if (ok) sent++;
      else failed++;
    }

    const stats = {
      ...(campaign.stats || {}),
      sent,
      failed,
      delivered: sent, // Twilio delivery confirma asíncronamente; esto es optimista
    };

    const { data, error } = await supabase
      .from('crm_campaigns')
      .update({
        status: failed === contacts.length ? 'failed' : 'sent',
        sent_at: new Date().toISOString(),
        stats,
      })
      .eq('id', body.id)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data, sent, failed, total: contacts.length });
  }

  // Update normal
  const patch: Record<string, any> = {};
  for (const key of [
    'name',
    'channel',
    'message_template',
    'recipients_filter',
    'scheduled_at',
    'status',
  ]) {
    if (key in body) patch[key] = body[key];
  }

  const { data, error } = await supabase
    .from('crm_campaigns')
    .update(patch)
    .eq('id', body.id)
    .eq('owner_id', user.id)
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

  const { error } = await supabase
    .from('crm_campaigns')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
