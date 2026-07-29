begin;

select plan(22);

create function pg_temp.throws(sql text)
returns boolean
language plpgsql
as $$
begin
  execute sql;
  return false;
exception when others then
  return true;
end;
$$;

create function pg_temp.lives(sql text)
returns boolean
language plpgsql
as $$
begin
  execute sql;
  return true;
exception when others then
  return false;
end;
$$;

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('60000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'herbacode-viewer@test.invalid', 'test', now(), now(), now()),
  ('60000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'herbacode-editor@test.invalid', 'test', now(), now(), now()),
  ('60000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'herbacode-validator@test.invalid', 'test', now(), now(), now()),
  ('60000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'herbacode-admin@test.invalid', 'test', now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, display_name, role, is_active)
values
  ('60000000-0000-0000-0000-000000000001', 'HerbaCode Viewer', 'viewer', true),
  ('60000000-0000-0000-0000-000000000002', 'HerbaCode Editor', 'editor', true),
  ('60000000-0000-0000-0000-000000000003', 'HerbaCode Validator', 'validator', true),
  ('60000000-0000-0000-0000-000000000004', 'HerbaCode Admin', 'admin', true)
on conflict (id) do update set role = excluded.role, is_active = excluded.is_active;

insert into public.plant_sources (
  source_code, title, source_type, description, file_reference,
  observed_entry_total, content_status
) values (
  'PGTAP-HERBACODE', 'PGTAP HerbaCode', 'docx', 'Fixture HerbaCode',
  'herba code.docx', 3, 'published'
)
on conflict (source_code) do update set
  title = excluded.title,
  observed_entry_total = excluded.observed_entry_total,
  content_status = excluded.content_status;

insert into public.plants (
  slug, local_name, category, short_description, description,
  validation_status, content_status, featured
) values
  ('pgtap-herbacode-public-plant', 'PGTAP HerbaCode Public Plant', 'daun', 'Public', 'Public description', 'pending', 'published', false),
  ('pgtap-herbacode-draft-plant', 'PGTAP HerbaCode Draft Plant', 'daun', 'Draft', 'Draft description', 'pending', 'draft', false),
  ('pgtap-herbacode-admin-plant', 'PGTAP HerbaCode Admin Plant', 'daun', 'Admin', 'Admin description', 'pending', 'published', false)
on conflict (slug) do update set
  local_name = excluded.local_name,
  content_status = excluded.content_status;

insert into public.health_zones (
  zone_code, slug, street_name, zone_name, block_ranges, health_topic,
  short_description, overview, validation_status, content_status
) values
  ('khb-z96', 'pgtap-herbacode-public-zone', 'Jl. HerbaCode Public', 'Zona HerbaCode Public', array['H1'], 'Public', 'Public zone', 'Public overview', 'pending', 'published'),
  ('khb-z97', 'pgtap-herbacode-draft-zone', 'Jl. HerbaCode Draft', 'Zona HerbaCode Draft', array['H2'], 'Draft', 'Draft zone', 'Draft overview', 'pending', 'draft'),
  ('khb-z98', 'pgtap-herbacode-admin-zone', 'Jl. HerbaCode Admin', 'Zona HerbaCode Admin', array['H3'], 'Admin', 'Admin zone', 'Admin overview', 'pending', 'published')
on conflict (zone_code) do update set
  slug = excluded.slug,
  zone_name = excluded.zone_name,
  content_status = excluded.content_status;

insert into public.herbacode_plant_zone_entries (
  source_id, health_zone_id, plant_id, zone_code, zone_slug, zone_title,
  entry_order, raw_zone_title, raw_entry_title, local_name, scientific_name,
  active_compounds, benefits, used_parts, cultivation_techniques, warnings,
  preparation_methods, source_document_name, content_status
) values
  (
    (select id from public.plant_sources where source_code = 'PGTAP-HERBACODE'),
    (select id from public.health_zones where zone_code = 'khb-z96'),
    (select id from public.plants where slug = 'pgtap-herbacode-public-plant'),
    'khb-z96', 'pgtap-herbacode-public-zone', 'Zona HerbaCode Public',
    1, 'Zona HerbaCode Public', 'PGTAP Public Entry', 'PGTAP HerbaCode Public Plant',
    'Publica herbacodensis', array['Senyawa publik'], array['Manfaat publik'],
    array['Daun'], array['Tanam publik'], array['Perhatian publik'], array[]::text[],
    'HerbaCode Kampung Herbal Harmony', 'published'
  ),
  (
    (select id from public.plant_sources where source_code = 'PGTAP-HERBACODE'),
    (select id from public.health_zones where zone_code = 'khb-z97'),
    (select id from public.plants where slug = 'pgtap-herbacode-draft-plant'),
    'khb-z97', 'pgtap-herbacode-draft-zone', 'Zona HerbaCode Draft',
    1, 'Zona HerbaCode Draft', 'PGTAP Draft Entry', 'PGTAP HerbaCode Draft Plant',
    'Drafta herbacodensis', array['Senyawa draft'], array['Manfaat draft'],
    array['Daun'], array['Tanam draft'], array['Perhatian draft'], array[]::text[],
    'HerbaCode Kampung Herbal Harmony', 'draft'
  )
on conflict (source_id, health_zone_id, plant_id) do update set
  local_name = excluded.local_name,
  content_status = excluded.content_status;

select has_table('public', 'herbacode_plant_zone_entries', 'herbacode plant-zone entries table exists');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.herbacode_plant_zone_entries'::regclass),
  'herbacode plant-zone entries RLS enabled'
);
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'herbacode_entries_source_zone_plant_uidx'
  ),
  'herbacode entry source-zone-plant unique index exists'
);
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'herbacode_entries_source_zone_order_uidx'
  ),
  'herbacode entry source-zone-order unique index exists'
);
select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.herbacode_plant_zone_entries'::regclass
      and polname = 'herbacode_entries_select_published'
  ),
  'herbacode public select policy exists'
);
select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.herbacode_plant_zone_entries'::regclass
      and polname = 'herbacode_entries_select_staff'
  ),
  'herbacode staff select policy exists'
);
select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.herbacode_plant_zone_entries'::regclass
      and polname = 'herbacode_entries_mutate_admin'
  ),
  'herbacode admin mutate policy exists'
);

