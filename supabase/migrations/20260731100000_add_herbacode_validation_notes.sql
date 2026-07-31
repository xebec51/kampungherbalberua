-- Kampung Herbal Berua: rejection-reason parity for HerbaCode entries.
--
-- plants.validation_notes and health_zones.validation_notes already exist;
-- herbacode_plant_zone_entries has no equivalent free-text reviewer-notes
-- column, so the admin dashboard's "Tandai Perlu Perbaikan" action has
-- nowhere consistent to store a rejection reason for this content type. This
-- adds one nullable text column, mirroring the other two tables exactly.
-- Purely additive: no trigger, RLS, or enum change.

alter table public.herbacode_plant_zone_entries
  add column if not exists validation_notes text;

comment on column public.herbacode_plant_zone_entries.validation_notes is
  'Optional notes from content checking, including the reason when validation_status is rejected.';
