begin;

select plan(17);

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

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'viewer@test.invalid', 'test', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'editor@test.invalid', 'test', now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, display_name, role, is_active)
values
  ('10000000-0000-0000-0000-000000000001', 'Viewer Test', 'viewer', true),
  ('10000000-0000-0000-0000-000000000002', 'Editor Test', 'editor', true)
on conflict (id) do update set role = excluded.role, is_active = excluded.is_active;

insert into public.plants (
  slug, local_name, category, short_description, description,
  validation_status, content_status, featured
) values
  ('pgtap-public-plant', 'PGTAP Published Plant', 'rimpang', 'Published', 'Published description', 'data_demonstrasi', 'published', false),
  ('pgtap-draft-plant', 'PGTAP Draft Plant', 'rimpang', 'Draft', 'Draft description', 'data_demonstrasi', 'draft', false)
on conflict (slug) do update set content_status = excluded.content_status;

insert into public.health_zones (
  zone_code, slug, street_name, zone_name, block_ranges, health_topic,
  short_description, overview, validation_status, content_status
) values
  ('khb-z80', 'pgtap-public-zone', 'Jl. PGTAP Public', 'Zona Public', array['Z1'], 'Topic', 'Published zone', 'Overview', 'data_demonstrasi', 'published'),
  ('khb-z81', 'pgtap-draft-zone', 'Jl. PGTAP Draft', 'Zona Draft', array['Z2'], 'Topic', 'Draft zone', 'Overview', 'data_demonstrasi', 'draft')
on conflict (zone_code) do update set content_status = excluded.content_status;

set local role anon;
set local request.jwt.claim.role = 'anon';

select is((select count(*) from public.plants where slug = 'pgtap-public-plant'), 1::bigint, 'anon can read published plant');
select is((select count(*) from public.plants where slug = 'pgtap-draft-plant'), 0::bigint, 'anon cannot read draft plant');
select ok(pg_temp.throws($$insert into public.plants (slug, local_name, category, short_description, description) values ('anon-insert', 'Anon', 'rimpang', 'Short', 'Desc')$$), 'anon cannot insert plant');
select ok(pg_temp.throws($$update public.plants set local_name = 'Anon Update' where slug = 'pgtap-public-plant'$$), 'anon cannot update plant');
select ok(pg_temp.throws($$delete from public.plants where slug = 'pgtap-public-plant'$$), 'anon cannot delete plant');

select is((select count(*) from public.health_zones where zone_code = 'khb-z80'), 1::bigint, 'anon can read published health zone');
select is((select count(*) from public.health_zones where zone_code = 'khb-z81'), 0::bigint, 'anon cannot read draft health zone');
select ok(pg_temp.throws($$insert into public.health_zones (zone_code, slug, street_name, zone_name, block_ranges, health_topic, short_description, overview) values ('khb-z82', 'anon-zone', 'Jl. Anon', 'Zona Anon', array['A1'], 'Topic', 'Short', 'Overview')$$), 'anon cannot insert health zone');
select ok(pg_temp.throws($$update public.health_zones set zone_name = 'Anon Update' where zone_code = 'khb-z80'$$), 'anon cannot update health zone');
select ok(pg_temp.throws($$delete from public.health_zones where zone_code = 'khb-z80'$$), 'anon cannot delete health zone');
select ok(pg_temp.throws($$select count(*) from public.profiles$$), 'anon cannot read profiles');

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';

select is((select count(*) from public.profiles), 1::bigint, 'viewer can read only own profile');
select is((select count(*) from public.plants where slug = 'pgtap-draft-plant'), 0::bigint, 'viewer cannot read staff draft plant');
select is((select count(*) from public.health_zones where zone_code = 'khb-z81'), 0::bigint, 'viewer cannot read draft health zone');
select ok(pg_temp.throws($$insert into public.plants (slug, local_name, category, short_description, description) values ('viewer-insert', 'Viewer', 'rimpang', 'Short', 'Desc')$$), 'viewer cannot mutate plants');
select ok(pg_temp.throws($$insert into public.health_zones (zone_code, slug, street_name, zone_name, block_ranges, health_topic, short_description, overview) values ('khb-z83', 'viewer-zone', 'Jl. Viewer', 'Zona Viewer', array['V1'], 'Topic', 'Short', 'Overview')$$), 'viewer cannot mutate health zones');
select ok(pg_temp.throws($$update public.profiles set role = 'admin' where id = auth.uid()$$), 'viewer cannot change own role');

select * from finish();

rollback;
