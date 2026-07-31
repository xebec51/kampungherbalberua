-- Kampung Herbal Berua: fix enforce_media_assets_admin_workflow().
--
-- The trigger (from 20260730090000_admin_only_workflow.sql) referenced
-- new.published_at / old.published_at, mirroring the plants/health_zones
-- workflow triggers. media_assets never had a published_at column (it only
-- has content_status + reviewed_by/reviewed_at). This went unnoticed
-- because nothing previously inserted/updated media_assets through an
-- authenticated admin session with content_status = 'published'; it
-- surfaced when the admin photo-upload feature exercised that exact path
-- for the first time, failing with
-- "record "new" has no field "published_at"".
--
-- NOTE: this function was already patched once after 20260730090000 by
-- 20260731091000_restore_import_service_role_bypass.sql, which added the
-- "or public.import_caller_is_service_role()" bypass so the offline media
-- import scripts can write with a service-role key. That bypass is
-- preserved here -- this migration only removes the invalid published_at
-- assignment, nothing else changes.

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

  return new;
end;
$$;
