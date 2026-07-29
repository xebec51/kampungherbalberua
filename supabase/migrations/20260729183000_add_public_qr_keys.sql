-- Kampung Herbal Berua: public immutable QR keys for streets and health zones.
-- zone_code stays only for legacy /z/[code] compatibility and internal admin data.

alter table public.health_zones
  add column if not exists qr_key text;

alter table public.streets
  add column if not exists qr_key text;

update public.health_zones
set qr_key = slug
where qr_key is null or btrim(qr_key) = '';

update public.streets
set qr_key = slug
where qr_key is null or btrim(qr_key) = '';

alter table public.health_zones
  alter column qr_key set not null;

alter table public.streets
  alter column qr_key set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'health_zones_qr_key_key'
      and conrelid = 'public.health_zones'::regclass
  ) then
    alter table public.health_zones
      add constraint health_zones_qr_key_key unique (qr_key);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'health_zones_qr_key_format'
      and conrelid = 'public.health_zones'::regclass
  ) then
    alter table public.health_zones
      add constraint health_zones_qr_key_format
      check (
        qr_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        and qr_key !~ '^khb-z[0-9]{2}$'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'streets_qr_key_key'
      and conrelid = 'public.streets'::regclass
  ) then
    alter table public.streets
      add constraint streets_qr_key_key unique (qr_key);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'streets_qr_key_format'
      and conrelid = 'public.streets'::regclass
  ) then
    alter table public.streets
      add constraint streets_qr_key_format
      check (
        qr_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        and qr_key !~ '^khb-z[0-9]{2}$'
      );
  end if;
end;
$$;

comment on column public.health_zones.qr_key is
  'Public immutable QR identity for /qr/zona/[qrKey]. Do not expose zone_code in new printed QR URLs.';

comment on column public.streets.qr_key is
  'Public immutable QR identity for /qr/jalan/[qrKey], separate from the editable page slug.';

create or replace function public.enforce_public_qr_key()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.qr_key is null or btrim(new.qr_key) = '' then
      new.qr_key := new.slug;
    end if;
  elsif old.qr_key is not null and new.qr_key is distinct from old.qr_key then
    raise exception 'QR key permanen tidak dapat diubah'
      using errcode = '23514';
  end if;

  new.qr_key := lower(btrim(new.qr_key));
  return new;
end;
$$;

drop trigger if exists enforce_health_zones_public_qr_key on public.health_zones;
create trigger enforce_health_zones_public_qr_key
  before insert or update on public.health_zones
  for each row
  execute function public.enforce_public_qr_key();

drop trigger if exists enforce_streets_public_qr_key on public.streets;
create trigger enforce_streets_public_qr_key
  before insert or update on public.streets
  for each row
  execute function public.enforce_public_qr_key();

create index if not exists health_zones_qr_key_idx
  on public.health_zones (qr_key);

create index if not exists streets_qr_key_idx
  on public.streets (qr_key);
