-- ============================================================================
-- Rate limiting básico para endpoints públicos
-- ============================================================================
-- Tabla + función que implementan rate limit por clave arbitraria
-- (IP, email, etc). Uso desde server actions:
--
--   const { data: allowed } = await admin.rpc("check_rate_limit", {
--     p_key: `submit:ip:${ip}`,
--     p_max: 5,
--     p_window_seconds: 3600,
--   });
--   if (!allowed) return { ok: false, error: "..." };
--
-- Estrategia de ventana: ventana fija. Cuando expira (now() - window_start
-- > p_window_seconds), se resetea el contador. No es el algoritmo más
-- preciso (sliding window sería mejor), pero alcanza para defensa contra
-- spam/abuso simple sin agregar Redis.
-- ============================================================================

create table rate_limits (
  key             text primary key,
  count           integer not null default 0,
  window_start    timestamptz not null default now()
);

-- Sin policies: solo service_role accede (bypasea RLS por diseño).
alter table rate_limits enable row level security;

create or replace function check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into rate_limits (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
  set
    count = case
      when rate_limits.window_start < now() - make_interval(secs := p_window_seconds)
        then 1
      else rate_limits.count + 1
    end,
    window_start = case
      when rate_limits.window_start < now() - make_interval(secs := p_window_seconds)
        then now()
      else rate_limits.window_start
    end
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

-- Limpieza periódica recomendada (correr manualmente o con pg_cron):
--   delete from rate_limits where window_start < now() - interval '7 days';
