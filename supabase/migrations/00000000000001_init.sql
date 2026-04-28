-- ============================================================================
-- Portal Crédito — migración inicial
-- ============================================================================
-- Crea las tablas core (solicitudes, informes, accesos_informe), tipos ENUM
-- por cada selección del wizard, bucket de Storage privado para PDFs y
-- políticas RLS que habilitan SELECT por user_id desde el browser.
--
-- Modelo de escritura: TODAS las inserciones/updates pasan por server actions
-- usando la service_role key (que bypasea RLS). Las políticas de abajo solo
-- habilitan lectura para que el cliente vea sus propias filas.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUM types — reflejan los enums de src/lib/wizard-schema.ts
-- ---------------------------------------------------------------------------
create type solicitud_status as enum ('borrador', 'enviada', 'procesada');

create type proposito as enum ('vivir', 'invertir', 'no_lo_tengo_claro');

create type cuando_invertir as enum (
  'lo_antes_posible',
  '0_6_meses',
  '7_12_meses',
  'proximo_anio'
);

create type tipo_ingreso as enum ('dependiente', 'independiente', 'mixto');

create type ahorro_pie as enum (
  'no_ahorros',
  'hasta_2m',
  '2_a_5m',
  '5_a_10m',
  '10_a_20m',
  '20_a_30m'
);

create type mes_gastos_fuertes as enum (
  'pido_credito',
  'quedo_justo',
  'tengo_ahorro',
  'holgura'
);

create type prioridad_compra as enum (
  'pagar_menos',
  'equilibrio',
  'buena_inversion',
  'maximizar'
);

create type canal_contacto as enum ('correo', 'celular');

-- ---------------------------------------------------------------------------
-- Trigger reusable: actualiza updated_at
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- solicitudes — un row por wizard (borrador → enviada → procesada)
-- ---------------------------------------------------------------------------
create table solicitudes (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  status              solicitud_status not null default 'borrador',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  nombre              text,
  apellido            text,
  proposito           proposito,
  cuando_invertir     cuando_invertir,
  comunas             text[],
  canal_preferido     canal_contacto,
  correo              text,
  celular             text,
  tipo_ingreso        tipo_ingreso,
  liquido_mensual     integer,
  deudas_mensuales    integer,
  ahorro_pie          ahorro_pie,
  mes_gastos_fuertes  mes_gastos_fuertes,
  prioridad_compra    prioridad_compra,
  rut                 text,

  constraint liquido_mensual_positive
    check (liquido_mensual is null or liquido_mensual > 0),
  constraint deudas_no_negativas
    check (deudas_mensuales is null or deudas_mensuales >= 0),
  constraint comunas_max_10
    check (comunas is null or array_length(comunas, 1) <= 10)
);

create index solicitudes_user_id_idx on solicitudes (user_id);
create index solicitudes_status_idx on solicitudes (status);

-- Un usuario solo puede tener UN borrador a la vez (evita duplicados al refrescar).
create unique index solicitudes_one_borrador_per_user
  on solicitudes (user_id)
  where status = 'borrador';

create trigger solicitudes_set_updated_at
  before update on solicitudes
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- informes — resultado financiero + ruta al PDF en Storage
-- ---------------------------------------------------------------------------
create table informes (
  id                  uuid primary key default gen_random_uuid(),
  solicitud_id        uuid not null references solicitudes(id) on delete cascade,
  created_at          timestamptz not null default now(),

  -- Raw response del mock/API CrediBid (preservado por trazabilidad).
  credibid_response   jsonb,

  -- Campos extraídos para queries (denormalizados desde credibid_response).
  score               integer,
  monto_uf_aprobado   integer,
  dividenda_max       integer,

  -- Cálculos locales (financial-calc.ts) en CLP.
  liquido_efectivo    integer,
  cuota_maxima        integer,

  -- Tips renderizados al momento del informe (snapshot — la lógica de
  -- consejos.ts puede cambiar en el futuro sin alterar informes pasados).
  tips                text[] not null default '{}',

  -- Path dentro del bucket "informes" en Storage. Se sirve via signed URL.
  pdf_storage_path    text
);

create index informes_solicitud_id_idx on informes (solicitud_id);

-- ---------------------------------------------------------------------------
-- accesos_informe — eventos de visualización del PDF
-- ---------------------------------------------------------------------------
-- Opcional si PostHog termina cubriendo todo el tracking. Mantenida acá para
-- tener auditoría propia (independiente de un tercero) y eventualmente ofrecer
-- al cliente un historial de accesos.
create table accesos_informe (
  id          uuid primary key default gen_random_uuid(),
  informe_id  uuid not null references informes(id) on delete cascade,
  evento      text not null check (evento in ('open', 'download', 'print')),
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index accesos_informe_informe_id_idx on accesos_informe (informe_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table solicitudes      enable row level security;
alter table informes         enable row level security;
alter table accesos_informe  enable row level security;

-- solicitudes: el cliente solo ve sus propias filas
create policy solicitudes_select_own
  on solicitudes for select
  to authenticated
  using (auth.uid() = user_id);

-- informes: el cliente solo ve informes de sus propias solicitudes
create policy informes_select_own
  on informes for select
  to authenticated
  using (
    exists (
      select 1 from solicitudes s
      where s.id = informes.solicitud_id
        and s.user_id = auth.uid()
    )
  );

-- accesos_informe: el cliente solo ve accesos de sus propios informes
create policy accesos_informe_select_own
  on accesos_informe for select
  to authenticated
  using (
    exists (
      select 1
      from informes i
      join solicitudes s on s.id = i.solicitud_id
      where i.id = accesos_informe.informe_id
        and s.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Storage — bucket privado para PDFs
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('informes', 'informes', false)
on conflict (id) do nothing;

-- Defensivo: aunque los PDFs se sirven via signed URL desde server actions,
-- bloqueamos el SELECT directo para que solo el dueño del informe pueda leer.
create policy informes_storage_select_own
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'informes'
    and exists (
      select 1
      from informes i
      join solicitudes s on s.id = i.solicitud_id
      where i.pdf_storage_path = storage.objects.name
        and s.user_id = auth.uid()
    )
  );
