# 🌱 Suelo v4 — Master Prompt para Claude Code

Documento maestro definitivo. Si tenés que leer UN solo archivo, es este.

---

## 📋 Qué es Suelo

**Suelo** es una plataforma SaaS latinoamericana de inversión inmobiliaria fraccionada con analista IA personal.

**Tagline:** "Invertí en lo que pisás, potenciado por IA"

**Target:** Paraguay (primary) → Argentina → Uruguay → Bolivia → Brasil

**Value props:**
- Desde USD 100 o 100 USDT cualquier persona invierte en real estate real
- Analista IA que accede a datos en tiempo real y recomienda personalizado
- Contratos verificables on-chain en Polygon
- Multi-moneda: ARS, PYG, USD, USDT, USDC
- CRM + facturación integrados para developers

---

## 🏗️ Arquitectura Completa del Producto

### Stack técnico

**Core:**
- Next.js 14 App Router + TypeScript
- Tailwind CSS (dark fintech premium)
- Supabase (Auth, Postgres con RLS, Realtime, Storage)
- Framer Motion animaciones

**IA:**
- OpenAI GPT-4o (analista + function calling)
- GPT-4o Vision (análisis documentos)
- text-embedding-3-large (búsqueda semántica)
- Whisper + TTS (voz, fase futura)

**Blockchain/Crypto:**
- ethers.js + tronweb
- Smart contract Solidity en Polygon (SueloAnchor.sol)
- Custodial providers: Circle/Bitso/Fireblocks (opcional)

**Payments:**
- Mercado Pago (fiat ARS/PYG)
- Crypto directo (USDT TRC20, USDC Polygon)
- Bancard (Paraguay, planeado)

**Comms:**
- Resend (emails)
- Twilio WhatsApp Business
- Supabase Realtime (notifications)

**Business logic:**
- AFIP (Argentina) + SIFEN (Paraguay) facturación
- Didit KYC LATAM
- jsPDF contratos

---

## 📁 Estructura del Proyecto

```
suelo/
├── app/
│   ├── (auth)/                  ✅ Login, Register
│   ├── (dashboard)/
│   │   ├── investor/            ✅ Dashboard inversor
│   │   ├── developer/           ✅ Dashboard developer
│   │   ├── assistant/           ✅ AI Analyst página completa
│   │   ├── projects/            ✅ CRUD proyectos
│   │   ├── marketplace/         ✅ Marketplace
│   │   ├── verify/              ✅ Verificación interna
│   │   ├── wallet/              ✅ Fiat
│   │   │   └── crypto/          ✅ Crypto wallet
│   │   ├── secondary-market/    🔨
│   │   ├── crm/                 🔨
│   │   ├── invoicing/           🔨
│   │   ├── notifications/       🔨
│   │   ├── referrals/           🔨
│   │   └── settings/            🔨
│   ├── api/
│   │   ├── ai/
│   │   │   └── chat/            ✅ AI Analyst
│   │   ├── crypto/              ✅ deposit, withdraw, webhook, anchor, rates
│   │   ├── wallet/              ✅ deposit, webhook MP
│   │   ├── projects/            ✅
│   │   ├── investments/         ✅
│   │   ├── contracts/           ✅
│   │   ├── verify/              ✅
│   │   └── hash/                ✅
│   └── verify/[hash]/           ✅ Pública
├── lib/
│   ├── ai/
│   │   ├── analyst/
│   │   │   ├── core.ts          ✅ System prompt + tools definition
│   │   │   └── tools.ts         ✅ Implementación de tools
│   │   ├── due-diligence/       🔨
│   │   ├── content/             🔨
│   │   ├── agents/              🔨
│   │   └── intelligence/        🔨
│   ├── crypto/                  ✅ hd-wallet, monitor, rates
│   ├── blockchain/              ✅ Smart contract + client
│   ├── openai/                  ✅
│   ├── mercadopago/             ✅
│   ├── afip/                    ✅
│   └── supabase-*.ts            ✅
├── components/
│   ├── ui/                      ✅
│   ├── landing/                 ✅ Navbar, Hero, Features, HowItWorks, Footer
│   ├── layout/Sidebar.tsx       ✅ Con AI
│   ├── ai/
│   │   └── FloatingAssistant.tsx ✅ Widget global
│   ├── wallet/                  🔨
│   ├── crm/                     🔨
│   ├── invoicing/               🔨
│   └── scoring/                 🔨
├── types/
│   ├── base.ts                  ✅
│   ├── index.ts                 ✅
│   └── crypto.ts                ✅
├── supabase/migrations/
│   ├── 001_initial_schema.sql   ✅
│   ├── 002_extensions.sql       ✅ CRM, Invoicing, Scoring
│   ├── 003_crypto.sql           ✅ Crypto + blockchain
│   └── 004_ai_rebrand.sql       ✅ AI + rebrand
└── docs/
    ├── MASTER-PROMPT.md         ✅ (este archivo)
    ├── AI-FEATURES.md           ✅ Spec módulo IA
    ├── CRYPTO-SETUP.md          ✅ Deploy smart contract
    ├── REBRAND-GUIDE.md         ✅ Nuevo branding
    ├── PARAGUAY-STRATEGY.md     ✅ Plan comercial
    ├── CODE-SNIPPETS.md         ✅ Código listo
    └── ROADMAP.md               ✅ 12 fases
```

