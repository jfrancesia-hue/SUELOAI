# 🤖 Suelo AI — Features Documentation

Documentación completa del módulo de IA de Suelo — el diferenciador competitivo clave.

---

## 🎯 Vision

Suelo no es "una plataforma con features de IA". Es una **plataforma nativa de IA** donde cada inversor tiene un analista personal que lo acompaña 24/7.

Tagline: **"Tu Warren Buffett personal, en tu bolsillo"**

---

## 🏗️ Arquitectura de IA

### 5 Capas de inteligencia

```
┌─────────────────────────────────────────────┐
│  Capa 5: Agentes multi-canal                │
│  WhatsApp · Email · Voice · Push             │
├─────────────────────────────────────────────┤
│  Capa 4: Comunicación automática             │
│  Reportes · Emails · Alertas                 │
├─────────────────────────────────────────────┤
│  Capa 3: Ops inteligente                     │
│  Fraud · Compliance · Support                │
├─────────────────────────────────────────────┤
│  Capa 2: Due Diligence                       │
│  Análisis proyectos · Comparables · Vision   │
├─────────────────────────────────────────────┤
│  Capa 1: Analista Personal (core)            │
│  Chat · Recomendaciones · Tools              │
└─────────────────────────────────────────────┘
```

### Stack técnico

- **OpenAI GPT-4o** → Analista principal, razonamiento complejo
- **GPT-4o-mini** → Tareas rápidas (clasificación, extracción simple)
- **GPT-4o Vision** → Análisis de fotos, documentos, facturas
- **text-embedding-3-large** → Búsqueda semántica de proyectos
- **Whisper** → Transcripción de voice notes
- **TTS** → Respuestas de voz

---

## 📦 Módulo 1: Analista IA Personal ✅ (implementado)

### Qué hace

Chatbot conversacional persistente que:
- Accede a datos reales del usuario en tiempo real
- Responde consultas con contexto personalizado
- Recomienda proyectos según perfil
- Calcula retornos proyectados
- Explica conceptos financieros en simple
- Alerta sobre riesgos y oportunidades

### Tools disponibles (function calling)

El analista puede ejecutar:

1. `get_user_profile` — Datos del usuario
2. `get_user_investments` — Portfolio actual
3. `get_user_wallet_balance` — Saldos fiat + crypto
4. `search_projects` — Búsqueda en marketplace con filtros
5. `analyze_project_for_user` — Match score personalizado
6. `get_portfolio_stats` — Diversificación + alertas
7. `get_exchange_rate` — Tasas en tiempo real
8. `calculate_expected_returns` — Proyecciones con impuestos
9. `create_recommendation` — Guarda recomendación formal

### Acceso

- **Página dedicada:** `/assistant` — Chat completo con sidebar de conversaciones
- **Widget flotante:** En todas las páginas del dashboard (esquina inferior derecha)
- **API:** `/api/ai/chat` (POST)

### Ejemplos de uso

**Inversor nuevo:**
- "No entiendo qué es un token en un proyecto"
- "¿Cómo empiezo a invertir con USD 500?"
- "¿Qué pasa si el proyecto no se completa?"

**Inversor activo:**
- "Analizá mi portfolio"
- "Mostrame proyectos en Paraguay con retorno > 15%"
- "Si invierto USD 2000 en el proyecto X, ¿cuánto gano en 18 meses?"

**Developer:**
- "Qué proyectos similares al mío tuvieron éxito"
- "Sugerime un precio óptimo para este proyecto"
- "Escribime descripción marketing para mi proyecto"

### Costo operativo estimado

- GPT-4o input: $2.50/1M tokens
- GPT-4o output: $10/1M tokens
- Conversación promedio: ~1500 tokens input + 500 output
- **Costo por conversación: ~$0.009 USD**
- **Margen sostenible:** si free tier ofrece 100k tokens/mes, costo por usuario: ~$0.60/mes

### Tiers de acceso

- **Free:** 100k tokens/mes (~50 conversaciones)
- **Pro ($9.99/mes):** 500k tokens (~250 conversaciones) + priority
- **Business ($99/mes):** 2M tokens + developer tools

---

## 📦 Módulo 2: Due Diligence Automatizada 🔨

### Qué hará

Al crear un proyecto, IA automáticamente:

1. **Extrae data** de documentos subidos (escrituras, planos, permisos)
2. **Cruza información** con registros públicos (municipalidad, registro)
3. **Busca comparables** en la plataforma y zona
4. **Analiza mercado** (precio m², tendencia demográfica)
5. **Evalúa developer** (historial en plataforma)
6. **Genera scoring** A+ a D con explicación detallada

### Implementación pendiente

```
lib/ai/due-diligence/
├── project-analyzer.ts      # Orquestador principal
├── document-extractor.ts    # Vision API para escrituras/planos
├── market-analyzer.ts       # Análisis de zona
├── comparables-finder.ts    # Búsqueda con embeddings
└── scoring-generator.ts     # Genera rating final
```

### Flow

```
Developer carga proyecto
  ↓
Trigger SQL schedule análisis
  ↓
Edge function se ejecuta async (5-30s)
  ↓
Extrae data de documentos (Vision)
  ↓
Busca comparables (embeddings)
  ↓
Analiza zona y mercado
  ↓
Genera scoring + análisis
  ↓
Guarda en project_scores
  ↓
Developer recibe notificación
```

---

## 📦 Módulo 3: Content Generator 🔨

### Para developers

Genera automáticamente:

