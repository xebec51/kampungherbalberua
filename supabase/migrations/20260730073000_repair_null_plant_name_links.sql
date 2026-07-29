-- Complete street catalog mapping repair for plant_names rows that already
-- existed with null plant_id. Keep this deterministic and limited to poster
-- names required by street_plant_entries.

with canonical_map(normalized_name, plant_slug, match_status) as (
  values
    ('beluntas', 'beluntas', 'exact'),
    ('brotowali', 'brotowali', 'exact'),
    ('cincau', 'cincau-hijau', 'alias'),
    ('delima', 'delima', 'exact'),
    ('eucalyptus', 'eucalyptus', 'exact'),
    ('garcinia', 'garcinia', 'exact'),
    ('kayu putih', 'kayu-putih', 'exact'),
    ('kopi hijau', 'kopi-hijau', 'exact'),
    ('mahkota dewa', 'mahkota-dewa', 'exact'),
    ('mengkudu', 'mengkudu', 'exact'),
    ('pare', 'pare', 'exact'),
    ('saga', 'saga', 'exact'),
    ('salam', 'daun-salam', 'alias')
),
resolved_names as (
  select
    cm.normalized_name,
    cm.match_status,
    p.id as plant_id
  from canonical_map cm
  join public.plants p on p.slug = cm.plant_slug
)
update public.plant_names pn
set
  plant_id = rn.plant_id,
  notes = coalesce(pn.notes || ' ', '') ||
    'Plant ID diperbaiki untuk mapping jalan tematik.'
from resolved_names rn
where pn.normalized_name = rn.normalized_name
  and pn.plant_id is null;

with poster_source as (
  select id
  from public.plant_sources
  where source_code = 'KHB-POSTER-216-2026'
),
canonical_map(normalized_name, plant_slug) as (
  values
    ('beluntas', 'beluntas'),
    ('brotowali', 'brotowali'),
    ('cincau', 'cincau-hijau'),
    ('delima', 'delima'),
    ('eucalyptus', 'eucalyptus'),
    ('garcinia', 'garcinia'),
    ('kayu putih', 'kayu-putih'),
    ('kopi hijau', 'kopi-hijau'),
    ('mahkota dewa', 'mahkota-dewa'),
    ('mengkudu', 'mengkudu'),
    ('pare', 'pare'),
    ('saga', 'saga'),
    ('salam', 'daun-salam')
),
resolved_names as (
  select cm.normalized_name, p.id as plant_id
  from canonical_map cm
  join public.plants p on p.slug = cm.plant_slug
)
update public.plant_source_entries pse
set plant_id = rn.plant_id
from poster_source ps
cross join resolved_names rn
where pse.source_id = ps.id
  and pse.normalized_candidate_name = rn.normalized_name
  and pse.plant_id is null;

with canonical_map(normalized_name, plant_slug, match_status) as (
  values
    ('beluntas', 'beluntas', 'exact'),
    ('brotowali', 'brotowali', 'exact'),
    ('cincau', 'cincau-hijau', 'alias'),
    ('delima', 'delima', 'exact'),
    ('eucalyptus', 'eucalyptus', 'exact'),
    ('garcinia', 'garcinia', 'exact'),
    ('kayu putih', 'kayu-putih', 'exact'),
    ('kopi hijau', 'kopi-hijau', 'exact'),
    ('mahkota dewa', 'mahkota-dewa', 'exact'),
    ('mengkudu', 'mengkudu', 'exact'),
    ('pare', 'pare', 'exact'),
    ('saga', 'saga', 'exact'),
    ('salam', 'daun-salam', 'alias')
),
resolved_names as (
  select
    cm.normalized_name,
    cm.match_status,
    p.id as plant_id
  from canonical_map cm
  join public.plants p on p.slug = cm.plant_slug
)
update public.street_plant_entries spe
set
  plant_id = rn.plant_id,
  match_status = rn.match_status,
  notes = coalesce(spe.notes || ' ', '') ||
    'Plant ID diperbaiki dari mapping canonical katalog jalan.',
  updated_at = now()
from resolved_names rn
where spe.normalized_name = rn.normalized_name
  and spe.plant_id is null;
