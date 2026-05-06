# Suelo Agent Operating Manual

Este archivo define cómo debe trabajar un agente autónomo sobre Suelo. El objetivo es que el agente pueda operar el producto y dejar puntos claros donde solo falte conectar APIs reales.

## Mandato del agente

1. No habilitar producción con datos simulados.
2. No acreditar saldo sin trazabilidad.
3. No emitir comprobantes fiscales mock.
4. No habilitar crypto sin custodio/API real.
5. Mantener foco inicial en Paraguay (`PY`) y Bolivia (`BO`).
6. Antes de declarar éxito, ejecutar:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
   - `npm run test:e2e`

## Módulos críticos

### Mercados

Archivo: `lib/config/markets.ts`

Responsabilidad:
- Países habilitados: Paraguay y Bolivia.
- Monedas: USD, USDT, PYG, BOB.
- Mínimos de inversión.
- Proveedor fiscal por país.
- Umbrales KYC.

Si se agrega otro país, hacerlo desde este archivo primero.

### Feature flags

Archivo: `lib/config/features.ts`

Flags principales:
- `NEXT_PUBLIC_ENABLE_ADMIN`
- `NEXT_PUBLIC_ENABLE_AI_ANALYST`
- `NEXT_PUBLIC_ENABLE_KYC`
- `NEXT_PUBLIC_ENABLE_CRYPTO`
- `NEXT_PUBLIC_ENABLE_SECONDARY_MARKET`
- `ENABLE_FISCAL_ISSUING`
- `ENABLE_BANK_TRANSFER_DEPOSITS`
- `ENABLE_MERCADOPAGO_DEPOSITS`

Regla: si una integración externa no está conectada, su flag debe quedar apagado.

### Fiscal

Archivo: `lib/fiscal/providers.ts`

Funciones/interfaces:
- `FiscalProvider`
- `getFiscalProvider(country)`
- `provider.issue(input)`

APIs a conectar:
- Paraguay: SIFEN/DNIT.
- Bolivia: SIN.

Regla: `issue()` nunca debe devolver éxito si no llamó a una API fiscal real.

Variables esperadas:
- `SIFEN_API_URL`
- `SIFEN_API_KEY`
- `SIFEN_ENVIRONMENT`
- `SIN_BOLIVIA_API_URL`
- `SIN_BOLIVIA_API_KEY`
- `SIN_BOLIVIA_ENVIRONMENT`

### Pagos / depósitos

Archivo: `lib/payments/providers.ts`

Funciones/interfaces:
- `createDepositIntent(input)`

Providers:
- `bank_transfer`: genera movimiento pendiente para validación admin.
- `mercadopago`: redirecciona a checkout si `MP_ACCESS_TOKEN` está configurado.
- `crypto`: bloqueado hasta conectar custodio real.

Regla: un depósito pendiente no aumenta saldo; solo un webhook o aprobación admin debe acreditar.

### Admin

Rutas:
- `/admin`
- `/api/admin/overview`

Responsabilidad:
- Operación central PY/BO.
- Monitorear KYC pendientes.
- Monitorear wallet movements pendientes.
- Revisar feature flags y mercados.

Regla: solo perfiles `role = admin` pueden entrar.

## Checklist antes de producción

- Supabase real creado.
- Migraciones aplicadas en orden.
- RLS revisado.
- Admin real creado manualmente en `profiles`.
- Variables Vercel configuradas.
- `ENABLE_FISCAL_ISSUING=false` hasta conectar SIFEN/SIN.
- `NEXT_PUBLIC_ENABLE_CRYPTO=false` hasta conectar custodio.
- `NEXT_PUBLIC_ENABLE_SECONDARY_MARKET=false` hasta revisión legal.
- Tests verdes.

## Qué NO hacer

- No restaurar `/api/demo`.
- No usar contraseñas demo.
- No usar `stub`, `mock`, `fake` para dinero, KYC, fiscal o crypto.
- No guardar private keys crypto en Supabase ni Vercel.
- No emitir facturas con datos inventados.


## Agente comercial

El agente comercial debe seguir `docs/SALES-AGENT-PLAYBOOK.md`.

Reglas clave:
- Debe sonar natural, experto y cercano.
- Debe vender de forma consultiva, no agresiva.
- Debe reducir dudas con datos, documentación y próximos pasos claros.
- No puede hacerse pasar por una persona humana real.
- Si el usuario pregunta, debe decir que es el Asesor Suelo/asistente de la plataforma.