- **Descripciones atractivas** de proyectos (basado en datos básicos)
- **Posts para redes sociales** (Instagram, LinkedIn)
- **Emails de presentación** personalizados por lead
- **Reportes trimestrales** a inversores
- **FAQs** del proyecto
- **Subject lines** A/B test

### API planeada

```typescript
POST /api/ai/generate/description
POST /api/ai/generate/social-post
POST /api/ai/generate/email
POST /api/ai/generate/quarterly-report
```

---

## 📦 Módulo 4: AI Sales para CRM 🔨

### Features

**Lead scoring automático:**
- Cada lead clasificado hot/warm/cold
- Probabilidad de conversión estimada
- Próxima acción recomendada

**Respuestas 24/7:**
- Inversor pregunta sobre proyecto → IA responde con data real
- Si no sabe → agenda llamada con developer
- Tono aprendido del developer via few-shot

**Segmentación para campañas:**
- "Enviá email a inversores que invirtieron > $1000 en residencial"
- IA genera segmento y contenido personalizado

---

## 📦 Módulo 5: Agentes Multi-canal 🔨

### WhatsApp Agent

```
Usuario: [voice note] "¿Cómo va mi inversión?"
  ↓ Whisper transcribe
  ↓ GPT-4o con tools accede a DB
  ↓ TTS genera voice response
Bot: [voice] "Tu inversión en Riviera va al 67%..."
```

**Tech:** Twilio WhatsApp Business API + OpenAI

### Email Agent

- Lee emails entrantes
- Clasifica intent
- Responde automáticamente si puede
- Escalar a humano si complejo

### Voice Onboarding

- Usuarios no-tech pueden registrarse por voz
- Revoluciona accesibilidad en PY/BO rural
- Accessible para adultos mayores

---

## 📊 Métricas a trackear

### Funcionalidad

- Conversaciones iniciadas por día
- Mensajes promedio por conversación
- Rating promedio de respuestas (thumbs up/down)
- Tool calls ejecutados
- Tiempo promedio de respuesta

### Business

- Conversión: "usó IA" vs "no usó IA" → retención, inversión
- Upgrade rate: Free → Pro después de usar IA
- NPS de usuarios AI-activos
- Tokens consumidos por tier
- Costo IA por usuario activo

### Calidad

- Alucinaciones reportadas
- Recomendaciones aceptadas vs dismissed
- Feedback negativo y categorización
- Errores en tool calls

---

## 🔒 Consideraciones de seguridad y ética

### Prompt injection

- Todos los user inputs son tratados como data, no instrucciones
- System prompt nunca expuesto
- Rate limiting agresivo por usuario

### Protección de datos

- Conversaciones encriptadas en DB
- Usuario puede exportar + eliminar sus conversaciones
- Datos sensibles (DNI, CBU) nunca en logs

### Compliance

- Disclaimers constantes: "no es asesoramiento financiero legal"
- Recomendación de consultar contador/abogado en temas fiscales
- Reporte de usage para auditoría AFIP/SET

### Bias y fairness

- Testing periódico: ¿recomienda diferente a usuarios A vs B con mismo perfil?
- Monitoring de clasificaciones para detectar sesgos
- Humano en el loop para decisiones críticas

### Red flags proactivos

IA alerta si detecta:
- Usuario endeudándose para invertir
- Patrones de FOMO o pánico
- Concentración excesiva
- Comportamiento inconsistente

---

## 🛣️ Roadmap de implementación

### Semana 1 — Foundation (HECHO)

- ✅ Migración DB (004_ai_rebrand.sql)
- ✅ Core del analista con tools
- ✅ API /api/ai/chat
- ✅ Página /assistant
- ✅ FloatingAssistant widget

### Semana 2 — Onboarding conversacional

- [ ] Flow de onboarding usando IA
- [ ] Perfil de riesgo via chat
- [ ] Guardado automático de preferencias

### Semana 3 — Análisis de proyectos

- [ ] Due diligence automática
- [ ] Scoring IA activado
- [ ] Comparables con embeddings

### Semana 4 — Content generation

- [ ] Generador de descripciones
- [ ] Reportes trimestrales
- [ ] Email templates

### Semana 5 — CRM con IA

- [ ] Lead scoring
- [ ] Respuestas automáticas
- [ ] Segmentación

### Semana 6 — Multi-canal

- [ ] WhatsApp Agent básico
- [ ] Email Agent
- [ ] Voice (opcional)

### Semana 7-8 — Polish + launch

- [ ] Testing extensivo
- [ ] Optimización de prompts
- [ ] A/B testing
- [ ] Marketing materials

---

## 💡 Mejores prácticas de prompt engineering

### System prompts

- **Context-setting:** quién es, qué hace, cómo habla
- **Constraints:** qué NO hacer (nunca inventar, nunca prometer)
- **Format:** cómo estructurar respuestas
- **Examples:** few-shot cuando es complejo

### Tool use

- Descripciones de tools claras y accionables
- Parameters con types y descriptions detalladas
- Enums cuando hay valores finitos
- Required fields mínimos

### Evaluación

- Logging de todas las conversaciones (con consentimiento)
- Dashboard de calidad semanal
- A/B testing de prompts
- Feedback loop: thumbs → mejora prompts

---

## 📞 Referencias y recursos

- [OpenAI Function Calling docs](https://platform.openai.com/docs/guides/function-calling)
- [Anthropic Tool Use](https://docs.claude.com/en/docs/build-with-claude/tool-use) (si migrás a Claude)
- [OpenAI Cost Calculator](https://openai.com/api/pricing/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

**Última actualización:** Abril 2026
**Autor:** Jorge Eduardo Francesia — Nativos Consultora Digital
**Versión:** v4.0 con módulo AI nativo