set local role anon;
set local request.jwt.claim.role = 'anon';

select is((select count(*) from public.herbacode_plant_zone_entries where zone_code = 'khb-z96'), 1::bigint, 'anon can read published HerbaCode entry');
select is((select count(*) from public.herbacode_plant_zone_entries where zone_code = 'khb-z97'), 0::bigint, 'anon cannot read draft HerbaCode entry');
select ok(pg_temp.throws($$insert into public.herbacode_plant_zone_entries (source_id, health_zone_id, plant_id, zone_code, zone_slug, zone_title, entry_order, raw_zone_title, raw_entry_title, local_name, source_document_name) values ((select id from public.plant_sources where source_code = 'PGTAP-HERBACODE'), (select id from public.health_zones where zone_code = 'khb-z98'), (select id from public.plants where slug = 'pgtap-herbacode-admin-plant'), 'khb-z98', 'pgtap-herbacode-admin-zone', 'Zona HerbaCode Admin', 1, 'Zona HerbaCode Admin', 'Anon Entry', 'Anon Plant', 'HerbaCode Kampung Herbal Harmony')$$), 'anon cannot insert HerbaCode entry');
select ok(pg_temp.throws($$update public.herbacode_plant_zone_entries set local_name = 'Anon Update' where zone_code = 'khb-z96'$$), 'anon cannot update HerbaCode entry');
select ok(pg_temp.throws($$delete from public.herbacode_plant_zone_entries where zone_code = 'khb-z96'$$), 'anon cannot delete HerbaCode entry');

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '60000000-0000-0000-0000-000000000001';

select is((select count(*) from public.herbacode_plant_zone_entries where zone_code = 'khb-z96'), 1::bigint, 'viewer can read published HerbaCode entry');
select is((select count(*) from public.herbacode_plant_zone_entries where zone_code = 'khb-z97'), 0::bigint, 'viewer cannot read draft HerbaCode entry');
select ok(pg_temp.throws($$insert into public.herbacode_plant_zone_entries (source_id, health_zone_id, plant_id, zone_code, zone_slug, zone_title, entry_order, raw_zone_title, raw_entry_title, local_name, source_document_name) values ((select id from public.plant_sources where source_code = 'PGTAP-HERBACODE'), (select id from public.health_zones where zone_code = 'khb-z98'), (select id from public.plants where slug = 'pgtap-herbacode-admin-plant'), 'khb-z98', 'pgtap-herbacode-admin-zone', 'Zona HerbaCode Admin', 1, 'Zona HerbaCode Admin', 'Viewer Entry', 'Viewer Plant', 'HerbaCode Kampung Herbal Harmony')$$), 'viewer cannot insert HerbaCode entry');

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '60000000-0000-0000-0000-000000000002';

select is((select count(*) from public.herbacode_plant_zone_entries where zone_code in ('khb-z96', 'khb-z97')), 2::bigint, 'editor can read published and draft HerbaCode entries');
update public.herbacode_plant_zone_entries
set local_name = 'Editor Update'
where zone_code = 'khb-z97';
select is((select local_name from public.herbacode_plant_zone_entries where zone_code = 'khb-z97'), 'PGTAP HerbaCode Draft Plant', 'editor cannot update HerbaCode entry');

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '60000000-0000-0000-0000-000000000003';

select is((select count(*) from public.herbacode_plant_zone_entries where zone_code in ('khb-z96', 'khb-z97')), 2::bigint, 'validator can read published and draft HerbaCode entries');
delete from public.herbacode_plant_zone_entries where zone_code = 'khb-z97';
select is((select count(*) from public.herbacode_plant_zone_entries where zone_code = 'khb-z97'), 1::bigint, 'validator cannot delete HerbaCode entry');

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '60000000-0000-0000-0000-000000000004';

select ok(pg_temp.lives($$insert into public.herbacode_plant_zone_entries (source_id, health_zone_id, plant_id, zone_code, zone_slug, zone_title, entry_order, raw_zone_title, raw_entry_title, local_name, source_document_name, content_status) values ((select id from public.plant_sources where source_code = 'PGTAP-HERBACODE'), (select id from public.health_zones where zone_code = 'khb-z98'), (select id from public.plants where slug = 'pgtap-herbacode-admin-plant'), 'khb-z98', 'pgtap-herbacode-admin-zone', 'Zona HerbaCode Admin', 1, 'Zona HerbaCode Admin', 'Admin Entry', 'Admin Plant', 'HerbaCode Kampung Herbal Harmony', 'draft')$$), 'admin can insert HerbaCode entry');
select ok(pg_temp.lives($$update public.herbacode_plant_zone_entries set content_status = 'published' where zone_code = 'khb-z98'$$), 'admin can publish HerbaCode entry');
select ok(pg_temp.lives($$delete from public.herbacode_plant_zone_entries where zone_code = 'khb-z98'$$), 'admin can delete HerbaCode entry');

select * from finish();

rollback;
