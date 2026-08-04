begin;

select plan(9);

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

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('40000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'products-viewer@test.invalid', 'test', now(), now(), now()),
  ('40000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'products-admin@test.invalid', 'test', now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, display_name, role, is_active)
values
  ('40000000-0000-0000-0000-000000000001', 'Viewer Test', 'viewer', true),
  ('40000000-0000-0000-0000-000000000002', 'Admin Test', 'admin', true)
on conflict (id) do update set role = excluded.role, is_active = excluded.is_active;

set local role anon;
set local request.jwt.claim.role = 'anon';

select is(
  (select count(*) from public.products),
  8::bigint,
  'anon can read the seeded product catalog'
);
select ok(
  pg_temp.throws($$insert into public.products (slug, name, category, description, producer_name) values ('pgtap-anon', 'PGTAP Anon', 'Uji', 'Deskripsi.', 'PGTAP')$$),
  'anon cannot insert a product'
);
select ok(
  pg_temp.throws($$delete from public.products where slug = 'empon-empon'$$),
  'anon cannot delete a product (no delete grant at all)'
);

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '40000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.products),
  8::bigint,
  'non-admin staff can still read products (no publish gate on select)'
);
select ok(
  pg_temp.throws($$insert into public.products (slug, name, category, description, producer_name) values ('pgtap-viewer', 'PGTAP Viewer', 'Uji', 'Deskripsi.', 'PGTAP')$$),
  'non-admin staff cannot insert a product'
);
update public.products set name = 'Hijacked' where slug = 'empon-empon';
select is(
  (select name from public.products where slug = 'empon-empon'),
  'Empon-Empon',
  'non-admin staff update was silently blocked by RLS (name unchanged)'
);

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '40000000-0000-0000-0000-000000000002';

select lives_ok(
  $$insert into public.products (slug, name, category, description, producer_name) values ('pgtap-admin', 'PGTAP Admin', 'Uji', 'Deskripsi.', 'PGTAP')$$,
  'admin can insert a product'
);
select lives_ok(
  $$update public.products set name = 'PGTAP Admin Updated' where slug = 'pgtap-admin'$$,
  'admin can update a product'
);
select lives_ok(
  $$delete from public.products where slug = 'pgtap-admin'$$,
  'admin can delete a product'
);

select * from finish();

rollback;
