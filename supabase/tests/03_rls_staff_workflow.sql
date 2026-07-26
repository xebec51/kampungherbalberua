begin;

select plan(23);

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
  ('20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'editor@test.invalid', 'test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'validator@test.invalid', 'test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'admin@test.invalid', 'test', now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, display_name, role, is_active)
values
  ('20000000-0000-0000-0000-000000000001', 'Editor Test', 'editor', true),
  ('20000000-0000-0000-0000-000000000002', 'Validator Test', 'validator', true),
  ('20000000-0000-0000-0000-000000000003', 'Admin Test', 'admin', true)
on conflict (id) do update set role = excluded.role, is_active = excluded.is_active;

insert into public.plants (
  slug, local_name, category, short_description, description,
  validation_status, content_status, featured
) values
  ('pgtap-staff-draft-plant', 'Staff Draft Plant', 'rimpang', 'Draft', 'Draft description', 'data_demonstrasi', 'draft', false),
  ('pgtap-staff-published-plant', 'Staff Published Plant', 'rimpang', 'Published', 'Published description', 'data_demonstrasi', 'published', false)
on conflict (slug) do update set content_status = excluded.content_status;

insert into public.health_zones (
  zone_code, slug, street_name, zone_name, block_ranges, health_topic,
  short_description, overview, validation_status, content_status
) values
  ('khb-z84', 'pgtap-staff-draft-zone', 'Jl. Staff Draft', 'Zona Draft', array['D1'], 'Topic', 'Draft zone', 'Overview', 'data_demonstrasi', 'draft'),
  ('khb-z85', 'pgtap-staff-published-zone', 'Jl. Staff Published', 'Zona Published', array['P1'], 'Topic', 'Published zone', 'Overview', 'data_demonstrasi', 'published')
on conflict (zone_code) do update set content_status = excluded.content_status;

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000001';

select is((select count(*) from public.plants where slug like 'pgtap-staff-%'), 2::bigint, 'editor can read all plants');
select is((select count(*) from public.health_zones where zone_code in ('khb-z84', 'khb-z85')), 2::bigint, 'editor can read all zones');
select ok(pg_temp.lives($$insert into public.plants (slug, local_name, category, short_description, description, content_status) values ('pgtap-editor-plant', 'Editor Plant', 'rimpang', 'Short', 'Desc', 'draft')$$), 'editor can insert plant draft');
select ok(pg_temp.lives($$insert into public.health_zones (zone_code, slug, street_name, zone_name, block_ranges, health_topic, short_description, overview, content_status) values ('khb-z86', 'pgtap-editor-zone', 'Jl. Editor', 'Zona Editor', array['E1'], 'Topic', 'Short', 'Overview', 'draft')$$), 'editor can insert zone draft');
select ok(pg_temp.lives($$update public.plants set short_description = 'Updated draft' where slug = 'pgtap-editor-plant'$$), 'editor can update own draft plant');
select ok(pg_temp.throws($$update public.plants set content_status = 'published' where slug = 'pgtap-editor-plant'$$), 'editor cannot publish plant');
select ok(pg_temp.throws($$update public.health_zones set validation_status = 'verified', validator_name = 'Editor', source_notes = array['Source'] where zone_code = 'khb-z86'$$), 'editor cannot set verified zone');
delete from public.plants where slug = 'pgtap-editor-plant';
select is((select count(*) from public.plants where slug = 'pgtap-editor-plant'), 1::bigint, 'editor cannot delete plant');
select is((select updated_by from public.plants where slug = 'pgtap-editor-plant'), '20000000-0000-0000-0000-000000000001'::uuid, 'updated_by set to editor auth user');
select is((select created_by from public.plants where slug = 'pgtap-editor-plant'), '20000000-0000-0000-0000-000000000001'::uuid, 'created_by set to editor auth user');
select ok(pg_temp.lives($$update public.plants set created_by = '20000000-0000-0000-0000-000000000003' where slug = 'pgtap-editor-plant'$$), 'editor forged created_by update statement does not error');
select is((select created_by from public.plants where slug = 'pgtap-editor-plant'), '20000000-0000-0000-0000-000000000001'::uuid, 'created_by forged value is ignored');

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000002';

select is((select count(*) from public.plants where slug like 'pgtap-staff-%'), 2::bigint, 'validator can read all plants');
select is((select count(*) from public.health_zones where zone_code in ('khb-z84', 'khb-z85')), 2::bigint, 'validator can read all zones');
select ok(pg_temp.throws($$insert into public.plants (slug, local_name, category, short_description, description) values ('pgtap-validator-plant', 'Validator Plant', 'rimpang', 'Short', 'Desc')$$), 'validator cannot insert plant');
update public.health_zones set zone_name = 'Validator Update' where zone_code = 'khb-z84';
select is((select zone_name from public.health_zones where zone_code = 'khb-z84'), 'Zona Draft', 'validator cannot update zone');
delete from public.health_zones where zone_code = 'khb-z84';
select is((select count(*) from public.health_zones where zone_code = 'khb-z84'), 1::bigint, 'validator cannot delete zone');

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000003';

select is((select count(*) from public.plants where slug like 'pgtap-staff-%'), 2::bigint, 'admin can read all content');
select ok(pg_temp.lives($$insert into public.plants (slug, local_name, category, short_description, description, content_status) values ('pgtap-admin-plant', 'Admin Plant', 'rimpang', 'Short', 'Desc', 'draft')$$), 'admin can insert plant');
select ok(pg_temp.lives($$update public.plants set content_status = 'published' where slug = 'pgtap-admin-plant'$$), 'admin can publish plant');
select ok(pg_temp.lives($$update public.plants set content_status = 'archived' where slug = 'pgtap-admin-plant'$$), 'admin can archive plant');
select ok(pg_temp.lives($$delete from public.plants where slug = 'pgtap-admin-plant'$$), 'admin can delete plant');
select ok(pg_temp.lives($$update public.profiles set role = 'viewer' where id = '20000000-0000-0000-0000-000000000002'$$), 'admin can manage profiles according to policy');

select * from finish();

rollback;
