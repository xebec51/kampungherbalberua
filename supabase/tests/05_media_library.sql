begin;

select plan(45);

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
      and polname = 'media_assets_update_editor_admin'
  ),
  'media editor/admin update policy exists'
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
      and polname = 'media_quality_reviews_select_staff'
  ),
  'media quality review staff select policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.media_quality_reviews'::regclass
      and polname = 'media_quality_reviews_insert_editor_admin'
  ),
  'media quality review editor/admin insert policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.media_quality_reviews'::regclass
      and polname = 'media_quality_reviews_update_validator_admin'
  ),
  'media quality review validator/admin update policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.media_attachment_history'::regclass
      and polname = 'media_attachment_history_select_staff'
  ),
  'media attachment history staff select policy exists'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'public.media_attachment_history'::regclass
      and polname = 'media_attachment_history_insert_editor_admin'
  ),
  'media attachment history editor/admin insert policy exists'
);

select * from finish();

rollback;
