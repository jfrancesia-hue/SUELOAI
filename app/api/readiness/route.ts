import { NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demo';

export const dynamic = 'force-dynamic';

type Check = {
  name: string;
  ok: boolean;
  severity: 'required' | 'warning';
  detail?: string;
};

function hasRealValue(value?: string, invalid: string[] = []) {
  if (!value || value.trim().length < 8) return false;
  return !invalid.some((token) => value.includes(token));
}

export async function GET() {
  const demoMode = isDemoMode();
  const checks: Check[] = [
    {
      name: 'Supabase URL real',
      ok: hasRealValue(process.env.NEXT_PUBLIC_SUPABASE_URL, ['placeholder.supabase.co']),
      severity: 'required',
      detail: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'Falta NEXT_PUBLIC_SUPABASE_URL',
    },
    {
      name: 'Supabase anon key',
      ok: hasRealValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, ['placeholder', 'anon-key']),
      severity: 'required',
    },
    {
      name: 'Supabase service role',
      ok: hasRealValue(process.env.SUPABASE_SERVICE_ROLE_KEY, ['placeholder', 'service-role']),
      severity: 'required',
    },
    {
      name: 'Demo mode apagado en producción',
      ok: !demoMode,
      severity: 'required',
      detail: demoMode ? 'NEXT_PUBLIC_DEMO_MODE sigue activo o Supabase es placeholder' : 'OK',
    },
    {
      name: 'App URL',
      ok: hasRealValue(process.env.NEXT_PUBLIC_APP_URL),
      severity: 'warning',
    },
    {
      name: 'Emails Resend',
      ok: hasRealValue(process.env.RESEND_API_KEY) && hasRealValue(process.env.RESEND_FROM_EMAIL),
      severity: 'warning',
    },
    {
      name: 'KYC provider',
      ok: hasRealValue(process.env.DIDIT_API_KEY) && hasRealValue(process.env.DIDIT_WORKFLOW_ID),
      severity: 'warning',
    },
    {
      name: 'WhatsApp comercial',
      ok: hasRealValue(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
      severity: 'warning',
    },
  ];

  const requiredOk = checks.filter((check) => check.severity === 'required').every((check) => check.ok);

  return NextResponse.json(
    {
      ok: requiredOk,
      mode: demoMode ? 'demo' : 'production-ready-candidate',
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: requiredOk ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
