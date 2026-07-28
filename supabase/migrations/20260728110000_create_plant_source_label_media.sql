-- Kampung Herbal Berua: public poster plant label media.
-- Lets poster-only plant names have licensed illustration media without
-- requiring every poster label to become a published plant row.

create table public.plant_source_label_media (
  source_id uuid not null references public.plant_sources (id) on delete cascade,
  normalized_name text not null,
  raw_name text not null,
  slug text not null,
  media_id uuid not null references public.media_assets (id) on delete restrict,
  role text not null default 'cover',
  is_primary boolean not null default true,
  label_as_illustration boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (source_id, normalized_name, media_id),
  constraint plant_source_label_media_normalized_name_not_blank check (
    btrim(normalized_name) <> ''
  ),
  constraint plant_source_label_media_raw_name_not_blank check (
    btrim(raw_name) <> ''
  ),
  constraint plant_source_label_media_slug_not_blank check (btrim(slug) <> ''),
  constraint plant_source_label_media_role_not_blank check (btrim(role) <> '')
);

create unique index plant_source_label_media_source_slug_idx
  on public.plant_source_label_media (source_id, slug);

create unique index plant_source_label_media_one_primary_idx
  on public.plant_source_label_media (source_id, normalized_name)
  where is_primary;

create index plant_source_label_media_media_id_idx
  on public.plant_source_label_media (media_id);

alter table public.plant_source_label_media enable row level security;

grant select on public.plant_source_label_media to anon, authenticated;
grant insert, update, delete on public.plant_source_label_media to authenticated;
grant select, insert, update, delete on public.plant_source_label_media to service_role;

drop policy if exists "plant_media_select_public" on public.plant_media;

create policy "plant_media_select_public"
  on public.plant_media
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.media_assets m
      where m.id = plant_media.media_id
        and m.content_status = 'published'::public.content_status
        and m.rights_status = 'approved'
        and m.privacy_status in ('approved', 'not_required')
        and m.public_path is not null
    )
  );

create policy "plant_source_label_media_select_public"
  on public.plant_source_label_media
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.media_assets m
      where m.id = plant_source_label_media.media_id
        and m.content_status = 'published'::public.content_status
        and m.rights_status = 'approved'
        and m.privacy_status in ('approved', 'not_required')
        and m.public_path is not null
    )
  );

create policy "plant_source_label_media_select_staff"
  on public.plant_source_label_media
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "plant_source_label_media_mutate_editor_admin"
  on public.plant_source_label_media
  for all
  to authenticated
  using (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  )
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );
