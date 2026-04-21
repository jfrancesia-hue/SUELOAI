# 🗺️ Suelo v2 — Roadmap Ejecutivo

## Vista general de fases

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: SETUP & MIGRACIÓN                    [½ día]   ✓ READY  │
├─────────────────────────────────────────────────────────────────┤
│ FASE 2: REDISEÑO VISUAL                     [2-3 días]  CRITICAL│
├─────────────────────────────────────────────────────────────────┤
│ FASE 3: BILLETERA VIRTUAL COMPLETA         [2 días]            │
├─────────────────────────────────────────────────────────────────┤
│ FASE 4: NOTIFICACIONES + REALTIME          [1 día]             │
├─────────────────────────────────────────────────────────────────┤
│ FASE 5: SCORING IA                         [1 día]      HIGH-IMPACT│
├─────────────────────────────────────────────────────────────────┤
│ FASE 6: CRM COMPLETO                        [3-4 días]  DIFFERENTIATOR│
├─────────────────────────────────────────────────────────────────┤
│ FASE 7: FACTURACIÓN + AFIP + IA            [3-4 días]  KILLER   │
├─────────────────────────────────────────────────────────────────┤
│ FASE 8: MERCADO SECUNDARIO                 [2-3 días]           │
├─────────────────────────────────────────────────────────────────┤
│ FASE 9: KYC + REFERIDOS                    [2 días]             │
├─────────────────────────────────────────────────────────────────┤
│ FASE 10: POLISH + DEPLOY                   [2 días]             │
└─────────────────────────────────────────────────────────────────┘

