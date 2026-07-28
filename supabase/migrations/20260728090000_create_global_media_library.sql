-- Kampung Herbal Berua: global media library foundation.
-- Stores media metadata, rights/privacy review state, and content attachments.

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  asset_code text unique not null,
  title text not null,
  alt_text text not null,
  caption text,
  media_kind text not null default 'image',
  image_type text,
  original_bucket text,
  original_path text,
  public_bucket text,
  public_path text,
  mime_type text not null,
  width integer,
  height integer,
  file_size_bytes bigint,
  checksum_sha256 text not null,
  source_type text not null,
  source_page_url text,
  source_file_url text,
  creator_name text,
  license_code text,
  license_url text,
  attribution_text text,
  changes_made text,
  accessed_at date,
  rights_status text not null default 'pending',
  privacy_status text not null default 'pending',
  content_status public.content_status not null default 'draft',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_assets_asset_code_not_blank check (btrim(asset_code) <> ''),
  constraint media_assets_title_not_blank check (btrim(title) <> ''),
  constraint media_assets_alt_text_not_blank check (btrim(alt_text) <> ''),
  constraint media_assets_media_kind_allowed check (media_kind in ('image')),
  constraint media_assets_image_type_allowed check (
    image_type is null
    or image_type in (
      'cover',
      'whole_plant',
      'leaf',
      'flower',
      'fruit',
      'seed',
      'stem',
      'root',
      'rhizome',
      'recipe',
      'product',
      'documentation',
      'portrait',
      'map',
      'illustration',
      'hero'
    )
  ),
  constraint media_assets_checksum_sha256_format check (checksum_sha256 ~ '^[0-9a-f]{64}$'),
  constraint media_assets_width_positive check (width is null or width > 0),
  constraint media_assets_height_positive check (height is null or height > 0),
  constraint media_assets_file_size_non_negative check (
    file_size_bytes is null or file_size_bytes >= 0
  ),
  constraint media_assets_source_type_allowed check (
    source_type in (
      'community_original',
      'kkn_documentation',
      'resident_submission',
      'wikimedia_commons',
      'government_open_data',
      'external_licensed',
      'public_domain',
      'commissioned'
    )
  ),
  constraint media_assets_rights_status_allowed check (
    rights_status in ('pending', 'approved', 'rejected', 'needs_clarification')
  ),
  constraint media_assets_privacy_status_allowed check (
    privacy_status in ('not_required', 'pending', 'approved', 'rejected')
  ),
  constraint media_assets_published_requires_public_path check (
    content_status <> 'published'::public.content_status
    or (
      public_bucket = 'media-public'
      and btrim(coalesce(public_path, '')) <> ''
    )
  ),
  constraint media_assets_published_requires_approved_rights check (
    content_status <> 'published'::public.content_status
    or rights_status = 'approved'
  ),
  constraint media_assets_published_requires_privacy_clearance check (
    content_status <> 'published'::public.content_status
    or privacy_status in ('approved', 'not_required')
  ),
  constraint media_assets_external_requires_license check (
    source_type <> 'external_licensed'
    or (
      btrim(coalesce(license_code, '')) <> ''
      and btrim(coalesce(license_url, '')) <> ''
      and btrim(coalesce(source_page_url, '')) <> ''
    )
  ),
  constraint media_assets_wikimedia_requires_license check (
    source_type <> 'wikimedia_commons'
    or (
      btrim(coalesce(license_code, '')) <> ''
      and btrim(coalesce(license_url, '')) <> ''
      and btrim(coalesce(source_page_url, '')) <> ''
      and btrim(coalesce(source_file_url, '')) <> ''
    )
  ),
  constraint media_assets_cc_by_requires_creator_or_attribution check (
    license_code is null
    or license_code not in ('CC BY 4.0', 'CC BY-SA 4.0')
    or btrim(coalesce(creator_name, attribution_text, '')) <> ''
  )
);

comment on table public.media_assets is
  'Global metadata registry for website media, including rights review, privacy review, source, license, and storage paths.';

create trigger set_media_assets_updated_at
  before update on public.media_assets
  for each row
  execute function public.set_updated_at();

create index media_assets_asset_code_idx on public.media_assets (asset_code);
create index media_assets_checksum_sha256_idx on public.media_assets (checksum_sha256);
create index media_assets_content_status_idx on public.media_assets (content_status);
create index media_assets_rights_status_idx on public.media_assets (rights_status);
create index media_assets_privacy_status_idx on public.media_assets (privacy_status);
create index media_assets_source_type_idx on public.media_assets (source_type);
create index media_assets_image_type_idx on public.media_assets (image_type);
create index media_assets_created_at_idx on public.media_assets (created_at);

create table public.plant_media (
  plant_id uuid not null references public.plants (id) on delete cascade,
  media_id uuid not null references public.media_assets (id) on delete restrict,
  role text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (plant_id, media_id),
  constraint plant_media_role_not_blank check (btrim(role) <> ''),
  constraint plant_media_sort_order_non_negative check (sort_order >= 0)
);

create unique index plant_media_one_primary_idx
  on public.plant_media (plant_id)
  where is_primary;

create index plant_media_media_id_idx on public.plant_media (media_id);
create index plant_media_role_idx on public.plant_media (role);

