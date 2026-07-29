-- Kampung Herbal Berua: separate streets from health zones.
-- Health zone QR identity stays in health_zones.zone_code. Street names are
-- stored only when real street data exists.

alter table public.health_zones
  alter column street_name drop not null;

alter table public.health_zones
  drop constraint if exists health_zones_street_name_not_blank;

comment on column public.health_zones.street_name is
  'Deprecated display cache for older admin forms. Do not fill from zone names; use streets + health_zone_streets for real street data.';

create table if not exists public.streets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  street_name text unique not null,
  description text,
  source_notes text[] not null default '{}',
  validation_status public.validation_status not null default 'pending',
  content_status public.content_status not null default 'draft',
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint streets_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint streets_street_name_not_blank check (btrim(street_name) <> '')
);

comment on table public.streets is
  'Real street entities for Kampung Herbal Berua. Names must come from verified street data, not thematic health zone names.';

drop trigger if exists set_streets_updated_at on public.streets;
create trigger set_streets_updated_at
  before update on public.streets
  for each row
  execute function public.set_updated_at();

create table if not exists public.health_zone_streets (
  health_zone_id uuid not null references public.health_zones (id) on delete cascade,
  street_id uuid not null references public.streets (id) on delete cascade,
  sort_order integer not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  primary key (health_zone_id, street_id),
  constraint health_zone_streets_sort_order_positive check (sort_order > 0)
);

comment on table public.health_zone_streets is
  'Many-to-many relation between health zones and real street entities.';

create index if not exists health_zone_streets_zone_idx
  on public.health_zone_streets (health_zone_id);

create index if not exists health_zone_streets_street_idx
  on public.health_zone_streets (street_id);

alter table public.streets enable row level security;
alter table public.health_zone_streets enable row level security;

grant select on public.streets to anon, authenticated;
grant insert, update, delete on public.streets to authenticated;
grant select, insert, update, delete on public.streets to service_role;

grant select on public.health_zone_streets to anon, authenticated;
grant insert, update, delete on public.health_zone_streets to authenticated;
grant select, insert, update, delete on public.health_zone_streets to service_role;

drop policy if exists "streets_select_published" on public.streets;
create policy "streets_select_published"
  on public.streets
  for select
  to anon, authenticated
  using (content_status = 'published'::public.content_status);

drop policy if exists "streets_select_staff" on public.streets;
create policy "streets_select_staff"
  on public.streets
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

drop policy if exists "streets_insert_staff" on public.streets;
create policy "streets_insert_staff"
  on public.streets
  for insert
  to authenticated
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );

drop policy if exists "streets_update_staff" on public.streets;
create policy "streets_update_staff"
  on public.streets
  for update
  to authenticated
  using (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  )
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );

drop policy if exists "streets_delete_admin" on public.streets;
create policy "streets_delete_admin"
  on public.streets
  for delete
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

drop policy if exists "health_zone_streets_select_published" on public.health_zone_streets;
create policy "health_zone_streets_select_published"
  on public.health_zone_streets
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.health_zones hz
      join public.streets s on s.id = health_zone_streets.street_id
      where hz.id = health_zone_streets.health_zone_id
        and hz.content_status = 'published'::public.content_status
        and s.content_status = 'published'::public.content_status
    )
  );

drop policy if exists "health_zone_streets_select_staff" on public.health_zone_streets;
create policy "health_zone_streets_select_staff"
  on public.health_zone_streets
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

drop policy if exists "health_zone_streets_mutate_admin" on public.health_zone_streets;
create policy "health_zone_streets_mutate_admin"
  on public.health_zone_streets
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

update public.health_zones
set
  street_name = null,
  block_ranges = '{}',
  location_notes = null,
  image_path = null,
  updated_at = now()
where street_name in (
  'Jl. Digestia',
  'Jl. Respiria',
  'Jl. Glycemia',
  'Jl. Lipidia',
  'Jl. Imun',
  'Jl. Hepatia',
  'Jl. Feminia',
  'Jl. Vaskulia',
  'Jl. Pediatria'
)
or street_name = zone_name
or street_name = health_topic;

alter table public.herbacode_plant_zone_entries
  add column if not exists validation_status public.validation_status not null default 'pending',
  add column if not exists validator_id uuid references public.profiles (id),
  add column if not exists validator_name text,
  add column if not exists validated_at timestamptz;

create index if not exists herbacode_entries_validation_status_idx
  on public.herbacode_plant_zone_entries (validation_status);

create table if not exists public.herbacode_entry_history (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.herbacode_plant_zone_entries (id) on delete cascade,
  action text not null,
  change_summary jsonb not null default '{}'::jsonb,
  changed_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint herbacode_entry_history_action_not_blank check (btrim(action) <> '')
);

comment on table public.herbacode_entry_history is
  'Audit history for admin HerbaCode edits, publication, validation, and archive actions.';

create index if not exists herbacode_entry_history_entry_idx
  on public.herbacode_entry_history (entry_id, created_at desc);

alter table public.herbacode_entry_history enable row level security;

grant select on public.herbacode_entry_history to authenticated;
grant insert on public.herbacode_entry_history to authenticated;
grant select, insert on public.herbacode_entry_history to service_role;

drop policy if exists "herbacode_entry_history_select_staff" on public.herbacode_entry_history;
create policy "herbacode_entry_history_select_staff"
  on public.herbacode_entry_history
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

drop policy if exists "herbacode_entry_history_insert_admin" on public.herbacode_entry_history;
create policy "herbacode_entry_history_insert_admin"
  on public.herbacode_entry_history
  for insert
  to authenticated
  with check (public.current_user_role() = 'admin'::public.app_role);
