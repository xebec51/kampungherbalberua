-- Restore the nine thematic street names as street entities.
-- These names were part of the earlier Kampung Herbal Harmony catalog. They
-- stay outside health_zones.street_name so zone and street concepts remain
-- separate.

insert into public.streets (
  slug,
  street_name,
  description,
  source_notes,
  validation_status,
  content_status
) values
  (
    'digestia',
    'Jl. Digestia',
    'Jalan tematik untuk zona pencernaan.',
    array['Dipulihkan dari katalog zona awal Kampung Herbal Harmony.'],
    'pending',
    'published'
  ),
  (
    'respiria',
    'Jl. Respiria',
    'Jalan tematik untuk zona pernapasan.',
    array['Dipulihkan dari katalog zona awal Kampung Herbal Harmony.'],
    'pending',
    'published'
  ),
  (
    'glycemia',
    'Jl. Glycemia',
    'Jalan tematik untuk zona gula darah.',
    array['Dipulihkan dari katalog zona awal Kampung Herbal Harmony.'],
    'pending',
    'published'
  ),
  (
    'lipidia',
    'Jl. Lipidia',
    'Jalan tematik untuk zona lemak sehat.',
    array['Dipulihkan dari katalog zona awal Kampung Herbal Harmony.'],
    'pending',
    'published'
  ),
  (
    'imun',
    'Jl. Imun',
    'Jalan tematik untuk zona daya tahan tubuh.',
    array['Dipulihkan dari katalog zona awal Kampung Herbal Harmony.'],
    'pending',
    'published'
  ),
  (
    'hepatia',
    'Jl. Hepatia',
    'Jalan tematik untuk zona hati sehat.',
    array['Dipulihkan dari katalog zona awal Kampung Herbal Harmony.'],
    'pending',
    'published'
  ),
  (
    'feminia',
    'Jl. Feminia',
    'Jalan tematik untuk zona kesehatan perempuan.',
    array['Dipulihkan dari katalog zona awal Kampung Herbal Harmony.'],
    'pending',
    'published'
  ),
  (
    'vaskulia',
    'Jl. Vaskulia',
    'Jalan tematik untuk zona jantung dan pembuluh darah.',
    array['Dipulihkan dari katalog zona awal Kampung Herbal Harmony.'],
    'pending',
    'published'
  ),
  (
    'pediatria',
    'Jl. Pediatria',
    'Jalan tematik untuk zona anak.',
    array['Dipulihkan dari katalog zona awal Kampung Herbal Harmony.'],
    'pending',
    'published'
  )
on conflict (slug) do update set
  street_name = excluded.street_name,
  description = coalesce(public.streets.description, excluded.description),
  source_notes = case
    when public.streets.source_notes @> excluded.source_notes then public.streets.source_notes
    else public.streets.source_notes || excluded.source_notes
  end,
  content_status = case
    when public.streets.content_status = 'archived' then public.streets.content_status
    else excluded.content_status
  end,
  updated_at = now();

with restored_relations(zone_slug, street_slug, notes) as (
  values
    ('imunitas-kuat', 'imun', 'Relasi tema daya tahan tubuh.'),
    ('pencernaan-sehat', 'digestia', 'Relasi tema pencernaan.'),
    ('hati-sehat', 'hepatia', 'Relasi tema hati.'),
    ('jantung-sehat', 'vaskulia', 'Relasi tema jantung dan pembuluh darah.'),
    ('kesehatan-perempuan', 'feminia', 'Relasi tema kesehatan perempuan.')
)
insert into public.health_zone_streets (
  health_zone_id,
  street_id,
  sort_order,
  notes
)
select
  hz.id,
  s.id,
  1,
  restored_relations.notes
from restored_relations
join public.health_zones hz on hz.slug = restored_relations.zone_slug
join public.streets s on s.slug = restored_relations.street_slug
on conflict (health_zone_id, street_id) do update set
  notes = coalesce(public.health_zone_streets.notes, excluded.notes);

