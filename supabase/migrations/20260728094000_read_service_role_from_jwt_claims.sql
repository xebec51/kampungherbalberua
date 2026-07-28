-- Kampung Herbal Berua: support Supabase PostgREST JWT claims JSON format
-- for guarded service-role import scripts.

create or replace function public.import_caller_is_service_role()
returns boolean
language plpgsql
stable
set search_path = ''
as $$
declare
  claim_role text := current_setting('request.jwt.claim.role', true);
  claims text := current_setting('request.jwt.claims', true);
begin
  if claim_role = 'service_role' then
    return true;
  end if;

  if claims is not null and btrim(claims) <> '' then
    return coalesce((claims::jsonb ->> 'role') = 'service_role', false);
  end if;

  return false;
exception
  when others then
    return false;
end;
$$;

revoke all on function public.import_caller_is_service_role() from public;
grant execute on function public.import_caller_is_service_role() to service_role;

create or replace function public.enforce_health_zones_staff_workflow()
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

  if tg_op = 'INSERT' then
    if caller_role not in ('editor'::public.app_role, 'admin'::public.app_role) then
      raise exception 'Akses tambah zona tidak diizinkan'
        using errcode = '42501';
    end if;

    if caller_role = 'editor'::public.app_role then
      if new.content_status not in (
        'draft'::public.content_status,
        'pending_review'::public.content_status
      ) then
        raise exception 'Editor tidak dapat mempublikasikan zona'
          using errcode = '42501';
      end if;

      if new.validation_status not in (
        'data_demonstrasi'::public.validation_status,
        'pending'::public.validation_status
      ) then
        raise exception 'Editor tidak dapat menetapkan status validasi final'
          using errcode = '42501';
      end if;
    end if;

    new.created_by = caller_id;
    new.updated_by = caller_id;
  end if;

  if tg_op = 'UPDATE' then
    if caller_role not in ('editor'::public.app_role, 'admin'::public.app_role) then
      raise exception 'Akses ubah zona tidak diizinkan'
        using errcode = '42501';
    end if;

    if (
      old.zone_code is distinct from new.zone_code
      and (old.published_at is not null or old.content_status = 'published'::public.content_status)
    ) then
      raise exception 'Kode zona permanen tidak dapat diubah setelah publikasi'
        using errcode = '23514';
    end if;

    if caller_role = 'editor'::public.app_role then
      if old.content_status not in (
        'draft'::public.content_status,
        'pending_review'::public.content_status
      ) then
        raise exception 'Editor hanya dapat mengubah zona draft atau pending review'
          using errcode = '42501';
      end if;

      if new.content_status not in (
        'draft'::public.content_status,
        'pending_review'::public.content_status
      ) then
        raise exception 'Editor tidak dapat mempublikasikan atau mengarsipkan zona'
          using errcode = '42501';
      end if;

      if new.validation_status not in (
        'data_demonstrasi'::public.validation_status,
        'pending'::public.validation_status
      ) then
        raise exception 'Editor tidak dapat menetapkan status validasi final'
          using errcode = '42501';
      end if;
    end if;

    new.created_by = old.created_by;
    new.updated_by = caller_id;
  end if;

  if new.content_status = 'published'::public.content_status and new.published_at is null then
    new.published_at = now();
  end if;

  if new.validation_status = 'verified'::public.validation_status then
    if btrim(coalesce(new.validator_name, '')) = '' or coalesce(array_length(new.source_notes, 1), 0) = 0 then
      raise exception 'Zona terverifikasi wajib memiliki validator dan sumber'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_media_assets_staff_workflow()
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

  if tg_op = 'INSERT' then
    if caller_role not in ('editor'::public.app_role, 'admin'::public.app_role) then
      raise exception 'Akses tambah media tidak diizinkan'
        using errcode = '42501';
    end if;

    if caller_role = 'editor'::public.app_role then
      if new.content_status not in (
        'draft'::public.content_status,
        'pending_review'::public.content_status
      ) then
        raise exception 'Editor tidak dapat mempublikasikan media'
          using errcode = '42501';
      end if;

      if new.rights_status = 'approved' or new.privacy_status = 'approved' then
        raise exception 'Editor tidak dapat menyetujui hak atau privasi media'
          using errcode = '42501';
      end if;
    end if;

    new.created_by = caller_id;
    new.updated_by = caller_id;
  end if;

  if tg_op = 'UPDATE' then
    if caller_role not in ('editor'::public.app_role, 'admin'::public.app_role) then
      raise exception 'Akses ubah media tidak diizinkan'
        using errcode = '42501';
    end if;

    if caller_role = 'editor'::public.app_role then
      if old.content_status not in (
        'draft'::public.content_status,
        'pending_review'::public.content_status
      ) then
        raise exception 'Editor hanya dapat mengubah media draft atau pending review'
          using errcode = '42501';
      end if;

      if new.content_status not in (
        'draft'::public.content_status,
        'pending_review'::public.content_status
      ) then
        raise exception 'Editor tidak dapat mempublikasikan atau mengarsipkan media'
          using errcode = '42501';
      end if;

      if new.rights_status = 'approved' or new.privacy_status = 'approved' then
        raise exception 'Editor tidak dapat menyetujui hak atau privasi media'
          using errcode = '42501';
      end if;
    end if;

    new.created_by = old.created_by;
    new.updated_by = caller_id;
  end if;

  if caller_role = 'admin'::public.app_role
    and (new.rights_status = 'approved' or new.privacy_status in ('approved', 'not_required'))
    and new.reviewed_by is null then
    new.reviewed_by = caller_id;
    new.reviewed_at = now();
  end if;

  return new;
end;
$$;
