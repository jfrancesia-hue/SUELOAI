# API Connection Guide — Suelo PY/BO

Este documento indica exactamente dónde conectar APIs externas.

## 1. Fiscal Paraguay — SIFEN/DNIT

Archivo: `lib/fiscal/providers.ts`
Clase: `ParaguaySifenProvider`
Método: `issue(input)`

Implementar:
1. Validar `ENABLE_FISCAL_ISSUING=true`.
2. Firmar payload según requerimiento SIFEN/DNIT.
3. Enviar a `SIFEN_API_URL` con `SIFEN_API_KEY`.
4. Guardar respuesta completa en `rawResponse`.
5. Retornar:
   - `status`
   - `fiscalCode`
   - `fiscalCodeExpiry`

## 2. Fiscal Bolivia — SIN

Archivo: `lib/fiscal/providers.ts`
Clase: `BoliviaSinProvider`
Método: `issue(input)`

Implementar igual que Paraguay, usando:
- `SIN_BOLIVIA_API_URL`
- `SIN_BOLIVIA_API_KEY`
- `SIN_BOLIVIA_ENVIRONMENT`

## 3. Depósitos bancarios

Archivo: `lib/payments/providers.ts`
Provider: `bank_transfer`

Estado actual:
- Crea movimiento `wallet_movements.status = pending`.
- No acredita saldo automáticamente.

Conectar:
- API bancaria/open banking si existe.
- O panel admin para aprobar/rechazar con comprobante.

## 4. Mercado Pago

Archivo: `lib/mercadopago/client.ts`

Estado actual:
- Crea preferencia si `MP_ACCESS_TOKEN` está configurado.

Pendiente:
- Confirmar disponibilidad y moneda por Paraguay/Bolivia.
- Si no aplica, apagar `ENABLE_MERCADOPAGO_DEPOSITS`.

## 5. Crypto custodial

Archivo base: `lib/crypto/hd-wallet.ts`

Regla productiva:
- No usar xprv en app.
- Usar Bitso, Circle, Fireblocks o proveedor custodial.
- Encender `NEXT_PUBLIC_ENABLE_CRYPTO=true` solo cuando depósitos/retiros tengan webhook y reconciliación.

## 6. KYC

Rutas:
- `app/api/kyc/route.ts`
- `app/api/kyc/webhook/route.ts`

Variables:
- `DIDIT_API_KEY`
- `DIDIT_WORKFLOW_ID`
- `DIDIT_WEBHOOK_SECRET`

Pendiente:
- Confirmar documentos aceptados Paraguay/Bolivia.
- Bloquear retiros sobre umbral si KYC no está aprobado.

## 7. Observabilidad

Archivo: `lib/logger.ts`

Pendiente:
- Conectar Sentry si se define `SENTRY_DSN`.
- Agregar log drains en Vercel.

## 8. Validación obligatoria

```bash
npm run verify
```


## 9. Agente comercial

Playbook: `docs/SALES-AGENT-PLAYBOOK.md`
Prompt integrable: `lib/ai/analyst/sales-playbook.ts`

Objetivo:
- Calificar inversores y developers.
- Resolver objeciones.
- Recomendar pr?ximos pasos.
- Mantener transparencia: no fingir identidad humana.
