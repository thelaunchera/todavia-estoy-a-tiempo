-- Mensajes, comentarios y me gusta sincronizados entre miembros autorizados.
alter publication supabase_realtime add table
 public.podcast_club_posts,
 public.podcast_club_comments,
 public.podcast_club_likes;