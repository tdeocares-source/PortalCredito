# Portal Crédito

Portal autónomo para que clientes externos calculen su capacidad de crédito hipotecario, completando un cuestionario guiado y recibiendo un informe en PDF con análisis financiero y recomendaciones.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** primitives
- **react-hook-form + zod** — wizard con validación incremental
- **framer-motion** — transiciones del wizard
- **Supabase** — auth (magic link), base de datos, storage de PDFs
- **@react-pdf/renderer** — generación del informe
- **Resend** — email transaccional con el link al informe
- **PostHog** — tracking de comportamiento del cliente

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Completá las variables (ver sección "Variables de entorno" abajo)
npm run dev
```

Abrí http://localhost:3000.

## Variables de entorno

Ver [`.env.local.example`](./.env.local.example) para el listado completo. Mínimo necesario para arrancar:

| Variable | Dónde se obtiene |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API (mantener server-side) |
| `RESEND_API_KEY` | https://resend.com/api-keys |
| `RESEND_FROM_EMAIL` | Email "from" verificado en Resend |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog → Project settings |
| `NEXT_PUBLIC_SITE_URL` | URL pública (`http://localhost:3000` en dev) |

## Estructura

```
src/
├── app/                  # App Router (rutas + layouts)
│   ├── layout.tsx
│   ├── page.tsx          # Landing
│   ├── login/            # Magic link
│   ├── wizard/           # 12 pasos del cuestionario
│   ├── informe/[id]/     # Visualización del PDF generado
│   └── auth/callback/    # Callback de Supabase Auth
├── components/
│   ├── ui/               # Primitives shadcn
│   ├── wizard/           # WizardLayout, ProgressBar, steps/
│   └── landing/
├── lib/
│   ├── supabase.ts       # Cliente browser
│   ├── supabase-server.ts# Cliente server
│   ├── credibid.ts       # Mock del API (reemplazable cuando llegue real)
│   ├── financial-calc.ts # Capacidad de crédito (fórmula chilena)
│   ├── chilean-rut.ts    # Validador de RUT con dígito verificador
│   └── comunas.ts        # Catálogo top 10 + 346 comunas oficiales
├── pdf/
│   └── InformeFinanciero.tsx  # @react-pdf/renderer component
└── config/
    └── wizard-steps.ts   # Definición declarativa de los 12 pasos
```

## Comandos

```bash
npm run dev         # dev server con turbopack
npm run build       # build de producción
npm run start       # start del build
npm run typecheck   # tsc --noEmit
npm run test        # vitest
npm run test:watch
npm run lint
```

## Despliegue

Netlify con el plugin `@netlify/plugin-nextjs` declarado en [`netlify.toml`](./netlify.toml). Antes del primer deploy:

1. Crear el sitio en Netlify apuntando al repo.
2. Cargar las variables de entorno (Settings → Environment variables) — todas las del `.env.local.example`.
3. Verificar dominio en Resend antes de mandar emails a clientes externos (sin verificación, Resend solo envía al email de tu cuenta).

## Migraciones Supabase

Ver [`supabase/migrations/`](./supabase/migrations/). Aplicar en orden numérico desde Supabase SQL Editor.

## Licencia

Privado — Capital Inteligente.
