
-- Content Lab data lives in the EXISTING podcast Supabase project, but all Content Lab tables, Storage and RLS policies are isolated.
-- Do NOT touch existing podcast_* tables or Cleaning App data.
create extension if not exists pgcrypto;
create table if not exists public.content_lab_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.content_lab_admins enable row level security;
revoke all on public.content_lab_admins from anon,authenticated;
grant select on public.content_lab_admins to authenticated;
drop policy if exists "lab admin reads own authorization" on public.content_lab_admins;
create policy "lab admin reads own authorization" on public.content_lab_admins
  for select to authenticated using(user_id=(select auth.uid()));

-- Reuse ONLY the already-approved podcast Studio owner (never all podcast users).
-- No personal identifiers are stored in GitHub.
do $$
declare table_name text;
begin
 foreach table_name in array array['brands','posts','assets','grids'] loop
  execute format(
   'create table if not exists public.%I (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade, payload jsonb not null default ''{}''::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now())',
   'content_lab_'||table_name);
  execute format('alter table public.%I enable row level security','content_lab_'||table_name);
  execute format('revoke all on public.%I from anon','content_lab_'||table_name);
  execute format('grant select,insert,update,delete on public.%I to authenticated','content_lab_'||table_name);
  execute format('drop policy if exists "lab authorized owner only" on public.%I','content_lab_'||table_name);
  execute format(
    'create policy "lab authorized owner only" on public.%I for all to authenticated using (owner_id=(select auth.uid()) and exists (select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))) with check (owner_id=(select auth.uid()) and exists (select 1 from public.content_lab_admins a where a.user_id=(select auth.uid())))',
    'content_lab_'||table_name);
 end loop;
end $$;
-- Private image storage. Access controlled by owner UUID prefix AND admin membership.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('content-lab-private','content-lab-private',false,8000000,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "lab private storage read" on storage.objects;
drop policy if exists "lab private storage create" on storage.objects;
drop policy if exists "lab private storage delete" on storage.objects;
create policy "lab private storage read" on storage.objects for select to authenticated
 using(bucket_id='content-lab-private' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid())));
create policy "lab private storage create" on storage.objects for insert to authenticated
 with check(bucket_id='content-lab-private' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid())));
create policy "lab private storage delete" on storage.objects for delete to authenticated
 using(bucket_id='content-lab-private' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid())));

-- Grant only existing podcast Studio owner access to the isolated Content Lab tables.
insert into public.content_lab_admins(user_id)
select user_id from public.podcast_studio_admins where role='owner'
on conflict (user_id) do nothing;
