-- ============================================================================
-- Funciones de limpieza periódica
-- ============================================================================
-- Dos funciones de mantenimiento. Programalas con pg_cron si la extension está
-- disponible (Free tier de Supabase la incluye). Si no, ejecutalas manualmente
-- desde SQL Editor cada N días.
--
-- 1. cleanup_orphan_solicitudes — borra solicitudes sin user_id que tengan
--    más de N días. Cumple con derecho al olvido (Ley 19.628) y evita acumular
--    PII (RUT, sueldo, deudas) que ya no le sirve a nadie. El cascade en
--    informes y accesos_informe se encarga de las tablas dependientes.
--
-- 2. cleanup_old_rate_limits — borra entradas de rate_limits con ventana
--    expirada hace > 7 días. Evita que la tabla crezca indefinidamente.
-- ============================================================================

-- ---- 1. Solicitudes huérfanas viejas ---------------------------------------
create or replace function cleanup_orphan_solicitudes(max_age_days integer default 14)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  delete from solicitudes
  where user_id is null
    and created_at < now() - make_interval(days := max_age_days);

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function cleanup_orphan_solicitudes(integer) from public;
grant execute on function cleanup_orphan_solicitudes(integer) to service_role;

-- ---- 2. Rate limits viejos -------------------------------------------------
create or replace function cleanup_old_rate_limits()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  delete from rate_limits
  where window_start < now() - interval '7 days';

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function cleanup_old_rate_limits() from public;
grant execute on function cleanup_old_rate_limits() to service_role;

-- ============================================================================
-- Cómo programar las limpiezas
-- ============================================================================
-- Opción A — pg_cron (recomendada, una sola vez en SQL Editor):
--
--   create extension if not exists pg_cron;
--
--   select cron.schedule(
--     'cleanup-orphan-solicitudes-daily',
--     '0 3 * * *',                          -- 3:00 AM UTC todos los días
--     $$select cleanup_orphan_solicitudes(14);$$
--   );
--
--   select cron.schedule(
--     'cleanup-old-rate-limits-daily',
--     '15 3 * * *',                         -- 3:15 AM UTC todos los días
--     $$select cleanup_old_rate_limits();$$
--   );
--
-- Opción B — manual cuando quieras, en SQL Editor:
--
--   select cleanup_orphan_solicitudes(14) as borradas;
--   select cleanup_old_rate_limits() as borradas;
-- ============================================================================
