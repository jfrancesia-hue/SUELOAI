# Tests E2E — Suelo

Suite Playwright con flujos críticos: landing, auth, middleware, API security, rate limiting.

## Setup inicial

```bash
npm install
npm run test:e2e:install   # instala browser Chromium + deps del sistema
```

## Correr contra dev local

```bash
npm run test:e2e           # arranca next dev + corre tests
npm run test:e2e:ui        # UI interactiva de Playwright
```

## Correr contra preview Vercel

```bash
BASE_URL=https://suelo-preview-xxx.vercel.app npm run test:e2e
```

## Lo que cubre hoy

| Spec | Qué valida |
|---|---|
| `landing.spec.ts` | Hero + CTAs + OG metadata + security headers |
| `auth.spec.ts` | Middleware redirige las 6 rutas protegidas a /login con redirect param |
| `api-security.spec.ts` | 401 en rutas sin auth, noindex en /api, rate limit dispara 429 |

## Qué falta (próximas iteraciones)

- [ ] Flujo signup → login → dashboard
- [ ] Crear inversión → generar contrato → verificar hash
- [ ] AI Analyst conversación real (requiere sesión + API key Claude)
- [ ] CRM: crear contacto → mover deal en pipeline con drag&drop
- [ ] Secondary market: crear listing → comprar → ver tokens transferidos
