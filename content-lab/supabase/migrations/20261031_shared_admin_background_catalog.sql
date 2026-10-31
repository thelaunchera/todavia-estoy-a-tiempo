-- Production catalog: administrator backgrounds are shared read-only with verified members.
-- Buyers' photos, posts, grids, private backgrounds and stickers stay in owner-scoped
-- content_lab_* tables and UUID-prefixed private Storage objects, untouched here.
create table if not exists public.content_lab_background_catalog (
 id uuid primary key default gen_random_uuid(),
 created_by uuid not null references auth.users(id),
 path text not null unique check (path like 'shared-backgrounds/%'),
 name text not null check (length(btrim(name)) between 1 and 120),
 category text not null default 'Editoriales',
 mime text not null check (mime in ('image/png','image/jpeg','image/webp')),
 sha256 text not null unique check (sha256 ~ '^[0-9a-f]{64}$'),
 size_bytes integer not null check (size_bytes between 200 and 5000000),
 published boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.content_lab_background_catalog enable row level security;
revoke all on public.content_lab_background_catalog from anon;
grant select,insert,update,delete on public.content_lab_background_catalog to authenticated;
drop policy if exists "lab paid shared background catalog read" on public.content_lab_background_catalog;
create policy "lab paid shared background catalog read"
 on public.content_lab_background_catalog for select to authenticated
 using (published and (
   exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
   or exists(select 1 from public.content_lab_memberships m
      where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
 ));
drop policy if exists "lab admin publish shared backgrounds" on public.content_lab_background_catalog;
create policy "lab admin publish shared backgrounds"
 on public.content_lab_background_catalog for insert to authenticated
 with check (
   created_by=(select auth.uid())
   and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
 );
drop policy if exists "lab admin remove shared backgrounds" on public.content_lab_background_catalog;
create policy "lab admin remove shared backgrounds"
 on public.content_lab_background_catalog for delete to authenticated
 using (exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid())));
drop policy if exists "lab admin edit shared backgrounds" on public.content_lab_background_catalog;
create policy "lab admin edit shared backgrounds"
 on public.content_lab_background_catalog for update to authenticated
 using (created_by=(select auth.uid()) and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid())))
 with check (created_by=(select auth.uid()) and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid())));
-- The single bucket remains PRIVATE (public=false). Do not ever add a public URL.
drop policy if exists "lab admin upload shared backgrounds" on storage.objects;
create policy "lab admin upload shared backgrounds" on storage.objects
 for insert to authenticated
 with check (bucket_id='content-lab-private'
   and (storage.foldername(name))[1]='shared-backgrounds'
   and lower(storage.extension(name)) in ('png','jpg','jpeg','webp')
   and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid())));
drop policy if exists "lab paid shared backgrounds storage read" on storage.objects;
create policy "lab paid shared backgrounds storage read" on storage.objects
 for select to authenticated using (
   bucket_id='content-lab-private'
   and (storage.foldername(name))[1]='shared-backgrounds'
   and exists(select 1 from public.content_lab_background_catalog c
       where c.path=objects.name and c.published)
   and (
     exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
     or exists(select 1 from public.content_lab_memberships m
       where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
   )
 );
drop policy if exists "lab admin delete shared backgrounds" on storage.objects;
create policy "lab admin delete shared backgrounds" on storage.objects
 for delete to authenticated using (
  bucket_id='content-lab-private'
  and (storage.foldername(name))[1]='shared-backgrounds'
  and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
 );
