# = Suelo v3  Crypto Setup Guide

Guía paso a paso para deploy del smart contract y configuración del módulo crypto.

---

##  Resumen

Suelo v3 agrega dos capas crypto:

1. **Payment Rail**  USDT/USDC como método de depósito/retiro en wallet
2. **Blockchain Anchoring**  Hashes SHA-256 de contratos registrados on-chain en Polygon para verificación pública

Ambas son **opcionales y no-breaking**: si no configurás las env vars, el sistema funciona 100% como estaba sin crypto.

---

## <?? PARTE 1: Deploy del Smart Contract Anchor

### Costos estimados

- **Deploy inicial**: ~$2-5 USD (en MATIC)
- **Por anchor individual**: ~$0.001-0.005 USD
- **Por batch de 100**: ~$0.05-0.10 USD
- **Fondeo recomendado**: 20 MATIC (~$10 USD) = ~3000 anchors

### Opción A: Deploy con Remix (recomendado para no-devs)

**Paso 1: Preparar wallet**

1. Instalá MetaMask en tu browser
2. Agregá red Polygon Mainnet:
   - Network Name: Polygon
   - RPC URL: `https://polygon-rpc.com`
   - Chain ID: `137`
   - Currency: MATIC
   - Explorer: `https://polygonscan.com`
3. Comprá ~20 MATIC (~$10 USD) en cualquier exchange y enviá a tu wallet

**Paso 2: Deploy**

1. Ir a [remix.ethereum.org](https://remix.ethereum.org)
2. Crear archivo nuevo: `SueloAnchor.sol`
3. Copiar el contenido de `lib/blockchain/SueloAnchor.sol` (está en el proyecto)
4. En el tab "Solidity Compiler":
   - Compiler: 0.8.20+
   - Click "Compile SueloAnchor.sol"
5. En el tab "Deploy & Run":
   - Environment: "Injected Provider - MetaMask"
   - Account: tu wallet con MATIC
   - Contract: SueloAnchor
   - Click "Deploy"
   - MetaMask te pide confirmar → Confirm
6. Copiar la address del contrato desplegado (ej: `0xAbCd...`)

**Paso 3: Verificar (opcional pero recomendado)**

1. Ir a [polygonscan.com](https://polygonscan.com)
2. Buscar tu contract address
3. Click "Contract" → "Verify and Publish"
4. Compiler: 0.8.20, Optimization: No
5. Pegar el código fuente
6. Verify

**Paso 4: Configurar en Suelo**

Agregar a `.env.local`:

```env
POLYGON_RPC_URL=https://polygon-rpc.com
ANCHOR_CONTRACT_ADDRESS=0xTuContractAddressHere
ANCHOR_PRIVATE_KEY=0xPrivateKeyDeTuWallet
```

⚠️ **CRÍTICO**: La `ANCHOR_PRIVATE_KEY` tiene acceso al wallet que paga gas. Usar una wallet **separada** solo para esto, sin fondos importantes. Mantener siempre saldo pequeño.

### Opción B: Deploy con Hardhat (para devs)

```bash
mkdir anchor-deploy && cd anchor-deploy
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

Crear `contracts/SueloAnchor.sol` con el contrato.

Config `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
  },
};
```

Script deploy `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const Anchor = await hre.ethers.getContractFactory("SueloAnchor");
  const anchor = await Anchor.deploy();
  await anchor.waitForDeployment();
  console.log("SueloAnchor deployed to:", await anchor.getAddress());
}