TOTAL ESTIMADO: 3-4 semanas de trabajo focused
```

---

## FASE 1 — Setup (½ día)

### Tareas
- [ ] Clonar/partir del estado actual
- [ ] Instalar nuevas dependencies (ver CODE-SNIPPETS.md)
- [ ] Ejecutar migración `002_extensions.sql` en Supabase
- [ ] Configurar variables de entorno completas
- [ ] Testear `npm run dev`

### Servicios a crear cuentas
- [ ] OpenAI API key
- [ ] Mercado Pago developer account
- [ ] Resend account
- [ ] Twilio account (sandbox gratis)
- [ ] Didit para KYC (puede posponerse)
- [ ] AFIP — certificados de homologación

### Output
- Proyecto corriendo con v2 schema + todas las dependencies

---

## FASE 2 — Rediseño Visual (2-3 días) 🎨

### Objetivo
Transformar el look & feel de "MVP funcional" a "producto premium vendible a gobiernos y corporativos".

### Tareas

**Día 1: Fundamentos visuales**
- [ ] Actualizar `globals.css` con Cabinet Grotesk + Inter
- [ ] Agregar color tokens de tierra/arquitectura
- [ ] Crear sistema de utilities para imágenes (lazy loading, placeholders)
- [ ] Instalar y configurar Framer Motion

**Día 2: Landing completo**
- [ ] Rediseñar Hero con imagen de fondo + overlays
- [ ] Rediseñar Features con cards más sofisticadas
- [ ] Rediseñar How It Works con imágenes ilustrativas
- [ ] Agregar sección de testimoniales (stock photos)
- [ ] Agregar sección "Proyectos Destacados" con preview del marketplace
- [ ] Rediseñar Footer con más enlaces y branding

**Día 3: Dashboard + Marketplace**
- [ ] Rediseñar Sidebar con todos los nuevos items
- [ ] Rediseñar ProjectCard del marketplace (ver SNIPPET 2)
- [ ] Rediseñar Detalle de Proyecto con:
  - Hero image grande con gallery
  - Panel lateral sticky de inversión
  - Sección de scoring
  - Tabs: Descripción / Docs / Inversores / Updates
- [ ] Dashboards (Investor + Developer) con cards más pulidos
- [ ] Empty states con ilustraciones

### Output
- Producto visualmente 10x mejor
- Ready para screenshots en pitch deck

---

## FASE 3 — Billetera Virtual (2 días) 💰

### Día 1
- [ ] Completar página `/wallet` con UI refinada
- [ ] API: `/api/wallet/deposit` (✅ ya existe base)
- [ ] API: `/api/wallet/withdraw` con validación KYC
- [ ] API: `/api/wallet/transfer` entre usuarios
- [ ] API: `/api/wallet/webhook` para MP (✅ ya existe base)

### Día 2
- [ ] Integración completa Mercado Pago checkout
- [ ] Flow de retiros con confirmación email
- [ ] Historial paginado con filtros
- [ ] Graph de balance en tiempo con Recharts
- [ ] Export a Excel de movimientos

### Output
- Wallet 100% funcional para depósitos reales
- Mercado Pago integrado con webhooks

---

## FASE 4 — Notificaciones Realtime (1 día) 🔔

- [ ] Componente `NotificationBell` en navbar/sidebar
- [ ] Hook `useNotifications` con Supabase Realtime (ver SNIPPET 8)
- [ ] Página `/notifications` con lista completa
- [ ] Triggers en DB para eventos clave:
  - Al confirmarse inversión → notificar inversor y developer
  - Al completar depósito → notificar usuario
  - Al llegar proyecto a 100% → notificar developer
- [ ] Integración email via Resend para eventos críticos
- [ ] Browser push notifications (opcional)

### Output
- Sistema de notificaciones en tiempo real
- Emails transaccionales funcionando

---

## FASE 5 — Scoring IA (1 día) 🤖

- [ ] API `/api/scoring/analyze` (ver SNIPPET 6)
- [ ] Componente `ScoreBadge` (ver SNIPPET 3)
- [ ] Componente `ScoreDetail` con radar (ver SNIPPET 4)
- [ ] Botón "Analizar con IA" en detalle de proyecto (solo developer)
- [ ] Mostrar score en marketplace cards
- [ ] Mostrar score en detalle con tab dedicado
- [ ] Versión pública del scoring en `/verify` (opcional)

### Output
- Diferenciador visual fuerte
- Proyectos con rating A+/A/B/C/D

---

## FASE 6 — CRM para Developers (3-4 días) 📊

### Día 1: Leads
- [ ] Página `/crm` dashboard con stats
- [ ] Página `/crm/leads` con tabla + filtros
- [ ] Página `/crm/leads/[id]` con detalle completo
- [ ] API CRUD de leads
- [ ] Importar CSV

### Día 2: Pipeline + Activities
- [ ] Página `/crm/pipeline` con Kanban (ver SNIPPET 5)
- [ ] Instalar @dnd-kit/core y @dnd-kit/sortable
- [ ] Drag & drop funcional entre columnas
- [ ] Timeline de activities en detalle de lead
- [ ] Form para crear actividades (call, email, meeting, note)

### Día 3: IA + Comunicación
- [ ] Integración Twilio para WhatsApp
- [ ] Integración Resend para emails
- [ ] IA para generar email personalizado
- [ ] IA para sugerir próxima acción
- [ ] Envío de mensajes desde el CRM

### Día 4: Campañas
- [ ] Página `/crm/campaigns`
- [ ] Crear campaña con editor rich-text
- [ ] Selección de segmento (filtros)
- [ ] Preview antes de enviar
- [ ] Tracking: open rate, click rate
- [ ] Templates guardables

### Output
- CRM competitivo con herramientas profesionales
- Diferenciador B2B fuerte

---

## FASE 7 — Facturación + AFIP + IA (3-4 días) 📄

### Día 1: Setup AFIP
- [ ] Página `/settings/afip` para upload de certs
- [ ] Validación de certificado
- [ ] Test de conexión en sandbox
- [ ] Storage seguro de certs en Supabase Storage

### Día 2: Facturas
- [ ] Página `/invoicing` dashboard
- [ ] Página `/invoicing/invoices` lista
- [ ] Página `/invoicing/invoices/new` con form dinámico
- [ ] API emitir factura en AFIP (obtener CAE)
- [ ] Generar PDF de factura
- [ ] Envío automático por email al receptor

### Día 3: Gastos con Vision IA
- [ ] Página `/invoicing/expenses`
- [ ] Upload de PDF/foto
- [ ] Integración GPT-4 Vision para extraer datos
- [ ] Clasificación automática por categoría
- [ ] Review humano antes de confirmar
- [ ] Asociación con proyectos

### Día 4: Reportes + Asistente
- [ ] Libro IVA Ventas (generación automática)
- [ ] Libro IVA Compras
- [ ] Export PDF/Excel
- [ ] Asistente Fiscal IA (ver SNIPPET 7)
- [ ] Alertas de vencimientos

### Output
- Facturación electrónica Argentina completa
- Asistente IA que responde dudas fiscales
- Automatización de procesamiento de facturas recibidas

---

## FASE 8 — Mercado Secundario (2-3 días) 🔄

### Día 1: Core
- [ ] Página `/secondary-market` con order book
- [ ] Crear orden de venta (solo si tengo tokens)
- [ ] Página `/secondary-market/my-orders`
- [ ] API CRUD de órdenes

### Día 2: Trading
- [ ] Modal de compra con validación de wallet
- [ ] Transacción atómica:
  - Débito de buyer
  - Crédito a seller
  - Transfer de tokens
  - Registro en `secondary_market_trades`
  - Hash SHA-256 del trade
  - Notificaciones
- [ ] Comisión de plataforma (configurable)

### Día 3: Stats
- [ ] Gráfico histórico de precios por proyecto
- [ ] Volume de trading
- [ ] Spread bid/ask
- [ ] Liquidez indicator

### Output
- Mercado secundario funcional
- Features que justifican valuación 10x mayor

---

## FASE 9 — KYC + Referidos (2 días) 🛡️

### Día 1: KYC
- [ ] Integración Didit (o Veriff)
- [ ] Flow de verificación desde `/settings/kyc`
- [ ] Webhook de callback de Didit
- [ ] Aplicar límites según status KYC
- [ ] UI del estado actual
- [ ] Email de notificación de aprobación/rechazo

### Día 2: Referidos
- [ ] Página `/referrals` con código único
- [ ] Modificar register para aceptar código
- [ ] Trigger al confirmar primera inversión
- [ ] Acreditación de comisión en wallet
- [ ] Notificaciones a ambos
- [ ] Leaderboard (opcional)
- [ ] Compartir en WhatsApp/Email/social

### Output
- KYC profesional obligatorio
- Programa viral de referidos

---

## FASE 10 — Polish + Deploy (2 días) 🚀

### Día 1: Polish
- [ ] Testing manual de todos los flows end-to-end
- [ ] Fix bugs encontrados
- [ ] Optimización de imágenes (Next Image)
- [ ] Lazy loading de componentes pesados
- [ ] SEO metadata + OG images
- [ ] Error boundaries
- [ ] Loading skeletons consistentes
- [ ] Accesibilidad (aria-labels, keyboard navigation)

### Día 2: Deploy
- [ ] Variables de entorno en Vercel
- [ ] Configurar dominio custom
- [ ] Webhooks de MP apuntando a producción
- [ ] Webhook de Didit apuntando a producción
- [ ] AFIP en modo producción (con certs reales)
- [ ] Setup de Vercel Analytics
- [ ] Setup Sentry para error tracking
- [ ] Rate limiting en APIs críticas
- [ ] Primera landing con tráfico real

### Output
- Producto en producción
- Monitoreo activo
- Listo para primer demo comercial

---

## 📊 Dependencias entre fases

```
Fase 1 (Setup)
  ├─→ Fase 2 (Rediseño) — puede empezar en paralelo con Fase 3
  │
  ├─→ Fase 3 (Wallet) — independiente
  │
  └─→ Fase 4 (Notifications) — requiere Wallet para eventos
       │
       └─→ Fase 5 (Scoring) — independiente, pero visible via Notifications

