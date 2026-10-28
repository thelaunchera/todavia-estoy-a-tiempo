-- Aula privada · defensas RLS del progreso por compra activa y correo autenticado.
-- Aplicado y verificado en producción el 28 de octubre de 2026.
-- Evita la condición permisiva a.buyer_email = a.buyer_email.
begin;
drop policy if exists class_progress_own_insert on public.podcast_class_progress;
create policy class_progress_own_insert on public.podcast_class_progress
 for insert to authenticated
 with check (
  (select auth.uid()) is not null
  and buyer_email = lower((select auth.jwt()->>'email'))
  and exists(
    select 1 from public.podcast_class_access a
    where a.course_id=podcast_class_progress.course_id
      and a.buyer_email=lower((select auth.jwt()->>'email'))
      and a.status='active' and a.revoked_at is null
  )
  and exists(
    select 1 from public.podcast_class_lessons l
    where l.course_id=podcast_class_progress.course_id
      and l.lesson_code=podcast_class_progress.lesson_code
      and l.status='ready' and l.youtube_video_id is not null
  )
 );
drop policy if exists class_progress_own_select on public.podcast_class_progress;
create policy class_progress_own_select on public.podcast_class_progress
 for select to authenticated
 using (
  (select auth.uid()) is not null
  and buyer_email=lower((select auth.jwt()->>'email'))
  and exists(select 1 from public.podcast_class_access a
    where a.course_id=podcast_class_progress.course_id
      and a.buyer_email=lower((select auth.jwt()->>'email'))
      and a.status='active' and a.revoked_at is null)
 );
drop policy if exists class_progress_own_delete on public.podcast_class_progress;
create policy class_progress_own_delete on public.podcast_class_progress
 for delete to authenticated
 using (
  (select auth.uid()) is not null
  and buyer_email=lower((select auth.jwt()->>'email'))
  and exists(select 1 from public.podcast_class_access a
    where a.course_id=podcast_class_progress.course_id
      and a.buyer_email=lower((select auth.jwt()->>'email'))
      and a.status='active' and a.revoked_at is null)
 );
commit;