create table public.health_zone_media (
  health_zone_id uuid not null references public.health_zones (id) on delete cascade,
  media_id uuid not null references public.media_assets (id) on delete restrict,
  role text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (health_zone_id, media_id),
  constraint health_zone_media_role_not_blank check (btrim(role) <> ''),
  constraint health_zone_media_sort_order_non_negative check (sort_order >= 0)
);

create unique index health_zone_media_one_primary_idx
  on public.health_zone_media (health_zone_id)
  where is_primary;

create index health_zone_media_media_id_idx on public.health_zone_media (media_id);
create index health_zone_media_role_idx on public.health_zone_media (role);

create table public.content_media_slots (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_key text not null,
  media_id uuid not null references public.media_assets (id) on delete restrict,
  role text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  label_as_illustration boolean not null default false,
  created_at timestamptz not null default now(),
  constraint content_media_slots_type_allowed check (
    content_type in ('recipe', 'product', 'activity', 'program', 'team', 'site', 'map')
  ),
  constraint content_media_slots_key_not_blank check (btrim(content_key) <> ''),
  constraint content_media_slots_role_not_blank check (btrim(role) <> ''),
  constraint content_media_slots_sort_order_non_negative check (sort_order >= 0),
  unique (content_type, content_key, media_id)
);

create unique index content_media_slots_one_primary_idx
  on public.content_media_slots (content_type, content_key)
  where is_primary;

create index content_media_slots_media_id_idx on public.content_media_slots (media_id);
create index content_media_slots_lookup_idx
  on public.content_media_slots (content_type, content_key, role, sort_order);

create function public.enforce_media_assets_staff_workflow()
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

create trigger enforce_media_assets_staff_workflow
  before insert or update on public.media_assets
  for each row
  execute function public.enforce_media_assets_staff_workflow();

create function public.prevent_attached_media_asset_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.plant_media where media_id = old.id)
    or exists (select 1 from public.health_zone_media where media_id = old.id)
    or exists (select 1 from public.content_media_slots where media_id = old.id) then
    raise exception 'Media masih terhubung ke konten'
      using errcode = '23503';
  end if;

  return old;
end;
$$;

create trigger prevent_attached_media_asset_delete
  before delete on public.media_assets
  for each row
  execute function public.prevent_attached_media_asset_delete();

alter table public.media_assets enable row level security;
alter table public.plant_media enable row level security;
alter table public.health_zone_media enable row level security;
alter table public.content_media_slots enable row level security;

grant select on public.media_assets to anon, authenticated;
grant insert, update, delete on public.media_assets to authenticated;
grant select, insert, update, delete on public.media_assets to service_role;

grant select on public.plant_media to anon, authenticated;
grant insert, update, delete on public.plant_media to authenticated;
grant select, insert, update, delete on public.plant_media to service_role;

grant select on public.health_zone_media to anon, authenticated;
grant insert, update, delete on public.health_zone_media to authenticated;
grant select, insert, update, delete on public.health_zone_media to service_role;

grant select on public.content_media_slots to anon, authenticated;
grant insert, update, delete on public.content_media_slots to authenticated;
grant select, insert, update, delete on public.content_media_slots to service_role;

create policy "media_assets_select_public"
  on public.media_assets
  for select
  to anon, authenticated
  using (
    content_status = 'published'::public.content_status
    and rights_status = 'approved'
    and privacy_status in ('approved', 'not_required')
    and public_path is not null
  );

create policy "media_assets_select_staff"
  on public.media_assets
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "media_assets_insert_editor_admin"
  on public.media_assets
  for insert
  to authenticated
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );

create policy "media_assets_update_editor_admin"
  on public.media_assets
  for update
  to authenticated
  using (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  )
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );

create policy "media_assets_delete_admin"
  on public.media_assets
  for delete
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "plant_media_select_public"
  on public.plant_media
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.plants p
      join public.media_assets m on m.id = plant_media.media_id
      where p.id = plant_media.plant_id
        and p.content_status = 'published'::public.content_status
        and m.content_status = 'published'::public.content_status
        and m.rights_status = 'approved'
        and m.privacy_status in ('approved', 'not_required')
        and m.public_path is not null
    )
  );

create policy "plant_media_select_staff"
  on public.plant_media
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "plant_media_mutate_editor_admin"
  on public.plant_media
  for all
  to authenticated
  using (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  )
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );

create policy "health_zone_media_select_public"
  on public.health_zone_media
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.health_zones z
      join public.media_assets m on m.id = health_zone_media.media_id
      where z.id = health_zone_media.health_zone_id
        and z.content_status = 'published'::public.content_status
        and m.content_status = 'published'::public.content_status
        and m.rights_status = 'approved'
        and m.privacy_status in ('approved', 'not_required')
        and m.public_path is not null
    )
  );

create policy "health_zone_media_select_staff"
  on public.health_zone_media
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "health_zone_media_mutate_editor_admin"
  on public.health_zone_media
  for all
  to authenticated
  using (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  )
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );

create policy "content_media_slots_select_public"
  on public.content_media_slots
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.media_assets m
      where m.id = content_media_slots.media_id
        and m.content_status = 'published'::public.content_status
        and m.rights_status = 'approved'
        and m.privacy_status in ('approved', 'not_required')
        and m.public_path is not null
    )
  );

create policy "content_media_slots_select_staff"
  on public.content_media_slots
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "content_media_slots_mutate_editor_admin"
  on public.content_media_slots
  for all
  to authenticated
  using (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  )
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );
