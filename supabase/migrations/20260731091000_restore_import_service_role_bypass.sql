-- Kampung Herbal Berua: restore service-role bypass on admin-only workflow triggers.
--
-- 20260730090000_admin_only_workflow.sql rewrote the plants/health_zones/
-- media_assets/herbacode_plant_zone_entries workflow triggers to be admin-only,
-- but in doing so dropped the "or public.import_caller_is_service_role()"
-- fallback that the earlier staff-workflow versions had (see
-- 20260728094000_read_service_role_from_jwt_claims.sql). Guarded local import
-- scripts (scripts/herbacode, scripts/media) authenticate with the
-- service_role key -- under PostgREST that runs as Postgres role
-- `service_role`, which is neither `postgres`/`supabase_admin` nor a row in
-- `public.profiles`, so `current_user_role()` returns null and the trigger's
-- null-role fallback (`current_user in ('postgres', 'supabase_admin')`)
-- rejects it outright. Without this fix, every guarded import script that
-- writes to these four tables fails against any project with the admin-only
-- migration applied.
--
-- This migration only recreates the four trigger functions to add back that
-- bypass. It does not change any RLS policy, any human-facing role check, or
-- any publish-gate validation rule.
--
-- It also grants service_role EXECUTE on public.current_user_role(): that
-- function was only ever granted to `authenticated` (20260716060810), and
-- every one of these trigger functions calls it unconditionally as the very
-- first thing they do (`caller_role public.app_role := public.current_user_role()`)
-- -- before the bypass check below even runs. Without this grant, calling it
-- as service_role fails with "permission denied for function
-- current_user_role" instead of reaching the bypass at all. The function is
-- `security definer` and only reads the caller's own (nonexistent, for
-- service_role) session profile, so this grant exposes nothing new.
grant execute on function public.current_user_role() to service_role;

create or replace function public.enforce_plants_admin_workflow()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller_role public.app_role := public.current_user_role();
  caller_id uuid := auth.uid();
begin
  if caller_role is null then
    if current_user in ('postgres', 'supabase_admin') or public.import_caller_is_service_role() then
      return new;
    end if;

    raise exception 'Akses konten tanaman tidak diizinkan'
      using errcode = '42501';
  end if;

  if caller_role <> 'admin'::public.app_role then
    raise exception 'Hanya admin yang dapat mengelola tanaman'
      using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    new.created_by = caller_id;
    new.updated_by = caller_id;
  elsif tg_op = 'UPDATE' then
    new.created_by = old.created_by;
    new.updated_by = caller_id;
  end if;

  if new.validation_status = 'verified'::public.validation_status
    and new.validation_checked_at is null
  then
    new.validation_checked_at = now();
  end if;

  if new.content_status = 'published'::public.content_status then
    if new.validation_status <> 'verified'::public.validation_status
      or btrim(coalesce(new.validator_name, '')) = ''
      or btrim(coalesce(new.source_notes, '')) = ''
      or new.validation_checked_at is null
    then
      raise exception 'Konten tanaman published wajib terverifikasi lengkap'
        using errcode = '23514';
    end if;

    if new.published_at is null then
      new.published_at = now();
    end if;
  else
    new.published_at = null;
  end if;

  if new.validation_status = 'verified'::public.validation_status then
    if btrim(coalesce(new.validator_name, '')) = ''
      or btrim(coalesce(new.source_notes, '')) = ''
      or new.validation_checked_at is null
    then
      raise exception 'Data terverifikasi wajib memiliki pemeriksa, sumber, dan tanggal pemeriksaan'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_health_zones_admin_workflow()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller_role public.app_role := public.current_user_role();
  caller_id uuid := auth.uid();
