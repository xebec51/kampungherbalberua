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
  ('20000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'admin@test.invalid', 'test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'viewer@test.invalid', 'test', now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, display_name, role, is_active)
values
  ('20000000-0000-0000-0000-000000000001', 'Editor Test', 'editor', true),
  ('20000000-0000-0000-0000-000000000002', 'Validator Test', 'validator', true),
  ('20000000-0000-0000-0000-000000000003', 'Admin Test', 'admin', true),
  ('20000000-0000-0000-0000-000000000004', 'Viewer Test', 'viewer', true)
on conflict (id) do update set role = excluded.role, is_active = excluded.is_active;

insert into public.plants (
  slug, local_name, category, short_description, description,
  source_notes, validator_name, validation_status, validation_checked_at,
  content_status, featured
) values
  ('pgtap-staff-draft-plant', 'Staff Draft Plant', 'rimpang', 'Draft', 'Draft description', 'Source', 'Admin Test', 'verified', now(), 'draft', false),
  ('pgtap-staff-published-plant', 'Staff Published Plant', 'rimpang', 'Published', 'Published description', 'Source', 'Admin Test', 'verified', now(), 'published', false)
on conflict (slug) do update set
  content_status = excluded.content_status,
  source_notes = excluded.source_notes,
  validator_name = excluded.validator_name,
  validation_status = excluded.validation_status,
  validation_checked_at = excluded.validation_checked_at;

insert into public.health_zones (
  zone_code, slug, street_name, zone_name, block_ranges, health_topic,
  short_description, overview, source_notes, validator_name,
  validation_status, validation_checked_at, content_status
) values
  ('khb-z84', 'pgtap-staff-draft-zone', null, 'Zona Draft', array['D1'], 'Topic', 'Draft zone', 'Overview', array['Source'], 'Admin Test', 'verified', now(), 'draft'),
  ('khb-z85', 'pgtap-staff-published-zone', null, 'Zona Published', array['P1'], 'Topic', 'Published zone', 'Overview', array['Source'], 'Admin Test', 'verified', now(), 'published')
on conflict (zone_code) do update set
  content_status = excluded.content_status,
  source_notes = excluded.source_notes,
  validator_name = excluded.validator_name,
  validation_status = excluded.validation_status,
  validation_checked_at = excluded.validation_checked_at;

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000004';

select is((select count(*) from public.plants where slug = 'pgtap-staff-draft-plant'), 0::bigint, 'viewer cannot read draft plant');
select is((select count(*) from public.health_zones where zone_code = 'khb-z84'), 0::bigint, 'viewer cannot read draft zone');
select ok(pg_temp.throws($$insert into public.plants (slug, local_name, category, short_description, description) values ('pgtap-viewer-plant', 'Viewer Plant', 'rimpang', 'Short', 'Desc')$$), 'viewer cannot insert plant');

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000001';

select is((select count(*) from public.plants where slug = 'pgtap-staff-draft-plant'), 0::bigint, 'editor cannot read draft plant');
select is((select count(*) from public.health_zones where zone_code = 'khb-z84'), 0::bigint, 'editor cannot read draft zone');
select ok(pg_temp.throws($$insert into public.plants (slug, local_name, category, short_description, description) values ('pgtap-editor-plant', 'Editor Plant', 'rimpang', 'Short', 'Desc')$$), 'editor cannot insert plant');
select ok(pg_temp.lives($$update public.plants set short_description = 'Editor update' where slug = 'pgtap-staff-published-plant'$$), 'editor update statement is filtered by RLS');
select is((select short_description from public.plants where slug = 'pgtap-staff-published-plant'), 'Published', 'editor cannot update plant');
select ok(pg_temp.lives($$delete from public.plants where slug = 'pgtap-staff-published-plant'$$), 'editor delete statement is filtered by RLS');
select is((select count(*) from public.plants where slug = 'pgtap-staff-published-plant'), 1::bigint, 'editor cannot delete plant');

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000002';

select is((select count(*) from public.plants where slug = 'pgtap-staff-draft-plant'), 0::bigint, 'validator role cannot read draft plant');
select is((select count(*) from public.health_zones where zone_code = 'khb-z84'), 0::bigint, 'validator role cannot read draft zone');
select ok(pg_temp.throws($$insert into public.health_zones (zone_code, slug, zone_name, block_ranges, health_topic, short_description, overview) values ('khb-z86', 'pgtap-validator-zone', 'Zona Validator', array['V1'], 'Topic', 'Short', 'Overview')$$), 'validator role cannot insert zone');
select ok(pg_temp.lives($$update public.health_zones set zone_name = 'Validator Update' where zone_code = 'khb-z85'$$), 'validator update statement is filtered by RLS');
select is((select zone_name from public.health_zones where zone_code = 'khb-z85'), 'Zona Published', 'validator role cannot update zone');

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000003';

select is((select count(*) from public.plants where slug like 'pgtap-staff-%'), 2::bigint, 'admin can read all plants');
select is((select count(*) from public.health_zones where zone_code in ('khb-z84', 'khb-z85')), 2::bigint, 'admin can read all zones');
select ok(pg_temp.lives($$insert into public.plants (slug, local_name, category, short_description, description, content_status) values ('pgtap-admin-plant', 'Admin Plant', 'rimpang', 'Short', 'Desc', 'draft')$$), 'admin can insert draft plant');
select ok(pg_temp.throws($$update public.plants set content_status = 'published', validation_status = 'pending' where slug = 'pgtap-admin-plant'$$), 'admin cannot publish plant with pending validation');
select ok(pg_temp.lives($$update public.plants set source_notes = 'Source', validator_name = 'Admin Test', validation_status = 'verified', validation_checked_at = now(), content_status = 'published' where slug = 'pgtap-admin-plant'$$), 'admin can publish verified plant with complete metadata');
select ok(pg_temp.lives($$update public.plants set content_status = 'archived' where slug = 'pgtap-admin-plant'$$), 'admin can archive plant');
select ok(pg_temp.lives($$delete from public.plants where slug = 'pgtap-admin-plant'$$), 'admin can delete plant');
select ok(pg_temp.lives($$update public.profiles set role = 'viewer' where id = '20000000-0000-0000-0000-000000000002'$$), 'admin can manage profiles according to policy');

select * from finish();

rollback;