---

## 🎯 Estado de Implementación

### ✅ Listo (core funcional)

- Landing, Auth, Dashboards, CRUD proyectos
- Marketplace con filtros
- Inversión fraccionada con contratos PDF
- Hash SHA-256 + verificación pública
- Wallet fiat con Mercado Pago
- Wallet crypto (USDT/USDC en Tron/Polygon)
- Smart contract de anchoring (código + cliente)
- **AI Analyst con function calling real**
- **FloatingAssistant widget**
- Sidebar con todos los items
- 4 migraciones SQL ejecutables

### 🔨 Pendiente (por fase)

**Prioridad alta:**
- Rediseño visual completo con imágenes reales
- Deploy smart contract Polygon
- Testing integración Mercado Pago
- Scoring IA en marketplace

**Prioridad media:**
- CRM completo con Kanban
- Facturación AFIP + SIFEN
- Notifications realtime
- KYC Didit

**Prioridad baja (fase 2):**
- Mercado secundario
- Agentes WhatsApp/Email
- Multi-idioma guaraní
- White-label para gobiernos

---

## 🎨 Sistema Visual

### Nombre y dominio

- **Marca:** Suelo
- **Dominio:** suelo.ai
- **Handle social:** @suelo.ai

### Paleta

```css
/* Brand (verde signature) */
--brand-500: #00C853;
--brand-600: #00A844;
--brand-700: #008836;

/* Tierra (nuevo acento) */
--earth-100: #F0E9DC;
--earth-500: #8B6F47;
--earth-900: #3D2E1A;

/* Surface (dark) */
--surface-0: #000000;
--surface-100: #111111;
--surface-200: #1a1a1a;
```

### Tipografía

- **Display:** Cabinet Grotesk (editorial premium)
- **Body:** Inter (legible UI)
- **Mono:** JetBrains Mono (hashes, código)

### Imágenes

Unsplash arquitectónicas reales. Ejemplos:
- Hero: `photo-1545324418-cc1a3fa10c00`
- Residencial: `photo-1600607687939-ce8a6c25118c`
- Loft: `photo-1512917774080-9991f1c4c750`

### Tone of voice

- Voseo argentino/LATAM ("invertí", "pisás")
- Profesional pero cercano
- Honesto con riesgos
- Sin jerga innecesaria

---

## 🔐 Variables de Entorno

