-- Replica del cambio ya aplicado en Supabase producción el 28 de octubre de 2026.
-- Migración: bonus_release_only_after_course_completion_and_project_20261028.
-- No volver a ejecutar manualmente sin revisar el historial de migraciones.
-- Los bonos marcados ready necesitan una asignación por correo, la compra activa,
-- nueve lecciones aprobadas y completadas, y un proyecto compartido con prueba.
drop policy if exists class_resources_assigned_bonus_read on public.podcast_class_resources;
create policy class_resources_assigned_bonus_read on public.podcast_class_resources
for select to authenticated using (
 status='ready'
 and resource_code ~ '^bonus_'
 and (select auth.uid()) is not null
 and exists (
   select 1 from public.podcast_class_access a
   where a.course_id=podcast_class_resources.course_id
     and a.buyer_email=lower((select auth.jwt()->>'email'))
     and a.status='active' and a.revoked_at is null
 )
 and exists (
   select 1 from public.podcast_class_bonus_grants g
   where g.course_id=podcast_class_resources.course_id
     and g.resource_code=podcast_class_resources.resource_code
     and g.buyer_email=lower((select auth.jwt()->>'email'))
 )
 and (
   select count(*) from public.podcast_class_lessons l
   where l.course_id=podcast_class_resources.course_id
     and l.status='ready' and l.youtube_video_id is not null
 )=9
 and (
   select count(*) from public.podcast_class_progress p
   join public.podcast_class_lessons l on l.course_id=p.course_id and l.lesson_code=p.lesson_code
   where p.course_id=podcast_class_resources.course_id
     and p.buyer_email=lower((select auth.jwt()->>'email'))
     and l.status='ready' and l.youtube_video_id is not null
 )=9
 and exists (
   select 1 from public.podcast_club_posts post
   where post.author_id=(select auth.uid())
     and post.status='visible' and post.channel='proyectos'
     and (post.scope='club' or (post.scope='curso' and post.course_id=podcast_class_resources.course_id))
     and (post.image_path is not null or post.project_url is not null)
 )
);