begin
  if caller_role is null then
    if current_user in ('postgres', 'supabase_admin') or public.import_caller_is_service_role() then
      return new;
    end if;

    raise exception 'Akses zona kesehatan tidak diizinkan'
      using errcode = '42501';
  end if;

  if caller_role <> 'admin'::public.app_role then
    raise exception 'Hanya admin yang dapat mengelola zona kesehatan'
      using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    new.created_by = caller_id;
    new.updated_by = caller_id;
  elsif tg_op = 'UPDATE' then
    if (
      old.zone_code is distinct from new.zone_code
      and (old.published_at is not null or old.content_status = 'published'::public.content_status)
    ) then
      raise exception 'Kode zona permanen tidak dapat diubah setelah publikasi'
        using errcode = '23514';
    end if;

    new.created_by = old.created_by;
    new.updated_by = caller_id;
  end if;

  if new.validation_status = 'verified'::public.validation_status
    and new.validation_checked_at is null
  then
    new.validation_checked_at = now();
  end if;

  if new.content_status = 'published'::public.content_status then
    if new.validation_status <> 'verified'::public.validation_status
      or btrim(coalesce(new.validator_name, '')) = ''
      or coalesce(array_length(new.source_notes, 1), 0) = 0
      or new.validation_checked_at is null
    then
      raise exception 'Konten zona published wajib terverifikasi lengkap'
        using errcode = '23514';
    end if;

    if new.published_at is null then
      new.published_at = now();
    end if;
  else
    new.published_at = null;
  end if;

  if new.validation_status = 'verified'::public.validation_status then
    if btrim(coalesce(new.validator_name, '')) = ''
      or coalesce(array_length(new.source_notes, 1), 0) = 0
      or new.validation_checked_at is null
    then
      raise exception 'Zona terverifikasi wajib memiliki pemeriksa, sumber, dan tanggal pemeriksaan'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_media_assets_admin_workflow()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller_role public.app_role := public.current_user_role();
  caller_id uuid := auth.uid();
begin
  if caller_role is null then
    if current_user in ('postgres', 'supabase_admin') or public.import_caller_is_service_role() then
      return new;
    end if;

    raise exception 'Akses media tidak diizinkan'
      using errcode = '42501';
  end if;

  if caller_role <> 'admin'::public.app_role then
    raise exception 'Hanya admin yang dapat mengelola media'
      using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    new.created_by = caller_id;
    new.updated_by = caller_id;
  elsif tg_op = 'UPDATE' then
    new.created_by = old.created_by;
    new.updated_by = caller_id;
  end if;

  if new.content_status = 'published'::public.content_status and new.published_at is null then
    new.published_at = now();
  end if;

  if new.content_status <> 'published'::public.content_status then
    new.published_at = null;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_herbacode_admin_workflow()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller_role public.app_role := public.current_user_role();
begin
  if caller_role is null then
    if current_user in ('postgres', 'supabase_admin') or public.import_caller_is_service_role() then
      return new;
    end if;

    raise exception 'Akses HerbaCode tidak diizinkan'
      using errcode = '42501';
  end if;

  if caller_role <> 'admin'::public.app_role then
    raise exception 'Hanya admin yang dapat mengelola HerbaCode'
      using errcode = '42501';
  end if;

  if new.validation_status = 'verified'::public.validation_status
    and new.validated_at is null
  then
    new.validated_at = now();
  end if;

  if new.content_status = 'published'::public.content_status then
    if new.validation_status <> 'verified'::public.validation_status
      or btrim(coalesce(new.validator_name, '')) = ''
      or btrim(coalesce(new.source_document_name, '')) = ''
      or new.validated_at is null
    then
      raise exception 'Konten HerbaCode published wajib terverifikasi lengkap'
        using errcode = '23514';
    end if;
  end if;

  if new.validation_status = 'verified'::public.validation_status then
    if btrim(coalesce(new.validator_name, '')) = ''
      or btrim(coalesce(new.source_document_name, '')) = ''
      or new.validated_at is null
    then
      raise exception 'HerbaCode terverifikasi wajib memiliki pemeriksa, sumber, dan tanggal pemeriksaan'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;