Fase 6 (CRM) — independiente, puede arrancar en cualquier momento
Fase 7 (Invoicing) — puede arrancar en cualquier momento
Fase 8 (Secondary) — requiere Fase 3 (Wallet) completa
Fase 9 (KYC) — mejor después de Fase 3 (afecta límites de wallet)
Fase 10 (Deploy) — al final
```

---

## 🎯 MVP mínimo vendible

Si el tiempo apremia, el orden de prioridad para un MVP comercializable es:

1. **Fase 1** (Setup) — imprescindible
2. **Fase 2** (Rediseño) — imprescindible para pitches
3. **Fase 3** (Wallet) — core del producto
4. **Fase 5** (Scoring IA) — diferenciador fuerte con poco esfuerzo
5. **Fase 4** (Notifications) — UX básica
6. **Fase 10** (Deploy) — ready to sell

Total MVP mínimo: **~10 días**

Con esto ya tenés producto presentable a inversores, gobiernos y primeros clientes.

---

## 🔥 Decisiones técnicas recomendadas

### ¿Storage de archivos?
**Supabase Storage** — simple, integrado con RLS, CDN incluido. Buckets recomendados:
- `avatars` (public)
- `project-hero` (public)
- `project-gallery` (public)
- `project-documents` (private, con signed URLs)
- `contracts` (private)
- `kyc-documents` (private, encryption at rest)
- `afip-certs` (private, encryption at rest)
- `invoices` (private)
- `expense-receipts` (private)

### ¿Search?
Supabase full-text search con Postgres `tsvector` para proyectos, leads, facturas. Si crece mucho, migrar a Algolia.

### ¿Jobs en background?
**Trigger.dev** o **Upstash QStash** para:
- Procesamiento de facturas con Vision
- Envío de campañas masivas
- Cálculo de retornos programados
- Generación de reportes periódicos

### ¿Email templates?
**React Email** (@react-email/components) para templates con React.

### ¿Monitoring?
- **Sentry** para errors
- **Vercel Analytics** para performance
- **PostHog** (self-hosted) para product analytics

### ¿Feature flags?
**Vercel Edge Config** o **LaunchDarkly** para rollouts graduales.

---

## 💰 Estimación de costos mensuales (escala inicial)

| Servicio | Plan | Costo aprox |
|---|---|---|
| Vercel | Hobby (free) → Pro cuando crezca | $0 → $20 |
| Supabase | Free → Pro | $0 → $25 |
| OpenAI API | Pay as you go | $20-100 |
| Mercado Pago | Por transacción (~5%) | Variable |
| Resend | Free 3k/mes → Pro | $0 → $20 |
| Twilio WhatsApp | Por mensaje (~$0.005) | $20-100 |
| Didit KYC | Por verificación (~$1-2) | Variable |
| Sentry | Free tier | $0 → $26 |
| **Total aproximado** | | **$80-300/mes** |

Escalable hasta ~1000 usuarios activos con <$500/mes en infra.

---

## 🚀 Siguiente acción

**En Claude Code**, copia este prompt para arrancar:

```
Hola Claude. Estoy continuando el desarrollo de Suelo v2.

Docs de referencia:
- docs/MASTER-PROMPT.md (especificación completa)
- docs/CODE-SNIPPETS.md (código listo)
- docs/ROADMAP.md (plan por fases)

Quiero empezar por la FASE 1 (Setup).
Revisá el estado actual del proyecto y dame un plan de ejecución
para poner todo funcionando, incluyendo:
1. Qué dependencies faltan instalar
2. Qué variables de entorno necesito configurar
3. Qué migración debo ejecutar en Supabase
4. Verificaciones para confirmar que todo funciona

Después pasamos a la FASE 2 (Rediseño Visual).
```

¡Éxitos con el desarrollo! 🎉
