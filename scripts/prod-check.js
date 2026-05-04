const fs = require('fs');
const path = require('path');

function loadEnvFile(file) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;

  const content = fs.readFileSync(fullPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    if (!process.env[key]) {
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env.production');

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'ANTHROPIC_API_KEY',
];

const errors = [];
const warnings = [];

function isMissing(name) {
  const value = process.env[name];
  return !value || value.includes('placeholder') || value.includes('your-') || value.endsWith('...');
}

function isTruthy(name) {
  return ['1', 'true', 'yes', 'on'].includes(String(process.env[name] || '').trim().toLowerCase());
}

for (const name of required) {
  if (isMissing(name)) errors.push(`${name} es obligatorio`);
}

if (isTruthy('NEXT_PUBLIC_DEMO_MODE') || isTruthy('DEMO_MODE')) {
  errors.push('El modo demo debe estar deshabilitado en produccion');
}

if (process.env.NEXT_PUBLIC_APP_URL?.startsWith('http://localhost')) {
  errors.push('NEXT_PUBLIC_APP_URL debe apuntar al dominio real de produccion');
}

if (process.env.MP_ACCESS_TOKEN && isMissing('MP_WEBHOOK_SECRET')) {
  errors.push('MP_WEBHOOK_SECRET es obligatorio si MP_ACCESS_TOKEN esta configurado');
}

if ((process.env.DIDIT_API_KEY || process.env.DIDIT_WORKFLOW_ID) && isMissing('DIDIT_WEBHOOK_SECRET')) {
  errors.push('DIDIT_WEBHOOK_SECRET es obligatorio si Didit esta configurado');
}

if ((process.env.POLYGON_RPC_URL || process.env.ANCHOR_CONTRACT_ADDRESS) && isMissing('CRYPTO_WEBHOOK_SECRET')) {
  errors.push('CRYPTO_WEBHOOK_SECRET es obligatorio si crypto/on-chain esta configurado');
}

if (isMissing('UPSTASH_REDIS_REST_URL') || isMissing('UPSTASH_REDIS_REST_TOKEN')) {
  warnings.push('UPSTASH_REDIS_* no configurado: el rate limit usara memoria y no es distribuido');
}

if (isMissing('RESEND_API_KEY')) {
  warnings.push('RESEND_API_KEY no configurado: emails transaccionales limitados');
}

for (const warning of warnings) {
  console.warn(`[prod-check] warning: ${warning}`);
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[prod-check] error: ${error}`);
  process.exit(1);
}

console.log('[prod-check] OK: configuracion minima de produccion valida');
