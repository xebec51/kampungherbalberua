-- Kampung Herbal Berua: complete admin-only RLS for poster label media.

drop policy if exists "plant_source_label_media_select_staff"
  on public.plant_source_label_media;
drop policy if exists "plant_source_label_media_select_admin"
  on public.plant_source_label_media;
create policy "plant_source_label_media_select_admin"
  on public.plant_source_label_media
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

drop policy if exists "plant_source_label_media_mutate_editor_admin"
  on public.plant_source_label_media;
drop policy if exists "plant_source_label_media_mutate_admin"
  on public.plant_source_label_media;
create policy "plant_source_label_media_mutate_admin"
  on public.plant_source_label_media
  for all
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);
