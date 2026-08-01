-- Kampung Herbal Berua: public immutable QR key for plants (tanaman).
-- Mirrors 20260729183000_add_public_qr_keys.sql (streets, health_zones) so a
-- printed plant QR keeps working even if the plant's editable slug changes.

alter table public.plants
  add column if not exists qr_key text;

update public.plants
set qr_key = slug
where qr_key is null or btrim(qr_key) = '';

alter table public.plants
  alter column qr_key set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'plants_qr_key_key'
      and conrelid = 'public.plants'::regclass
  ) then
    alter table public.plants
      add constraint plants_qr_key_key unique (qr_key);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'plants_qr_key_format'
      and conrelid = 'public.plants'::regclass
  ) then
    alter table public.plants
      add constraint plants_qr_key_format
      check (
        qr_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        and qr_key !~ '^khb-z[0-9]{2}$'
      );
  end if;
end;
$$;

comment on column public.plants.qr_key is
  'Public immutable QR identity for /qr/tanaman/[qrKey], separate from the editable page slug.';

-- Reuses the generic trigger function already defined for streets/health_zones
-- (public.enforce_public_qr_key): defaults qr_key to slug on insert, rejects
-- any update once set.
drop trigger if exists enforce_plants_public_qr_key on public.plants;
create trigger enforce_plants_public_qr_key
  before insert or update on public.plants
  for each row
  execute function public.enforce_public_qr_key();

create index if not exists plants_qr_key_idx
  on public.plants (qr_key);
