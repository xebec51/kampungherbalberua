-- Kampung Herbal Berua: HerbaCode plant-zone content.
-- Keeps zone-specific HerbaCode material separate from the canonical plant
-- catalog so repeated plants can have different benefits per zone.

create table if not exists public.herbacode_plant_zone_entries (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.plant_sources (id) on delete cascade,
  health_zone_id uuid not null references public.health_zones (id) on delete cascade,
  plant_id uuid not null references public.plants (id) on delete cascade,
  zone_code text not null,
  zone_slug text not null,
  zone_title text not null,
  entry_order integer not null,
  raw_zone_title text not null,
  raw_entry_title text not null,
  local_name text not null,
  scientific_name text,
  active_compounds text[] not null default '{}',
  benefits text[] not null default '{}',
  used_parts text[] not null default '{}',
  cultivation_techniques text[] not null default '{}',
  warnings text[] not null default '{}',
  preparation_methods text[] not null default '{}',
  source_document_name text not null,
  title_correction_notes text[] not null default '{}',
  content_status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint herbacode_entries_entry_order_positive check (entry_order > 0),
  constraint herbacode_entries_zone_code_format check (zone_code ~ '^khb-z[0-9]{2}$'),
  constraint herbacode_entries_zone_slug_format check (zone_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint herbacode_entries_zone_title_not_blank check (btrim(zone_title) <> ''),
  constraint herbacode_entries_raw_zone_title_not_blank check (btrim(raw_zone_title) <> ''),
  constraint herbacode_entries_raw_entry_title_not_blank check (btrim(raw_entry_title) <> ''),
  constraint herbacode_entries_local_name_not_blank check (btrim(local_name) <> ''),
  constraint herbacode_entries_source_document_name_not_blank check (btrim(source_document_name) <> '')
);

comment on table public.herbacode_plant_zone_entries is
  'HerbaCode source content for each plant-health-zone relationship. Repeated plants keep zone-specific benefits, warnings, compounds, and cultivation notes here.';

drop trigger if exists set_herbacode_plant_zone_entries_updated_at
  on public.herbacode_plant_zone_entries;
create trigger set_herbacode_plant_zone_entries_updated_at
  before update on public.herbacode_plant_zone_entries
  for each row
  execute function public.set_updated_at();

create unique index if not exists herbacode_entries_source_zone_plant_uidx
  on public.herbacode_plant_zone_entries (source_id, health_zone_id, plant_id);

create unique index if not exists herbacode_entries_source_zone_order_uidx
  on public.herbacode_plant_zone_entries (source_id, health_zone_id, entry_order);

create index if not exists herbacode_entries_source_id_idx
  on public.herbacode_plant_zone_entries (source_id);

create index if not exists herbacode_entries_health_zone_id_idx
  on public.herbacode_plant_zone_entries (health_zone_id);

create index if not exists herbacode_entries_plant_id_idx
  on public.herbacode_plant_zone_entries (plant_id);

create index if not exists herbacode_entries_zone_code_idx
  on public.herbacode_plant_zone_entries (zone_code);

create index if not exists herbacode_entries_content_status_idx
  on public.herbacode_plant_zone_entries (content_status);

alter table public.herbacode_plant_zone_entries enable row level security;

grant select on public.herbacode_plant_zone_entries to anon, authenticated;
grant insert, update, delete on public.herbacode_plant_zone_entries to authenticated;
grant select, insert, update, delete on public.herbacode_plant_zone_entries to service_role;

drop policy if exists "herbacode_entries_select_published"
  on public.herbacode_plant_zone_entries;
create policy "herbacode_entries_select_published"
  on public.herbacode_plant_zone_entries
  for select
  to anon, authenticated
  using (content_status = 'published'::public.content_status);

drop policy if exists "herbacode_entries_select_staff"
  on public.herbacode_plant_zone_entries;
create policy "herbacode_entries_select_staff"
  on public.herbacode_plant_zone_entries
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

drop policy if exists "herbacode_entries_mutate_admin"
  on public.herbacode_plant_zone_entries;
create policy "herbacode_entries_mutate_admin"
  on public.herbacode_plant_zone_entries
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);
