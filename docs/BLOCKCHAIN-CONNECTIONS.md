# Suelo AI - Guía de conexiones Blockchain

Esta guía deja listo el camino para conectar blockchain sin fricción y sin exponer claves sensibles. El enfoque recomendado para Paraguay y Bolivia es avanzar por etapas: primero trazabilidad documental, después wallet interna, luego depósitos stablecoin y finalmente tokenización solo con revisión legal.

## 1. Estrategia recomendada

### Fase 1 - Hash documental en Polygon
- Registrar hashes de contratos, documentos KYC, anexos, comprobantes y reportes.
- No se publica información privada: solo un hash verificable.
- Permite demostrar que un documento existía y no fue alterado.

### Fase 2 - Wallet interna Suelo
- Mantener saldo interno en USD/USDT.
- Conciliar depósitos, retiros e inversiones desde el panel admin.
- Evitar retiros automáticos grandes: usar aprobación manual.

### Fase 3 - Depósitos USDT/USDC
- Tron TRC20: recomendado para USDT de bajo costo.
- Polygon: recomendado para USDC/USDT y compatibilidad EVM.
- Confirmar depósito por webhook + explorer + conciliación interna.

### Fase 4 - Retiros con control
- KYC aprobado obligatorio.
- Confirmación por email.
- Umbrales de aprobación admin.
- Logs de auditoría y monitoreo antifraude.

### Fase 5 - Tokenización futura
- Solo después de definir estructura legal, contratos, custodia, derechos del inversor y tratamiento regulatorio local.
- No prometer retornos garantizados.
- Separar “token de utilidad/registro” de “valor negociable” hasta revisión legal.

## 2. Variables de entorno

Estas variables ya están contempladas en `.env.local.example`.

```bash
# Blockchain anchoring
POLYGON_RPC_URL=https://polygon-rpc.com
ANCHOR_CONTRACT_ADDRESS=0x...
ANCHOR_PRIVATE_KEY=0x...
CRYPTO_WEBHOOK_SECRET=random-secure-string-here

# Explorers
POLYGONSCAN_API_KEY=
TRONGRID_API_KEY=
ETHERSCAN_API_KEY=
BSCSCAN_API_KEY=

# Direcciones públicas derivadas
CRYPTO_MASTER_XPUB_EVM=xpub...
CRYPTO_MASTER_XPUB_TRON=xpub...

# Proveedores opcionales/custodiales
CIRCLE_API_KEY=
CIRCLE_ENTITY_SECRET=
BITSO_API_KEY=
BITSO_API_SECRET=
BITSO_TRON_HOT_WALLET=TX...
```

## 3. Reglas de seguridad

- Nunca poner `ANCHOR_PRIVATE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, seed phrases, xprv o secretos en variables `NEXT_PUBLIC_*`.
- La app frontend solo puede ver direcciones públicas, estados y links de explorer.
- Usar un signer con saldo mínimo para anchors; no guardar fondos grandes en hot wallet.
- Para retiros reales, preferir custodio profesional o multisig.
- Rotar `CRYPTO_WEBHOOK_SECRET` si se sospecha exposición.
- Registrar en auditoría: usuario, IP, monto, red, token, tx hash, estado y aprobador.

## 4. Redes sugeridas

| Red | Uso recomendado | Motivo |
| --- | --- | --- |
| Polygon | Hash documental y contratos | EVM, bajo costo, buen tooling |
| Tron | Depósitos USDT TRC20 | Muy usado en LATAM y comisiones bajas |
| Ethereum | Reputación institucional | Costos altos; no empezar por acá |
| BNB Chain | Alternativa stablecoin | Activar solo si hay demanda |

## 5. Endpoints agregados

- `GET /api/blockchain/status`  
  Devuelve estado seguro de configuración sin mostrar secretos.

- `GET /api/readiness`  
  Estado general de producción: Supabase, demo mode, emails, KYC y otros.

- `/blockchain`  
  Panel visual dentro del dashboard para revisar fases, conexiones y reglas.

## 6. Checklist antes de producción

- [ ] `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] Supabase URL, anon key y service role configurados en Vercel.
- [ ] `POLYGON_RPC_URL` real configurado.
- [ ] Contrato anchor desplegado y `ANCHOR_CONTRACT_ADDRESS` cargado.
- [ ] `ANCHOR_PRIVATE_KEY` guardada solo en backend/Vercel env o vault.
- [ ] `CRYPTO_WEBHOOK_SECRET` fuerte y único.
- [ ] Retiros crypto con KYC, confirmación email y aprobación admin.
- [ ] Política legal y riesgos visibles para inversores.
- [ ] Logs y alertas operativas en admin.

## 7. Conexión con Supabase

El proyecto Supabase informado por el usuario es:

```text
https://uozpjqogtssnvknxayan.supabase.co
```

Para operación real todavía faltan claves privadas que no deben compartirse públicamente:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Cuando estén cargadas en `.env.local` y en Vercel, el modo demo debe apagarse.
