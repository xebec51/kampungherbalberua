-- Kampung Herbal Berua: thematic street plant catalogs.
-- Street plant entries are mapped from verified street board themes to existing
-- Kampung Herbal plant catalog collections, not from HerbaCode health-zone
-- relations or poster number/code ranges.

create table if not exists public.street_plant_entries (
  id uuid primary key default gen_random_uuid(),
  street_id uuid not null references public.streets (id) on delete cascade,
  plant_id uuid references public.plants (id) on delete set null,
  raw_plant_name text not null,
  normalized_name text not null,
  sort_order integer not null,
  match_status text not null default 'unresolved',
  source_media_id uuid references public.media_assets (id) on delete set null,
  source_photo_path text,
  notes text,
  content_status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint street_plant_entries_raw_name_not_blank check (btrim(raw_plant_name) <> ''),
  constraint street_plant_entries_normalized_name_not_blank check (btrim(normalized_name) <> ''),
  constraint street_plant_entries_sort_order_positive check (sort_order > 0),
  constraint street_plant_entries_match_status_allowed check (
    match_status in (
      'exact',
      'alias',
      'scientific',
      'manual',
      'ambiguous',
      'unresolved'
    )
  )
);

comment on table public.street_plant_entries is
  'Plant names mapped from street-board health themes to existing Kampung Herbal catalog collections. Do not populate this table from health-zone relations.';

drop trigger if exists set_street_plant_entries_updated_at on public.street_plant_entries;
create trigger set_street_plant_entries_updated_at
  before update on public.street_plant_entries
  for each row
  execute function public.set_updated_at();

create unique index if not exists street_plant_entries_street_sort_idx
  on public.street_plant_entries (street_id, sort_order);

create index if not exists street_plant_entries_street_idx
  on public.street_plant_entries (street_id);

create index if not exists street_plant_entries_plant_idx
  on public.street_plant_entries (plant_id);

create index if not exists street_plant_entries_match_status_idx
  on public.street_plant_entries (match_status);

create table if not exists public.street_media (
  street_id uuid not null references public.streets (id) on delete cascade,
  media_id uuid not null references public.media_assets (id) on delete restrict,
  role text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (street_id, media_id),
  constraint street_media_role_not_blank check (btrim(role) <> ''),
  constraint street_media_sort_order_non_negative check (sort_order >= 0)
);

comment on table public.street_media is
  'Media attachments for real street entities, including documentation photos of thematic street boards.';

create unique index if not exists street_media_one_primary_idx
  on public.street_media (street_id)
  where is_primary;

create index if not exists street_media_media_id_idx
  on public.street_media (media_id);

alter table public.street_plant_entries enable row level security;
alter table public.street_media enable row level security;

grant select on public.street_plant_entries to anon, authenticated;
grant insert, update, delete on public.street_plant_entries to authenticated;
grant select, insert, update, delete on public.street_plant_entries to service_role;

grant select on public.street_media to anon, authenticated;
grant insert, update, delete on public.street_media to authenticated;
grant select, insert, update, delete on public.street_media to service_role;

drop policy if exists "street_plant_entries_select_public" on public.street_plant_entries;
create policy "street_plant_entries_select_public"
  on public.street_plant_entries
  for select
  to anon, authenticated
  using (
    content_status = 'published'::public.content_status
    and exists (
      select 1
      from public.streets s
      where s.id = street_plant_entries.street_id
        and s.content_status = 'published'::public.content_status
    )
  );

drop policy if exists "street_plant_entries_select_staff" on public.street_plant_entries;
create policy "street_plant_entries_select_staff"
  on public.street_plant_entries
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

drop policy if exists "street_plant_entries_mutate_admin" on public.street_plant_entries;
create policy "street_plant_entries_mutate_admin"
  on public.street_plant_entries
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

drop policy if exists "street_media_select_public" on public.street_media;
create policy "street_media_select_public"
  on public.street_media
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.streets s
      join public.media_assets m on m.id = street_media.media_id
      where s.id = street_media.street_id
        and s.content_status = 'published'::public.content_status
        and m.content_status = 'published'::public.content_status
        and m.rights_status = 'approved'
        and m.privacy_status in ('approved', 'not_required')
        and m.public_path is not null
    )
  );

