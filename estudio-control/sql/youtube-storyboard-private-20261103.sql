-- Fuera de Brief / YouTube · Biblioteca visual privada del Studio.
-- Solo la propietaria autenticada puede subir, ver, reemplazar y borrar fotos.
-- El público, el aula y el catálogo comercial no reciben acceso.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('podcast-youtube-storyboard','podcast-youtube-storyboard',false,15000000,
        array['image/png','image/jpeg','image/webp']::text[])
on conflict(id) do nothing;

create table if not exists public.podcast_youtube_photo_assets (
  user_id uuid not null references auth.users(id) on delete cascade,
  shot_id text not null check(shot_id ~ '^E0[1-8]-F(0[1-9]|10)$'),
  episode smallint not null check(episode between 1 and 8),
  object_path text not null,
  file_name text not null check(char_length(file_name) between 1 and 180),
  file_size integer not null check(file_size between 1 and 15000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(user_id, shot_id),
  constraint youtube_shot_episode_matches check(substring(shot_id from 2 for 2)::int = episode),
  constraint youtube_shot_path_matches check (
    object_path like (user_id::text || '/' || lpad(episode::text,2,'0') || '/' || shot_id || '/%')
  )
);
alter table public.podcast_youtube_photo_assets enable row level security;
revoke all on public.podcast_youtube_photo_assets from anon;
grant select,insert,update,delete on public.podcast_youtube_photo_assets to authenticated;
create policy "youtube photos owner only"
on public.podcast_youtube_photo_assets for all to authenticated
using (
  user_id = (select auth.uid())
  and exists (select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
)
with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
);

-- Guardar cada imagen como {uid}/{ep}/E01-F01/{uuid}.{png|jpg|webp}
create policy "youtube storyboard owner upload"
on storage.objects for insert to authenticated with check(
  bucket_id='podcast-youtube-storyboard'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and (storage.foldername(name))[2]~'^0[1-8]$'
  and (storage.foldername(name))[3]~'^E0[1-8]-F(0[1-9]|10)$'
  and exists(select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
);
create policy "youtube storyboard owner read"
on storage.objects for select to authenticated using(
  bucket_id='podcast-youtube-storyboard'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists(select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
);
create policy "youtube storyboard owner delete"
on storage.objects for delete to authenticated using(
  bucket_id='podcast-youtube-storyboard'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists(select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
);
