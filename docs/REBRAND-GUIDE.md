# 🎨 Suelo — Rebrand Guide

Guía completa del rebrand de Suelo a **Suelo.ai**.

---

## 🌱 Nuevo Brand

### Nombre

**Suelo** — la palabra latina que captura todo lo que hace la plataforma.

- En español: suelo = tierra/piso/base
- Funciona en todo LATAM sin traducción
- Corto (5 letras, 2 sílabas)
- Vocales abiertas, auditivamente potente
- Único en el espacio fintech/proptech

### Dominio principal

**suelo.ai** — el `.ai` refuerza que somos AI-native

### Dominios secundarios (registrar)

- usesuelo.com
- suelo.lat
- suelo.app
- mysuelo.com
- suelolatam.com

---

## 📣 Positioning

### Tagline principal

**"Invertí en lo que pisás, potenciado por IA"**

### Taglines alternativas

- "Tu analista inmobiliario, en tu bolsillo"
- "Construí tu patrimonio desde el Suelo"
- "El Suelo donde crece tu capital"

### Elevator pitch

> Suelo es la primera plataforma latinoamericana de inversión inmobiliaria fraccionada con analista IA personal. Desde USD 100 o 100 USDT, cualquiera puede construir un portfolio de real estate real con decisiones informadas. Nuestro analista IA analiza miles de proyectos, evalúa tu perfil, y te acompaña en cada inversión.

### Diferenciación

**No somos:**
- ❌ Otra fintech de inversión genérica
- ❌ Otro proyecto crypto especulativo
- ❌ Una proptech tradicional

**Somos:**
- ✅ Plataforma AI-native de inversión en activos reales
- ✅ LATAM-first (no un producto europeo traducido)
- ✅ Fiat + Crypto como iguales
- ✅ Compliance-friendly para gobiernos

---

## 🎨 Sistema Visual

### Paleta de colores

**Brand primary (mantener del actual):**
- `brand-500: #00C853` (verde signature)
- `brand-600: #00A844` (verde oscuro)
- `brand-700: #008836`

**Tierra (NUEVO para Suelo):**
- `earth-50: #FAF7F2` (crema)
- `earth-100: #F0E9DC`
- `earth-500: #8B6F47` (terracota)
- `earth-700: #5C4A2F`
- `earth-900: #3D2E1A` (tierra oscura)

**Surface (mantener):**
- `surface-0: #000000`
- `surface-50: #0a0a0a`
- `surface-100: #111111`

### Tipografía

**Display:** Cabinet Grotesk
- Más editorial que Outfit
- Mejor para headlines premium
- Falta suscripción (Fontshare gratis o Adobe Fonts)

**Body:** Inter
- Más legible que DM Sans en UI
- Standard de la industria

**Mono:** JetBrains Mono (mantener)

### Logo

**Conceptos:**
1. **Monograma "S"** con forma de surco de tierra
2. **Brote de raíz** emergiendo del suelo (sutil)
3. **Cuadrado + S** como sello premium

**Usos:**
- Icon (favicon, app icon): solo S
- Logo horizontal: "Suelo" con S destacada
- Logo con tagline: "Suelo" + microcopy debajo

### Iconografía

- Lucide icons (mantener)
- Agregar sutil: hojas, raíces, tierra en ilustraciones
- Mantener estilo minimalista flat

### Imágenes

- Fotografía arquitectónica real (Unsplash)
- Preferir imágenes con **tierra visible** (jardines, paisaje)
- Agregar fotos de **construcción en progreso** (refuerza "activos reales")
- Fotos de inversores diversos LATAM (reales, no stock genéricos)

---

## ✍️ Copy Guidelines

### Tone of voice

- **Profesional pero cercano** — tratamos de "vos"
- **Claro y directo** — evitamos jerga innecesaria
- **Empático con LATAM** — entendemos inflación, cepos, dolarización
- **Honesto sobre riesgos** — nunca prometemos retornos garantizados
- **Optimista pero realista** — construir patrimonio es maratón, no sprint

### Do's

- "Invertí" (voseo argentino/uruguayo/paraguayo)
- "Construí tu patrimonio"
- "Desde USD 100"
- "Activos reales y tangibles"
- "Con total transparencia"

### Don'ts

- "Invierte" (tuteo no conecta)
- "Hazte rico rápido"
- "Retornos garantizados"
- "Blockchain revolucionario" (cliché)
- "Descentralizado" sin contexto

### Emojis permitidos (sparingly)

- 🏗️ Construcción/proyectos
- 💰 Finanzas/retornos
- 📊 Datos/análisis
- ✅ Confirmación
- ⚠️ Alertas
- 🌱 Crecimiento/brote (brand-aligned)
- ✨ IA/inteligencia

Prohibidos: 🚀 (cringe), 💎 (crypto-bro), 🔥 (FOMO)

---

## 🔄 Checklist de Rebrand Técnico

Todo este checklist ya fue aplicado vía sed:

- [x] `package.json` → name: "suelo"
- [x] Metadata en `app/layout.tsx`
- [x] Referencias en componentes UI
- [x] Referencias en prompts OpenAI
- [x] Footer con "Suelo"
- [x] Navbar con logo Suelo.ai
- [x] Sidebar con branding actualizado
- [x] Emails de confirmación (cuando se implementen)

### Pendiente de actualizar

