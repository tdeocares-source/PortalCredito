-- ============================================================================
-- Wizard público — login post-completion
-- ============================================================================
-- Cambia el modelo de "login antes del wizard" a "login después del wizard
-- vía magic link en el email del informe":
--
-- 1. solicitudes.user_id pasa a nullable: el wizard se completa sin auth.
-- 2. Se agrega solicitudes.correo_contacto: el email al que se manda el
--    informe + magic link. Usado por /auth/callback para reclamar las
--    solicitudes huérfanas (user_id = null) cuando el cliente clickea el link.
-- 3. RLS sigue funcionando igual (auth.uid() = user_id). Las filas con
--    user_id null no son visibles para nadie hasta que /auth/callback las
--    reclame.
-- ============================================================================

alter table solicitudes
  alter column user_id drop not null;

alter table solicitudes
  add column correo_contacto text;

-- Backfill: las solicitudes existentes ya tenían el correo en la columna
-- "correo". Lo copiamos a correo_contacto para mantener consistencia.
update solicitudes
set correo_contacto = correo
where correo_contacto is null;

create index solicitudes_correo_contacto_idx
  on solicitudes (correo_contacto)
  where user_id is null;
