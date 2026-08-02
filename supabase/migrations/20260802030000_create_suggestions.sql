-- Kampung Herbal Berua: kotak saran (resident suggestion box).
-- Public visitors may submit a suggestion (with or without their name and
-- contact info); only authenticated admins can read or update submissions.

create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  content text not null,
  location text,
  submitter_name text,
  submitter_contact text,
  is_anonymous boolean not null default false,
  status text not null default 'baru',
  created_at timestamptz not null default now()
);

comment on table public.suggestions is
  'Saran/aspirasi warga dari formulir publik di /kotak-saran. Hanya admin yang dapat membaca dan memperbarui statusnya.';
comment on column public.suggestions.status is
  'Status tindak lanjut internal: baru atau selesai.';
comment on column public.suggestions.is_anonymous is
  'true bila warga memilih kirim anonim; submitter_name/submitter_contact kosong pada kondisi ini.';

alter table public.suggestions enable row level security;

create policy "suggestions_insert_public"
  on public.suggestions
  for insert
  to anon, authenticated
  with check (
    btrim(category) <> ''
    and btrim(title) <> ''
    and btrim(content) <> ''
  );

create policy "suggestions_select_admin"
  on public.suggestions
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "suggestions_update_admin"
  on public.suggestions
  for update
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role)
  with check (public.current_user_role() = 'admin'::public.app_role);

create index suggestions_created_at_idx on public.suggestions (created_at desc);
create index suggestions_status_idx on public.suggestions (status);

grant select, insert on public.suggestions to anon;
grant select, insert, update on public.suggestions to authenticated;
grant select, insert, update, delete on public.suggestions to service_role;
