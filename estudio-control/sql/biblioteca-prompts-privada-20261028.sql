-- Biblioteca de prompts: contenido almacenado en Supabase, nunca en HTML/JS públicos.
create table if not exists public.podcast_class_prompts (
 course_id text not null,
 prompt_code text not null,
 position integer not null default 0,
 category text not null,
 title text not null,
 summary text not null default '',
 body text not null,
 status text not null default 'draft' check (status in ('draft','ready')),
 updated_at timestamptz not null default now(),
 primary key (course_id,prompt_code)
);
create index if not exists podcast_class_prompts_course_pos on public.podcast_class_prompts(course_id,position);
alter table public.podcast_class_prompts enable row level security;
revoke all on table public.podcast_class_prompts from anon, authenticated;
grant select, insert, update, delete on table public.podcast_class_prompts to authenticated;

create policy class_prompts_paid_or_owner_select on public.podcast_class_prompts
for select to authenticated
using ((select auth.uid()) is not null and (
 exists (select 1 from public.podcast_studio_admins s
   where s.user_id=(select auth.uid()) and s.role='owner')
 or (status='ready' and exists (
  select 1 from public.podcast_class_access a
  where a.course_id=podcast_class_prompts.course_id
  and a.buyer_email=lower((select auth.jwt()->>'email'))
  and a.status='active' and a.revoked_at is null))
));
create policy class_prompts_owner_insert on public.podcast_class_prompts
for insert to authenticated with check (exists (select 1 from public.podcast_studio_admins s
where s.user_id=(select auth.uid()) and s.role='owner'));
create policy class_prompts_owner_update on public.podcast_class_prompts
for update to authenticated using (exists (select 1 from public.podcast_studio_admins s
where s.user_id=(select auth.uid()) and s.role='owner'))
with check (exists (select 1 from public.podcast_studio_admins s
where s.user_id=(select auth.uid()) and s.role='owner'));
create policy class_prompts_owner_delete on public.podcast_class_prompts
for delete to authenticated using (exists (select 1 from public.podcast_studio_admins s
where s.user_id=(select auth.uid()) and s.role='owner'));