drop policy if exists "street_media_select_staff" on public.street_media;
create policy "street_media_select_staff"
  on public.street_media
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

drop policy if exists "street_media_mutate_admin" on public.street_media;
create policy "street_media_mutate_admin"
  on public.street_media
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create or replace function public.prevent_attached_media_asset_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.plant_media where media_id = old.id)
    or exists (select 1 from public.health_zone_media where media_id = old.id)
    or exists (select 1 from public.street_media where media_id = old.id)
    or exists (select 1 from public.content_media_slots where media_id = old.id) then
    raise exception 'Media masih terhubung ke konten'
      using errcode = '23503';
  end if;

  return old;
end;
$$;

update public.health_zones
set image_path = null,
    updated_at = now()
where image_path in (
  '/images/zones/digestia.jpg',
  '/images/zones/respiria.jpg',
  '/images/zones/glycemia.jpg',
  '/images/zones/lipidia.jpg',
  '/images/zones/imun.jpg',
  '/images/zones/hepatia.jpg',
  '/images/zones/feminia.jpg',
  '/images/zones/vaskulia.jpg',
  '/images/zones/pediatria.jpg'
);

with street_photo_assets(
  slug,
  asset_code,
  title,
  alt_text,
  caption,
  public_path,
  checksum_sha256,
  file_size_bytes,
  width,
  height
) as (
  values
    ('digestia', 'street-board-digestia', 'Papan tanaman di Jl. Digestia', 'Papan tanaman di Jl. Digestia', 'Dokumentasi papan jalan tematik Jl. Digestia.', 'streets/digestia.jpg', '3d45777dc8acb98313fee24def9a961e70b492eb2a6d3468afa1136c0be89f1a', 166183, 1200, 900),
    ('respiria', 'street-board-respiria', 'Papan tanaman di Jl. Respiria', 'Papan tanaman di Jl. Respiria', 'Dokumentasi papan jalan tematik Jl. Respiria.', 'streets/respiria.jpg', '669be490e2b2780e39d48c1f6796f693063cf94c44507ecef2611cc275bad745', 116941, 1200, 900),
    ('glycemia', 'street-board-glycemia', 'Papan tanaman di Jl. Glycemia', 'Papan tanaman di Jl. Glycemia', 'Dokumentasi papan jalan tematik Jl. Glycemia.', 'streets/glycemia.jpg', 'e4a57a2ad79ee7ebab8b892d8288ab088c4b80edfb4338f544e9bdbef8b8643b', 54825, 1200, 900),
    ('lipidia', 'street-board-lipidia', 'Papan tanaman di Jl. Lipidia', 'Papan tanaman di Jl. Lipidia', 'Dokumentasi papan jalan tematik Jl. Lipidia.', 'streets/lipidia.jpg', 'f20441988093cfc7e061e26d86ea9319f26be3ee4f4a883d09ff9ba265c39c86', 98991, 1200, 900),
    ('imun', 'street-board-imun', 'Papan tanaman di Jl. Imun', 'Papan tanaman di Jl. Imun', 'Dokumentasi papan jalan tematik Jl. Imun.', 'streets/imun.jpg', 'e4e85ed6abcce6590bffeef8bf384456338780b502b71871aed1bf1758cc0bfc', 120976, 1200, 900),
    ('hepatia', 'street-board-hepatia', 'Papan tanaman di Jl. Hepatia', 'Papan tanaman di Jl. Hepatia', 'Dokumentasi papan jalan tematik Jl. Hepatia.', 'streets/hepatia.jpg', 'f682ad7cc835223e6186c1c3955671ccbdd831fdfde36a38827d5efc08dd8844', 104860, 1200, 900),
    ('feminia', 'street-board-feminia', 'Papan tanaman di Jl. Feminia', 'Papan tanaman di Jl. Feminia', 'Dokumentasi papan jalan tematik Jl. Feminia.', 'streets/feminia.jpg', 'a3e0622ac3bbfd320bcfaef9e55b4f86ddda92164864285b13abc7131e131cd9', 152586, 1200, 900),
    ('vaskulia', 'street-board-vaskulia', 'Papan tanaman di Jl. Vaskulia', 'Papan tanaman di Jl. Vaskulia', 'Dokumentasi papan jalan tematik Jl. Vaskulia.', 'streets/vaskulia.jpg', '74794160945269ccf53bad27f037dfb611ce3140f6dd3daa15111fded9ca620d', 166650, 1200, 900),
    ('pediatria', 'street-board-pediatria', 'Papan tanaman di Jl. Pediatria', 'Papan tanaman di Jl. Pediatria', 'Dokumentasi papan jalan tematik Jl. Pediatria.', 'streets/pediatria.jpg', '8a1c3f06c81d3da271d23f9e76ce3b12320e05f50a58cb271974a69169925c2e', 124420, 1200, 900)
)
insert into public.media_assets (
  asset_code,
  title,
  alt_text,
  caption,
  media_kind,
  image_type,
  public_bucket,
  public_path,
  mime_type,
  width,
  height,
  file_size_bytes,
  checksum_sha256,
  source_type,
  source_file_url,
  creator_name,
  license_code,
  attribution_text,
  changes_made,
  accessed_at,
  rights_status,
  privacy_status,
  content_status
)
select
  asset_code,
  title,
  alt_text,
  caption,
  'image',
  'documentation',
  'media-public',
  public_path,
  'image/jpeg',
  width,
  height,
  file_size_bytes,
  checksum_sha256,
  'kkn_documentation',
  '/images/' || public_path,
  'KKN Kampung Herbal Berua',
  'Dokumentasi KKN',
  'Dokumentasi KKN Kampung Herbal Berua, 2026.',
  'Metadata EXIF/GPS dihapus; JPEG dioptimalkan tanpa mengubah keterbacaan papan.',
  current_date,
  'approved',
  'approved',
  'published'
