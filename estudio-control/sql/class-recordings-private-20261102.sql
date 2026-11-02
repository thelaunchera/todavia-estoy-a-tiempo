-- Private chapter production footage for the podcast Studio.
-- Applied in production 2026-11-02, fhrvuhikrybobidxpvnh.
-- This does not grant classroom/student access; no published video table is modified.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('podcast-class-recordings','podcast-class-recordings',false,50000000,
       array['video/mp4','video/quicktime','video/webm']::text[])
on conflict(id) do nothing;

-- Each policy is created once on production. Authorization is tied to both the
-- signed-in UID's personal folder and the existing server-side admin table.
-- All object names are /{user_id}/{lesson_code}/es-{uuid}.{extension}
create policy "podcast owner upload course recordings" on storage.objects
 for insert to authenticated with check(
  bucket_id='podcast-class-recordings'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and (storage.foldername(name))[2]~'^(0[0-8])$'
  and exists(select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
 );
create policy "podcast owner read course recordings" on storage.objects
 for select to authenticated using(
  bucket_id='podcast-class-recordings'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists(select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
 );
create policy "podcast owner remove own course recordings" on storage.objects
 for delete to authenticated using(
  bucket_id='podcast-class-recordings'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists(select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
 );
