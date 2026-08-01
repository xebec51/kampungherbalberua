begin;

select plan(6);

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

create function pg_temp.lives(sql text)
returns boolean
language plpgsql
as $$
begin
  execute sql;
  return true;
exception when others then
  return false;
end;
$$;

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values ('31000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin-plant-qr@test.invalid', 'test', now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, display_name, role, is_active)
values ('31000000-0000-0000-0000-000000000001', 'Admin Plant QR Test', 'admin', true)
on conflict (id) do update set role = excluded.role, is_active = excluded.is_active;

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '31000000-0000-0000-0000-000000000001';

select ok(pg_temp.lives($$insert into public.plants (slug, local_name, category, short_description, description, content_status) values ('pgtap-qr-plant', 'QR Plant', 'rimpang', 'Short', 'Desc', 'draft')$$), 'admin can insert draft plant');

select is((select qr_key from public.plants where slug = 'pgtap-qr-plant'), 'pgtap-qr-plant', 'qr_key defaults to slug on insert');

select ok(pg_temp.lives($$update public.plants set slug = 'pgtap-qr-plant-baru' where slug = 'pgtap-qr-plant'$$), 'slug can change after creation');

select is((select qr_key from public.plants where slug = 'pgtap-qr-plant-baru'), 'pgtap-qr-plant', 'slug change does not change public qr_key');

select ok(pg_temp.throws($$update public.plants set qr_key = 'pgtap-qr-plant-new' where slug = 'pgtap-qr-plant-baru'$$), 'public qr_key cannot change after creation');

select ok(pg_temp.throws($$insert into public.plants (slug, local_name, category, short_description, description, qr_key, content_status) values ('pgtap-bad-qr-plant', 'Bad QR Plant', 'rimpang', 'Short', 'Desc', 'khb-z89', 'draft')$$), 'plant public qr_key cannot use legacy zone_code pattern');

select * from finish();

rollback;
