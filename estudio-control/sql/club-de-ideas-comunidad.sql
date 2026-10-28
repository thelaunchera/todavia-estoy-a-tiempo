-- Club de Ideas | Comunidad privada del podcast | 2026-10-28
-- Las compras verificadas y la sesión owner autorizan el acceso; ninguna clave privilegiada en frontend.
begin;

create or replace function public.podcast_club_is_owner()
returns boolean language sql stable security invoker set search_path=public
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.podcast_studio_admins a
  where a.user_id=(select auth.uid()) and a.role='owner'
); $$;

create or replace function public.podcast_club_is_member()
returns boolean language sql stable security invoker set search_path=public
as $$ select public.podcast_club_is_owner() or (
  (select auth.uid()) is not null
  and exists (
    select 1 from public.podcast_class_access a
    where a.buyer_email=lower((select auth.jwt()->>'email'))
      and a.status='active' and a.revoked_at is null
  )
); $$;

create or replace function public.podcast_club_course_member(target_course text)
returns boolean language sql stable security invoker set search_path=public
as $$ select public.podcast_club_is_owner() or (
 (select auth.uid()) is not null
 and exists (
    select 1 from public.podcast_class_access a
    where a.course_id=target_course and a.buyer_email=lower((select auth.jwt()->>'email'))
      and a.status='active' and a.revoked_at is null
 )
); $$;

revoke all on function public.podcast_club_is_owner() from public,anon;
revoke all on function public.podcast_club_is_member() from public,anon;
revoke all on function public.podcast_club_course_member(text) from public,anon;
grant execute on function public.podcast_club_is_owner(), public.podcast_club_is_member(),public.podcast_club_course_member(text) to authenticated;

