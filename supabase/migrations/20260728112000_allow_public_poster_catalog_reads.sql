-- Kampung Herbal Berua: public poster catalog read access.
-- The public catalog intentionally exposes poster transcription labels without
-- requiring source, collection, or linked plant publication status.

grant select on public.plant_source_entries to anon, authenticated;

drop policy if exists "plant_sources_select_public" on public.plant_sources;
create policy "plant_sources_select_public"
  on public.plant_sources
  for select
  to anon, authenticated
  using (
    content_status = 'published'::public.content_status
    or source_code = 'KHB-POSTER-216-2026'
  );

drop policy if exists "plant_collections_select_public" on public.plant_collections;
create policy "plant_collections_select_public"
  on public.plant_collections
  for select
  to anon, authenticated
  using (
    content_status = 'published'::public.content_status
    or exists (
      select 1
      from public.plant_sources s
      where s.id = plant_collections.source_id
        and s.source_code = 'KHB-POSTER-216-2026'
    )
  );

create policy "plant_source_entries_select_public_poster"
  on public.plant_source_entries
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.plant_sources s
      where s.id = plant_source_entries.source_id
        and s.source_code = 'KHB-POSTER-216-2026'
    )
  );
