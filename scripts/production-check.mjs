const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const recommended = [
  'NEXT_PUBLIC_APP_URL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'DIDIT_API_KEY',
  'DIDIT_WORKFLOW_ID',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
  'ANTHROPIC_API_KEY',
];

async function loadLocalEnv() {
  const { existsSync, readFileSync } = await import('node:fs');
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue;
    const content = readFileSync(file, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || !line.includes('=')) continue;
      const [key, ...rest] = line.split('=');
      if (!process.env[key]) {
        process.env[key] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
}

function hasRealValue(value, invalid = []) {
  if (!value || value.trim().length < 8) return false;
  return !invalid.some((token) => value.includes(token));
}

let failed = false;
await loadLocalEnv();
console.log('Suelo production check\n');

for (const key of required) {
  const ok = hasRealValue(process.env[key], ['placeholder', 'anon-key', 'service-role']);
  console.log(`${ok ? 'OK ' : 'ERR'} required ${key}`);
  if (!ok) failed = true;
}

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || (process.env.NEXT_PUBLIC_SUPABASE_URL || '').includes('placeholder.supabase.co');
console.log(`${!demoMode ? 'OK ' : 'ERR'} required NEXT_PUBLIC_DEMO_MODE=false for production`);
if (demoMode) failed = true;

for (const key of recommended) {
  const ok = hasRealValue(process.env[key], ['placeholder']);
  console.log(`${ok ? 'OK ' : 'WARN'} recommended ${key}`);
}

process.exit(failed ? 1 : 0);
