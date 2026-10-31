-- User-owned prompt recipes; separate from 8 free publicly visible master prompts.
create table if not exists public.content_lab_prompts(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload)='object' and pg_column_size(payload)<25000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists content_lab_prompts_owner_idx on public.content_lab_prompts(owner_id,updated_at desc);
alter table public.content_lab_prompts enable row level security;
grant select,insert,update,delete on public.content_lab_prompts to authenticated;
revoke all on public.content_lab_prompts from anon;
drop policy if exists "prompt owner and verified member" on public.content_lab_prompts;
create policy "prompt owner and verified member" on public.content_lab_prompts
 for all to authenticated
 using (
  owner_id=(select auth.uid()) and (
    exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
    or exists(select 1 from public.content_lab_memberships m
      where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
  )
 )
 with check (
  owner_id=(select auth.uid()) and (
    exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
    or exists(select 1 from public.content_lab_memberships m
      where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
  )
 );
-- For clarity, owner_id cannot be reassigned through a browser UPDATE.
revoke update(owner_id) on public.content_lab_prompts from authenticated;
comment on table public.content_lab_prompts is 'Private prompt recipes for one authenticated active buyer or admin; never exposed by public freebie.';
