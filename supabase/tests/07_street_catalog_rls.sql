begin;

select plan(7);

create function pg_temp.throws(sql text)
returns boolean
language plpgsql
as $$
begin
  execute sql;
  return false;
exception when others then
  return true;
end;
$$;

insert into public.streets (
  slug,
  street_name,
  description,
  validation_status,
  content_status
) values
  ('pgtap-public-street', 'Jl. PGTAP Public', 'Published street', 'pending', 'published'),
  ('pgtap-draft-street', 'Jl. PGTAP Draft', 'Draft street', 'pending', 'draft')
on conflict (slug) do update set
  content_status = excluded.content_status,
  street_name = excluded.street_name;

insert into public.media_assets (
  asset_code,
  title,
  alt_text,
  media_kind,
  image_type,
  public_bucket,
  public_path,
  mime_type,
  checksum_sha256,
  source_type,
  rights_status,
  privacy_status,
  content_status
) values (
  'pgtap-street-board',
  'Papan tanaman di Jl. PGTAP Public',
  'Papan tanaman di Jl. PGTAP Public',
  'image',
  'documentation',
  'media-public',
  'streets/pgtap-public-street.jpg',
  'image/jpeg',
  '0000000000000000000000000000000000000000000000000000000000000001',
  'kkn_documentation',
  'approved',
  'approved',
  'published'
)
on conflict (asset_code) do update set
  content_status = excluded.content_status,
  rights_status = excluded.rights_status,
  privacy_status = excluded.privacy_status;

insert into public.street_media (street_id, media_id, role, sort_order, is_primary)
select s.id, m.id, 'board', 0, true
from public.streets s
join public.media_assets m on m.asset_code = 'pgtap-street-board'
where s.slug = 'pgtap-public-street'
on conflict (street_id, media_id) do update set is_primary = excluded.is_primary;

insert into public.street_plant_entries (
  street_id,
  raw_plant_name,
  normalized_name,
  sort_order,
  match_status,
  content_status
)
select id, 'PGTAP Street Plant', 'pgtap street plant', 1, 'unresolved', 'published'
from public.streets
where slug = 'pgtap-public-street'
on conflict (street_id, sort_order) do update set
  raw_plant_name = excluded.raw_plant_name,
  content_status = excluded.content_status;

insert into public.street_plant_entries (
  street_id,
  raw_plant_name,
  normalized_name,
  sort_order,
  match_status,
  content_status
)
select id, 'PGTAP Draft Street Plant', 'pgtap draft street plant', 1, 'unresolved', 'published'
from public.streets
where slug = 'pgtap-draft-street'
on conflict (street_id, sort_order) do update set
  raw_plant_name = excluded.raw_plant_name,
  content_status = excluded.content_status;

set local role anon;
set local request.jwt.claim.role = 'anon';

select is((select count(*) from public.street_media sm join public.streets s on s.id = sm.street_id where s.slug like 'pgtap-%'), 1::bigint, 'anon can read published street media');
select is((select count(*) from public.street_plant_entries spe join public.streets s on s.id = spe.street_id where s.slug like 'pgtap-%'), 1::bigint, 'anon can read entries only for published streets');
select ok(pg_temp.throws($$insert into public.street_media (street_id, media_id, role) select s.id, m.id, 'anon' from public.streets s cross join public.media_assets m limit 1$$), 'anon cannot insert street media');
select ok(pg_temp.throws($$insert into public.street_plant_entries (street_id, raw_plant_name, normalized_name, sort_order) select id, 'Anon', 'anon', 9 from public.streets limit 1$$), 'anon cannot insert street plant entry');

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';

select is((select count(*) from public.street_media sm join public.streets s on s.id = sm.street_id where s.slug like 'pgtap-%'), 1::bigint, 'viewer can read published street media');
select is((select count(*) from public.street_plant_entries spe join public.streets s on s.id = spe.street_id where s.slug like 'pgtap-%'), 1::bigint, 'viewer can read published street plant entry');
delete from public.street_media;
select is((select count(*) from public.street_media sm join public.streets s on s.id = sm.street_id where s.slug like 'pgtap-%'), 1::bigint, 'viewer cannot delete street media');

select * from finish();

rollback;
