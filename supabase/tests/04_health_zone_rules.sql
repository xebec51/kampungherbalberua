begin;

select plan(11);

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
values ('30000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@test.invalid', 'test', now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, display_name, role, is_active)
values ('30000000-0000-0000-0000-000000000001', 'Admin Test', 'admin', true)
on conflict (id) do update set role = excluded.role, is_active = excluded.is_active;

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000001';

select ok(pg_temp.lives($$insert into public.health_zones (zone_code, slug, street_name, zone_name, block_ranges, health_topic, short_description, overview, content_status) values ('khb-z90', 'pgtap-permanent-zone', 'Jl. Permanent', 'Zona Permanent', array['P1'], 'Topic', 'Short', 'Overview', 'draft')$$), 'zone_code can be created before publication');

select ok(pg_temp.lives($$update public.health_zones set zone_code = 'khb-z91' where zone_code = 'khb-z90'$$), 'zone_code can change before publication');

select ok(pg_temp.lives($$update public.health_zones set content_status = 'published' where zone_code = 'khb-z91'$$), 'admin can publish zone');

select ok(pg_temp.throws($$update public.health_zones set zone_code = 'khb-z92' where zone_code = 'khb-z91'$$), 'zone_code cannot change after publication');

select ok(pg_temp.lives($$update public.health_zones set slug = 'pgtap-permanent-zone-baru' where zone_code = 'khb-z91'$$), 'slug can change after publication');

select is((select zone_code from public.health_zones where slug = 'pgtap-permanent-zone-baru'), 'khb-z91', 'slug change does not change zone_code');

select ok(pg_temp.throws($$insert into public.health_zones (zone_code, slug, street_name, zone_name, block_ranges, health_topic, short_description, overview, validation_status, content_status) values ('khb-z93', 'pgtap-verified-no-validator', 'Jl. Verified', 'Zona Verified', array['V1'], 'Topic', 'Short', 'Overview', 'verified', 'published')$$), 'verified without validator_name fails');

select ok(pg_temp.throws($$insert into public.health_zones (zone_code, slug, street_name, zone_name, block_ranges, health_topic, short_description, overview, validation_status, validator_name, source_notes, content_status) values ('khb-z94', 'pgtap-verified-no-source', 'Jl. Verified', 'Zona Verified', array['V1'], 'Topic', 'Short', 'Overview', 'verified', 'Validator', array[]::text[], 'published')$$), 'verified without source_notes fails');

select ok(pg_temp.lives($$insert into public.health_zones (zone_code, slug, street_name, zone_name, block_ranges, health_topic, short_description, overview, validation_status, validator_name, source_notes, content_status) values ('khb-z95', 'pgtap-verified-ok', 'Jl. Verified', 'Zona Verified', array['V1'], 'Topic', 'Short', 'Overview', 'verified', 'Validator', array['Source'], 'published')$$), 'verified with validator and source succeeds for admin');

select ok(pg_temp.lives($$insert into public.health_zones (zone_code, slug, zone_name, block_ranges, health_topic, short_description, overview, content_status) values ('khb-z96', 'pgtap-no-street-zone', 'Zona Tanpa Jalan', array[]::text[], 'Topic', 'Short', 'Overview', 'draft')$$), 'health zone can exist without street_name');

select ok(pg_temp.lives($$insert into public.streets (slug, street_name, content_status) values ('pgtap-real-street', 'Jl. PGTAP Riil', 'published')$$), 'real street entity can be created separately');

select * from finish();

rollback;