from street_photo_assets
on conflict (asset_code) do update set
  title = excluded.title,
  alt_text = excluded.alt_text,
  caption = excluded.caption,
  image_type = excluded.image_type,
  public_bucket = excluded.public_bucket,
  public_path = excluded.public_path,
  mime_type = excluded.mime_type,
  width = excluded.width,
  height = excluded.height,
  file_size_bytes = excluded.file_size_bytes,
  checksum_sha256 = excluded.checksum_sha256,
  source_type = excluded.source_type,
  source_file_url = excluded.source_file_url,
  creator_name = excluded.creator_name,
  license_code = excluded.license_code,
  attribution_text = excluded.attribution_text,
  changes_made = excluded.changes_made,
  accessed_at = excluded.accessed_at,
  rights_status = excluded.rights_status,
  privacy_status = excluded.privacy_status,
  content_status = excluded.content_status,
  updated_at = now();

with street_photo_assets(slug, asset_code) as (
  values
    ('digestia', 'street-board-digestia'),
    ('respiria', 'street-board-respiria'),
    ('glycemia', 'street-board-glycemia'),
    ('lipidia', 'street-board-lipidia'),
    ('imun', 'street-board-imun'),
    ('hepatia', 'street-board-hepatia'),
    ('feminia', 'street-board-feminia'),
    ('vaskulia', 'street-board-vaskulia'),
    ('pediatria', 'street-board-pediatria')
)
insert into public.street_media (
  street_id,
  media_id,
  role,
  sort_order,
  is_primary
)
select
  s.id,
  m.id,
  'board',
  0,
  true
from street_photo_assets
join public.streets s on s.slug = street_photo_assets.slug
join public.media_assets m on m.asset_code = street_photo_assets.asset_code
on conflict (street_id, media_id) do update set
  role = excluded.role,
  sort_order = excluded.sort_order,
  is_primary = excluded.is_primary;