create table if not exists public.podcast_club_profiles(
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check(char_length(trim(display_name)) between 2 and 32 and position('@' in display_name)=0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.podcast_club_posts(
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  scope text not null default 'club' check(scope in ('club','curso')),
  course_id text,
  channel text not null default 'charla' check(channel in ('charla','proyectos','preguntas')),
  title text check(title is null or char_length(title)<=100),
  body text not null check(char_length(trim(body)) between 2 and 2000),
  image_path text check(image_path is null or (char_length(image_path)<=300 and image_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}[.](png|jpg|webp)$')),
  status text not null default 'visible' check(status in ('visible','oculto')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint club_scope_course_chk check((scope='club' and course_id is null) or (scope='curso' and course_id is not null and length(course_id) between 3 and 100))
);
create table if not exists public.podcast_club_comments(
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.podcast_club_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check(char_length(trim(body)) between 2 and 700),
  status text not null default 'visible' check(status in ('visible','oculto')),
  created_at timestamptz not null default now()
);
create table if not exists public.podcast_club_likes(
  post_id uuid not null references public.podcast_club_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(post_id,author_id)
);
create table if not exists public.podcast_club_reports(
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.podcast_club_posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check(char_length(trim(reason)) between 4 and 300),
  created_at timestamptz not null default now(),
  unique(post_id,reporter_id)
);
create index if not exists podcast_club_posts_created_idx on public.podcast_club_posts(created_at desc);
create index if not exists podcast_club_comments_post_idx on public.podcast_club_comments(post_id,created_at);
create index if not exists podcast_club_likes_post_idx on public.podcast_club_likes(post_id);

alter table public.podcast_club_profiles enable row level security;
alter table public.podcast_club_posts enable row level security;
alter table public.podcast_club_comments enable row level security;
alter table public.podcast_club_likes enable row level security;
alter table public.podcast_club_reports enable row level security;
revoke all on public.podcast_club_profiles,public.podcast_club_posts,public.podcast_club_comments,public.podcast_club_likes,public.podcast_club_reports from anon,authenticated;
grant select,insert,update on public.podcast_club_profiles to authenticated;
grant select,insert,update,delete on public.podcast_club_posts to authenticated;
grant select,insert,update,delete on public.podcast_club_comments to authenticated;
grant select,insert,delete on public.podcast_club_likes to authenticated;
grant select,insert on public.podcast_club_reports to authenticated;

create policy club_profiles_read on public.podcast_club_profiles for select to authenticated
 using(public.podcast_club_is_member());
create policy club_profiles_insert on public.podcast_club_profiles for insert to authenticated
 with check(public.podcast_club_is_member() and user_id=(select auth.uid()));
create policy club_profiles_update on public.podcast_club_profiles for update to authenticated
 using(public.podcast_club_is_member() and user_id=(select auth.uid()))
 with check(public.podcast_club_is_member() and user_id=(select auth.uid()));

create policy club_posts_read on public.podcast_club_posts for select to authenticated
 using(public.podcast_club_is_owner() or
  (status='visible' and public.podcast_club_is_member()
   and (scope='club' or public.podcast_club_course_member(course_id))));
create policy club_posts_insert on public.podcast_club_posts for insert to authenticated
 with check(public.podcast_club_is_member() and author_id=(select auth.uid()) and status='visible'
  and (scope='club' or public.podcast_club_course_member(course_id))
  and (image_path is null or split_part(image_path,'/',1)=(select auth.uid())::text));
create policy club_posts_moderate on public.podcast_club_posts for update to authenticated
 using(public.podcast_club_is_owner()) with check(public.podcast_club_is_owner());
create policy club_posts_delete on public.podcast_club_posts for delete to authenticated
 using((author_id=(select auth.uid()) and public.podcast_club_is_member()) or public.podcast_club_is_owner());

create policy club_comments_read on public.podcast_club_comments for select to authenticated
 using(public.podcast_club_is_owner() or (status='visible' and public.podcast_club_is_member()
 and exists(select 1 from public.podcast_club_posts p where p.id=post_id and p.status='visible')));
create policy club_comments_insert on public.podcast_club_comments for insert to authenticated
 with check(public.podcast_club_is_member() and author_id=(select auth.uid()) and status='visible'
 and exists(select 1 from public.podcast_club_posts p where p.id=post_id and p.status='visible'));
create policy club_comments_moderate on public.podcast_club_comments for update to authenticated
 using(public.podcast_club_is_owner()) with check(public.podcast_club_is_owner());
create policy club_comments_delete on public.podcast_club_comments for delete to authenticated
 using((author_id=(select auth.uid()) and public.podcast_club_is_member()) or public.podcast_club_is_owner());

create policy club_likes_read on public.podcast_club_likes for select to authenticated
 using(public.podcast_club_is_member() and exists(select 1 from public.podcast_club_posts p where p.id=post_id and p.status='visible'));
create policy club_likes_insert on public.podcast_club_likes for insert to authenticated
 with check(public.podcast_club_is_member() and author_id=(select auth.uid())
 and exists(select 1 from public.podcast_club_posts p where p.id=post_id and p.status='visible'));
create policy club_likes_delete on public.podcast_club_likes for delete to authenticated
 using(public.podcast_club_is_member() and author_id=(select auth.uid()));

create policy club_reports_read on public.podcast_club_reports for select to authenticated
 using(public.podcast_club_is_owner() or reporter_id=(select auth.uid()));
create policy club_reports_insert on public.podcast_club_reports for insert to authenticated
 with check(public.podcast_club_is_member() and reporter_id=(select auth.uid())
 and exists(select 1 from public.podcast_club_posts p where p.id=post_id and p.status='visible'));

-- Guard against automated spam without exposing member data.
create or replace function public.podcast_club_rate_limit()
returns trigger language plpgsql security invoker set search_path=public
as $$
declare recent boolean;
begin
 if TG_TABLE_NAME='podcast_club_posts' then
  select exists(select 1 from public.podcast_club_posts where author_id=new.author_id and created_at>now()-interval '15 seconds') into recent;
 else
  select exists(select 1 from public.podcast_club_comments where author_id=new.author_id and created_at>now()-interval '5 seconds') into recent;
 end if;
 if recent then raise exception 'Espera unos segundos antes de publicar otra vez.' using errcode='P0001'; end if;
 return new;
end;
$$;
drop trigger if exists club_posts_cooldown on public.podcast_club_posts;
create trigger club_posts_cooldown before insert on public.podcast_club_posts
 for each row execute function public.podcast_club_rate_limit();
drop trigger if exists club_comments_cooldown on public.podcast_club_comments;
create trigger club_comments_cooldown before insert on public.podcast_club_comments
 for each row execute function public.podcast_club_rate_limit();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('podcast-club-projects','podcast-club-projects',false,5242880,array['image/png','image/jpeg','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
create policy club_images_member_read on storage.objects for select to authenticated
 using(bucket_id='podcast-club-projects' and public.podcast_club_is_member()
 and (
  (storage.foldername(name))[1]=(select auth.uid())::text or public.podcast_club_is_owner()
  or exists(select 1 from public.podcast_club_posts p
     where p.image_path=name and p.status='visible')
 ));
create policy club_images_member_insert on storage.objects for insert to authenticated
 with check(bucket_id='podcast-club-projects' and public.podcast_club_is_member()
 and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy club_images_member_delete on storage.objects for delete to authenticated
 using(bucket_id='podcast-club-projects' and ((storage.foldername(name))[1]=(select auth.uid())::text
 or public.podcast_club_is_owner()));

commit;
