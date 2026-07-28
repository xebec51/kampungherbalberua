-- Kampung Herbal Berua: media quality review and attachment history.
-- Internal audit metadata only. Public media visibility policies are unchanged.

drop index if exists public.plant_source_label_media_source_slug_idx;

create index if not exists plant_source_label_media_source_slug_lookup_idx
  on public.plant_source_label_media (source_id, slug);

create table public.media_quality_reviews (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_assets (id) on delete cascade,
  entity_type text not null,
  entity_key text not null,
  relevance_status text not null,
  quality_status text not null,
  duplicate_status text not null default 'unique',
  review_notes text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_quality_reviews_entity_type_allowed check (
    entity_type in (
      'plant',
      'poster_plant',
      'health_zone',
      'recipe',
      'product',
      'activity',
      'program',
      'team',
      'site',
      'map'
    )
  ),
  constraint media_quality_reviews_relevance_status_allowed check (
    relevance_status in (
      'exact',
      'common_name_match',
      'corrected_spelling_match',
      'material_match',
      'illustration_reference',
      'generic_fallback',
      'irrelevant',
      'needs_review'
    )
  ),
  constraint media_quality_reviews_quality_status_allowed check (
    quality_status in (
      'approved',
      'acceptable',
      'low_resolution',
      'poor_crop',
      'misleading',
      'broken',
      'needs_review'
    )
  ),
  constraint media_quality_reviews_duplicate_status_allowed check (
    duplicate_status in (
      'unique',
      'intentionally_reused',
      'generic_reuse',
      'excessive_reuse'
    )
  ),
  constraint media_quality_reviews_entity_key_not_blank check (btrim(entity_key) <> '')
);

create unique index media_quality_reviews_entity_media_idx
  on public.media_quality_reviews (media_id, entity_type, entity_key);

create index media_quality_reviews_media_id_idx
  on public.media_quality_reviews (media_id);

create index media_quality_reviews_entity_idx
  on public.media_quality_reviews (entity_type, entity_key);

create index media_quality_reviews_relevance_idx
  on public.media_quality_reviews (relevance_status);

create trigger set_media_quality_reviews_updated_at
  before update on public.media_quality_reviews
  for each row
  execute function public.set_updated_at();

create table public.media_attachment_history (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_key text not null,
  old_media_id uuid references public.media_assets (id) on delete set null,
  new_media_id uuid not null references public.media_assets (id) on delete restrict,
  action text not null,
  changed_by uuid references public.profiles (id),
  change_reason text,
  created_at timestamptz not null default now(),
  constraint media_attachment_history_entity_type_allowed check (
    entity_type in (
      'plant',
      'poster_plant',
      'health_zone',
      'recipe',
      'product',
      'activity',
      'program',
      'team',
      'site',
      'map'
    )
  ),
  constraint media_attachment_history_action_allowed check (
    action in ('attach', 'replace_primary', 'mark_non_primary', 'restore', 'classify')
  ),
  constraint media_attachment_history_entity_key_not_blank check (btrim(entity_key) <> '')
);

create index media_attachment_history_entity_idx
  on public.media_attachment_history (entity_type, entity_key, created_at desc);

create index media_attachment_history_new_media_idx
  on public.media_attachment_history (new_media_id);

alter table public.media_quality_reviews enable row level security;
alter table public.media_attachment_history enable row level security;

grant select, insert, update, delete on public.media_quality_reviews to authenticated;
grant select, insert on public.media_attachment_history to authenticated;
grant select, insert, update, delete on public.media_quality_reviews to service_role;
grant select, insert, update, delete on public.media_attachment_history to service_role;

create policy "media_quality_reviews_select_staff"
  on public.media_quality_reviews
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "media_quality_reviews_insert_editor_admin"
  on public.media_quality_reviews
  for insert
  to authenticated
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );

create policy "media_quality_reviews_update_validator_admin"
  on public.media_quality_reviews
  for update
  to authenticated
  using (
    public.current_user_role() in (
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  )
  with check (
    public.current_user_role() in (
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "media_quality_reviews_delete_admin"
  on public.media_quality_reviews
  for delete
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create policy "media_attachment_history_select_staff"
  on public.media_attachment_history
  for select
  to authenticated
  using (
    public.current_user_role() in (
      'editor'::public.app_role,
      'validator'::public.app_role,
      'admin'::public.app_role
    )
  );

create policy "media_attachment_history_insert_editor_admin"
  on public.media_attachment_history
  for insert
  to authenticated
  with check (
    public.current_user_role() in ('editor'::public.app_role, 'admin'::public.app_role)
  );
