-- Kampung Herbal Berua: plant poster source foundation.
-- Keeps poster transcription/mapping data separate from the canonical plant catalog.

alter table public.plants
  add column if not exists canonical_local_name text,
  add column if not exists scientific_authority text,
  add column if not exists family text,
  add column if not exists taxonomy_source text,
  add column if not exists taxonomy_external_id text,
  add column if not exists identification_status text not null default 'unresolved';

alter table public.plants
  add constraint plants_identification_status_allowed check (
    identification_status in ('unresolved', 'candidate', 'confirmed', 'disputed')
  );

create index plants_identification_status_idx on public.plants (identification_status);
create index plants_canonical_local_name_idx on public.plants (canonical_local_name);
create index plants_scientific_name_idx on public.plants (scientific_name);

create table public.plant_sources (
  id uuid primary key default gen_random_uuid(),
  source_code text unique not null,
  title text not null,
  source_type text not null,
  description text,
  file_reference text,
  claimed_total integer,
  observed_entry_total integer,
  numbering_notes text,
  content_status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plant_sources_source_code_not_blank check (btrim(source_code) <> ''),
  constraint plant_sources_title_not_blank check (btrim(title) <> ''),
  constraint plant_sources_source_type_not_blank check (btrim(source_type) <> ''),
  constraint plant_sources_claimed_total_positive check (
    claimed_total is null or claimed_total > 0
  ),
  constraint plant_sources_observed_entry_total_positive check (
    observed_entry_total is null or observed_entry_total >= 0
  )
);

create trigger set_plant_sources_updated_at
  before update on public.plant_sources
  for each row
  execute function public.set_updated_at();

create index plant_sources_content_status_idx on public.plant_sources (content_status);

create table public.plant_collections (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.plant_sources (id) on delete cascade,
  collection_number integer not null,
  source_title text not null,
  public_title text not null,
  slug text not null,
  display_order integer not null,
  description text,
  validation_status public.validation_status not null default 'data_demonstrasi',
  content_status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plant_collections_collection_number_positive check (collection_number > 0),
  constraint plant_collections_source_title_not_blank check (btrim(source_title) <> ''),
  constraint plant_collections_public_title_not_blank check (btrim(public_title) <> ''),
  constraint plant_collections_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint plant_collections_display_order_positive check (display_order > 0),
  unique (source_id, collection_number),
  unique (source_id, slug)
);

create trigger set_plant_collections_updated_at
  before update on public.plant_collections
  for each row
  execute function public.set_updated_at();

create index plant_collections_source_id_idx on public.plant_collections (source_id);
create index plant_collections_content_status_idx on public.plant_collections (content_status);
create index plant_collections_validation_status_idx on public.plant_collections (validation_status);

create table public.plant_source_entries (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.plant_sources (id) on delete cascade,
  collection_id uuid not null references public.plant_collections (id) on delete cascade,
  poster_number integer not null,
  raw_plant_name text not null,
  normalized_candidate_name text,
  plant_id uuid references public.plants (id) on delete set null,
  transcription_status text not null default 'transcribed',
  mapping_status text not null default 'unresolved',
  transcription_notes text,
  display_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plant_source_entries_poster_number_allowed check (
    (poster_number between 1 and 156) or (poster_number between 167 and 216)
  ),
  constraint plant_source_entries_raw_name_not_blank check (btrim(raw_plant_name) <> ''),
  constraint plant_source_entries_transcription_status_allowed check (
    transcription_status in ('pending', 'transcribed', 'needs_review', 'rejected')
  ),
  constraint plant_source_entries_mapping_status_allowed check (
    mapping_status in ('unresolved', 'candidate', 'matched', 'created_draft', 'rejected')
  ),
  constraint plant_source_entries_display_order_positive check (display_order > 0),
  unique (source_id, poster_number)
);

create trigger set_plant_source_entries_updated_at
  before update on public.plant_source_entries
  for each row
  execute function public.set_updated_at();

create index plant_source_entries_source_id_idx on public.plant_source_entries (source_id);
create index plant_source_entries_collection_id_idx on public.plant_source_entries (collection_id);
create index plant_source_entries_plant_id_idx on public.plant_source_entries (plant_id);
create index plant_source_entries_raw_plant_name_idx on public.plant_source_entries (raw_plant_name);
create index plant_source_entries_mapping_status_idx on public.plant_source_entries (mapping_status);

create table public.plant_names (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid references public.plants (id) on delete cascade,
  name text not null,
  normalized_name text not null,
  name_type text not null,
  language_code text,
  source_id uuid references public.plant_sources (id) on delete set null,
  is_preferred boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plant_names_name_not_blank check (btrim(name) <> ''),
  constraint plant_names_normalized_name_not_blank check (btrim(normalized_name) <> ''),
  constraint plant_names_name_type_allowed check (
    name_type in (
      'preferred_local',
      'alternate_local',
      'scientific',
      'poster_raw',
      'poster_misspelling',
      'trade_name',
      'unresolved_common_name'
    )
  )
);

create trigger set_plant_names_updated_at
  before update on public.plant_names
  for each row
  execute function public.set_updated_at();

create index plant_names_plant_id_idx on public.plant_names (plant_id);
create index plant_names_normalized_name_idx on public.plant_names (normalized_name);
create index plant_names_name_type_idx on public.plant_names (name_type);
create index plant_names_source_id_idx on public.plant_names (source_id);

create unique index plant_names_one_preferred_per_plant_type_idx
  on public.plant_names (plant_id, name_type)
  where is_preferred and plant_id is not null;

alter table public.plant_sources enable row level security;
alter table public.plant_collections enable row level security;
alter table public.plant_source_entries enable row level security;
alter table public.plant_names enable row level security;

grant select on public.plant_sources to anon, authenticated;
grant insert, update, delete on public.plant_sources to authenticated;
grant select, insert, update, delete on public.plant_sources to service_role;

grant select on public.plant_collections to anon, authenticated;
grant insert, update, delete on public.plant_collections to authenticated;
grant select, insert, update, delete on public.plant_collections to service_role;

grant select on public.plant_source_entries to authenticated;
grant insert, update, delete on public.plant_source_entries to authenticated;
grant select, insert, update, delete on public.plant_source_entries to service_role;

grant select on public.plant_names to anon, authenticated;
grant insert, update, delete on public.plant_names to authenticated;
grant select, insert, update, delete on public.plant_names to service_role;

create policy "plant_sources_select_public"
  on public.plant_sources
  for select
  to anon, authenticated
  using (content_status = 'published'::public.content_status);

create policy "plant_sources_select_staff"
  on public.plant_sources
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "plant_sources_mutate_admin"
  on public.plant_sources
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "plant_collections_select_public"
  on public.plant_collections
  for select
  to anon, authenticated
  using (content_status = 'published'::public.content_status);

create policy "plant_collections_select_staff"
  on public.plant_collections
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "plant_collections_mutate_admin"
  on public.plant_collections
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "plant_source_entries_select_staff"
  on public.plant_source_entries
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "plant_source_entries_mutate_admin"
  on public.plant_source_entries
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create policy "plant_names_select_public"
  on public.plant_names
  for select
  to anon, authenticated
  using (
    plant_id is not null
    and exists (
      select 1
      from public.plants p
      where p.id = plant_names.plant_id
        and p.content_status = 'published'::public.content_status
    )
  );

create policy "plant_names_select_staff"
  on public.plant_names
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "plant_names_mutate_admin"
  on public.plant_names
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);
