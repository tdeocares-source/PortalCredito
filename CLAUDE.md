# Portal Crédito — guía permanente para Claude Code

Este archivo se lee al inicio de cada sesión. Contiene **decisiones que no
deberían cambiar** y convenciones del proyecto. Para el plan operativo
del momento (qué falta hacer, en qué orden), ver `CONTEXT.md`.

---

## Identidad del proyecto

Portal autónomo para clientes externos. Completan un wizard de 12 pasos
con datos personales y financieros, y reciben un informe en PDF con su
**capacidad de crédito hipotecario estimada** + tips personalizados.

- **Cliente final**: persona física que busca pre-aprobación. Llega
  desde marketing o referido. **No tiene cuenta previa**.
- **Operador del portal**: Capital Inteligente (yo, Tomás).
- **No relacionado** con la plataforma `capital-plataforma-next`. Repo
  propio, BD propia, deploy propio.

---

## Stack — congelado

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **Next 16 App Router** | Server actions + RSC |
| UI | **Tailwind v4** + **shadcn/ui** | Tema en `src/app/globals.css` con OKLCH |
| Formularios | **react-hook-form + zod** | Validación incremental por step |
| Animaciones | **framer-motion** | Transiciones del wizard |
| Auth | **Supabase Auth — magic link** | Sin password. Email → link → sesión |
| BD | **Supabase Postgres + RLS** | Proyecto SUPABASE PROPIO (no compartir con la plataforma interna) |
| Storage | **Supabase Storage** | PDFs de informes con URL firmada |
| PDF | **`@react-pdf/renderer`** | Server-side, layout consistente |
| Email | **Resend** | Magic link + notificación de informe listo |
| Tracking | **PostHog** | Tiempo, clicks, funnel completo |
| Tests | **vitest** + `@testing-library/react` | jsdom para componentes, unit tests para lib/ |
| Deploy | **Netlify** | Plugin `@netlify/plugin-nextjs` declarado en `netlify.toml` |

**Package manager**: **npm** (no pnpm). Mantener `package-lock.json`.

---

## Convenciones de código

- **TypeScript estricto** — `strict: true` en tsconfig.
- **Path alias**: `@/*` apunta a `src/*`.
- **Estructura por feature**, no por tipo:
  ```
  src/
    app/                # rutas
    components/
      ui/               # primitives shadcn
      wizard/           # todo lo del wizard, incluyendo steps/
    lib/                # utilidades de dominio (rut, comunas, cálculo)
    pdf/                # componentes @react-pdf/renderer (cuando se cree)
  ```
- **Tests al lado del código**: `chilean-rut.ts` + `chilean-rut.test.ts`.
- **Tono cercano** ("tú" no "usted") — el cliente final no es corporativo.
- **Comentarios solo cuando aportan**: explicar el _por qué_ o restricciones
  no obvias, no el _qué_ (que el código ya muestra).
- **No agregar Husky/Prettier/commitlint** sin pedirlo: simplicidad
  primero.

---

## Reglas de negocio que no cambian (a hoy)

1. **Acceso del cliente**: 100% autónomo. Pone email → magic link → entra
   al wizard. No hay registro ni asesor de por medio.

2. **Resultado**: estimación referencial **no oficial** hasta que
   integremos Credibid real. Hoy se calcula localmente con la fórmula
   chilena estándar (ver `lib/financial-calc.ts`).

3. **Fórmula financiera (mientras Credibid no esté)**:
   - Líquido efectivo = `sueldo × factor` donde
     `factor = 1.0 dependiente | 0.70 independiente | 0.85 mixto`.
   - Capacidad mensual = `(líquido_efectivo - deudas_mensuales) × 0.25`
     (regla del 25 % de carga financiera).
   - Monto UF aprobado ≈ `capacidad_mensual × 200` (factor referencial
     para 25 años a tasa habitual).

4. **Comunas**: catálogo cerrado de **346 comunas oficiales de Chile**.
   El cliente puede agregar otra solo si está en el catálogo (autocomplete);
   no se permiten valores libres.

5. **Tips dinámicos**: se entregan según el resultado financiero (ej. si
   tiene mucha deuda → tip de saldarla antes; si tiene buena holgura →
   tip de comparar tasas). Lógica en `lib/consejos.ts`.

6. **Persistencia del wizard**: si el cliente cierra y vuelve por su
   magic link, retoma donde dejó. El borrador se persiste en
   `solicitudes` desde el primer paso.

7. **Datos sensibles**: RUT, sueldo y deudas no aparecen nunca en logs
   ni en URLs. PostHog se configura con `mask_all_text: true` o se
   excluyen los campos sensibles del autocapture.

8. **Sin dominio Resend verificado**: hasta que se verifique un dominio
   propio en Resend, los emails solo llegan al email de la cuenta de
   Resend. No mandar a clientes externos hasta que el dominio esté
   verificado (tarea operativa fuera de código).

---

## Cómo invocar agentes / tareas comunes

- **Lint / typecheck**: `npm run typecheck && npm run lint`.
- **Tests**: `npm run test` (vitest).
- **Dev**: `npm run dev`.
- **Build local**: `npm run build && npm run start`.
- **Aplicar migración**: copiar SQL desde `supabase/migrations/` y pegar
  en Supabase SQL Editor (o `supabase db push` si tenés CLI).

---

## Variables de entorno

Listadas en `.env.local.example`. Mínimo para correr en local:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_SITE_URL`.

**Nunca commitear `.env.local`**. Usar el `.env.local.example` como
plantilla. **Nunca pegar API keys en chat** — pasar solo el nombre de la
variable y confirmar que está cargada.
