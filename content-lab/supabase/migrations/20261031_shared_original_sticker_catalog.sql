-- Shared ORIGINAL Content Lab sticker catalogue for verified paying buyers.
-- Separate from each buyer's private media; no public, anonymous or cross-brand writes.
create table if not exists public.content_lab_sticker_catalog (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  path text not null unique check (path ~ '^shared-stickers/[0-9a-f-]{36}\\.png$'),
  name text not null check(length(name) between 1 and 120),
  category text not null check(category in ('Avatares','Matcha','Pilates','Ejercicios','Aesthetic')),
  sha256 text not null unique check (sha256 ~ '^[0-9a-f]{64}$'),
  size_bytes integer not null check(size_bytes > 200 and size_bytes <= 5000000),
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists content_lab_stickers_category_idx on public.content_lab_sticker_catalog(category);
alter table public.content_lab_sticker_catalog enable row level security;
revoke all on public.content_lab_sticker_catalog from anon,authenticated;
grant select,insert,delete on public.content_lab_sticker_catalog to authenticated;
drop policy if exists "lab paid sticker catalog read" on public.content_lab_sticker_catalog;
create policy "lab paid sticker catalog read" on public.content_lab_sticker_catalog
  for select to authenticated using (
    published
    and (exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
    or exists(select 1 from public.content_lab_memberships m where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active'))
  );
drop policy if exists "lab admin publish original sticker" on public.content_lab_sticker_catalog;
create policy "lab admin publish original sticker" on public.content_lab_sticker_catalog
  for insert to authenticated with check (
    created_by=(select auth.uid())
    and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
  );
drop policy if exists "lab admin delete original sticker" on public.content_lab_sticker_catalog;
create policy "lab admin delete original sticker" on public.content_lab_sticker_catalog
  for delete to authenticated using (
    exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
  );
-- The existing PRIVATE storage bucket retains the default owner-only
-- policies. Only a dedicated 'shared-stickers/' prefix is accessible to buyers.
drop policy if exists "lab paid shared stickers storage read" on storage.objects;
create policy "lab paid shared stickers storage read" on storage.objects
  for select to authenticated using (
   bucket_id='content-lab-private'
   and (storage.foldername(name))[1]='shared-stickers'
   and (exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
   or exists(select 1 from public.content_lab_memberships m where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active'))
  );
drop policy if exists "lab admin upload shared stickers" on storage.objects;
create policy "lab admin upload shared stickers" on storage.objects
  for insert to authenticated with check (
   bucket_id='content-lab-private'
   and (storage.foldername(name))[1]='shared-stickers'
   and lower(storage.extension(name))='png'
   and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
  );
drop policy if exists "lab admin delete shared stickers" on storage.objects;
create policy "lab admin delete shared stickers" on storage.objects
  for delete to authenticated using (
   bucket_id='content-lab-private'
   and (storage.foldername(name))[1]='shared-stickers'
   and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
  );
comment on table public.content_lab_sticker_catalog is 'Curated original transparent PNG stickers shared read-only with active paid Content Lab buyers. Admin-only uploads.';
