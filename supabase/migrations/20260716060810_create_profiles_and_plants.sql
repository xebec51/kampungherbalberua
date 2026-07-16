-- Kampung Herbal Berua: profiles + plants foundation
-- Adds roles/profiles for authenticated users and the first content table
-- (plants) with Row Level Security. No data is touched by this migration
-- besides the schema objects it creates.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.app_role as enum ('viewer', 'editor', 'validator', 'admin');

create type public.content_status as enum (
  'draft',
  'pending_review',
  'published',
  'archived'
);

create type public.validation_status as enum (
  'data_demonstrasi',
  'pending',
  'verified',
  'rejected'
);

create type public.plant_category as enum (
  'rimpang',
  'daun',
  'bunga',
  'batang',
  'lainnya'
);

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on every row update.
-- No table lookups are needed, so search_path can stay empty.
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated user, created automatically on signup.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role public.app_role not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Application role and status for each authenticated user. Row is created by the on_auth_user_created trigger; role is never taken from user-supplied metadata.';

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- plants: TOGA plant catalog. Public visitors only ever see published rows.
-- ---------------------------------------------------------------------------

create table public.plants (
  id uuid primary key default gen_random_uuid(),
  plant_code text unique,
  slug text not null unique,
  local_name text not null,
  scientific_name text,
  other_names text[] not null default '{}',
  category public.plant_category not null,
  short_description text not null,
  description text not null,
  used_parts text[] not null default '{}',
  traditional_uses text[] not null default '{}',
  preparation text[] not null default '{}',
  care_instructions text[] not null default '{}',
  warnings text[] not null default '{}',
  image_path text,
  location_status text,
  source_notes text,
  validator_id uuid references public.profiles (id),
  validator_name text,
  validation_status public.validation_status not null default 'data_demonstrasi',
  content_status public.content_status not null default 'draft',
  featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plants_slug_not_blank check (btrim(slug) <> ''),
  constraint plants_local_name_not_blank check (btrim(local_name) <> '')
);

comment on table public.plants is
  'TOGA plant catalog. Only rows with content_status = published are visible to anonymous or unprivileged visitors.';

create trigger set_plants_updated_at
  before update on public.plants
  for each row
  execute function public.set_updated_at();

-- `slug` and `plant_code` are already indexed by their unique constraints
-- above, so only the remaining filter/sort columns need explicit indexes.
create index plants_content_status_idx on public.plants (content_status);
create index plants_validation_status_idx on public.plants (validation_status);
create index plants_category_idx on public.plants (category);
create index plants_featured_idx on public.plants (featured);
create index plants_published_at_idx on public.plants (published_at);

-- ---------------------------------------------------------------------------
-- New-user trigger: every new auth.users row gets a viewer profile.
-- Role always starts as 'viewer' and is never read from user metadata, so a
-- signup can never grant itself elevated access. Admin promotion is a
-- manual, deliberate step performed by a database operator (see
-- docs/supabase-setup.md).
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, is_active)
  values (new.id, 'viewer', true)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Role helper for RLS policies. Only ever resolves the caller's own role
-- from their own profile row; cannot be used to read or change anyone
-- else's role.
-- ---------------------------------------------------------------------------

create function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and is_active = true
  limit 1;
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.plants enable row level security;

-- Base table grants. Supabase does not auto-expose newly created tables, so
-- these are required in addition to the RLS policies below, which remain
-- the actual authorization boundary.
grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;
grant select on public.plants to anon, authenticated;
grant insert, update, delete on public.plants to authenticated;

-- profiles policies -----------------------------------------------------

-- 1. Authenticated users can read their own profile.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- 2. Active admins can read every profile.
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

-- 3. Active admins can update any profile (including role changes).
--    No update policy is granted to non-admins, so a regular user has no
--    path to change their own role or anyone else's.
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

-- 4. No insert policy: rows are created only by the on_auth_user_created
--    trigger, which runs as a security definer and bypasses RLS.
-- 5. No delete policy: profile deletion is not exposed through the public
--    API this sprint.
-- 6. Anonymous users match no policy above, so they cannot read profiles.

-- plants policies ---------------------------------------------------------

-- Public read: anyone (including anon) can read published plants.
create policy "plants_select_published"
  on public.plants
  for select
  to anon, authenticated
  using (content_status = 'published'::public.content_status);

-- Staff read: active editors, validators, and admins can read every plant,
-- including drafts. Validators get read access only this sprint; the
-- validation workflow itself arrives in a later dashboard sprint.
create policy "plants_select_staff"
  on public.plants
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

-- Insert: active editors and admins only.
create policy "plants_insert_staff"
  on public.plants
  for insert
  to authenticated
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );

-- Update: active editors and admins only. Validators intentionally have no
-- update policy so they cannot alter plant content directly.
create policy "plants_update_staff"
  on public.plants
  for update
  to authenticated
  using (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  )
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );

-- Delete: active admins only.
create policy "plants_delete_admin"
  on public.plants
  for delete
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);