Ver `.env.local.example` completo. Obligatorias para dev local:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (AI Analyst - crítico)
OPENAI_API_KEY=sk-...
```

Opcionales según features que uses:
- Mercado Pago (wallet fiat)
- Alchemy/Polygonscan (crypto monitoring)
- Smart contract vars (blockchain anchoring)
- Twilio, Resend (comms)
- AFIP, SIFEN (facturación)
- Didit (KYC)

---

## 🚀 Plan de Ejecución por Fases (12 fases)

### FASE 1 — Setup inicial (½ día)
1. `npm install`
2. Configurar `.env.local` con Supabase + OpenAI mínimo
3. Ejecutar las 4 migraciones en Supabase SQL Editor en orden
4. Testear `npm run dev`

### FASE 2 — Rediseño Visual + Branding (2-3 días) 🎨
1. Verificar que todo diga "Suelo" no "Suelo"
2. Aplicar fonts Cabinet Grotesk + Inter
3. Rediseñar Hero con imagen real de fondo
4. Rediseñar Marketplace cards con hero images
5. Rediseñar Project Detail con gallery
6. Agregar Framer Motion

### FASE 3 — AI Analyst (YA IMPLEMENTADO, solo validar) 🤖
1. Validar que `/assistant` funciona
2. Testear tool calling con OpenAI API real
3. Optimizar prompts según respuestas
4. Agregar onboarding conversacional

### FASE 4 — Deploy Smart Contract (1 día) 🔐
1. Seguir `docs/CRYPTO-SETUP.md`
2. Deploy SueloAnchor en Polygon (Remix)
3. Verificar en Polygonscan
4. Configurar env vars
5. Test anchor manual

### FASE 5 — Billetera Completa (2 días) 💰
1. Completar UI wallet fiat refinada
2. Integrar MP checkout real
3. Testing crypto deposits Tron/Polygon
4. UI retiros con 2FA
5. Historial unificado

### FASE 6 — Scoring IA en Marketplace (1 día) 📊
1. Ejecutar `generateProjectScoring` en proyectos existentes
2. Mostrar rating en cards
3. Panel scoring en detalle de proyecto
4. Radar chart con 5 dimensiones

### FASE 7 — Notifications Realtime (1 día) 🔔
1. NotificationBell en navbar
2. Hook useNotifications con Supabase Realtime
3. Integración Resend para emails críticos
4. Página `/notifications`

### FASE 8 — CRM Completo (3-4 días) 📊
1. Dashboard CRM + stats
2. Leads CRUD con filtros
3. Pipeline Kanban con @dnd-kit
4. Activities timeline
5. Campañas con WhatsApp via Twilio
6. IA para generar emails personalizados

### FASE 9 — Facturación AFIP + SIFEN + IA (3-4 días) 📄
1. Setup AFIP (upload certs)
2. Setup SIFEN para Paraguay
3. CRUD facturas con emisión
4. Vision API para facturas recibidas
5. Asistente fiscal IA
6. Libros IVA

### FASE 10 — Mercado Secundario (2-3 días) 🔄
1. Order book
2. Creación de órdenes
3. Trading engine atómico con wallet
4. Stats de volume/precio

### FASE 11 — KYC + Referidos (2 días) 🛡️
1. Integración Didit
2. Límites por status KYC
3. Sistema de referidos
4. Comisiones automáticas

### FASE 12 — Paraguay Launch + Polish + Deploy (2-3 días) 🇵🇾🚀
1. Integración SIFEN completa
2. Integración Bancard
3. Testing end-to-end
4. SEO + metadata
5. Vercel deploy
6. Webhooks producción
7. Monitoring (Sentry)

**Total estimado:** 4 semanas para producto Paraguay-ready completo.

**MVP mínimo vendible (10 días):**
Fases 1 + 2 + 3 + 5 + 6 + 12 → ya es demostrable a inversores.

---

## 💡 Comando inicial para Claude Code

Pegá esto como primer mensaje al arrancar Claude Code en la carpeta del proyecto:

```
Hola Claude. Continuamos el desarrollo de Suelo v4.

Lee primero /docs/MASTER-PROMPT.md completo — tiene toda la especificación.