main().catch(console.error);
```

Ejecutar:

```bash
npx hardhat run scripts/deploy.js --network polygon
```

### Opción C: Deploy en testnet primero (Polygon Amoy)

Para testing sin gastar MATIC real:

1. Red: Polygon Amoy Testnet
2. RPC: `https://rpc-amoy.polygon.technology`
3. Chain ID: `80002`
4. Faucet: [faucet.polygon.technology](https://faucet.polygon.technology)
5. Explorer: `https://amoy.polygonscan.com`

---

##  PARTE 2: Wallet HD para Depósitos Crypto

Tenés **3 opciones** según nivel de sofisticación:

### Opción A: Custodial Provider (recomendado para producción)

**Circle Programmable Wallets (USDC)**

Pros: Oficial, regulado, incluye KYC, simple
Contras: Solo USDC, costo por wallet

1. Crear cuenta en [circle.com/developers](https://developers.circle.com)
2. Obtener API key + entity secret
3. Agregar a env:
```env
CIRCLE_API_KEY=
CIRCLE_ENTITY_SECRET=
```
4. Modificar `lib/crypto/hd-wallet.ts` para usar Circle SDK (ya tiene stub)

**Bitso Business (USDT TRC20 - LATAM)**

Pros: Fuerte en LATAM, Paraguay/Argentina/México, bajo costo
Contras: Onboarding lento (~2 semanas)

1. Aplicar en [bitso.com/business](https://bitso.com/business)
2. Cuentas e $10k USD/mes de volumen
3. API de creación de addresses por usuario

**Fireblocks (institutional)**

Pros: Máxima seguridad, multi-chain, HSM
Contras: Caro (~$15k/año mínimo)

Solo si vas a manejar volumen alto (>$1M mensual).

### Opción B: HD Wallet propio (MVP-friendly)

Usas una xpub maestra para derivar addresses deterministas. Cuando recibís un depósito, necesitás "barrer" los fondos a una hot wallet.

**Generar xpub maestra:**

```javascript
// scripts/generate-master-key.js
const { ethers } = require('ethers');
const wallet = ethers.HDNodeWallet.createRandom();
console.log('Mnemonic (guardar offline):', wallet.mnemonic.phrase);
console.log('xpub (agregar a .env):', wallet.neuter().extendedKey);
```

⚠️ **CRÍTICO**:
- Guardar el mnemonic offline (paper wallet, Ledger, Trezor)
- NUNCA subirlo a Git ni poner en servidor
- La xpub sí va en `.env` (es pública, solo genera addresses sin firma)

### Opción C: Shared Address + Memo (solo para Tron)

Para empezar rápido con bajo volumen:
- Una sola address Tron receptora
- Cada usuario usa un "memo" único (userId truncated)
- El monitor identifica al usuario por memo
- Ya implementado en `lib/crypto/hd-wallet.ts` para Tron

Pro: cero setup
Contra: requiere que usuarios copien el memo correctamente

---

##  PARTE 3: Monitoreo de Transacciones On-Chain

Cuando un usuario deposita crypto, necesitamos detectarlo. Dos enfoques:

### Opción A: Webhooks (recomendado)

**Alchemy Notify (EVM)**

1. Cuenta gratis en [alchemy.com](https://alchemy.com)
2. Crear app en Polygon Mainnet
3. Configurar webhook "Address Activity"
4. Addresses a monitorear: todas las derivadas
5. Webhook URL: `https://tu-dominio.com/api/crypto/webhook`
6. Agregar a env:
```env
ALCHEMY_API_KEY=
ALCHEMY_WEBHOOK_SIGNING_KEY=
```

**TronGrid (Tron)**

Tron no tiene webhooks nativos. Alternativas:
- Polling periódico a TronGrid API cada 30s
- Usar servicio como [Tatum.io](https://tatum.io) o [QuickNode](https://quicknode.com) que dan webhooks para Tron

### Opción B: Polling (más simple)

Cron job cada 30 segundos que llama al API:

```bash
# Vercel Cron (vercel.json)
{
  "crons": [{
    "path": "/api/crypto/poll",
    "schedule": "*/1 * * * *"
  }]
}
```

O externo: [cron-job.org](https://cron-job.org) gratis.

---

## = PARTE 4: API Keys de Explorers

Necesitás API keys para verificar transacciones on-chain:

- **Polygonscan**: [polygonscan.com/apis](https://polygonscan.com/apis)  gratis 5 req/s
- **Etherscan**: [etherscan.io/apis](https://etherscan.io/apis)  gratis 5 req/s
- **BSCScan**: [bscscan.com/apis](https://bscscan.com/apis)  gratis
- **TronGrid**: [trongrid.io](https://www.trongrid.io)  gratis con registro

```env
POLYGONSCAN_API_KEY=
ETHERSCAN_API_KEY=
BSCSCAN_API_KEY=
TRONGRID_API_KEY=
```

---

## ⚙️ PARTE 5: Aplicar migración SQL

En Supabase SQL Editor, ejecutar en orden:

1. `001_initial_schema.sql` (si no ejecutado antes)
2. `002_extensions.sql` (si no ejecutado antes)
3. `003_crypto.sql` (nuevo)

La migración 003 crea:
- `crypto_addresses`
- `crypto_transactions`
- `blockchain_anchors`
- `exchange_rates`
- `crypto_withdrawal_requests`
- Extensiones a `wallets` y `projects`
- Triggers de acreditación automática

---

##  PARTE 6: Testing

### Test 1: Anchor de hash

```bash
# Desde terminal
curl -X POST http://localhost:3000/api/crypto/anchor \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "hash": "abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    "metadata": "Test anchor"
  }'
```

Deberías recibir el tx_hash y ver el anchor en Polygonscan.

### Test 2: Generar address de depósito

```bash
curl -X POST http://localhost:3000/api/crypto/deposit \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"network": "polygon", "token": "USDC"}'
```

### Test 3: Procesar depósito manualmente

```bash
curl "http://localhost:3000/api/crypto/webhook?tx_hash=0x...&network=polygon&token=USDC"
```

---

##  CHECKLIST DE SEGURIDAD

Antes de deploy a producción:

- [ ] Private keys NUNCA en Git (verificar `.gitignore`)
- [ ] xpub maestra NO en env, solo xpub derivada
- [ ] Wallet operadora separada del wallet principal
- [ ] Alertas configuradas si balance MATIC < 5
- [ ] Webhook secret configurado y rotado mensualmente
- [ ] Rate limiting en API routes crypto (max 10 req/min por IP)
- [ ] 2FA obligatorio para retiros > $500
- [ ] KYC approved requerido para retiros crypto
- [ ] Monitoring de transacciones pendientes (alerta si >1h en confirming)
- [ ] Backup del mnemonic en 2 lugares físicos distintos
- [ ] Seguro de crypto custody (Nexus Mutual o similar)
- [ ] Auditoría del smart contract si anchor es crítico (opcional, contract es minimalista)

---

##  Tips de producción

**Optimización de gas:**
- Usar `batchAnchor()` si tenés múltiples hashes (ej: fin de día)
- Polygon gas es bajo pero aún así batch ahorra 60%

**Fallback si Polygon está caído:**
- El sistema degrada graceful: hash se guarda en DB sin anchor
- Cron job periódico re-intenta anchors pendientes

**Monitoring recomendado:**
- Sentry para errors de blockchain client
- Alerta si balance operador < threshold
- Dashboard con anchors pendientes, fallidos, success rate

**Compliance:**
- Log todos los anchors con timestamp en audit_logs
- Export mensual para contador/auditor
- Anchor NO es obligación legal (solo value-add de transparencia)

---

##  Soporte

Si algo no funciona:

1. Verificar logs del servidor: `vercel logs`
2. Verificar balance de operador: balance debe ser > $1 USD
3. Verificar que las env vars tienen prefijo correcto (NEXT_PUBLIC_ solo para vars de browser)
4. Smart contract verificado: cualquiera puede leer el código en Polygonscan
5. En caso de hack del operator wallet: solo perdés el gas restante. Anchors previos no se pueden alterar

---

**Última actualización:** Abril 2026
**Autor:** Jorge Eduardo Francesia  Nativos Consultora Digital