- [ ] Logo SVG final (crear con diseñador)
- [ ] Favicon en `/public`
- [ ] Open Graph image
- [ ] Manifest PWA
- [ ] Email templates
- [ ] Términos de servicio
- [ ] Política de privacidad

---

## 📱 Assets necesarios

### Mínimos para launch

- [ ] Logo SVG (color + blanco)
- [ ] Favicon 16x16, 32x32, 192x192, 512x512
- [ ] Open Graph 1200x630
- [ ] Twitter card 1200x675
- [ ] App icons iOS (ya-son-muchas-sizes)
- [ ] Splash screens PWA

### Marketing

- [ ] Banners social media (1080x1080, 1080x1920 stories)
- [ ] Plantillas posts Instagram/LinkedIn
- [ ] Presentación corporativa (Pitch deck)
- [ ] Brochure PDF
- [ ] Video explainer 60s

### Herramientas recomendadas

- **Figma** para diseños
- **Remove.bg** para fotos
- **Canva** para redes sociales
- **Pexels + Unsplash** para stock photos
- **Flaticon Pro** para iconos secundarios

---

## 🌍 Adaptación por mercado

### Argentina 🇦🇷
- Moneda default: ARS + USD
- Mensaje: "Refugiate de la inflación con activos reales"
- Testimoniales argentinos
- Contador como target secundario

### Paraguay 🇵🇾
- Moneda default: USD (mercado dolarizado)
- Mensaje: "Participá en el boom inmobiliario paraguayo"
- Integración SIFEN prominente
- Diáspora argentina/brasileña como inversores

### Uruguay 🇺🇾 (futuro)
- Mensaje: "Inversión premium con protección jurídica"
- Target: clase alta uruguaya + extranjeros

### Brasil 🇧🇷 (futuro)
- Traducción ES → PT completa
- Mensaje adaptado: "Invista no que você pisa"
- Integración Pix + USDT

---

## 📈 Marketing Campaign Ideas

### Lanzamiento

**Campaign: "Pisá fuerte"**

- Series de posts mostrando proyectos reales
- Testimoniales de inversores diversos
- Behind-the-scenes de desarrolladores
- Hashtags: #PisaFuerte #MiSuelo #InvertiEnLoReal

### Educacional

- Serie de reels: "¿Sabías que podés...?"
- Artículos blog: "Cómo empezar en real estate con USD 100"
- Webinars mensuales con expertos
- Podcast "Suelo Firme" con inversores exitosos

### Referidos

- "Traé a tu amigo, ambos ganan"
- Leaderboard público de top referidores
- Comisiones en USDT (atractivo para crypto-natives)

---

## 🎯 Métricas de éxito del rebrand

### Short-term (primeros 3 meses)

- Awareness: 100k impresiones orgánicas
- Consideration: 5k visitantes web únicos
- Conversion: 500 registros
- Activation: 200 con primera inversión

### Mid-term (6 meses)

- 2000 usuarios activos
- 50 developers contratados
- USD 500k capital movido
- NPS > 50

### Long-term (12 meses)

- 10,000 usuarios activos
- 300 developers
- USD 5M capital movido
- Presencia en 3 países (AR + PY + UY)

---

## 🚀 Launch Checklist

### Pre-launch (1 semana antes)

- [ ] Todos los assets visuales finales
- [ ] Landing optimizada para conversión
- [ ] Onboarding testeado con 10 usuarios beta
- [ ] Team interno alineado con messaging
- [ ] Contenido inicial blog listo
- [ ] Email de bienvenida funcionando
- [ ] Analytics configurado

### Launch day

- [ ] Announcement en LinkedIn
- [ ] Posts en redes sociales
- [ ] Email a lista de waiting
- [ ] Press release a medios (5Días, ABC, Infobae, La Nación)
- [ ] Founders publican en X/LinkedIn
- [ ] Monitor servers

### Post-launch (primera semana)

- [ ] Daily stand-ups reviewing metrics
- [ ] Soporte 24/7 activo
- [ ] Iteración rápida sobre feedback
- [ ] Celebrar primer usuario activo 🎉

---

## 💬 FAQ para el Rebrand

### Para el equipo interno

**Q: ¿Por qué cambiamos de Suelo a Suelo?**
R: Suelo nos posicionaba como "otro proyecto blockchain". Suelo refleja mejor nuestra identidad LATAM, conecta emocionalmente, y funciona mejor para el target expandido con features IA.

**Q: ¿Qué hacemos con usuarios existentes?**
R: Migración transparente. Todos los datos se mantienen, solo cambia branding. Email a la base comunicando el cambio con regalo de bienvenida (ej: análisis gratis con IA).

**Q: ¿Cambia el producto en sí?**
R: El producto core no cambia. Se agrega: capa de IA como diferenciador, foco LATAM más explícito, y preparación para expansión multi-país.

### Para usuarios

**Q: ¿Qué pasa con mi cuenta Suelo?**
R: Se migra automáticamente a Suelo. Mismos proyectos, mismas inversiones, mismo balance. Ahora con analista IA incluido gratis.

**Q: ¿Los contratos existentes siguen siendo válidos?**
R: Absolutamente. Los hashes SHA-256 se mantienen intactos. La verificación pública sigue funcionando igual.

---

**Última actualización:** Abril 2026
**Autor:** Jorge Eduardo Francesia — Nativos Consultora Digital
