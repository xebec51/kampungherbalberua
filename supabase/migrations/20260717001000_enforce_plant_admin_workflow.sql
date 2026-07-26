-- Kampung Herbal Berua: plants admin workflow guard
-- Reinforces the dashboard rules at the database level. Server Actions still
-- validate role and input first; this trigger is a final safety layer below
-- the application and above RLS.

create function public.enforce_plants_staff_workflow()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller_role public.app_role := public.current_user_role();
  caller_id uuid := auth.uid();
begin
  -- Local seed and administrative migrations may run outside an authenticated
  -- request. RLS policies still govern anon/authenticated application access.
  if caller_role is null then
    if current_user in ('postgres', 'supabase_admin') then
      return new;
    end if;

    raise exception 'Akses konten tanaman tidak diizinkan'
      using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    if caller_role not in ('editor'::public.app_role, 'admin'::public.app_role) then
      raise exception 'Akses tambah tanaman tidak diizinkan'
        using errcode = '42501';
    end if;

    if caller_role = 'editor'::public.app_role then
      if new.content_status not in (
        'draft'::public.content_status,
        'pending_review'::public.content_status
      ) then
        raise exception 'Editor tidak dapat mempublikasikan tanaman'
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
      raise exception 'Akses ubah tanaman tidak diizinkan'
        using errcode = '42501';
    end if;

    if caller_role = 'editor'::public.app_role then
      if old.content_status not in (
        'draft'::public.content_status,
        'pending_review'::public.content_status
      ) then
        raise exception 'Editor hanya dapat mengubah tanaman draft atau pending review'
          using errcode = '42501';
      end if;

      if new.content_status not in (
        'draft'::public.content_status,
        'pending_review'::public.content_status
      ) then
        raise exception 'Editor tidak dapat mempublikasikan atau mengarsipkan tanaman'
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

  if new.content_status <> 'published'::public.content_status then
    new.published_at = null;
  end if;

  if new.validation_status = 'verified'::public.validation_status then
    if btrim(coalesce(new.validator_name, '')) = '' or btrim(coalesce(new.source_notes, '')) = '' then
      raise exception 'Data terverifikasi wajib memiliki validator dan sumber'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_plants_staff_workflow
  before insert or update on public.plants
  for each row
  execute function public.enforce_plants_staff_workflow();
