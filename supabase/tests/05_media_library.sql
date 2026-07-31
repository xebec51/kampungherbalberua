begin;

select plan(48);

select has_table('public', 'media_assets', 'media_assets table exists');
select has_table('public', 'plant_media', 'plant_media table exists');
select has_table('public', 'health_zone_media', 'health_zone_media table exists');
select has_table('public', 'content_media_slots', 'content_media_slots table exists');
select has_table('public', 'plant_sources', 'plant_sources table exists');
select has_table('public', 'plant_collections', 'plant_collections table exists');
select has_table('public', 'plant_source_entries', 'plant_source_entries table exists');
select has_table('public', 'plant_names', 'plant_names table exists');
select has_table('public', 'plant_source_label_media', 'plant_source_label_media table exists');
select has_table('public', 'media_quality_reviews', 'media_quality_reviews table exists');
select has_table('public', 'media_attachment_history', 'media_attachment_history table exists');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.media_assets'::regclass),
  'media_assets RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.plant_media'::regclass),
  'plant_media RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.health_zone_media'::regclass),
  'health_zone_media RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.content_media_slots'::regclass),
  'content_media_slots RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.plant_source_label_media'::regclass),
  'plant_source_label_media RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.media_quality_reviews'::regclass),
  'media_quality_reviews RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.media_attachment_history'::regclass),
  'media_attachment_history RLS enabled'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.media_assets'::regclass
      and conname = 'media_assets_published_requires_public_path'
  ),
  'published media requires public path'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.media_assets'::regclass
      and conname = 'media_assets_external_requires_license'
  ),
  'external media requires license metadata'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.plant_source_entries'::regclass
      and conname = 'plant_source_entries_poster_number_allowed'
  ),
  'poster numbering gap constraint exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.media_assets'::regclass
      and polname = 'media_assets_select_public'
  ),
  'public media select policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.media_assets'::regclass
      and polname = 'media_assets_update_admin'
  ),
  'media admin update policy exists'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'media_public_read_public'
  ),
  'media-public storage read policy exists'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'plant_media_one_primary_idx'
  ),
  'one primary plant media index exists'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'health_zone_media_one_primary_idx'
  ),
  'one primary health zone media index exists'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'content_media_slots_one_primary_idx'
  ),
  'one primary content media slot index exists'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'plant_names_source_normalized_name_idx'
  ),
  'poster plant name idempotency index exists'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'plant_source_label_media_one_primary_idx'
  ),
  'one primary poster label media index exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.plant_source_label_media'::regclass
      and polname = 'plant_source_label_media_select_public'
  ),
  'poster label media public select policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.plant_source_label_media'::regclass
      and polname = 'plant_source_label_media_select_admin'
  ),
  'poster label media admin select policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.plant_source_label_media'::regclass
      and polname = 'plant_source_label_media_mutate_admin'
  ),
  'poster label media admin mutate policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.plant_sources'::regclass
      and polname = 'plant_sources_select_public'
  ),
  'poster source public select policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.plant_collections'::regclass
      and polname = 'plant_collections_select_public'
  ),
  'poster collection public select policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.plant_source_entries'::regclass
      and polname = 'plant_source_entries_select_public_poster'
  ),
  'poster entry public select policy exists'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.plant_source_label_media'::regclass
      and conname = 'plant_source_label_media_media_id_fkey'
  ),
  'poster label media keeps media foreign key'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.media_quality_reviews'::regclass
      and conname = 'media_quality_reviews_relevance_status_allowed'
  ),
  'media quality relevance status is constrained'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.media_attachment_history'::regclass
      and conname = 'media_attachment_history_action_allowed'
  ),
  'media attachment history action is constrained'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'plant_source_label_media_source_slug_lookup_idx'
  ),
  'poster label media source slug lookup index exists'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'media_quality_reviews_entity_media_idx'
  ),
  'media quality unique entity media index exists'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'media_quality_reviews_entity_idx'
  ),
  'media quality entity lookup index exists'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'media_attachment_history_entity_idx'
  ),
  'media attachment history entity index exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.media_quality_reviews'::regclass
      and polname = 'media_quality_reviews_select_admin'
  ),
  'media quality review admin select policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.media_quality_reviews'::regclass
      and polname = 'media_quality_reviews_insert_admin'
  ),
  'media quality review admin insert policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.media_quality_reviews'::regclass
      and polname = 'media_quality_reviews_update_admin'
  ),
  'media quality review admin update policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.media_attachment_history'::regclass
      and polname = 'media_attachment_history_select_admin'
  ),
  'media attachment history admin select policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.media_attachment_history'::regclass
      and polname = 'media_attachment_history_insert_admin'
  ),
  'media attachment history admin insert policy exists'
);

-- Regression test for enforce_media_assets_admin_workflow(): it used to
-- reference new.published_at / old.published_at, a column media_assets
-- never had, so any admin-authenticated insert with content_status =
-- 'published' failed with "record "new" has no field "published_at"".
-- This only surfaced once the admin photo-upload feature exercised an
-- authenticated (non service-role) insert for the first time.
insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('70000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'media-admin@test.invalid', 'test', now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, display_name, role, is_active)
values
  ('70000000-0000-0000-0000-000000000001', 'Media Admin', 'admin', true)
on conflict (id) do update set role = excluded.role, is_active = excluded.is_active;

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '70000000-0000-0000-0000-000000000001';

select lives_ok(
  $$insert into public.media_assets (
    asset_code, title, alt_text, mime_type, checksum_sha256, source_type,
    content_status, rights_status, privacy_status, public_bucket, public_path
  ) values (
    'pgtap-media-published', 'PGTAP Published Media', 'Alt text uji',
    'image/webp', repeat('a', 64), 'kkn_documentation',
    'published', 'approved', 'not_required', 'media-public', 'plants/pgtap/cover-test.webp'
  )$$,
  'admin can insert media_assets with content_status published (no published_at column error)'
);

reset role;

select * from finish();

rollback;
