-- Kampung Herbal Berua: health zones + permanent QR identity
-- Creates the thematic zone table used by Kampung Herbal Harmony signs.

create table public.health_zones (
  id uuid primary key default gen_random_uuid(),
  zone_code text unique not null,
  slug text unique not null,
  program_name text not null default 'Kampung Herbal Harmony',
  street_name text not null,
  zone_name text not null,
  block_ranges text[] not null default '{}',
  health_topic text not null,
  sign_text text,
  short_description text not null,
  overview text not null,
  educational_points text[] not null default '{}',
  healthy_habits text[] not null default '{}',
  important_notes text[] not null default '{}',
  source_notes text[] not null default '{}',
  image_path text,
  location_notes text,
  validator_name text,
  validator_id uuid references public.profiles (id),
  validation_status public.validation_status not null default 'data_demonstrasi',
  content_status public.content_status not null default 'draft',
  featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint health_zones_zone_code_format check (zone_code ~ '^khb-z[0-9]{2}$'),
  constraint health_zones_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint health_zones_street_name_not_blank check (btrim(street_name) <> ''),
  constraint health_zones_zone_name_not_blank check (btrim(zone_name) <> ''),
  constraint health_zones_health_topic_not_blank check (btrim(health_topic) <> ''),
  constraint health_zones_short_description_not_blank check (btrim(short_description) <> ''),
  constraint health_zones_overview_not_blank check (btrim(overview) <> '')
);

comment on table public.health_zones is
  'Thematic health education zones for Kampung Herbal Harmony signs. Permanent QR codes use zone_code, not slug.';

create trigger set_health_zones_updated_at
  before update on public.health_zones
  for each row
  execute function public.set_updated_at();

create index health_zones_slug_idx on public.health_zones (slug);
create index health_zones_zone_code_idx on public.health_zones (zone_code);
create index health_zones_content_status_idx on public.health_zones (content_status);
create index health_zones_validation_status_idx on public.health_zones (validation_status);
create index health_zones_featured_idx on public.health_zones (featured);
create index health_zones_published_at_idx on public.health_zones (published_at);

create function public.enforce_health_zones_staff_workflow()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller_role public.app_role := public.current_user_role();
  caller_id uuid := auth.uid();
begin
  if caller_role is null then
    if current_user in ('postgres', 'supabase_admin') then
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

create trigger enforce_health_zones_staff_workflow
  before insert or update on public.health_zones
  for each row
  execute function public.enforce_health_zones_staff_workflow();

alter table public.health_zones enable row level security;

grant select on public.health_zones to anon, authenticated;
grant insert, update, delete on public.health_zones to authenticated;
grant select, insert, update, delete on public.health_zones to service_role;

create policy "health_zones_select_published"
  on public.health_zones
  for select
  to anon, authenticated
  using (content_status = 'published'::public.content_status);

create policy "health_zones_select_staff"
  on public.health_zones
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "health_zones_insert_staff"
  on public.health_zones
  for insert
  to authenticated
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );

create policy "health_zones_update_staff"
  on public.health_zones
  for update
  to authenticated
  using (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  )
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );

create policy "health_zones_delete_admin"
  on public.health_zones
  for delete
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);
