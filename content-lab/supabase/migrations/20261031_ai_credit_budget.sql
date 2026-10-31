-- Content Lab prepaid-use protections (2026-10-31).
-- $10 one-time access includes a finite starter wallet. The studio editor, photos already
-- saved, and local PNG export do NOT use credits. AI credits cannot be bought here yet.
-- Cloudflare's account-wide 10k daily free neurons are NOT this app's credit unit.
create table if not exists public.content_lab_ai_wallets (
 user_id uuid primary key references auth.users(id) on delete cascade,
 photo_remaining integer not null default 60 check (photo_remaining between 0 and 100000),
 creative_remaining integer not null default 30 check (creative_remaining between 0 and 100000),
 quota_day date not null default ((now() at time zone 'utc')::date),
 photo_today integer not null default 0 check(photo_today >= 0),
 creative_today integer not null default 0 check(creative_today >= 0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.content_lab_ai_wallets enable row level security;
revoke all on public.content_lab_ai_wallets from anon,authenticated;
grant select on public.content_lab_ai_wallets to authenticated;
drop policy if exists "ai wallet view only self" on public.content_lab_ai_wallets;
create policy "ai wallet view only self" on public.content_lab_ai_wallets
 for select to authenticated using(user_id = (select auth.uid()));

create table if not exists public.content_lab_ai_reservations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 action text not null check(action in ('ai-image','grid-image','ideas','grid-plan','connection-test')),
 photo_units integer not null default 0,
 creative_units integer not null default 0,
 global_units integer not null,
 quota_day date not null,
 status text not null default 'spent' check(status in ('spent','refunded')),
 created_at timestamptz not null default now()
);
alter table public.content_lab_ai_reservations enable row level security;
revoke all on public.content_lab_ai_reservations from anon,authenticated;
grant select on public.content_lab_ai_reservations to authenticated;
drop policy if exists "ai reservations view only self" on public.content_lab_ai_reservations;
create policy "ai reservations view only self" on public.content_lab_ai_reservations
 for select to authenticated using(user_id = (select auth.uid()));

create table if not exists public.content_lab_ai_global_daily (
 quota_day date primary key,
 units_used integer not null default 0 check(units_used >= 0)
);
alter table public.content_lab_ai_global_daily enable row level security;
revoke all on public.content_lab_ai_global_daily from anon, authenticated;

-- Security definer is intentionally narrow: no user-specified price, owner, or
-- credit counts; buyer authentication and entitlement verified inside transaction.
drop function if exists public.content_lab_reserve_ai(text);
create or replace function public.content_lab_reserve_ai(p_action text,p_user uuid,p_email text)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $body$
declare
 v_user uuid := p_user;
 v_email text := lower(btrim(coalesce(p_email,'')));
 v_day date := (now() at time zone 'utc')::date;
 v_admin boolean;
 v_buyer boolean;
 v_photo integer := 0;
 v_creative integer := 0;
 v_global integer := 0;
 v_id uuid;
 v_wallet public.content_lab_ai_wallets%rowtype;
begin
 if auth.role()<>'service_role' then raise exception 'Solo el servidor puede reservar créditos.';end if;
 if v_user is null or v_email='' then raise exception 'Usuario verificado requerido.';end if;
 select exists(select 1 from public.content_lab_admins where user_id=v_user) into v_admin;
 select exists(select 1 from public.content_lab_memberships where buyer_email=v_email and status='active') into v_buyer;
 if not v_admin and not v_buyer then raise exception 'Tu compra de Content Lab aún no está verificada.';end if;
 if p_action not in ('ai-image','grid-image','ideas','grid-plan','connection-test') then
   raise exception 'Operación de IA desconocida.';
 end if;
 if p_action='connection-test' and not v_admin then
   raise exception 'El diagnóstico de Cloudflare es solo para la administradora.';
 end if;
 v_photo := case when p_action in ('ai-image','grid-image') then 1 else 0 end;
 v_creative := case when p_action='grid-plan' then 3 when p_action='ideas' then 1 else 0 end;
 v_global := case when p_action='grid-plan' then 4 when p_action='ideas' then 2 else 1 end;

 -- Serialize quota decisions, preventing two parallel requests from overspending
 -- or bypassing the global safety ceiling.
 perform pg_advisory_xact_lock(20261031,4501);
 insert into public.content_lab_ai_global_daily(quota_day,units_used)
 values(v_day,0) on conflict(quota_day) do nothing;
 update public.content_lab_ai_global_daily
 set units_used=units_used+v_global
 where quota_day=v_day and units_used+v_global<=50;
 if not found then
   raise exception 'Se alcanzó el límite diario compartido de IA. Vuelve mañana (UTC).';
 end if;

 if not v_admin then
   insert into public.content_lab_ai_wallets(user_id) values(v_user)
   on conflict(user_id) do nothing;
   update public.content_lab_ai_wallets
   set photo_remaining=photo_remaining-v_photo,
       creative_remaining=creative_remaining-v_creative,
       photo_today=case when quota_day=v_day then photo_today+v_photo else v_photo end,
       creative_today=case when quota_day=v_day then creative_today+v_creative else v_creative end,
       quota_day=v_day,updated_at=now()
   where user_id=v_user
     and photo_remaining>=v_photo
     and creative_remaining>=v_creative
     and (case when quota_day=v_day then photo_today else 0 end)+v_photo <= 10
     and (case when quota_day=v_day then creative_today else 0 end)+v_creative <= 10
   returning * into v_wallet;
   if not found then
     raise exception 'No quedan créditos suficientes o alcanzaste tu límite diario. Tus diseños guardados siguen disponibles.';
   end if;
 end if;
 insert into public.content_lab_ai_reservations(user_id,action,photo_units,creative_units,global_units,quota_day)
 values(v_user,p_action,v_photo,v_creative,v_global,v_day) returning id into v_id;
 return jsonb_build_object('reservation_id',v_id,'remaining_photos',case when v_admin then null else v_wallet.photo_remaining end,
   'remaining_creative',case when v_admin then null else v_wallet.creative_remaining end);
end
$body$;
revoke all on function public.content_lab_reserve_ai(text,uuid,text) from public,anon,authenticated;
grant execute on function public.content_lab_reserve_ai(text,uuid,text) to service_role;

-- Only Supabase service_role (server-side Edge Function) can undo a failed AI
-- reservation. Buyers cannot call this; repeated refunds are idempotent.
create or replace function public.content_lab_refund_ai(p_reservation uuid,p_user uuid)
returns boolean
language plpgsql
security definer
set search_path=public,pg_temp
as $body$
declare
 v public.content_lab_ai_reservations%rowtype;
 v_today date := (now() at time zone 'utc')::date;
begin
 if auth.role() <> 'service_role' then raise exception 'Prohibido.';end if;
 perform pg_advisory_xact_lock(20261031,4501);
 update public.content_lab_ai_reservations
 set status='refunded'
 where id=p_reservation and user_id=p_user and status='spent'
 returning * into v;
 if not found then return false;end if;
 update public.content_lab_ai_wallets
 set photo_remaining=photo_remaining+v.photo_units,
     creative_remaining=creative_remaining+v.creative_units,
     photo_today=case when quota_day=v.quota_day then greatest(0,photo_today-v.photo_units) else photo_today end,
     creative_today=case when quota_day=v.quota_day then greatest(0,creative_today-v.creative_units) else creative_today end,
     updated_at=now()
 where user_id=v.user_id;
 update public.content_lab_ai_global_daily
 set units_used=greatest(0,units_used-v.global_units)
 where quota_day=v.quota_day;
 return true;
end
$body$;
revoke all on function public.content_lab_refund_ai(uuid,uuid) from public,anon,authenticated;
grant execute on function public.content_lab_refund_ai(uuid,uuid) to service_role;
