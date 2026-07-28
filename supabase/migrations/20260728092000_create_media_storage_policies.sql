-- Kampung Herbal Berua: storage policies for global media buckets.
-- Buckets are created via the Storage API by scripts/media/cli.ts.

create policy "media_public_read_public"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'media-public');

create policy "media_originals_read_staff"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'media-originals'
    and public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "media_public_insert_editor_admin"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media-public'
    and public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
    and name ~ '^(plants|health-zones|recipes|products|activities|programs|team|site|maps)/[a-z0-9][a-z0-9-]*/[a-z0-9-]+\\.(webp)$'
    and name !~ '(^|/)\\.\\.(/|$)'
  );

create policy "media_originals_insert_editor_admin"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'media-originals'
    and public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
    and name ~ '^(plants|health-zones|recipes|products|activities|programs|team|site|maps)/[a-z0-9][a-z0-9-]*/[a-z0-9-]+\\.(jpg|jpeg|png|webp)$'
    and name !~ '(^|/)\\.\\.(/|$)'
  );

create policy "media_public_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'media-public'
    and public.current_user_role() = 'admin'::public.app_role
  );

create policy "media_originals_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'media-originals'
    and public.current_user_role() = 'admin'::public.app_role
  );
