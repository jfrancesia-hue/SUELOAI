# 🚀 Deploy — Suelo v4

Guía paso a paso para deployar Suelo a producción usando **Vercel + Supabase**.
Estimado: ~45 minutos end-to-end si las credenciales ya están listas.

---

## 1. Prerequisitos (antes de empezar)

- [ ] Cuenta Vercel (free tier alcanza para MVP)
- [ ] Proyecto Supabase creado → tomar `NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`
- [ ] API key de Anthropic (console.anthropic.com) — **obligatoria**, toda la IA corre en Claude
- [ ] Dominio apuntado (opcional al principio — Vercel da subdominio `.vercel.app` gratis)

**Opcionales** (se pueden agregar después):
- Mercado Pago access token (wallet fiat)
- Resend API key (emails transaccionales)
- Twilio (WhatsApp del CRM)
- Didit (KYC)
- Alchemy + contract address (blockchain anchoring)

---

## 2. Supabase — ejecutar migraciones en orden

En el SQL Editor del proyecto Supabase, correr **en este orden** (cada uno es idempotente, pero el orden importa por FKs):

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_extensions.sql
supabase/migrations/003_crypto.sql
supabase/migrations/004_ai_rebrand.sql
supabase/migrations/005_claude_migration.sql
supabase/migrations/006_crm_invoicing_secondary.sql
```

Después (opcional), si querés datos demo de "Nativos Consultora":
1. Registrarte como developer en tu frontend local o en Supabase Auth UI
2. Copiar tu UUID de `auth.users`
3. Editar `supabase/seed.sql` → reemplazar `v_dev_id`
4. Ejecutar `seed.sql` en SQL Editor

**Seguridad post-migración**: verificar que RLS esté activo en todas las tablas:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```
Toda fila debe tener `rowsecurity = true`.

---

## 3. Vercel — deploy inicial

### 3.1 Conectar repo

```bash
# Opción A — Vercel CLI
npm i -g vercel
vercel login
cd path/to/suelo
vercel link
```

```bash
# Opción B — desde la web
# Ir a vercel.com/new → importar el repo de GitHub
```

### 3.2 Configurar environment variables

En **Project Settings → Environment Variables**, agregar (para Production, Preview y Development):

**Obligatorias:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://suelo.ai          # o tu *.vercel.app
NEXT_PUBLIC_APP_NAME=Suelo
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL_ANALYST=claude-sonnet-4-6
ANTHROPIC_MODEL_SCORING=claude-opus-4-7
ANTHROPIC_MODEL_FAST=claude-haiku-4-5
```

**Recomendadas:**
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=no-reply@suelo.ai
ADMIN_NOTIFY_EMAILS=admin@suelo.ai
```

**Opcionales según features activadas:**
- Wallet fiat: `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`
- CRM WhatsApp: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
- KYC: `DIDIT_API_KEY`, `DIDIT_WORKFLOW_ID`, `DIDIT_WEBHOOK_SECRET`
- Crypto on-chain: `POLYGON_RPC_URL`, `ANCHOR_CONTRACT_ADDRESS`, `ANCHOR_PRIVATE_KEY`

### 3.3 Deploy

```bash
vercel --prod
```

O push a `main` si ya conectaste el repo por GitHub.

---

## 4. Post-deploy: checklist de producción

- [ ] Landing carga en la URL de Vercel
- [ ] `/login` y `/register` funcionan
- [ ] Crear un usuario de prueba → debe loguear y redirigir a `/investor` o `/developer`
- [ ] Middleware protege: abrir `/wallet` sin sesión → redirige a `/login`
- [ ] AI Analyst responde (ir a `/ai-analyst` o usar FloatingAssistant) — requiere `ANTHROPIC_API_KEY`
- [ ] Headers de seguridad activos (ver con `curl -I https://tu-url.vercel.app`)
- [ ] Supabase RLS bloquea acceso cruzado entre usuarios

### Testing manual por módulo

| Módulo | Probar | URL |
|---|---|---|
| Auth | register → login → logout | `/register` |
| Marketplace | ver proyectos + badge IA A/B/C/D | `/marketplace` |
| AI Analyst | conversación + tool use | `/ai-analyst` |
| CRM | crear contacto → lead → deal en pipeline (drag & drop) | `/crm` |
| Facturación | crear + emitir factura draft | `/invoicing` |
| Mercado secundario | listar + comprar | `/secondary-market` |
| Wallet crypto | generar address Tron/Polygon | `/wallet/crypto` |

---

## 5. Webhooks que se deben registrar

Si activás features que dependen de callbacks externos:

| Provider | URL a registrar | Variables relacionadas |
|---|---|---|
| Mercado Pago | `https://tu-url.vercel.app/api/wallet/webhook` | `MP_ACCESS_TOKEN` |
| Alchemy (EVM) | `https://tu-url.vercel.app/api/crypto/webhook` | `ALCHEMY_WEBHOOK_SIGNING_KEY` |
| Didit (KYC) | `https://tu-url.vercel.app/api/kyc/webhook` | `DIDIT_WEBHOOK_SECRET` (HMAC) |

---

## 6. Dominio personalizado

1. Vercel → Project → Settings → Domains → Add `suelo.ai`
2. Agregar los registros DNS que pide (CNAME o A record)
3. Actualizar `NEXT_PUBLIC_APP_URL` a `https://suelo.ai` y re-deployar
4. Re-registrar los webhooks con la URL nueva

---

## 7. Monitoreo

- **Logs**: Vercel Dashboard → Project → Logs (últimas 24h gratis)
- **Errors**: `console.error` queda en Runtime logs; agregar Sentry si querés persistencia
- **Supabase**: Dashboard → Logs (queries, auth, storage)
- **Claude usage/cost**: Anthropic Console → Usage

---

## 8. Lo que falta antes de producción real

Esta versión (v4.0) es **MVP funcional**, no production-grade todavía. Antes de habilitar pagos reales:

- [ ] **AFIP**: reemplazar `lib/afip/client.ts` (hoy stub) por SDK oficial + certificados por tenant
- [ ] **Rate limiting** en API routes (Vercel KV + middleware o Upstash)
- [ ] **Sentry** / observability para errores runtime
- [ ] **Tests E2E** de flujos críticos (Playwright)
- [ ] **Backups automáticos** en Supabase (Pro plan)
- [ ] **Auditoría de seguridad** de smart contract antes de deploy a Polygon Mainnet
- [ ] **CSP header** estricto (hoy tenemos solo los básicos en `vercel.json`)
- [ ] **Legal**: ToS, privacy policy, compliance en cada jurisdicción (AR/PY/UY)

---

## Troubleshooting común

### `prerender-error` al build
→ Alguna page debajo de `(dashboard)` o `(auth)` llama a Supabase sin `dynamic = 'force-dynamic'`. Los layouts ya lo tienen aplicado.

### `Claude 401 Invalid API key`
→ Falta `ANTHROPIC_API_KEY` en environment vars de Vercel.

### Campañas WhatsApp no envían
→ Verificar que `TWILIO_WHATSAPP_FROM` esté registrado como sender en Twilio y el número destino haya hecho opt-in (sandbox de Twilio exige doble opt-in).

### `get_weather` tool no funciona en el AI Analyst
→ El tool no existe en el sistema, es del ejemplo de docs. Los tools reales son los 9 de `lib/ai/analyst/core.ts:ANALYST_TOOLS`.
