# Portal Crédito — contexto de implementación

> **Cuándo borrar este archivo**: cuando todos los items de "Pendiente"
> estén marcados ✅. Mientras tanto, leerlo al inicio de cada sesión
> nueva (`CLAUDE.md` ya se carga automático; este archivo trae el plan
> operativo).

---

## TL;DR para arrancar la próxima sesión

1. Leer este archivo + `CLAUDE.md`.
2. Revisar `git status` y `git log --oneline -10`.
3. Continuar por el siguiente ítem pendiente del plan (sección "Plan de
   commits" más abajo).

---

## Contexto de origen

Este proyecto se especificó en una conversación anterior de Claude Code
en el repo hermano `capital-plataforma-next` (la plataforma interna).
Ahí se decidió:

- Repo **separado**, BD **separada**, deploy **separado** del hermano.
- Cliente externo y autónomo (sin asesor de por medio).
- Magic link via Supabase + Resend para auth liviano.
- Mock de Credibid hasta tener API real.
- Look minimalista, formal y cercano (paleta azul cálido).

La autoría fue de Tomás (`tdeocares@capitalinteligente.cl`).

---

## Estado actual del proyecto (snapshot inicial)

### ✅ Hecho

- Bootstrap completo: `package.json`, `tsconfig`, `next.config.ts`
  (con `serverExternalPackages: ["@react-pdf/renderer"]`),
  `postcss.config.mjs`, `eslint.config.mjs`, `netlify.toml` (con
  `@netlify/plugin-nextjs` declarado), `.gitignore`,
  `.env.local.example`, `README.md`.
- Tema visual en `src/app/globals.css` (Tailwind v4 + OKLCH, modo claro
  y oscuro auto).
- Landing en `src/app/page.tsx` (header simple, hero, 3 cards de
  features, CTA al `/wizard`).
- shadcn UI primitives: `button`, `checkbox`, `input`, `label`,
  `progress`, `radio-group` en `src/components/ui/`.
- **Wizard completo de 12 pasos** en `src/components/wizard/`:
  - Layout (`WizardLayout`, `StepShell`, `StepRouter`, `ProgressBar`).
  - Componentes auxiliares (`ComunaPicker`, `NumberInput`, `RadioCard`).
  - Hook orquestador `use-wizard.ts` + `types.ts`.
  - Steps: `Step0Nombre`, `Step1Proposito`, `Step2Cuando`,
    `Step3Comunas`, `Step4Canal`, `Step5TipoIngreso`, `Step6Liquido`,
    `Step7Deudas`, `Step8AhorroPie`, `Step9MesGastosFuertes`,
    `Step10PrioridadCompra`, `Step11Final`.
- Página de resultado: `src/app/wizard/resultado/page.tsx`.
- Schemas zod: `src/lib/wizard-schema.ts`.
- Validador RUT chileno + tests: `src/lib/chilean-rut.ts`.
- Validador teléfono chileno + tests: `src/lib/chilean-phone.ts`.
- Catálogo comunas: `src/lib/comunas.ts`.
- Tips dinámicos: `src/lib/consejos.ts`.
- Calculadora financiera + tests: `src/lib/financial-calc.ts`.
- `node_modules` instalado.

### ❌ Pendiente — plan de commits

Cada ítem es un commit chico, en este orden:

1. **`git init` + primer commit** ("feat: bootstrap + wizard 12 pasos +
   calculadora financiera"). Crear repo en GitHub y `git push -u`.
2. **Migración Supabase** (`supabase/migrations/00000000000001_init.sql`):
   - Tabla `solicitudes` (datos del wizard, status, company_id si aplica
     algún día).
   - Tabla `informes` (raw response Credibid + path al PDF en Storage).
   - Tabla `accesos_informe` (eventos de visualización del PDF; opcional
     si PostHog cubre todo).
   - RLS: el cliente autenticado solo ve **sus** filas
     (`auth.uid() = solicitudes.user_id`).
3. **Cliente Supabase** (browser + server) en `src/lib/supabase.ts` y
   `src/lib/supabase-server.ts`. Wrap del helper SSR de Supabase.
4. **Magic link auth**:
   - `/login` con form de email → `signInWithOtp`.
   - `/auth/callback` route handler que setea sesión y redirige a
     `/wizard`.
   - Middleware que protege `/wizard` y `/informe/[id]` (login required).
5. **Server action `submitSolicitud`**:
   - Persiste el state final del wizard en `solicitudes`.
   - Llama al mock de Credibid (`src/lib/credibid.ts` — todavía no
     existe; crear con shape esperado).
   - Calcula resultado con `financial-calc.ts`.
   - Genera PDF y lo sube a Supabase Storage.
   - Inserta fila en `informes`.
   - Devuelve `{ informeId, urlPdf }` al cliente.
6. **PDF con `@react-pdf/renderer`**:
   - Componente en `src/pdf/InformeFinanciero.tsx`.
   - Layout: header con logo placeholder, datos del cliente, resumen
     numérico (UF aprobado, cuota, plazo), tips dinámicos según el
     resultado, footer con disclaimer "estimación referencial no
     oficial".
   - Generación en `src/app/api/pdf/[solicitudId]/route.ts` (route
     handler; renderiza on-the-fly y stream del buffer).
7. **Página de visualización del PDF** en `/informe/[id]`:
   - Carga la fila de `informes`, valida que `auth.uid()` matchea.
   - Muestra el PDF embebido (`<iframe>` apuntando a la URL firmada).
   - Botón "Descargar".
   - Tracking de eventos: open, scroll, download.
8. **Resend**:
   - Server action que envía email al cliente con el link al informe.
   - Template HTML simple (logo, copy corto, botón "Ver mi informe",
     link directo a `NEXT_PUBLIC_SITE_URL/informe/[id]`).
   - Disparada al final de `submitSolicitud`.
9. **PostHog**:
   - Setup en `src/app/layout.tsx` con `posthog-js` opt-in.
   - Eventos custom: `wizard_started`, `wizard_step_completed`,
     `wizard_completed`, `pdf_viewed`, `pdf_downloaded`.
   - Identify del usuario por email tras autenticación.
10. **Páginas informativas** (opcional, baja prioridad):
    `/quienes-somos`, `/como-funciona`, `/faq`. Header con links a estas.
11. **README final** con instrucciones de deploy actualizadas + lista de
    env vars que hay que cargar en Netlify.

---

## Especificación del wizard (referencia)

12 pasos según la spec acordada. Resumen de las preguntas (detalle ya
implementado en `src/components/wizard/steps/`):

1. **Datos del cliente**: Nombre + Apellido.
2. **Finalidad de la compra**: Vivir / Invertir / Aún no sé.
3. **Cuándo querés invertir**: Lo antes posible / 0–3m / 4–6m / 7–12m / Próximo año.
4. **Comunas de preferencia** (multi-select con autocomplete):
   - Top 10 inicial: Santiago, Las Condes, Providencia, Ñuñoa, Vitacura,
     La Florida, Lo Barnechea, San Miguel, Macul, La Reina.
   - "Agregar otra" busca en el catálogo de 346 comunas oficiales (no
     se permiten valores libres).
5. **Canal de contacto preferido**: correo o teléfono. Pedir uno; al
   final se pide el otro (no presionar al cliente).
6. **Tipo de ingreso**: Dependiente / Independiente / Mixto.
7. **Sueldo líquido promedio** (con nota: independientes contabilizan
   solo 70 % del monto bruto/honorarios).
8. **Monto de deudas mensuales** ($).
9. **Ahorro para el pie**: rangos (sin ahorros / 0–1M / 1–3M / 3–5M /
   5–10M / 10–20M / 20–30M).
10. **Cómo abarca un mes de gastos altos**: Pedir préstamo / Justo /
    Tengo ahorros / Holgura.
11. **Prioridad de compra**: Pagar lo menos posible / Equilibrio /
    Mejor inversión / Maximizar oportunidad.
12. **Paso final**: RUT + dato de contacto faltante (correo o teléfono,
    el opuesto del paso 5) + checkbox de consentimiento de uso de datos.

**Resultado**: monto referencial UF aprobado, cuota mensual sugerida,
3–5 tips personalizados según situación financiera.

---

## Cosas que conviene documentar / consultar

- **Credibid**: el API real llegará después. Por ahora el mock devuelve
  un shape como `{ score: number, monto_uf_aprobado: number,
  dividenda_max: number, observaciones: string[] }`. Diseñar para que
  reemplazar el mock por el real sea solo cambiar la implementación de
  `src/lib/credibid.ts` sin tocar el resto.
- **Dominio Resend**: pendiente de verificar. Hasta entonces, el `from`
  debe ser el email de la cuenta Resend; los emails solo llegan a la
  cuenta dueña de la API key.
- **Sitio Netlify**: aún no creado. Cuando se cree, cargar todas las
  env vars del `.env.local.example`.

---

## Decisiones de diseño tomadas

- **Modo de validación del wizard**: por step. `form.trigger([campos])`
  antes de avanzar.
- **Persistencia**: borrador en `solicitudes` desde el primer step;
  al "Enviar" se actualiza status y se dispara Credibid.
- **Auth**: magic link (sin password). Sesión de Supabase persiste; si
  el cliente vuelve días después con el link, retoma o ve su informe.
- **Cálculo "oficial vs referencial"**: hasta tener Credibid, todo
  resultado debe mostrar disclaimer de "estimación referencial".
- **Tono UX**: tuteo, animaciones suaves, móvil-first.

---

## Para el próximo "Claude"

Si llegás a este archivo y la lista de pendientes está mayoritariamente
hecha pero queda algún ítem suelto, completá lo que falta y al
terminar **borrá este archivo** o reemplazá su contenido por una nota
del estilo *"el plan original se completó el [fecha]; para nuevos
trabajos, ver issues/PRs"*.

Si necesitás contexto sobre la plataforma hermana
(`capital-plataforma-next`), está en
`c:\Users\tdeocares\OneDrive - capitalinteligente.cl\TI\capital-plataforma-next`.
Tiene su propio `CLAUDE.md` con las decisiones de **esa** plataforma.
Los dos proyectos son **independientes** salvo por compartir el equipo
y el lenguaje técnico.
