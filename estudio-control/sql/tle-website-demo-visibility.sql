-- Applied to the production podcast project fhrvuhikrybobidxpvnh on 2026-11-08.
-- Public editorial visibility only; never reuse for Aula publication or client auth.
-- Absence of a demo row intentionally means "visible" (legacy portfolio default).
create table if not exists public.tle_website_demo_visibility (
  demo_id text primary key check (demo_id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.tle_website_demo_visibility enable row level security;
grant select on table public.tle_website_demo_visibility to anon, authenticated;
grant insert, update on table public.tle_website_demo_visibility to authenticated;
create policy tle_website_demo_visibility_public_read
  on public.tle_website_demo_visibility for select to anon, authenticated using (true);
create policy tle_website_demo_visibility_owner_insert
  on public.tle_website_demo_visibility for insert to authenticated
  with check (exists (select 1 from public.podcast_studio_admins a
    where a.user_id=(select auth.uid()) and a.role='owner'));
create policy tle_website_demo_visibility_owner_update
  on public.tle_website_demo_visibility for update to authenticated
  using (exists (select 1 from public.podcast_studio_admins a
    where a.user_id=(select auth.uid()) and a.role='owner'))
  with check (exists (select 1 from public.podcast_studio_admins a
    where a.user_id=(select auth.uid()) and a.role='owner'));
comment on table public.tle_website_demo_visibility is 'Public read-only demo selection for Website of Websites; authenticated Studio owner controls writes.';
