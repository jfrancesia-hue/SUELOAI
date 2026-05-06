# 🌱 Suelo — v4.0

> **Invertí en lo que pisás, potenciado por IA (Claude)**

Plataforma SaaS latinoamericana de inversión inmobiliaria fraccionada con analista IA personal, wallet multi-moneda (ARS/PYG/USD/USDT), trazabilidad blockchain, CRM para developers y facturación electrónica automatizada.

**Creado por:** Jorge Eduardo Francesia — Nativos Consultora Digital 🇦🇷
**Target:** Paraguay 🇵🇾 → Argentina → Uruguay → Bolivia

---

## 🎯 Lo que hace único a Suelo

- 🤖 **Analista IA personal** con function calling real — no un chatbot genérico
- 🌎 **LATAM-native** desde el día uno — no un producto europeo traducido
- 💰 **Fiat + Crypto como iguales** — ARS, PYG, USD, USDT, USDC
- 🔐 **Blockchain anchoring opcional** — transparencia sin fricción
- 📊 **CRM + Facturación integrados** — developers operan todo en una sola herramienta
- ✨ **AI-generated content** — descripciones, reportes, emails automáticos
- 🛡️ **Compliance ready** — AFIP + SIFEN integrados

---

## 📚 Documentación (¡LEER EN ORDEN!)

Si vas a continuar el desarrollo, leé los docs en este orden:

1. **`docs/MASTER-PROMPT.md`** → Spec completa del producto (EMPEZAR AQUÍ)
2. **`docs/AI-FEATURES.md`** → Detalle del módulo de IA
3. **`docs/CRYPTO-SETUP.md`** → Deploy smart contract paso a paso
4. **`docs/REBRAND-GUIDE.md`** → Sistema visual y tone of voice
5. **`docs/PARAGUAY-STRATEGY.md`** → Plan comercial para Paraguay
6. **`docs/CODE-SNIPPETS.md`** → Código listo para copiar
7. **`docs/ROADMAP.md`** → Plan de 12 fases día por día

---

## ⚡ Quick Start

```bash
# 1. Instalar dependencies
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# Obligatorias mínimas:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   NEXT_PUBLIC_APP_URL
#   ANTHROPIC_API_KEY  (Claude — el AI Analyst corre sobre Anthropic SDK)

# 3. Ejecutar migraciones en Supabase SQL Editor EN ORDEN:
#   supabase/migrations/001_initial_schema.sql
#   supabase/migrations/002_extensions.sql
#   supabase/migrations/003_crypto.sql
#   supabase/migrations/004_ai_rebrand.sql
#   supabase/migrations/005_claude_migration.sql

# 4. Arrancar dev server
npm run dev
```

Abrir http://localhost:3000

---

## 📁 Estructura

```
suelo/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, Register
│   ├── (dashboard)/       # Todo lo protegido
│   │   ├── assistant/     # ← AI Analyst página dedicada
│   │   ├── wallet/        # Fiat + Crypto
│   │   ├── marketplace/
│   │   ├── projects/
│   │   └── ...
│   ├── api/               # API routes
│   │   ├── ai/chat/       # ← AI Analyst API
│   │   ├── crypto/        # deposits, withdrawals, anchor
│   │   └── ...
│   └── verify/[hash]/     # Verificación pública
├── lib/
│   ├── ai/analyst/        # ← AI Analyst core
│   ├── crypto/            # HD wallet, monitor, rates
│   ├── blockchain/        # Smart contract + client
│   ├── openai/            # Scoring, vision
│   ├── mercadopago/
│   └── afip/
├── components/
│   ├── ui/                # Design system
│   ├── landing/           # Hero, Features, etc.
│   ├── layout/Sidebar.tsx # Con "Mi Analista IA"
│   └── ai/FloatingAssistant.tsx # Widget global
├── types/
├── supabase/migrations/   # 4 migraciones SQL
├── styles/globals.css
└── docs/                  # ← Documentación crítica
```

---

## 🎯 Estado del Proyecto

### ✅ Implementado

