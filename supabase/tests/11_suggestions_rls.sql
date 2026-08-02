begin;

select plan(8);

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
  ('30000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'suggestions-viewer@test.invalid', 'test', now(), now(), now()),
  ('30000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'suggestions-admin@test.invalid', 'test', now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, display_name, role, is_active)
values
  ('30000000-0000-0000-0000-000000000001', 'Viewer Test', 'viewer', true),
  ('30000000-0000-0000-0000-000000000002', 'Admin Test', 'admin', true)
on conflict (id) do update set role = excluded.role, is_active = excluded.is_active;

set local role anon;
set local request.jwt.claim.role = 'anon';

select lives_ok(
  $$insert into public.suggestions (category, title, content, is_anonymous) values ('Lingkungan', 'PGTAP anon suggestion', 'Isi saran PGTAP.', true)$$,
  'anon can submit a suggestion'
);
select ok(
  pg_temp.throws($$insert into public.suggestions (category, title, content) values ('Lingkungan', '', 'Isi saran PGTAP.')$$),
  'anon cannot submit a suggestion with an empty title'
);
select is(
  (select count(*) from public.suggestions),
  0::bigint,
  'anon cannot read any suggestions'
);

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.suggestions),
  0::bigint,
  'non-admin staff cannot read suggestions'
);
update public.suggestions set status = 'selesai' where title = 'PGTAP anon suggestion';

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000002';

select is(
  (select count(*) from public.suggestions where title = 'PGTAP anon suggestion'),
  1::bigint,
  'admin can read submitted suggestions'
);
select is(
  (select status from public.suggestions where title = 'PGTAP anon suggestion'),
  'baru',
  'non-admin staff update was silently blocked by RLS (status still baru)'
);
select lives_ok(
  $$update public.suggestions set status = 'selesai' where title = 'PGTAP anon suggestion'$$,
  'admin can update suggestion status'
);
select is(
  (select status from public.suggestions where title = 'PGTAP anon suggestion'),
  'selesai',
  'suggestion status is updated to selesai'
);

select * from finish();

rollback;
