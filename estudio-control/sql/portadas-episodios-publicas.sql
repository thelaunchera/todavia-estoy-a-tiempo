-- Podcast «Todavía estoy a tiempo» · portadas públicas de episodios
-- Aplicar al proyecto Supabase del podcast ANTES de activar en producción
-- la opción «Subir foto» del Studio. No toca archivos de compras ni el bucket privado.
-- La URL pública es intencionada: la portada debe ser visible en correos a suscriptores.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'podcast-episode-art',
  'podcast-episode-art',
  true,
  5242880,
  array['image/png','image/jpeg','image/webp']::text[]
)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'podcast_episode_art_admin_insert'
  ) then
    create policy podcast_episode_art_admin_insert
    on storage.objects
    for insert to authenticated
    with check (
      bucket_id = 'podcast-episode-art'
      and (storage.foldername(name))[1] = (select auth.uid()::text)
      and exists (
        select 1 from public.podcast_studio_admins a
        where a.user_id = (select auth.uid())
      )
    );
  end if;
end $$;

-- Nunca ampliar los permisos del bucket privado podcast-personalized.
-- Sin UPDATE ni DELETE por cliente. Cada imagen tiene ruta UUID no adivinable.
-- La lectura pública de este bucket es necesaria para emails y portadas.
