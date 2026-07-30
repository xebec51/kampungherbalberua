-- Kampung Herbal Berua: admin-only dashboard workflow.
-- Keeps the existing app_role enum values for compatibility, but disables
-- legacy dashboard roles in RLS and workflow triggers.

alter table public.plants
  add column if not exists validation_checked_at timestamptz,
  add column if not exists validation_notes text;

alter table public.health_zones
  add column if not exists validation_checked_at timestamptz,
  add column if not exists validation_notes text;

comment on column public.plants.validator_name is
  'Human checker name metadata. This is not an account role.';
comment on column public.health_zones.validator_name is
  'Human checker name metadata. This is not an account role.';
comment on column public.plants.validation_checked_at is
  'Date/time when plant content was checked before publication.';
comment on column public.health_zones.validation_checked_at is
  'Date/time when health zone content was checked before publication.';
comment on column public.plants.validation_notes is
  'Optional notes from content checking.';
comment on column public.health_zones.validation_notes is
  'Optional notes from content checking.';

update public.plants
set
  validation_status = 'verified'::public.validation_status,
  validator_name = coalesce(nullif(btrim(validator_name), ''), 'Admin Kampung Herbal Berua'),
  source_notes = coalesce(nullif(btrim(source_notes), ''), 'Data produksi sebelum workflow admin-only'),
  validation_checked_at = coalesce(validation_checked_at, published_at, updated_at, now()),
  validation_notes = coalesce(validation_notes, 'Diperbaiki otomatis agar konten published memiliki metadata pemeriksaan lengkap.')
where content_status = 'published'::public.content_status
  and (
    validation_status <> 'verified'::public.validation_status
    or btrim(coalesce(validator_name, '')) = ''
    or btrim(coalesce(source_notes, '')) = ''
    or validation_checked_at is null
  );

update public.health_zones
set
  validation_status = 'verified'::public.validation_status,
  validator_name = coalesce(nullif(btrim(validator_name), ''), 'Admin Kampung Herbal Berua'),
  source_notes = case
    when coalesce(array_length(source_notes, 1), 0) = 0
      then array['Data produksi sebelum workflow admin-only']
    else source_notes
  end,
  validation_checked_at = coalesce(validation_checked_at, published_at, updated_at, now()),
  validation_notes = coalesce(validation_notes, 'Diperbaiki otomatis agar konten published memiliki metadata pemeriksaan lengkap.')
where content_status = 'published'::public.content_status
  and (
    validation_status <> 'verified'::public.validation_status
    or btrim(coalesce(validator_name, '')) = ''
    or coalesce(array_length(source_notes, 1), 0) = 0
    or validation_checked_at is null
  );

update public.herbacode_plant_zone_entries
set
  validation_status = 'verified'::public.validation_status,
  validator_name = coalesce(nullif(btrim(validator_name), ''), 'Admin Kampung Herbal Berua'),
  validated_at = coalesce(validated_at, updated_at, now())
where content_status = 'published'::public.content_status
  and (
    validation_status <> 'verified'::public.validation_status
    or btrim(coalesce(validator_name, '')) = ''
    or btrim(coalesce(source_document_name, '')) = ''
    or validated_at is null
  );

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
    if current_user in ('postgres', 'supabase_admin') then
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
    if current_user in ('postgres', 'supabase_admin') then
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
    if current_user in ('postgres', 'supabase_admin') then
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
    if current_user in ('postgres', 'supabase_admin') then
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

drop trigger if exists enforce_plants_staff_workflow on public.plants;
drop trigger if exists enforce_plants_admin_workflow on public.plants;
create trigger enforce_plants_admin_workflow
  before insert or update on public.plants
  for each row
  execute function public.enforce_plants_admin_workflow();

drop trigger if exists enforce_health_zones_staff_workflow on public.health_zones;
drop trigger if exists enforce_health_zones_admin_workflow on public.health_zones;
create trigger enforce_health_zones_admin_workflow
  before insert or update on public.health_zones
  for each row
  execute function public.enforce_health_zones_admin_workflow();

drop trigger if exists enforce_media_assets_staff_workflow on public.media_assets;
drop trigger if exists enforce_media_assets_admin_workflow on public.media_assets;
create trigger enforce_media_assets_admin_workflow
  before insert or update on public.media_assets
  for each row
  execute function public.enforce_media_assets_admin_workflow();

drop trigger if exists enforce_herbacode_admin_workflow on public.herbacode_plant_zone_entries;
create trigger enforce_herbacode_admin_workflow
  before insert or update on public.herbacode_plant_zone_entries
  for each row
  execute function public.enforce_herbacode_admin_workflow();

drop function if exists public.enforce_plants_staff_workflow();
drop function if exists public.enforce_health_zones_staff_workflow();
drop function if exists public.enforce_media_assets_staff_workflow();

do $$
declare
  policy_table text;
  policy_name text;
