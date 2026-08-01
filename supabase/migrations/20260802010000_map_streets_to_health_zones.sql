-- Kampung Herbal Berua: align each themed street's plant group with its
-- paired health zone via health_zone_streets, the official relation table.
--
-- Streets and health zones remain two distinct entities with two distinct
-- QR identities -- this migration only sets which zone's published
-- HerbaCode content a street's public plant list should mirror. It never
-- touches streets.id/slug/qr_key/street_name, health_zones.id/slug/
-- zone_code/display_order, or street_plant_entries (the older poster-based
-- table, left untouched and not deleted).
--
-- Deterministic and idempotent: safe to re-run. For each of the 9 mapped
-- streets it removes only relations pointing at the WRONG zone (if any),
-- then upserts the one correct pair. As of 2026-08-01, 5 of the 9 pairs
-- were already correct (digestia, imun, hepatia, feminia, vaskulia) and 4
-- were missing entirely (respiria, glycemia, lipidia, pediatria) -- none
-- were wrong, but the delete step stays generic so a future drift is still
-- repaired safely by re-running this migration.
with mapping (street_slug, zone_slug) as (
  values
    ('digestia', 'pencernaan-sehat'),
    ('respiria', 'pernapasan-lega'),
    ('glycemia', 'gula-darah-terkendali'),
    ('lipidia', 'obesitas-dan-metabolik'),
    ('imun', 'imunitas-kuat'),
    ('hepatia', 'hati-sehat'),
    ('feminia', 'kesehatan-perempuan'),
    ('vaskulia', 'jantung-sehat'),
    ('pediatria', 'anak-ceria')
),
resolved as (
  select s.id as street_id, hz.id as health_zone_id, m.street_slug, m.zone_slug
  from mapping m
  join public.streets s on s.slug = m.street_slug
  join public.health_zones hz on hz.slug = m.zone_slug
)
delete from public.health_zone_streets hzs
using resolved r
where hzs.street_id = r.street_id
  and hzs.health_zone_id <> r.health_zone_id;

with mapping (street_slug, zone_slug) as (
  values
    ('digestia', 'pencernaan-sehat'),
    ('respiria', 'pernapasan-lega'),
    ('glycemia', 'gula-darah-terkendali'),
    ('lipidia', 'obesitas-dan-metabolik'),
    ('imun', 'imunitas-kuat'),
    ('hepatia', 'hati-sehat'),
    ('feminia', 'kesehatan-perempuan'),
    ('vaskulia', 'jantung-sehat'),
    ('pediatria', 'anak-ceria')
),
resolved as (
  select s.id as street_id, hz.id as health_zone_id
  from mapping m
  join public.streets s on s.slug = m.street_slug
  join public.health_zones hz on hz.slug = m.zone_slug
)
insert into public.health_zone_streets (health_zone_id, street_id, sort_order, notes)
select
  r.health_zone_id,
  r.street_id,
  1,
  'Daftar tanaman jalan mengikuti entri HerbaCode published dari zona kesehatan pasangan.'
from resolved r
on conflict (health_zone_id, street_id)
do update set
  sort_order = excluded.sort_order,
  notes = excluded.notes;

do $$
declare
  missing_count integer;
  streets_with_extra_relations integer;
begin
  select count(*) into missing_count
  from (
    values
      ('digestia', 'pencernaan-sehat'),
      ('respiria', 'pernapasan-lega'),
      ('glycemia', 'gula-darah-terkendali'),
      ('lipidia', 'obesitas-dan-metabolik'),
      ('imun', 'imunitas-kuat'),
      ('hepatia', 'hati-sehat'),
      ('feminia', 'kesehatan-perempuan'),
      ('vaskulia', 'jantung-sehat'),
      ('pediatria', 'anak-ceria')
  ) as mapping(street_slug, zone_slug)
  where not exists (
    select 1
    from public.health_zone_streets hzs
    join public.streets s on s.id = hzs.street_id
    join public.health_zones hz on hz.id = hzs.health_zone_id
    where s.slug = mapping.street_slug and hz.slug = mapping.zone_slug
  );

  if missing_count > 0 then
    raise exception 'map_streets_to_health_zones: % dari 9 pasangan target tidak ditemukan setelah upsert', missing_count;
  end if;

  select count(*) into streets_with_extra_relations
  from (
    select s.slug
    from public.health_zone_streets hzs
    join public.streets s on s.id = hzs.street_id
    where s.slug in ('digestia','respiria','glycemia','lipidia','imun','hepatia','feminia','vaskulia','pediatria')
    group by s.slug
    having count(*) > 1
  ) as streets_with_more_than_one_relation;

  if streets_with_extra_relations > 0 then
    raise exception 'map_streets_to_health_zones: % jalan target mempunyai lebih dari satu relasi zona', streets_with_extra_relations;
  end if;
end $$;
