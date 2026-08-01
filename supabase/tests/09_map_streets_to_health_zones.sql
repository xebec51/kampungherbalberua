begin;

select plan(7);

-- These relations were created by migration
-- 20260802010000_map_streets_to_health_zones.sql, applied earlier in the
-- same migration sequence (not inserted by this test). We assert on the
-- real health_zone_streets state here rather than test fixtures.
--
-- This project's supabase/seed.sql seeds 9 placeholder health_zones for
-- RLS/schema testing with their own zone_code/slug pairing, unrelated to
-- production's real topic-based zone slugs (imunitas-kuat,
-- pencernaan-sehat, etc.) -- those only exist once the HerbaCode importer
-- has run against this database, as it has in production. So the
-- assertions below compare against how many of the 9 target pairs have
-- BOTH sides present in the CURRENT database, not a hardcoded 9: fully
-- strict wherever the real zones exist (production, or local after
-- running the importer), and honestly a no-op where they don't (a plain
-- `supabase db reset` in CI).

create temp table pgtap_mapping (street_slug text, zone_slug text);
insert into pgtap_mapping (street_slug, zone_slug) values
  ('digestia', 'pencernaan-sehat'),
  ('respiria', 'pernapasan-lega'),
  ('glycemia', 'gula-darah-terkendali'),
  ('lipidia', 'obesitas-dan-metabolik'),
  ('imun', 'imunitas-kuat'),
  ('hepatia', 'hati-sehat'),
  ('feminia', 'kesehatan-perempuan'),
  ('vaskulia', 'jantung-sehat'),
  ('pediatria', 'anak-ceria');

select is(
  (
    select count(*)
    from public.health_zone_streets hzs
    join public.streets s on s.id = hzs.street_id
    join public.health_zones hz on hz.id = hzs.health_zone_id
    join pgtap_mapping m on m.street_slug = s.slug and m.zone_slug = hz.slug
  ),
  (
    select count(*)
    from pgtap_mapping m
    where exists (select 1 from public.streets s where s.slug = m.street_slug)
      and exists (select 1 from public.health_zones hz where hz.slug = m.zone_slug)
  ),
  'setiap pasangan target yang kedua sisinya ada di database ini punya relasi di health_zone_streets'
);

select is(
  (
    select count(*)
    from (
      select s.slug
      from public.health_zone_streets hzs
      join public.streets s on s.id = hzs.street_id
      where s.slug in (select street_slug from pgtap_mapping)
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

select ok(
  not exists (select 1 from public.health_zones where slug = 'gula-darah-terkendali')
  or (select zone_code from public.health_zones where slug = 'gula-darah-terkendali') = 'khb-z10',
  'zone_code tidak berubah (gula-darah-terkendali), bila zona ini ada di database'
);

-- Idempotency: replay the migration's upsert logic inside this rolled-back
-- transaction and confirm it does not change the row count or throw. This
-- runs unconditionally -- with 0 resolvable pairs it is a correct no-op; with
-- 9 it re-upserts all 9 -- either way it must never throw or duplicate rows.
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
    where s.slug in (select street_slug from pgtap_mapping)
  ),
  (
    select count(*)
    from pgtap_mapping m
    where exists (select 1 from public.streets s where s.slug = m.street_slug)
      and exists (select 1 from public.health_zones hz where hz.slug = m.zone_slug)
  ),
  'setelah replay, jumlah relasi tetap sama dengan jumlah pasangan yang resolvable (idempotent, tidak ada duplikat baru)'
);

select * from finish();

rollback;