Estado actual del proyecto:
- MVP v1 funcional (landing, auth, dashboards, marketplace, contratos PDF)
- v2 con extensiones (wallet fiat, tipos CRM/Invoicing/Scoring)
- v3 con módulo crypto (USDT/USDC, smart contract Polygon)
- v4 con rebrand Suelo + AI Analyst implementado

Documentos de referencia en /docs/:
- MASTER-PROMPT.md (este archivo con toda la spec)
- AI-FEATURES.md (módulo IA detallado)
- CRYPTO-SETUP.md (deploy smart contract)
- REBRAND-GUIDE.md (nuevo branding)
- PARAGUAY-STRATEGY.md (plan comercial)
- CODE-SNIPPETS.md (código listo para copiar)
- ROADMAP.md (plan de 12 fases día por día)

Arrancamos por FASE 1 (Setup). Por favor:
1. Revisá el estado actual del proyecto
2. Listame dependencies que faltan
3. Listame env vars obligatorias
4. Guiame en ejecutar las 4 migraciones Supabase
5. Corré npm install + test build
6. Reportame errores

Después FASE 2 (Rediseño Visual) para tener screenshots vendibles,
y FASE 3 (validar AI Analyst) que es nuestro diferenciador competitivo.

Metodología: vos codeás, yo reviso. Antes de crear nuevos archivos,
mostrame un plan de cambios para aprobación.
```

---

## 🎯 El Pitch

**Para inversores retail (LATAM):**

> "Con Suelo construís tu patrimonio en real estate real desde USD 100 o 100 USDT. Y lo mejor: tenés un analista IA personal que analiza miles de proyectos, evalúa tu perfil, y te acompaña en cada decisión. 24/7, en tu idioma."

**Para developers inmobiliarios:**

> "Suelo es la plataforma donde tus proyectos encuentran inversores de toda LATAM. CRM con IA, facturación electrónica automatizada, contratos con verificación blockchain. Todo en una sola herramienta."

**Para inversores VC:**

> "Suelo es el Mercado Pago del real estate LATAM — la primera plataforma AI-native de inversión fraccionada. Beachhead en Paraguay, expansión regional. Multi-stakeholder: retail, developers, gobierno. Stack moderno, regulación permisiva, ventana competitiva 18-24 meses."

---

## 💎 Diferenciadores Competitivos

| Feature | Suelo | Competidores |
|---|---|---|
| Analista IA personal con tools | ✅ Core | ❌ Inexistente |
| LATAM-native (no producto traducido) | ✅ Desde día 1 | ❌ Adaptación tardía |
| Fiat + Crypto como iguales | ✅ Native | ⚠️ Limitado |
| Blockchain anchoring opcional | ✅ Sin complicar UX | ⚠️ Fuerzan crypto |
| CRM + Facturación integrados | ✅ Todo-en-uno | ❌ Herramientas separadas |
| Scoring IA de proyectos | ✅ Automático | ❌ Manual o ausente |
| White-label para gobiernos | ✅ Ready | ❌ No |
| Compliance AFIP + SIFEN | ✅ Argentina + Paraguay | ❌ Uno solo |

---

## 🎓 Principios de Desarrollo

### Arquitectura

- **Multi-país ready** — todo con enum `country` y `currency`
- **Fiat + Crypto iguales** — no preferir uno sobre otro
- **KYC progresivo** — usuarios empiezan con límites
- **Blockchain opcional** — sistema funciona sin anchor
- **AI como layer opcional** — producto core funciona sin IA
- **Modular** — features se activan/desactivan con flags

### Código

- TypeScript estricto en todo
- Validación con Zod en inputs usuario
- RLS obligatorio en cada tabla
- Secrets solo en env vars
- Error boundaries en layouts
- Tests manuales mínimos antes de deploy

### UX

- Mobile-first siempre
- Dark mode consistente
- Loading states en todas las async
- Error messages accionables
- Spanish LATAM (voseo), no España
- Empty states con CTA claras
- Confirmaciones para acciones destructivas

### IA

- Nunca inventar datos — usar tool calls
- Siempre mencionar riesgos en recomendaciones
- Disclaimer "no asesoramiento fiscal/legal"
- Logging de todas las conversaciones
- Feedback loops (thumbs up/down)
- Rate limiting por tier de usuario
- Cost tracking por usuario

---

## 📊 Métricas de éxito

### MVP (semana 1-4)
- Producto corriendo sin crashes
- AI Analyst respondiendo con tool calls reales
- Smart contract deployed y verificado
- Primera inversión real end-to-end
- Deploy producción Vercel

### Paraguay Launch (mes 2-3)
- 50 beta users activos
- 3-5 developers founding members
- USD 100k capital captado
- NPS > 40

### Growth (mes 4-12)
- 500 inversores activos
- 30 developers
- USD 2M capital movido
- Break-even operativo

### Scale (año 2)
- 5000 inversores
- 200 developers
- USD 25M capital movido
- Expansión AR + UY + BO

---

## 🛠️ Tips Operativos

### Costos iniciales

- Supabase Free tier al principio
- Vercel Hobby para dev, Pro para prod ($20)
- OpenAI API: ~$100/mes con 100 usuarios activos
- Mercado Pago: por transacción
- Dominio + SSL: $20/año

**Total mes 1-3:** <$200 USD

### Servicios gratuitos a aprovechar

- Supabase Free: 500MB DB, 50k MAU
- Vercel Hobby: deploy gratis
- Resend: 3k emails/mes gratis
- Alchemy: 300M compute units/mes gratis
- Polygonscan: API gratis
- Cron-job.org: cron gratis

### Monitoring esencial

- Sentry free tier (5k errors/mes)
- Vercel Analytics incluido
- Supabase Dashboard para queries
- OpenAI Usage Dashboard para tokens
- Uptime Robot free (monitoring externo)

---

## 🎬 Marketing Narrative

**Hook:**
> "¿Qué pasaría si pudieras invertir en real estate con un analista Warren Buffett en tu bolsillo?"

**Problem:**
> "Invertir en propiedades es para pocos. Necesitás USD 50k+, tiempo para research, intermediarios caros, y la suerte de acertar con el developer correcto."

**Solution:**
> "Suelo democratiza todo eso. Desde USD 100 accedés a proyectos curados, tu analista IA te guía, contratos verificables, retornos transparentes."

**Why now:**
> "LATAM tiene 600M habitantes con ahorros en USDT, propiedad como refugio cultural, y cero plataformas que unan las 3 cosas. La ventana es ahora."

**Why us:**
> "Somos LATAM-native, no adaptamos un producto europeo. Conocemos inflación, cepos, voseo, guaraníes y pesos. Construimos para nosotros, primero."

---

## 📞 Soporte y recursos

### Documentación técnica
- Next.js: nextjs.org/docs
- Supabase: supabase.com/docs
- OpenAI: platform.openai.com/docs
- Polygon: docs.polygon.technology
- Mercado Pago: mercadopago.com.ar/developers

### Comunidades
- LATAM Tech: latamlist.com
- Bitcoin Paraguay Telegram
- Next.js Discord
- Anthropic Discord

### Contactos clave Paraguay
Ver `docs/PARAGUAY-STRATEGY.md` sección completa de networking.

---

## 🚀 El Plan en una Línea

> **Construí un MVP en 10 días → Validá con 5 developers paraguayos → Ajustá con feedback → Launch público → 1000 usuarios en 6 meses → Raise seed → Expansión regional.**

Tenés todo para ejecutarlo. La tecnología está construida. Los docs están completos. La estrategia es clara.

Ahora es puro ejecución.

---

**Última actualización:** Abril 2026
**Autor:** Jorge Eduardo Francesia — Nativos Consultora Digital
**Versión:** v4.0 — Suelo AI
**Partner IA:** Claude Opus 4.7 (Anthropic)

🌱 **Suelo — Invertí en lo que pisás, potenciado por IA**