begin
  for policy_table, policy_name in
    values
      ('plants', 'plants_select_staff'),
      ('plants', 'plants_insert_staff'),
      ('plants', 'plants_update_staff'),
      ('health_zones', 'health_zones_select_staff'),
      ('health_zones', 'health_zones_insert_staff'),
      ('health_zones', 'health_zones_update_staff'),
      ('media_assets', 'media_assets_select_staff'),
      ('media_assets', 'media_assets_insert_editor_admin'),
      ('media_assets', 'media_assets_update_editor_admin'),
      ('plant_media', 'plant_media_select_staff'),
      ('plant_media', 'plant_media_mutate_editor_admin'),
      ('health_zone_media', 'health_zone_media_select_staff'),
      ('health_zone_media', 'health_zone_media_mutate_editor_admin'),
      ('content_media_slots', 'content_media_slots_select_staff'),
      ('content_media_slots', 'content_media_slots_mutate_editor_admin'),
      ('plant_sources', 'plant_sources_select_staff'),
      ('plant_collections', 'plant_collections_select_staff'),
      ('plant_source_entries', 'plant_source_entries_select_staff'),
      ('plant_names', 'plant_names_select_staff'),
      ('media_quality_reviews', 'media_quality_reviews_select_staff'),
      ('media_quality_reviews', 'media_quality_reviews_insert_editor_admin'),
      ('media_quality_reviews', 'media_quality_reviews_update_validator_admin'),
      ('media_attachment_history', 'media_attachment_history_select_staff'),
      ('media_attachment_history', 'media_attachment_history_insert_editor_admin'),
      ('streets', 'streets_select_staff'),
      ('streets', 'streets_insert_staff'),
      ('streets', 'streets_update_staff'),
      ('health_zone_streets', 'health_zone_streets_select_staff'),
      ('herbacode_plant_zone_entries', 'herbacode_entries_select_staff'),
      ('herbacode_entry_history', 'herbacode_entry_history_select_staff'),
      ('street_plant_entries', 'street_plant_entries_select_staff'),
      ('street_media', 'street_media_select_staff')
  loop
    execute format('drop policy if exists %I on public.%I', policy_name, policy_table);
  end loop;
end;
$$;

create policy "plants_select_admin"
  on public.plants
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "plants_insert_admin"
  on public.plants
  for insert
  to authenticated
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "plants_update_admin"
  on public.plants
  for update
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "health_zones_select_admin"
  on public.health_zones
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "health_zones_insert_admin"
  on public.health_zones
  for insert
  to authenticated
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "health_zones_update_admin"
  on public.health_zones
  for update
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "media_assets_select_admin"
  on public.media_assets
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "media_assets_insert_admin"
  on public.media_assets
  for insert
  to authenticated
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "media_assets_update_admin"
  on public.media_assets
  for update
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "plant_media_select_admin"
  on public.plant_media
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "plant_media_mutate_admin"
  on public.plant_media
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "health_zone_media_select_admin"
  on public.health_zone_media
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "health_zone_media_mutate_admin"
  on public.health_zone_media
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "content_media_slots_select_admin"
  on public.content_media_slots
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "content_media_slots_mutate_admin"
  on public.content_media_slots
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "plant_sources_select_admin"
  on public.plant_sources
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "plant_collections_select_admin"
  on public.plant_collections
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "plant_source_entries_select_admin"
  on public.plant_source_entries
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "plant_names_select_admin"
  on public.plant_names
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "media_quality_reviews_select_admin"
  on public.media_quality_reviews
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "media_quality_reviews_insert_admin"
  on public.media_quality_reviews
  for insert
  to authenticated
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "media_quality_reviews_update_admin"
  on public.media_quality_reviews
  for update
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "media_attachment_history_select_admin"
  on public.media_attachment_history
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "media_attachment_history_insert_admin"
  on public.media_attachment_history
  for insert
  to authenticated
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "streets_select_admin"
  on public.streets
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "streets_insert_admin"
  on public.streets
  for insert
  to authenticated
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "streets_update_admin"
  on public.streets
  for update
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "health_zone_streets_select_admin"
  on public.health_zone_streets
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "herbacode_entries_select_admin"
  on public.herbacode_plant_zone_entries
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "herbacode_entry_history_select_admin"
  on public.herbacode_entry_history
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "street_plant_entries_select_admin"
  on public.street_plant_entries
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "street_media_select_admin"
  on public.street_media
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

drop policy if exists "media_originals_read_staff" on storage.objects;
drop policy if exists "media_originals_read_admin" on storage.objects;
create policy "media_originals_read_admin"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'media-originals'
    and public.current_user_role() = 'admin'::public.app_role
  );

drop policy if exists "media_public_insert_editor_admin" on storage.objects;
drop policy if exists "media_public_insert_admin" on storage.objects;
create policy "media_public_insert_admin"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media-public'
    and public.current_user_role() = 'admin'::public.app_role
  );

drop policy if exists "media_originals_insert_editor_admin" on storage.objects;
drop policy if exists "media_originals_insert_admin" on storage.objects;
create policy "media_originals_insert_admin"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media-originals'
    and public.current_user_role() = 'admin'::public.app_role
  );

