# Conexión Supabase real

Proyecto indicado por el owner:

- URL: `https://uozpjqogtssnvknxayan.supabase.co`

Estado actual local:

- `NEXT_PUBLIC_SUPABASE_URL` ya apunta a ese proyecto.
- `NEXT_PUBLIC_DEMO_MODE=true` queda activado para poder navegar visualmente aunque falten keys reales.

Para pasar de demo a producción real:

1. En Supabase → Project Settings → API, copiar:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (solo servidor, nunca público)
2. Pegar esas keys en `.env.local` y en Vercel Environment Variables.
3. Cambiar:
   - `NEXT_PUBLIC_DEMO_MODE=false`
4. Ejecutar migraciones SQL en Supabase.
5. Crear usuarios reales desde registro o Supabase Auth.

Importante: no subir `.env.local` al repo.
