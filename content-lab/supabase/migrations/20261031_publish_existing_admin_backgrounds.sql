-- One-time publication of existing admin-uploaded Content Lab background images.
-- Only assets belonging to content_lab_admins and explicitly categorized as 'background'
-- are included. Users' uploaded backgrounds and all original personal photos stay private.
alter table public.content_lab_background_catalog
 drop constraint if exists content_lab_background_catalog_path_check;
alter table public.content_lab_background_catalog
 add constraint content_lab_background_catalog_path_check
 check (
   path ~ '^shared-backgrounds/[0-9a-f-]{36}[.](png|jpg|webp)$'
   or path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}[.](png|jpg|webp)$'
 );
alter table public.content_lab_background_catalog alter column sha256 drop not null;
-- Files remain in the private bucket and are readable only if their exact path
-- was explicitly recorded as a published admin background.
drop policy if exists "lab paid shared backgrounds storage read" on storage.objects;
create policy "lab paid shared backgrounds storage read" on storage.objects
 for select to authenticated using (
   bucket_id='content-lab-private'
   and exists(select 1 from public.content_lab_background_catalog c
              where c.path=objects.name and c.published)
   and (
     exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
     or exists(select 1 from public.content_lab_memberships m
       where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
   )
 );
insert into public.content_lab_background_catalog
  (created_by,path,name,category,mime,sha256,size_bytes,published)
select
 a.owner_id, a.payload->>'path',
 left(coalesce(nullif(btrim(a.payload->>'displayName'),''),
        nullif(btrim(a.payload->>'name'),''),'Fondo del estudio'),120),
 case
   when lower(coalesce(a.payload->>'name','')) ~ 'gradient|degrad|ombre|sunset|haze' then 'Gradientes'
   when lower(coalesce(a.payload->>'name','')) ~ 'paper|papel|texture|grain|journal|notebook' then 'Papel y texturas'
   when lower(coalesce(a.payload->>'name','')) ~ 'retro|cafe|coffee|autumn|vintage' then 'Retro y otoño'
   when lower(coalesce(a.payload->>'name','')) ~ 'dark|black|noir|night|midnight' then 'Oscuros'
   when lower(coalesce(a.payload->>'name','')) ~ 'scrap|collage|polaroid|washi' then 'Scrapbook'
   when lower(coalesce(a.payload->>'name','')) ~ 'minimal|white|ivory|solid|cream' then 'Minimalistas'
   else 'Editoriales'
 end,
 a.payload->>'mime',null,(so.metadata->>'size')::integer,true
from public.content_lab_assets a
join public.content_lab_admins ad on ad.user_id=a.owner_id
join storage.objects so on so.bucket_id='content-lab-private'
 and so.name=a.payload->>'path'
where a.payload->>'category'='background'
 and a.payload->>'mime' in ('image/png','image/jpeg','image/webp')
 and (so.metadata->>'size')::bigint between 200 and 5000000
 and (a.payload->>'path') ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}[.](png|jpg|webp)$'
on conflict(path) do nothing;