-- One automatic unfinished-post reminder after 12 hours, across all saved revisions.
-- Existing delivered history stays intact; cancelled attempts may be superseded.
create unique index if not exists content_lab_unfinished_once_per_post
 on public.content_lab_alerts(owner_id,source_type,source_id)
 where kind='unfinished' and delivery_state<>'cancelled';

CREATE OR REPLACE FUNCTION public.content_lab_queue_due_alerts()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare total integer:=0; added integer:=0;
begin
 -- Saved drafts: a single reminder per post, twelve hours after the last edit.
 with inserted as (
  insert into public.content_lab_alerts(owner_id,event_key,kind,source_type,source_id,brand_id,project_title,format)
  select p.owner_id, 'unfinished:'||p.id||':'||to_char(p.updated_at at time zone 'UTC','YYYYMMDDHH24MISSUS'),
   'unfinished','post',p.id,
   case when (p.payload->>'brandId') ~* '^[a-f0-9-]{36}$' then (p.payload->>'brandId')::uuid else null end,
   left(coalesce(nullif(p.payload->>'title',''),nullif(p.payload->>'hook',''),'Tu proyecto'),100),
   left(coalesce(p.payload->>'format','Post'),60)
  from public.content_lab_posts p join public.content_lab_alert_settings s on s.owner_id=p.owner_id
  where p.updated_at<=now()-interval '12 hours' and p.updated_at>now()-interval '30 days'
   and not exists (
    select 1 from public.content_lab_alerts a
    where a.owner_id=p.owner_id and a.source_type='post' and a.source_id=p.id
     and a.kind='unfinished'
     and (a.delivery_state<>'cancelled' or a.delivered_at is not null or a.read_at is not null)
   )
   and coalesce(p.payload->>'isFinished','false')<>'true'
   and coalesce(p.payload->>'status','Draft') not in ('Ready','Published','Completed')
   and (length(trim(coalesce(p.payload->>'hook','')))>0
      or length(trim(coalesce(p.payload->>'caption','')))>0
      or length(coalesce(p.payload->>'assetId',''))>6
      or length(coalesce(p.payload->>'designData',''))>250)
  on conflict do nothing
  returning 1
 ) select count(*) into added from inserted;
 total:=total+added;
 -- Calendar reminder for standalone posts: due within the following 2 hours.
 with due as (
  select p.*,
  public.content_lab_alert_instant(p.payload->>'date',p.payload->>'time',
     coalesce(nullif(p.payload->>'timeZone',''),s.timezone)) as publishing
  from public.content_lab_posts p join public.content_lab_alert_settings s on s.owner_id=p.owner_id
  where coalesce(p.payload->>'planningStatus','planned')<>'published'
    and coalesce(p.payload->>'status','')<>'Published'
 ), inserted as (
  insert into public.content_lab_alerts(owner_id,event_key,kind,source_type,source_id,brand_id,project_title,format,scheduled_at)
  select p.owner_id, 'scheduled:post:'||p.id||':'||to_char(p.publishing at time zone 'UTC','YYYYMMDDHH24MI'),
   'scheduled','post',p.id,
   case when(p.payload->>'brandId')~*'^[a-f0-9-]{36}$' then(p.payload->>'brandId')::uuid else null end,
   left(coalesce(nullif(p.payload->>'title',''),nullif(p.payload->>'hook',''),'Tu post'),100),
   left(coalesce(p.payload->>'format','Post'),60),p.publishing
  from due p
  where p.publishing>now() and p.publishing<=now()+interval '2 hours'
  on conflict(owner_id,event_key) do nothing returning 1
 ) select count(*) into added from inserted;
 total:=total+added;
 -- Independent calendar tiles from saved nine-post campaigns.
 with due as (
  select g.*, (tile.n-1)::integer as tile_index, tile.value as post,
     public.content_lab_alert_instant(tile.value->>'scheduledDate',tile.value->>'scheduledTime',
        coalesce(nullif(tile.value->>'scheduledTimeZone',''),s.timezone)) as publishing
  from public.content_lab_grids g join public.content_lab_alert_settings s on s.owner_id=g.owner_id
  cross join lateral jsonb_array_elements(coalesce(g.payload->'posts','[]'::jsonb))
    with ordinality as tile(value,n)
  where coalesce(tile.value->>'planningStatus','planned')<>'published'
 ), inserted as (
  insert into public.content_lab_alerts(owner_id,event_key,kind,source_type,source_id,tile_index,brand_id,project_title,format,scheduled_at)
  select g.owner_id, 'scheduled:grid:'||g.id||':'||g.tile_index||':'||
     to_char(g.publishing at time zone 'UTC','YYYYMMDDHH24MI'),
   'scheduled','grid',g.id,g.tile_index,
   case when(g.payload->>'brandId')~*'^[a-f0-9-]{36}$' then(g.payload->>'brandId')::uuid else null end,
   left(coalesce(nullif(g.post->>'headline',''),nullif(g.payload->>'title',''),'Tu post'),100),
   'Post del grid',g.publishing
  from due g where g.publishing>now() and g.publishing<=now()+interval '2 hours'
  on conflict(owner_id,event_key) do nothing returning 1
 ) select count(*) into added from inserted;
 total:=total+added;
 return total;
