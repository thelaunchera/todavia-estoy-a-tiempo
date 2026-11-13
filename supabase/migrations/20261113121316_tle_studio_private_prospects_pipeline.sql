-- Private prospects board for the owner Studio only. Applied to podcast Supabase project on 2026-11-13.
create table if not exists public.tle_studio_prospects (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 business_name text not null check (char_length(business_name) between 1 and 160),
 contact_name text not null default '' check (char_length(contact_name)<=140),
 phone text not null default '' check (char_length(phone)<=50),
 email text not null default '' check (char_length(email)<=180),
 city text not null default '' check (char_length(city)<=120),
 state text not null default '' check (char_length(state)<=80),
 service text not null default 'website' check (service in ('website','menu','both','other')),
 website_status text not null default 'unverified' check (website_status in ('unverified','none','social_only','exists')),
 website_url text not null default '' check (char_length(website_url)<=500),
 source_url text not null default '' check (char_length(source_url)<=500),
 notes text not null default '' check (char_length(notes)<=4000),
 next_follow_up date,
 estimated_value numeric(12,2) not null default 0 check (estimated_value between 0 and 100000000),
 stage text not null default 'found' check (stage in ('found','qualified','contacted','proposal','won','lost')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists tle_studio_prospects_owner_created_idx
 on public.tle_studio_prospects (owner_id, created_at desc);
alter table public.tle_studio_prospects enable row level security;
revoke all on table public.tle_studio_prospects from public,anon,authenticated;
grant select,insert,update,delete on table public.tle_studio_prospects to authenticated;
create policy tle_studio_prospects_owner_select on public.tle_studio_prospects
 for select to authenticated
 using (owner_id=(select auth.uid()) and exists(select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid())));
create policy tle_studio_prospects_owner_insert on public.tle_studio_prospects
 for insert to authenticated
 with check (owner_id=(select auth.uid()) and exists(select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid())));
create policy tle_studio_prospects_owner_update on public.tle_studio_prospects
 for update to authenticated
 using (owner_id=(select auth.uid()) and exists(select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid())))
 with check (owner_id=(select auth.uid()) and exists(select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid())));
create policy tle_studio_prospects_owner_delete on public.tle_studio_prospects
 for delete to authenticated
 using (owner_id=(select auth.uid()) and exists(select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid())));