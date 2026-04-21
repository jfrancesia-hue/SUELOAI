# 🚀 Deploy Quickstart — 15 minutos

Guía rápida para deployar Suelo v4.2 a producción.
Ideal si ya leíste `DEPLOY.md` y querés los comandos al grano.

---

## 1. Regenerar tokens (2 min)

Los tokens globales de `~/.claude/.env` están bloqueados:
- **Supabase**: `Unauthorized` → generar uno nuevo en https://supabase.com/dashboard/account/tokens
- **Vercel**: SAML enforcement → re-auth en https://vercel.com/account/tokens o usar `vercel login` con OAuth

```bash
# Actualizar ~/.claude/.env con los nuevos tokens
nano ~/.claude/.env
# SUPABASE_ACCESS_TOKEN=sbp_...
# VERCEL_TOKEN=...
source ~/.claude/.env
```

---

## 2. Crear proyecto Supabase (3 min)

```bash
# Via API
DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
echo "Guardá esta password: $DB_PASS"

curl -s -X POST "https://api.supabase.com/v1/projects" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"suelo\",
    \"organization_id\": \"lwuvgivrsllhjlwawrgi\",
    \"db_pass\": \"$DB_PASS\",
    \"region\": \"sa-east-1\",
    \"plan\": \"free\"
  }"

# Guardá el "ref" (id) del JSON retornado. Esperar ~2 min hasta ACTIVE_HEALTHY.
# Polling:
SUELO_REF=<ref_del_json>
curl -s "https://api.supabase.com/v1/projects/$SUELO_REF" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" | python -c "import sys, json; d=json.load(sys.stdin); print(d.get('status'))"
```

O **más fácil**: crearlo en https://supabase.com/dashboard/new con:
- **Name**: `suelo`
- **Region**: South America (São Paulo)
- **Plan**: Free
- Guardar la DB password

---

## 3. Ejecutar las 7 migraciones (3 min)

Opción A — Supabase CLI:
```bash
cd E:/Usuario/suelo-v4/suelo
supabase login --token $SUPABASE_ACCESS_TOKEN
supabase link --project-ref $SUELO_REF
supabase db push
```

Opción B — Dashboard SQL Editor (copy/paste en orden):
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_extensions.sql`
3. `supabase/migrations/003_crypto.sql`
4. `supabase/migrations/004_ai_rebrand.sql`
5. `supabase/migrations/005_claude_migration.sql`
6. `supabase/migrations/006_crm_invoicing_secondary.sql`
7. `supabase/migrations/007_ai_memory.sql`

Verificar RLS:
```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' ORDER BY tablename;
```

Obtener credenciales (Supabase Dashboard → Project Settings → API):
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service_role key (⚠️ mantener secret)

---

## 4. Deploy a Vercel (5 min)

### Via CLI (más rápido)

```bash
cd E:/Usuario/suelo-v4/suelo
npm i -g vercel
vercel login    # OAuth - evita el problema de SAML
vercel link     # Creás el proyecto si no existe. Nombre sugerido: sueloai

# Setear env vars (una por una o con `vercel env pull/push`)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_APP_NAME production   # valor: Suelo

# Deploy a producción
vercel --prod
```

### Via Dashboard (visual)

1. Ir a https://vercel.com/new
2. Import Git repository → `jfrancesia-hue/SUELOAI`
3. **Framework preset**: Next.js (auto-detecta)
4. **Environment Variables** → agregar las 5 obligatorias de arriba
5. Deploy

---

## 5. Verificación post-deploy (2 min)

```bash
# Reemplazar por tu URL real de Vercel
SUELO_URL=https://sueloai.vercel.app

# Landing responde
curl -I $SUELO_URL

# Middleware redirige rutas protegidas
curl -I "$SUELO_URL/wallet" | grep -i location
# Debe contener: location: /login?redirect=/wallet

# Headers de seguridad activos
curl -sI $SUELO_URL | grep -Ei "x-frame-options|strict-transport|referrer-policy|content-security"

# KYC webhook health check (pública)
curl $SUELO_URL/api/kyc/webhook
# {"service":"suelo-kyc-webhook","status":"ok",...}
```

Correr suite E2E contra prod:
```bash
BASE_URL=$SUELO_URL npm run test:e2e
```

---

## 6. Webhooks externos (después, cuando actives features)

| Provider | URL a registrar |
|---|---|
| Mercado Pago | `$SUELO_URL/api/wallet/webhook` |
| Alchemy (crypto EVM) | `$SUELO_URL/api/crypto/webhook` |
| Didit (KYC) | `$SUELO_URL/api/kyc/webhook` |

---

## 7. Opcional: env vars para features avanzadas

### Rate limiting distribuido (Upstash)
```bash
# Crear DB gratis en https://console.upstash.com → Redis
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```
Sin estos, el rate limit cae a LRU in-memory (funciona pero no distribuido).

### Emails transaccionales (Resend)
```bash
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production   # valor: no-reply@suelo.ai
vercel env add ADMIN_NOTIFY_EMAILS production # valor: admin@suelo.ai
```

### WhatsApp CRM (Twilio)
```bash
vercel env add TWILIO_ACCOUNT_SID production
vercel env add TWILIO_AUTH_TOKEN production
vercel env add TWILIO_WHATSAPP_FROM production
```

### Mercado Pago (wallet fiat)
```bash
vercel env add MP_ACCESS_TOKEN production
vercel env add MP_PUBLIC_KEY production
```

### KYC (Didit)
```bash
vercel env add DIDIT_API_KEY production
vercel env add DIDIT_WORKFLOW_ID production
vercel env add DIDIT_WEBHOOK_SECRET production
```

### Blockchain (Polygon anchor)
```bash
# Deployar smart contract primero (ver docs/CRYPTO-SETUP.md)
vercel env add POLYGON_RPC_URL production   # https://polygon-rpc.com
vercel env add ANCHOR_CONTRACT_ADDRESS production
vercel env add ANCHOR_PRIVATE_KEY production  # ⚠️ wallet con balance MATIC
```

Después de agregar env vars nuevas, siempre:
```bash
vercel --prod --force
```

---

## 8. CI/CD (opcional, ya quedó configurado)

Si querés activar GitHub Actions con preview deploys:
```bash
# En el repo GitHub → Settings → Secrets and variables → Actions
# Agregar secrets:
#   VERCEL_TOKEN
#   VERCEL_ORG_ID      (del proyecto vercel.json local)
#   VERCEL_PROJECT_ID  (del proyecto vercel.json local)

# Y agregar variable:
#   VERCEL_ENABLED=true
```

Después de eso, cada PR va a tener un deploy preview automático comentado en el PR.

---

## Troubleshooting

### `vercel link` falla con "not authorized"
- Usar `vercel logout && vercel login` (OAuth evita SAML)

### Build falla en Vercel por TypeScript error
- Los secrets son string vacíos pero tenés que setearlos igual (aunque sea "placeholder") para que el build arranque.

### Landing funciona pero dashboard 500
- Typical: falta `SUPABASE_SERVICE_ROLE_KEY` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verificá en Vercel → Deployments → Runtime Logs

### Tests E2E fallan contra producción
- El rate-limit test necesita ~40 requests secuenciales — si hay CDN/edge cache podría dar false positives. Skippealo en CI: `npx playwright test --grep-invert "rate limit"`
