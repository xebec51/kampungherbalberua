-- Repair thematic street plant mappings after the initial street catalog import.
-- The previous import relied on plant_source_entries.plant_id, but some poster
-- source rows were intentionally unresolved. This migration links street entries
-- deterministically by canonical plant name/alias and creates minimal canonical
-- catalog rows only for poster plants that do not already exist.

with missing_plants(slug, local_name) as (
  values
    ('beluntas', 'Beluntas'),
    ('brotowali', 'Brotowali'),
    ('delima', 'Delima'),
    ('eucalyptus', 'Eucalyptus'),
    ('garcinia', 'Garcinia'),
    ('kayu-putih', 'Kayu Putih'),
    ('kopi-hijau', 'Kopi Hijau'),
    ('mahkota-dewa', 'Mahkota Dewa'),
    ('mengkudu', 'Mengkudu'),
    ('pare', 'Pare'),
    ('saga', 'Saga')
)
insert into public.plants (
  slug,
  local_name,
  canonical_local_name,
  category,
  short_description,
  description,
  validation_status,
  content_status,
  source_notes
)
select
  slug,
  local_name,
  local_name,
  'lainnya',
  'Tercatat dalam katalog tanaman Kampung Herbal Harmony.',
  'Nama tanaman ini tercatat dalam katalog edukasi Kampung Herbal Harmony. Detail HerbaCode belum tersedia untuk tanaman ini.',
  'pending',
  'published',
  'Ditambahkan untuk menautkan daftar tanaman jalan tematik dari katalog poster Kampung Herbal Harmony.'
from missing_plants
on conflict (slug) do nothing;

with canonical_names(slug, normalized_name) as (
  values
    ('cincau-hijau', 'cincau'),
    ('daun-salam', 'salam')
),
plant_name_rows as (
  select p.id as plant_id, cn.normalized_name
  from canonical_names cn
  join public.plants p on p.slug = cn.slug
  union
  select
    p.id,
    lower(regexp_replace(btrim(coalesce(p.canonical_local_name, p.local_name)), '[[:space:]]+', ' ', 'g'))
  from public.plants p
)
insert into public.plant_names (
  plant_id,
  name,
  normalized_name,
  name_type,
  language_code,
  notes
)
select
  plant_id,
  initcap(normalized_name),
  normalized_name,
  'alternate_local',
  'id',
  'Ditambahkan untuk repair mapping tanaman jalan tematik.'
from plant_name_rows
where not exists (
  select 1
  from public.plant_names existing
  where existing.normalized_name = plant_name_rows.normalized_name
);

with poster_source as (
  select id
  from public.plant_sources
  where source_code = 'KHB-POSTER-216-2026'
),
resolved_names as (
  select distinct on (pn.normalized_name)
    pn.normalized_name,
    pn.plant_id,
    case
      when pn.normalized_name in ('cincau', 'salam') then 'alias'
      else 'exact'
    end as match_status
  from public.plant_names pn
  join public.plants p on p.id = pn.plant_id
  where pn.normalized_name in (
    select distinct pse.normalized_candidate_name
    from public.plant_source_entries pse
    join poster_source ps on ps.id = pse.source_id
    where pse.normalized_candidate_name is not null
  )
  order by pn.normalized_name, p.created_at, p.slug
)
update public.plant_source_entries pse
set plant_id = rn.plant_id
from poster_source ps
cross join resolved_names rn
where pse.source_id = ps.id
  and rn.normalized_name = pse.normalized_candidate_name
  and pse.plant_id is null;

with resolved_names as (
  select distinct on (pn.normalized_name)
    pn.normalized_name,
    pn.plant_id,
    case
      when pn.normalized_name in ('cincau', 'salam') then 'alias'
      else 'exact'
    end as match_status
  from public.plant_names pn
  join public.plants p on p.id = pn.plant_id
  order by pn.normalized_name, p.created_at, p.slug
)
update public.street_plant_entries spe
set
  plant_id = rn.plant_id,
  match_status = rn.match_status,
  notes = coalesce(spe.notes, '') ||
    case
      when spe.notes is null or spe.notes = '' then ''
      else ' '
    end ||
    'Plant ID diperbaiki secara deterministik dari nama katalog tanaman.',
  updated_at = now()
from resolved_names rn
where spe.normalized_name = rn.normalized_name
  and (
    spe.plant_id is null
    or spe.match_status in ('ambiguous', 'unresolved')
  );
