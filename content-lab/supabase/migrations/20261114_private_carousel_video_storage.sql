-- Dedicated, non-public media storage for mixed photo/video Content Lab carousels.
-- No new user-facing product: clips are owned by the authenticated buyer
-- and the original images in content-lab-private remain unchanged.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('content-lab-videos','content-lab-videos',false,40000000,
  array['video/mp4','video/quicktime','video/webm']::text[])
on conflict (id) do nothing;

create policy "lab carousel video owner upload" on storage.objects
for insert to authenticated
with check (
  bucket_id='content-lab-videos'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and (storage.foldername(name))[2]='carousel-videos'
  and lower(storage.extension(name))=any(array['mp4','mov','webm'])
  and (
    exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
    or exists(select 1 from public.content_lab_memberships m
      where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
  )
);

create policy "lab carousel video owner read" on storage.objects
for select to authenticated
using (
  bucket_id='content-lab-videos'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and (storage.foldername(name))[2]='carousel-videos'
  and (
    exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
    or exists(select 1 from public.content_lab_memberships m
      where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
  )
);

create policy "lab carousel video owner delete" on storage.objects
for delete to authenticated
using (
  bucket_id='content-lab-videos'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and (storage.foldername(name))[2]='carousel-videos'
  and (
    exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
    or exists(select 1 from public.content_lab_memberships m
      where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
  )
);
