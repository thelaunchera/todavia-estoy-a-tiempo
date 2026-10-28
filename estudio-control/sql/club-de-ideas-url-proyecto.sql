alter table public.podcast_club_posts
add column if not exists project_url text
check (project_url is null or (char_length(project_url)<=500 and project_url ~* '^https://[^ ]+[.][^ ]+'));
comment on column public.podcast_club_posts.project_url is 'Optional validated HTTPS URL of member project, visible only to authorized community members.';