-- Premium prompt catalogue, never embedded into public GitHub Pages JavaScript.
create table if not exists public.content_lab_prompt_catalogue (
 id text primary key check (id ~ '^[0-9]{2}$'),
 category text not null,
 title jsonb not null check (jsonb_typeof(title)='object'),
 body jsonb not null check (jsonb_typeof(body)='object'),
 created_at timestamptz not null default now()
);
alter table public.content_lab_prompt_catalogue enable row level security;
revoke all on public.content_lab_prompt_catalogue from anon,authenticated;
grant select on public.content_lab_prompt_catalogue to authenticated;
drop policy if exists "only authorized users see premium prompt catalogue" on public.content_lab_prompt_catalogue;
create policy "only authorized users see premium prompt catalogue" on public.content_lab_prompt_catalogue
 for select to authenticated
 using (
  exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
  or exists(select 1 from public.content_lab_memberships m
   where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
 );
comment on table public.content_lab_prompt_catalogue is 'Paid prompt library. Seed only from trusted server-side/admin workflow, not repository/frontend.';
