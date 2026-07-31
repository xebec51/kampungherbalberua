begin;

select plan(6);

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

-- Guarded local import scripts (scripts/herbacode, scripts/media) authenticate
-- with the service_role key. 20260730090000_admin_only_workflow.sql rewrote
-- the plants/health_zones/media_assets/herbacode_plant_zone_entries workflow
-- triggers to admin-only and, in doing so, dropped the service-role bypass
-- those triggers used to have -- which would silently break every guarded
-- import script against any project with that migration applied, since a
-- BEFORE INSERT/UPDATE trigger fires regardless of RLS bypass status.
-- 20260731091000_restore_import_service_role_bypass.sql restores it; these
-- assertions must stay green. (media_assets shares the same trigger pattern
-- and is not re-tested separately here.)

set local role service_role;
set local request.jwt.claim.role = 'service_role';

select ok(
  pg_temp.lives($$insert into public.health_zones (zone_code, slug, street_name, zone_name, block_ranges, health_topic, short_description, overview, content_status) values ('khb-z99', 'pgtap-service-role-zone', null, 'Zona Service Role', array['S1'], 'Topic', 'Short', 'Overview', 'draft')$$),
  'service_role can insert health_zones row'
);

select ok(
  pg_temp.lives($$update public.health_zones set short_description = 'Updated by service role' where zone_code = 'khb-z99'$$),
  'service_role can update health_zones row'
);

select ok(
  pg_temp.lives($$insert into public.plants (slug, local_name, category, short_description, description, content_status) values ('pgtap-service-role-plant', 'PGTAP Service Role Plant', 'daun', 'Short', 'Description', 'draft')$$),
  'service_role can insert plants row'
);

select ok(
  pg_temp.lives($$update public.plants set short_description = 'Updated by service role' where slug = 'pgtap-service-role-plant'$$),
  'service_role can update plants row'
);

select ok(
  pg_temp.lives($$insert into public.plant_sources (source_code, title, source_type, description, file_reference, observed_entry_total, content_status) values ('PGTAP-SERVICE-ROLE', 'PGTAP Service Role Source', 'docx', 'Fixture', 'herba code.docx', 1, 'published')$$),
  'service_role can insert plant_sources row'
);

select ok(
  pg_temp.lives($$insert into public.herbacode_plant_zone_entries (source_id, health_zone_id, plant_id, zone_code, zone_slug, zone_title, entry_order, raw_zone_title, raw_entry_title, local_name, source_document_name, content_status) values ((select id from public.plant_sources where source_code = 'PGTAP-SERVICE-ROLE'), (select id from public.health_zones where zone_code = 'khb-z99'), (select id from public.plants where slug = 'pgtap-service-role-plant'), 'khb-z99', 'pgtap-service-role-zone', 'Zona Service Role', 1, 'Zona Service Role', 'Service Role Entry', 'PGTAP Service Role Plant', 'HerbaCode Kampung Herbal Harmony', 'draft')$$),
  'service_role can insert herbacode_plant_zone_entries row'
);

reset role;

select * from finish();

rollback;
