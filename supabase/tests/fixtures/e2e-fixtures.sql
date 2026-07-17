-- Local-only E2E fixtures. Do not load this file into production.

do $$
declare
  test_password text := 'TestPassword123!';
begin
  delete from public.health_zones
  where zone_code between 'khb-z90' and 'khb-z99'
     or slug like 'e2e-%';

  delete from public.plants
  where slug like 'e2e-%'
     or local_name like 'E2E-%';

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  ) values
    ('00000000-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'viewer@test.invalid', crypt(test_password, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
    ('00000000-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'editor@test.invalid', crypt(test_password, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
    ('00000000-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'validator@test.invalid', crypt(test_password, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
    ('00000000-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'admin@test.invalid', crypt(test_password, gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false)
  on conflict (id) do update set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    updated_at = now(),
    raw_app_meta_data = excluded.raw_app_meta_data;

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values
    ('40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '{"sub":"40000000-0000-0000-0000-000000000001","email":"viewer@test.invalid"}', 'email', 'viewer@test.invalid', now(), now(), now()),
    ('40000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '{"sub":"40000000-0000-0000-0000-000000000002","email":"editor@test.invalid"}', 'email', 'editor@test.invalid', now(), now(), now()),
    ('40000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', '{"sub":"40000000-0000-0000-0000-000000000003","email":"validator@test.invalid"}', 'email', 'validator@test.invalid', now(), now(), now()),
    ('40000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', '{"sub":"40000000-0000-0000-0000-000000000004","email":"admin@test.invalid"}', 'email', 'admin@test.invalid', now(), now(), now())
  on conflict (provider, provider_id) do update set
    user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = now();

  insert into public.profiles (id, display_name, role, is_active)
  values
    ('40000000-0000-0000-0000-000000000001', 'E2E Viewer', 'viewer', true),
    ('40000000-0000-0000-0000-000000000002', 'E2E Editor', 'editor', true),
    ('40000000-0000-0000-0000-000000000003', 'E2E Validator', 'validator', true),
    ('40000000-0000-0000-0000-000000000004', 'E2E Admin', 'admin', true)
  on conflict (id) do update set
    display_name = excluded.display_name,
    role = excluded.role,
    is_active = excluded.is_active;
end $$;