end;$function$;

revoke all on function public.content_lab_queue_due_alerts() from public,anon,authenticated;
grant execute on function public.content_lab_queue_due_alerts() to service_role;


create or replace function public.content_lab_claim_alerts(p_limit integer default 20)
returns setof public.content_lab_alerts language plpgsql security definer set search_path = '' as $$
begin
 return query
 with claimed as (
   select a.id from public.content_lab_alerts a
   where a.read_at is null
    and ((a.delivery_state='pending' and (a.retry_after is null or a.retry_after<=now()))
       or (a.delivery_state='processing' and a.claimed_at<now()-interval '5 minutes'))
    and (a.snoozed_until is null or a.snoozed_until<=now())
    -- Never claim an old six-hour reminder or repeat one already delivered/read.
    and (a.kind<>'unfinished' or (
     a.delivered_at is null
     and exists (
      select 1 from public.content_lab_posts p
      where p.id=a.source_id and p.owner_id=a.owner_id and a.source_type='post'
       and p.updated_at<=now()-interval '12 hours'
       and coalesce(p.payload->>'isFinished','false')<>'true'
       and coalesce(p.payload->>'status','Draft') not in ('Ready','Published','Completed')
     )
     and not exists (
      select 1 from public.content_lab_alerts prior
      where prior.owner_id=a.owner_id and prior.source_type=a.source_type
       and prior.source_id=a.source_id and prior.kind='unfinished' and prior.id<>a.id
       and (prior.delivered_at is not null or prior.read_at is not null
        or prior.delivery_state in ('email','push','in_app'))
     )
    ))
   order by a.created_at
   for update skip locked
   limit least(greatest(p_limit,1),50)
 )
 update public.content_lab_alerts a
   set delivery_state='processing',claimed_at=now(),attempt_count=a.attempt_count+1
   from claimed c where a.id=c.id returning a.*;
end;$$;
revoke all on function public.content_lab_claim_alerts(integer) from public,anon,authenticated;
grant execute on function public.content_lab_claim_alerts(integer) to service_role;


create or replace function public.content_lab_act_on_alert(p_id uuid,p_action text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  if (select auth.uid()) is null or p_action not in ('read','snooze') then
    return false;
  end if;
  if not exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
     and not exists(select 1 from public.content_lab_memberships m
       where m.buyer_email=lower((select auth.jwt()->>'email'))
       and m.status='active' and public.content_lab_session_expires_at()>now()) then
    return false;
  end if;
  update public.content_lab_alerts
    set read_at=case when p_action='read' then now() else null end,
        snoozed_until=case when p_action='snooze' then now()+interval '1 hour' else null end,
        delivery_state=case when p_action='snooze' then 'pending' else delivery_state end,
        retry_after=case when p_action='snooze' then now()+interval '1 hour' else retry_after end
   where id=p_id and owner_id=(select auth.uid()) and read_at is null
    and (p_action<>'snooze' or kind<>'unfinished');
  get diagnostics changed=row_count;
  return changed=1;
end;$$;
revoke all on function public.content_lab_act_on_alert(uuid,text) from public,anon;
grant execute on function public.content_lab_act_on_alert(uuid,text) to authenticated;

