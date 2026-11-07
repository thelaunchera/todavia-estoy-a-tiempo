-- Content Lab buyer reminders · private, owner-scoped, idempotent.
create table if not exists public.content_lab_alert_settings(
  owner_id uuid primary key references auth.users(id) on delete cascade,
  timezone text not null default 'UTC' check(length(timezone) between 2 and 70),
  locale text not null default 'es' check(locale in('es','en')),
  email_enabled boolean not null default true,
  push_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.content_lab_push_subscriptions(
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique check(length(endpoint) between 25 and 2000),
  p256dh text not null check(length(p256dh) between 20 and 200),
  auth text not null check(length(auth) between 8 and 200),
  device_name text not null default 'Dispositivo' check(length(device_name)<=80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_lab_push_by_owner on public.content_lab_push_subscriptions(owner_id);
create table if not exists public.content_lab_alerts(
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null check(length(event_key)<=230),
  kind text not null check(kind in('unfinished','scheduled')),
  source_type text not null check(source_type in('post','grid')),
  source_id uuid not null,
  tile_index integer not null default -1 check(tile_index between -1 and 9),
  brand_id uuid,
  project_title text not null default 'Tu proyecto',
  format text not null default 'Post',
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  snoozed_until timestamptz,
  delivery_state text not null default 'pending' check(delivery_state in('pending','processing','push','email','in_app','cancelled')),
  attempt_count integer not null default 0,
  retry_after timestamptz,
  claimed_at timestamptz,
  delivered_at timestamptz,
  last_error text,
  unique(owner_id,event_key)
);
create index if not exists content_lab_alerts_owner_recent on public.content_lab_alerts(owner_id,created_at desc);
create index if not exists content_lab_alerts_dispatch on public.content_lab_alerts(delivery_state,retry_after,created_at)
  where read_at is null and delivery_state in('pending','processing');

alter table public.content_lab_alert_settings enable row level security;
alter table public.content_lab_push_subscriptions enable row level security;
alter table public.content_lab_alerts enable row level security;

revoke all on public.content_lab_alert_settings from anon;
revoke all on public.content_lab_push_subscriptions from anon;
revoke all on public.content_lab_alerts from anon;
grant select,insert,update on public.content_lab_alert_settings to authenticated;
grant select,insert,update,delete on public.content_lab_push_subscriptions to authenticated;
grant select on public.content_lab_alerts to authenticated;
grant all on public.content_lab_alert_settings,public.content_lab_push_subscriptions,public.content_lab_alerts to service_role;

create policy "lab buyer manages own alert settings" on public.content_lab_alert_settings
  for all to authenticated using(owner_id=(select auth.uid()))
  with check(owner_id=(select auth.uid()));
create policy "lab buyer manages own devices" on public.content_lab_push_subscriptions
  for all to authenticated using(owner_id=(select auth.uid()))
  with check(owner_id=(select auth.uid()));
create policy "lab buyer reads own reminders" on public.content_lab_alerts
  for select to authenticated using(owner_id=(select auth.uid()));

-- Strict user actions. No direct UPDATE grant on alert body, due time or owner.
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
   where id=p_id and owner_id=(select auth.uid()) and read_at is null;
  get diagnostics changed=row_count;
  return changed=1;
end;$$;
revoke all on function public.content_lab_act_on_alert(uuid,text) from public,anon;
grant execute on function public.content_lab_act_on_alert(uuid,text) to authenticated;

-- Safely resolve the buyer's calendar wall-clock to one actual instant.
create or replace function public.content_lab_alert_instant(p_date text,p_time text,p_timezone text)
returns timestamptz language plpgsql stable security invoker set search_path = '' as $$
declare tz text;
begin
 if p_date is null or p_date!~'^\\d{4}-\\d{2}-\\d{2}$'
    or p_time is null or p_time!~'^([01]\\d|2[0-3]):[0-5]\\d$' then return null; end if;
 select name into tz from pg_catalog.pg_timezone_names where name=p_timezone limit 1;
 if tz is null then tz:='UTC'; end if;
 return (p_date||' '||p_time)::timestamp at time zone tz;
exception when others then return null;
end;$$;
revoke all on function public.content_lab_alert_instant(text,text,text) from public,anon;
grant execute on function public.content_lab_alert_instant(text,text,text) to authenticated,service_role;

-- The worker, not the browser, decides whether a reminder is due.
create or replace function public.content_lab_queue_due_alerts()
returns integer language plpgsql security definer set search_path = '' as $$
declare total integer:=0; added integer:=0;
begin
 -- Saved drafts: once per saved modification, six hours after the last edit.
 with inserted as (
  insert into public.content_lab_alerts(owner_id,event_key,kind,source_type,source_id,brand_id,project_title,format)
  select p.owner_id, 'unfinished:'||p.id||':'||to_char(p.updated_at at time zone 'UTC','YYYYMMDDHH24MISSUS'),
   'unfinished','post',p.id,
   case when (p.payload->>'brandId') ~* '^[a-f0-9-]{36}$' then (p.payload->>'brandId')::uuid else null end,
   left(coalesce(nullif(p.payload->>'title',''),nullif(p.payload->>'hook',''),'Tu proyecto'),100),
   left(coalesce(p.payload->>'format','Post'),60)
  from public.content_lab_posts p join public.content_lab_alert_settings s on s.owner_id=p.owner_id
  where p.updated_at<=now()-interval '6 hours' and p.updated_at>now()-interval '30 days'
   and coalesce(p.payload->>'isFinished','false')<>'true'
   and coalesce(p.payload->>'status','Draft') not in ('Ready','Published','Completed')
   and (length(trim(coalesce(p.payload->>'hook','')))>0
      or length(trim(coalesce(p.payload->>'caption','')))>0
      or length(coalesce(p.payload->>'assetId',''))>6
      or length(coalesce(p.payload->>'designData',''))>250)
  on conflict(owner_id,event_key) do nothing
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
end;$$;
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

-- A job invokes this only through the worker token held in encrypted Vault.
create or replace function public.content_lab_worker_secrets()
returns jsonb language sql security definer set search_path = '' as $$
select jsonb_build_object(
 'worker', (select decrypted_secret from vault.decrypted_secrets where name='content_lab_alert_worker_secret' limit 1),
 'vapid_public', (select decrypted_secret from vault.decrypted_secrets where name='content_lab_vapid_public' limit 1),
 'vapid_private', (select decrypted_secret from vault.decrypted_secrets where name='content_lab_vapid_private' limit 1),
 'make_email_hook', (select decrypted_secret from vault.decrypted_secrets where name='content_lab_alert_email_make_hook' limit 1)
);$$;
revoke all on function public.content_lab_worker_secrets() from public,anon,authenticated;
grant execute on function public.content_lab_worker_secrets() to service_role;

create or replace function public.content_lab_public_push_key()
returns text language sql security definer set search_path = '' as $$
select (select decrypted_secret from vault.decrypted_secrets where name='content_lab_vapid_public' limit 1)
where (select auth.uid()) is not null;
$$;
revoke all on function public.content_lab_public_push_key() from public,anon;
grant execute on function public.content_lab_public_push_key() to authenticated;

comment on table public.content_lab_alerts is 'Private per-buyer project and posting reminders. Created by protected server job; never cross-brand.';
