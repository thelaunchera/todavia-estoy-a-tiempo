-- Admin curation of built-in Canvas backgrounds; past saved posts still render.
create table if not exists public.content_lab_hidden_backgrounds (
 id text primary key check(length(id) between 2 and 100 and id ~ '^[a-z0-9-]+$'),
 hidden_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
alter table public.content_lab_hidden_backgrounds enable row level security;
revoke all on public.content_lab_hidden_backgrounds from anon;
grant select,insert,delete on public.content_lab_hidden_backgrounds to authenticated;
create policy "lab members read hidden backgrounds" on public.content_lab_hidden_backgrounds
 for select to authenticated using (
   exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
   or exists(select 1 from public.content_lab_memberships m
     where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
 );
create policy "lab admin hide built in backgrounds" on public.content_lab_hidden_backgrounds
 for insert to authenticated with check (
  hidden_by=(select auth.uid())
  and exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
 );
create policy "lab admin restore built in backgrounds" on public.content_lab_hidden_backgrounds
 for delete to authenticated using (
  exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
 );
