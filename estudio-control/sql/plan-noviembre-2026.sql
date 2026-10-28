-- Applied only to the independent podcast project fhrvuhikrybobidxpvnh.
-- Preserve recordings, scripts, published episodes and previous scheduling metadata.
begin;
create temporary table plan_before on commit drop as
select id, title, payload from public.podcast_studio_entries where kind = 'episodios';

do $$ begin
  if (select count(*) from public.podcast_studio_admins where role='owner') <> 1 then
    raise exception 'Expected exactly one podcast owner';
  end if;
  if exists(select 1 from plan_before where payload->>'status'<>'publicado'
      and payload#>>'{publication_kit,spotify_scheduled}'='true') then
    raise exception 'An episode is already scheduled externally; review before changing its calendar';
  end if;
end $$;

update public.podcast_studio_entries
set payload = payload || jsonb_build_object(
  'archived',true,'archived_at',now(),'calendar_active',false,
  'archive_reason','Plan mensual autorizado el 28 octubre 2026. Conservar para revisar más adelante, sin fecha activa.',
  'previous_planned_date',payload->'date',
  'previous_publication_kit',payload->'publication_kit',
  'date',null
) || case when payload ? 'publication_kit' then jsonb_build_object('publication_kit',
  (payload->'publication_kit') || jsonb_build_object('date',null,'status','pausado_fuera_del_calendario'))
  else '{}'::jsonb end,
updated_at=now()
where kind='episodios' and coalesce(payload->>'status','')<>'publicado'
  and external_id not like 'plan:2026-11:%'
  and coalesce(payload->>'archived','false')<>'true';

insert into public.podcast_studio_entries(user_id,kind,title,external_id,payload)
select owner.user_id,'episodios',slot.title,slot.external_id,
  jsonb_build_object(
    'number',slot.number,'date',slot.date,'series','Noviembre 2026 · Construir algo propio',
    'status','borrador privado','archived',false,'calendar_active',true,
    'planning_month','2026-11','episode_format',slot.format,'planning_status',slot.planning_status,
    'summary',slot.summary,'notes',slot.notes,
    'script','','audio','','audio_ready',false,'announcement_state','disabled',
    'performance_notes','Ficha de planificación aprobada el 28 octubre 2026. Investigación, guion y audio pendientes. Conservar el tono cercano de Todavía estoy a tiempo. No inventar experiencias de Dailin ni preguntas de oyentes.'
  )
from (values
  ('plan:2026-11:03',3,'2026-11-03','Todo el mundo parece estar emprendiendo. ¿Y yo por dónde empiezo?',
   'Tema investigado','Tema provisional · investigación pendiente',
   'Comparación, presión y decisiones reales al querer construir algo propio.',
   'Revisar la conversación actual antes de grabar. El tema puede cambiar después de investigar; todavía no está validado como viral.'),
  ('plan:2026-11:10',4,'2026-11-10','Vamos a ordenar esa idea que tienes en la cabeza',
   'Una habilidad','Habilidad definida · guion pendiente',
   'Usar IA para preparar una propuesta sencilla: qué ofrecer, a quién y qué falta comprobar.',
   'Una habilidad práctica del mes. Preparar un ejemplo demostrable y revisar el resultado de la IA. No prometer ingresos ni resultados automáticos.'),
  ('plan:2026-11:17',5,'2026-11-17','Quiero construir algo mío, pero no quiero vivir agotada',
   'Tema investigado','Tema provisional · investigación pendiente',
   'Tiempo, expectativas y límites al emprender sin dejarse para después.',
   'Revisar conversaciones recientes y fuentes antes de cerrar el guion. Se puede reemplazar por un tema más pertinente después de investigar.'),
  ('plan:2026-11:24',6,'2026-11-24','Lo que no salió como pensábamos',
   'Preguntas y risas','Preguntas de audiencia pendientes',
   'Preguntas reales, pequeñas metidas de pata y cosas que vamos aprendiendo.',
   'Recoger preguntas desde el primer episodio. Si llegan pocas, completar con experiencias reales y preguntas propias identificadas como tales. No fabricar mensajes de audiencia.')
) as slot(external_id,number,date,title,format,planning_status,summary,notes)
cross join public.podcast_studio_admins owner
where owner.role='owner'
  and not exists(select 1 from public.podcast_studio_entries entry
    where entry.user_id=owner.user_id and entry.kind='episodios' and entry.external_id=slot.external_id);

do $$ begin
  if exists(select 1 from plan_before old join public.podcast_studio_entries current using(id)
      where old.payload->>'status'='publicado' and (old.title<>current.title or old.payload<>current.payload)) then
    raise exception 'Published episode changed';
  end if;
  if exists(select 1 from plan_before old left join public.podcast_studio_entries current using(id)
      where current.id is null or old.title<>current.title
        or (old.payload - array['archived','archived_at','calendar_active','archive_reason','previous_planned_date','previous_publication_kit','date','publication_kit'])
         <> (current.payload - array['archived','archived_at','calendar_active','archive_reason','previous_planned_date','previous_publication_kit','date','publication_kit'])) then
    raise exception 'Original content changed or disappeared';
  end if;
  if (select count(*) from public.podcast_studio_entries where kind='episodios'
      and coalesce(payload->>'archived','false')<>'true' and payload->>'status'<>'publicado')<>4 then
    raise exception 'Expected four active planned episodes';
  end if;
end $$;
commit;

select external_id,title,payload->>'date' as date,payload->>'episode_format' as format,
  payload->>'planning_status' as planning_status
from public.podcast_studio_entries
where kind='episodios' and external_id like 'plan:2026-11:%' order by payload->>'date';
