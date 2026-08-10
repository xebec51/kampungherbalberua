begin;

select plan(14);

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
  ('41000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'health-conditions-viewer@test.invalid', 'test', now(), now(), now()),
  ('41000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'health-conditions-admin@test.invalid', 'test', now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, display_name, role, is_active)
values
  ('41000000-0000-0000-0000-000000000001', 'Viewer Test', 'viewer', true),
  ('41000000-0000-0000-0000-000000000002', 'Admin Test', 'admin', true)
on conflict (id) do update set role = excluded.role, is_active = excluded.is_active;

set local role anon;
set local request.jwt.claim.role = 'anon';

select is(
  (select count(*) from public.health_conditions),
  10::bigint,
  'anon can read the seeded health condition catalog'
);
select is(
  (select count(*) from public.health_condition_plants),
  80::bigint,
  'anon can read the seeded health condition plant links'
);
select ok(
  pg_temp.throws($$insert into public.health_conditions (slug, name, short_description, description, sort_order) values ('pgtap-anon', 'PGTAP Anon', 'Uji.', 'Deskripsi.', 99)$$),
  'anon cannot insert a health condition'
);
select ok(
  pg_temp.throws($$insert into public.health_condition_plants (health_condition_id, display_name, sort_order) select id, 'PGTAP Anon Plant', 99 from public.health_conditions where slug = 'demam'$$),
  'anon cannot insert a health condition plant link'
);
select ok(
  pg_temp.throws($$delete from public.health_conditions where slug = 'demam'$$),
  'anon cannot delete a health condition (no delete grant at all)'
);

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '41000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.health_conditions),
  10::bigint,
  'non-admin staff can still read health conditions (no publish gate on select)'
);
select ok(
  pg_temp.throws($$insert into public.health_conditions (slug, name, short_description, description, sort_order) values ('pgtap-viewer', 'PGTAP Viewer', 'Uji.', 'Deskripsi.', 99)$$),
  'non-admin staff cannot insert a health condition'
);
update public.health_conditions set name = 'Hijacked' where slug = 'demam';
select is(
  (select name from public.health_conditions where slug = 'demam'),
  'Demam',
  'non-admin staff update was silently blocked by RLS (name unchanged)'
);

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '41000000-0000-0000-0000-000000000002';

select lives_ok(
  $$insert into public.health_conditions (slug, name, short_description, description, sort_order) values ('pgtap-admin', 'PGTAP Admin', 'Uji.', 'Deskripsi.', 99)$$,
  'admin can insert a health condition'
);
select lives_ok(
  $$update public.health_conditions set name = 'PGTAP Admin Updated' where slug = 'pgtap-admin'$$,
  'admin can update a health condition'
);
select lives_ok(
  $$insert into public.health_condition_plants (health_condition_id, plant_id, display_name, sort_order) select id, null, 'PGTAP Admin Plant', 99 from public.health_conditions where slug = 'pgtap-admin'$$,
  'admin can insert a health condition plant link'
);
select lives_ok(
  $$update public.health_condition_plants set display_name = 'PGTAP Admin Plant Updated' where display_name = 'PGTAP Admin Plant'$$,
  'admin can update a health condition plant link'
);
select lives_ok(
  $$delete from public.health_condition_plants where display_name = 'PGTAP Admin Plant Updated'$$,
  'admin can delete a health condition plant link'
);
select lives_ok(
  $$delete from public.health_conditions where slug = 'pgtap-admin'$$,
  'admin can delete a health condition (cascades any remaining plant links)'
);

select * from finish();

rollback;