with street_theme_collections(
  street_slug,
  collection_title,
  match_status,
  notes
) as (
  values
    ('digestia', 'Zona Pencernaan Sehat', 'exact', 'Tema papan cocok dengan koleksi poster.'),
    ('respiria', 'Zona Pernapasan Lega', 'manual', 'Papan menulis Zona Pernapasan Sehat; katalog poster memakai Zona Pernapasan Lega.'),
    ('glycemia', 'Zona Gula Darah Terkendali', 'exact', 'Tema papan cocok dengan koleksi poster.'),
    ('lipidia', 'Zona Obesitas & Metabolik', 'manual', 'Papan menulis Zona Lemak Sehat; katalog poster paling dekat adalah Zona Obesitas & Metabolik.'),
    ('imun', 'Zona Imunitas Kuat', 'manual', 'Papan menulis Zona Daya Tahan Tubuh; katalog poster memakai Zona Imunitas Kuat.'),
    ('hepatia', 'Zona Hati Sehat', 'exact', 'Tema papan cocok dengan koleksi poster.'),
    ('feminia', 'Zona Kesehatan Perempuan', 'manual', 'Papan menulis Zona Wanita Sehat Alami; katalog poster memakai Zona Kesehatan Perempuan.'),
    ('vaskulia', 'Zona Jantung Sehat', 'manual', 'Papan menulis Zona Jantung & Pembuluh Darah Sehat; katalog poster memakai Zona Jantung Sehat.'),
    ('pediatria', 'Zona Anak Ceria', 'exact', 'Tema papan cocok dengan koleksi poster.')
),
poster_source as (
  select id
  from public.plant_sources
  where source_code = 'KHB-POSTER-216-2026'
),
street_photo_assets(slug, asset_code) as (
  values
    ('digestia', 'street-board-digestia'),
    ('respiria', 'street-board-respiria'),
    ('glycemia', 'street-board-glycemia'),
    ('lipidia', 'street-board-lipidia'),
    ('imun', 'street-board-imun'),
    ('hepatia', 'street-board-hepatia'),
    ('feminia', 'street-board-feminia'),
    ('vaskulia', 'street-board-vaskulia'),
    ('pediatria', 'street-board-pediatria')
),
street_entries as (
  select
    s.id as street_id,
    pse.plant_id,
    pse.raw_plant_name,
    coalesce(
      pse.normalized_candidate_name,
      lower(regexp_replace(btrim(pse.raw_plant_name), '[[:space:]]+', ' ', 'g'))
    ) as normalized_name,
    row_number() over (
      partition by s.slug
      order by pse.raw_plant_name
    ) as sort_order,
    case
      when pse.plant_id is null then 'unresolved'
      else stc.match_status
    end as match_status,
    m.id as source_media_id,
    '/images/streets/' || s.slug || '.jpg' as source_photo_path,
    stc.notes || ' Data ini berasal dari katalog poster dan tidak diambil dari relasi tanaman-zona HerbaCode.' as notes
  from street_theme_collections stc
  join public.streets s on s.slug = stc.street_slug
  join poster_source ps on true
  join public.plant_collections pc
    on pc.source_id = ps.id
   and pc.public_title = stc.collection_title
  join public.plant_source_entries pse
    on pse.collection_id = pc.id
  left join street_photo_assets spa on spa.slug = s.slug
  left join public.media_assets m on m.asset_code = spa.asset_code
)
insert into public.street_plant_entries (
  street_id,
  plant_id,
  raw_plant_name,
  normalized_name,
  sort_order,
  match_status,
  source_media_id,
  source_photo_path,
  notes,
  content_status
)
select
  street_id,
  plant_id,
  raw_plant_name,
  normalized_name,
  sort_order,
  match_status,
  source_media_id,
  source_photo_path,
  notes,
  'published'
from street_entries
on conflict (street_id, sort_order) do update set
  plant_id = excluded.plant_id,
  raw_plant_name = excluded.raw_plant_name,
  normalized_name = excluded.normalized_name,
  match_status = excluded.match_status,
  source_media_id = excluded.source_media_id,
  source_photo_path = excluded.source_photo_path,
  notes = excluded.notes,
  content_status = excluded.content_status,
  updated_at = now();
