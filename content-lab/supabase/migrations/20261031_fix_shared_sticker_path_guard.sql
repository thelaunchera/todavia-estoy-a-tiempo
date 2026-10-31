-- Correct original catalogue path guard: literal dot in .png.
alter table public.content_lab_sticker_catalog
 drop constraint if exists content_lab_sticker_catalog_path_check;
alter table public.content_lab_sticker_catalog
 add constraint content_lab_sticker_catalog_path_check
 check (path ~ '^shared-stickers/[0-9a-f-]{36}[.]png$');
