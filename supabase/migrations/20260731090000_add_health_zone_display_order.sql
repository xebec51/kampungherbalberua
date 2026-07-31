-- Kampung Herbal Berua: independent public display order for health zones.
-- zone_code is a permanent QR identity and must never be renumbered once a
-- zone has been published. Public listing order, however, needs to follow
-- whatever order zones appear in in the current HerbaCode source document,
-- which can differ from the order zone_code values were originally assigned
-- in. This column decouples "what order zones are shown in publicly" from
-- "which permanent code a zone has".

alter table public.health_zones
  add column if not exists display_order integer;

comment on column public.health_zones.display_order is
  'Public listing order following the current HerbaCode source document. Independent of the permanent zone_code identity.';

update public.health_zones
set display_order = substring(zone_code from 6)::integer
where display_order is null
  and zone_code ~ '^khb-z[0-9]{2}$';

create index health_zones_display_order_idx on public.health_zones (display_order);
