begin;

select plan(7);

-- These 9 relations were created by migration
-- 20260802010000_map_streets_to_health_zones.sql, applied earlier in the
-- same migration sequence (not inserted by this test). We assert on the
-- real health_zone_streets state here rather than test fixtures.

select is(
  (
    select count(*)
    from public.health_zone_streets hzs
    join public.streets s on s.id = hzs.street_id
    join public.health_zones hz on hz.id = hzs.health_zone_id
    where (s.slug, hz.slug) in (
      ('digestia', 'pencernaan-sehat'),
      ('respiria', 'pernapasan-lega'),
      ('glycemia', 'gula-darah-terkendali'),
      ('lipidia', 'obesitas-dan-metabolik'),
      ('imun', 'imunitas-kuat'),
      ('hepatia', 'hati-sehat'),
      ('feminia', 'kesehatan-perempuan'),
      ('vaskulia', 'jantung-sehat'),
      ('pediatria', 'anak-ceria')
    )
  ),
  9::bigint,
  'tepat 9 relasi target street-zone ada di health_zone_streets'
);

select is(
  (
    select count(*)
    from (
      select s.slug
      from public.health_zone_streets hzs
      join public.streets s on s.id = hzs.street_id
      where s.slug in ('digestia','respiria','glycemia','lipidia','imun','hepatia','feminia','vaskulia','pediatria')
      group by s.slug
      having count(*) > 1
    ) as streets_with_duplicates
  ),
  0::bigint,
  'tidak ada jalan target dengan relasi zona ganda'
);

select is(
  (select slug from public.streets where slug = 'glycemia'),
  'glycemia',
  'street slug tidak berubah (glycemia)'
);

select is(
  (select qr_key from public.streets where slug = 'glycemia'),
  'glycemia',
  'street qr_key tidak berubah (glycemia)'
);

select is(
  (select zone_code from public.health_zones where slug = 'gula-darah-terkendali'),
  'khb-z10',
  'zone_code tidak berubah (gula-darah-terkendali)'
);

-- Idempotency: replay the migration's upsert logic inside this rolled-back
-- transaction and confirm it does not change the row count or throw.
select lives_ok(
  $$
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
  select r.health_zone_id, r.street_id, 1,
         'Daftar tanaman jalan mengikuti entri HerbaCode published dari zona kesehatan pasangan.'
  from resolved r
  on conflict (health_zone_id, street_id)
  do update set sort_order = excluded.sort_order, notes = excluded.notes
  $$,
  'migration replay (upsert) tidak melempar error'
);

select is(
  (
    select count(*)
    from public.health_zone_streets hzs
    join public.streets s on s.id = hzs.street_id
    where s.slug in ('digestia','respiria','glycemia','lipidia','imun','hepatia','feminia','vaskulia','pediatria')
  ),
  9::bigint,
  'setelah replay, tetap tepat 9 relasi (idempotent, tidak ada duplikat baru)'
);

select * from finish();

rollback;