- Landing, Auth, Dashboards completos
- Middleware con rutas protegidas (incluye `/ai-analyst`, `/assistant`, `/wallet`, `/crm`, `/invoicing`, `/secondary-market`)
- Marketplace + CRUD proyectos
- Inversión fraccionada con contratos PDF + hash SHA-256
- Verificación pública
- Wallet fiat con Mercado Pago
- Wallet crypto (Tron + Polygon) con email de confirmación + notificación admin para retiros >$1000
- Smart contract Solidity
- **AI Analyst con 9 tools de tool use sobre Claude Sonnet 4.6** (function calling migrado de OpenAI → Anthropic SDK)
- API routes IA: `/api/ai/chat`, `/api/ai/onboarding`, `/api/ai/analyze-project`, `/api/ai/generate-content`, `/api/ai/recommendations`
- FloatingAssistant global
- 5 migraciones SQL ejecutables

### 🔨 Pendiente

- Rediseño visual con imágenes reales
- CRM completo (Kanban, campañas, WhatsApp)
- Facturación AFIP + SIFEN
- Scoring IA visible en marketplace
- Notifications realtime
- Mercado secundario
- KYC Didit
- Deploy producción

---

## 💡 Próximos pasos en Claude Code

1. Descomprimir este proyecto
2. Abrir carpeta en terminal
3. Instalar Claude Code: `npm install -g @anthropic-ai/claude-code`
4. Ejecutar: `claude`
5. Pegar el comando inicial que está en `docs/MASTER-PROMPT.md`

Claude Code va a guiarte fase por fase siguiendo el ROADMAP.

---

## 🛠️ Stack Técnico

Next.js 14 · TypeScript · Tailwind CSS · Supabase · Framer Motion · ethers.js · tronweb · **Claude (Anthropic SDK — Opus 4.7 + Sonnet 4.6 + Haiku 4.5 con tool use)** · Mercado Pago · AFIP · Twilio · Resend · Polygon blockchain · jsPDF

### Modelo IA por módulo

| Módulo | Modelo default | Por qué |
|---|---|---|
| Project scoring | `claude-opus-4-7` | Análisis profundo + JSON schema estricto |
| Invoice vision (OCR AFIP/SIFEN) | `claude-opus-4-7` | High-res vision + comprensión de layout |
| AI Analyst (chat + tool use) | `claude-sonnet-4-6` | Balance velocidad/calidad |
| Fiscal assistant | `claude-sonnet-4-6` | Respuestas conversacionales |
| Onboarding | `claude-sonnet-4-6` | Tool use para `save_user_profile` |
| Generación de contenido | `claude-sonnet-4-6` | Descripciones + reportes trimestrales |
| Haiku (reserved) | `claude-haiku-4-5` | Workloads de clasificación rápida |

Modelos configurables via `ANTHROPIC_MODEL_ANALYST`, `ANTHROPIC_MODEL_SCORING`, `ANTHROPIC_MODEL_FAST`.

---

## 🎨 Brand

- **Nombre:** Suelo
- **Dominio:** suelo.ai
- **Tagline:** "Invertí en lo que pisás, potenciado por IA"
- **Paleta:** Verde #00C853 + tonos tierra
- **Tipografía:** Cabinet Grotesk (display) + Inter (body)

---

## 🌎 Mercados objetivo

### Fase 1 — Paraguay 🇵🇾
Mercado piloto: regulación permisiva, alta adopción USDT, dolarización, mercado real estate en crecimiento

### Fase 2 — Argentina 🇦🇷
Expansión con features AFIP, refugio contra inflación

### Fase 3 — Uruguay 🇺🇾
Premium + protección jurídica

### Fase 4 — Bolivia 🇧🇴, Brasil 🇧🇷
Expansión regional

---

## 📊 Proyección de Negocio

### Año 1 (conservador)
- 500 inversores activos
- 30 developers contratados
- USD 2M capital captado
- Revenue ~USD 75k
- Break-even mes 10-12

### Año 2
- 5000 inversores
- 200 developers
- USD 25M capital
- Revenue USD 800k-1M
- Expansión regional iniciada

---

## 🎓 Credits

- **Product & Code:** Jorge Eduardo Francesia
- **IA Development Partner:** Claude Opus 4.7 (Anthropic)
- **Licencia:** Proyecto privado — Nativos Consultora Digital © 2026

---

## 🌱 The Vision

> **Suelo es el Bloomberg Terminal del real estate LATAM.**
>
> Cualquier persona con USD 100 o 100 USDT puede acceder a inversiones inmobiliarias reales, con un analista IA que las acompaña 24/7. Cada contrato es verificable públicamente. Cada retorno es transparente. Cada decisión está informada.
>
> Democratizamos el acceso al activo más seguro del mundo, potenciado por la tecnología del presente.
