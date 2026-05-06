# Suelo Mobile

App móvil de Suelo — React Native + Expo 51 con expo-router.

## Estado

**Alpha** — estructura base con auth + 4 tabs: Dashboard / Marketplace / Wallet / Analista IA.
Consume la misma API REST que la web (`EXPO_PUBLIC_API_URL`).

## Setup

```bash
cd apps/mobile
npm install

# Correr en desarrollo
npm start              # abre Expo dev tools
npm run ios            # simulador iOS
npm run android        # emulador Android
npm run web            # versión web (debug)
```

## Variables de entorno

Crear `.env.local` en `apps/mobile/`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000   # la web de Suelo corriendo local
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

En `eas.json` los perfiles `preview` y `production` ya tienen el URL correcto.

## Builds con EAS

Primero, crear cuenta en [expo.dev](https://expo.dev) y correr:

```bash
npm install -g eas-cli
eas login
eas init              # linkea proyecto, completa REPLACE_WITH_EAS_PROJECT_ID en app.json
```

Después:

```bash
# Preview interno (para testers)
npm run build:preview

# Producción (sube a App Store / Play Store)
npm run build:ios
npm run build:android
npm run submit:ios
npm run submit:android
```

## Estructura

```
apps/mobile/
├── app/                          # expo-router (filesystem routing)
│   ├── _layout.tsx              # root stack
│   ├── index.tsx                # landing con redirect a /(tabs) si hay sesión
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/
│       ├── _layout.tsx          # bottom tabs
│       ├── dashboard.tsx
│       ├── marketplace.tsx
│       ├── wallet.tsx
│       └── analyst.tsx          # chat IA via /api/ai/chat
├── lib/
│   ├── supabase.ts              # cliente con SecureStore adapter
│   └── api.ts                   # apiGet/apiPost con auth header auto
├── app.json                     # config Expo
├── eas.json                     # perfiles de build
└── tsconfig.json                # extiende de expo/tsconfig.base
```

## Lo que falta

- [ ] Pantalla de detalle de proyecto + inversión in-app
- [ ] Wallet: deposits fiat (MP SDK mobile)
- [ ] Notificaciones push con `expo-notifications`
- [ ] Biometría (Face ID / Touch ID) para confirmar inversiones
- [ ] Onboarding nativo con el AI analyst
- [ ] Deep links (`suelo://projects/[id]`)
- [ ] Assets: icon.png, splash.png, adaptive-icon.png (usar los de brand)
- [ ] Tests con Maestro o Detox

## Compartir código con la web

La mobile consume la **misma API REST** que la web, así que la lógica de negocio
vive en un solo lado (`app/api/*` de la app Next.js). Los tipos compartidos
se importan desde `@shared/*` (alias a `../../types/*` en `tsconfig.json`).
