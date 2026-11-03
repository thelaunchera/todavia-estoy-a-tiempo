-- Extiende la biblioteca privada a los ocho frames estacionales (EP05 y EP08).
alter table public.podcast_youtube_photo_assets
  drop constraint if exists podcast_youtube_photo_assets_shot_id_check;
alter table public.podcast_youtube_photo_assets
  add constraint youtube_storyboard_valid_shot_id check (
    shot_id ~ '^E0[1-8]-F(0[1-9]|10)$'
    or shot_id ~ '^E0(5|8)-H0[1-4]$'
  );
drop policy if exists "youtube storyboard owner upload" on storage.objects;
create policy "youtube storyboard owner upload"
on storage.objects for insert to authenticated with check(
  bucket_id='podcast-youtube-storyboard'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and (storage.foldername(name))[2]~'^0[1-8]$'
  and (
    (storage.foldername(name))[3]~'^E0[1-8]-F(0[1-9]|10)$'
    or (storage.foldername(name))[3]~'^E0(5|8)-H0[1-4]$'
  )
  and exists (select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
);
