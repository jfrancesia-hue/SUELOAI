# Production Readiness — SueloAI

Checklist para pasar de demo visual a producción real.

## 1. Performance

- Next Image configurado con AVIF/WebP, cache largo y tamaños controlados.
- Imágenes críticas usan `priority` solo en hero principal.
- Imágenes secundarias usan lazy-loading de Next por defecto y `quality` reducido.
- Antes de lanzar, ejecutar Lighthouse mobile y revisar:
  - LCP menor a 2.5s
  - CLS menor a 0.1
  - JS inicial razonable

## 2. Health & readiness

Endpoints:

- `/api/health` → vivo/responde.
- `/api/readiness` → valida variables críticas para producción.

En producción, `/api/readiness` debe responder `200`. Si responde `503`, revisar checks.

## 3. Variables obligatorias

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_DEMO_MODE=false`

Variables recomendadas:

- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `DIDIT_API_KEY`
- `DIDIT_WORKFLOW_ID`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `ANTHROPIC_API_KEY`

## 4. Comando local

```bash
npm run production:check
```

Para usarlo local con `.env.local`, cargar las variables antes o correrlo desde el entorno de deploy.

## 5. Supabase

Proyecto indicado:

- `https://uozpjqogtssnvknxayan.supabase.co`

Falta copiar desde Supabase Dashboard:

- anon key
- service role key

Luego:

1. Ejecutar migraciones SQL.
2. Crear usuarios reales o registrar desde UI.
3. Apagar demo mode.
4. Revisar `/api/readiness`.

## 6. Auth / contraseña

- Recuperación de contraseña ya usa Supabase Auth en modo real.
- En demo mode simula éxito para no bloquear la navegación visual.

## 7. Antes de abrir al público

- Probar registro/login/logout.
- Probar forgot/reset password con email real.
- Probar KYC sandbox/producción.
- Revisar RLS de Supabase.
- Revisar admin solo para role `admin`.
- Configurar dominio final en Supabase Auth redirect URLs.
- Configurar Vercel env vars para preview y production.
