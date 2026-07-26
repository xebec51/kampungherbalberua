begin;

select plan(28);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'plants', 'plants table exists');
select has_table('public', 'health_zones', 'health_zones table exists');

select has_pk('public', 'profiles', 'profiles has primary key');
select has_pk('public', 'plants', 'plants has primary key');
select has_pk('public', 'health_zones', 'health_zones has primary key');

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.plants'::regclass
      and conname = 'plants_slug_key'
      and contype = 'u'
  ),
  'plants.slug has unique constraint'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.health_zones'::regclass
      and conname = 'health_zones_slug_key'
      and contype = 'u'
  ),
  'health_zones.slug has unique constraint'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.health_zones'::regclass
      and conname = 'health_zones_zone_code_key'
      and contype = 'u'
  ),
  'health_zones.zone_code has unique constraint'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'profiles RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.plants'::regclass),
  'plants RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.health_zones'::regclass),
  'health_zones RLS enabled'
);

select ok(to_regtype('public.app_role') is not null, 'app_role enum exists');
select ok(to_regtype('public.content_status') is not null, 'content_status enum exists');
select ok(to_regtype('public.validation_status') is not null, 'validation_status enum exists');
select ok(to_regtype('public.plant_category') is not null, 'plant_category enum exists');

select ok(
  exists (
    select 1 from pg_trigger
    where tgrelid = 'public.profiles'::regclass
      and tgname = 'set_profiles_updated_at'
      and not tgisinternal
  ),
  'profiles updated_at trigger exists'
);

select ok(
  exists (
    select 1 from pg_trigger
    where tgrelid = 'public.plants'::regclass
      and tgname = 'set_plants_updated_at'
      and not tgisinternal
  ),
  'plants updated_at trigger exists'
);

select ok(
  exists (
    select 1 from pg_trigger
    where tgrelid = 'public.health_zones'::regclass
      and tgname = 'set_health_zones_updated_at'
      and not tgisinternal
  ),
  'health_zones updated_at trigger exists'
);

select ok(
  exists (
    select 1 from pg_trigger
    where tgrelid = 'public.plants'::regclass
      and tgname = 'enforce_plants_staff_workflow'
      and not tgisinternal
  ),
  'plants workflow trigger exists'
);

select ok(
  exists (
    select 1 from pg_trigger
    where tgrelid = 'public.health_zones'::regclass
      and tgname = 'enforce_health_zones_staff_workflow'
      and not tgisinternal
  ),
  'health_zones workflow trigger exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.plants'::regclass
      and polname = 'plants_select_published'
  ),
  'plants public read policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.health_zones'::regclass
      and polname = 'health_zones_select_published'
  ),
  'health_zones public read policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.health_zones'::regclass
      and polname = 'health_zones_delete_admin'
  ),
  'health_zones admin delete policy exists'
);

select ok(
  has_table_privilege('service_role', 'public.profiles', 'SELECT, INSERT, UPDATE, DELETE'),
  'service_role can manage profiles for local E2E fixture setup'
);

select ok(
  has_table_privilege('service_role', 'public.plants', 'SELECT, INSERT, UPDATE, DELETE'),
  'service_role can clean local E2E plant data'
);

select ok(
  has_table_privilege('service_role', 'public.health_zones', 'SELECT, INSERT, UPDATE, DELETE'),
  'service_role can clean local E2E zone data'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.health_zones'::regclass
      and conname = 'health_zones_zone_code_format'
  ),
  'health_zones zone_code format constraint exists'
);

select * from finish();

rollback;
