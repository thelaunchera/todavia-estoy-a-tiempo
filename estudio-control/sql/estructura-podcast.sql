-- Todavía estoy a tiempo · Supabase exclusivo del podcast
-- Preparado para ejecutar en UN PROYECTO NUEVO, no en bases de The Launch Era.
-- IMPORTANTE: el primer administrador se habilita por SQL después de iniciar sesión.
-- Este archivo NO contiene credenciales, keys ni información de compradores.
begin;

create table if not exists public.podcast_studio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check(role in ('owner','editor')),
  created_at timestamptz not null default now()
);
alter table public.podcast_studio_admins enable row level security;
revoke all on table public.podcast_studio_admins from anon, authenticated;
grant select on public.podcast_studio_admins to authenticated;
drop policy if exists "podcast_admin_self_read" on public.podcast_studio_admins;
create policy "podcast_admin_self_read" on public.podcast_studio_admins
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.podcast_studio_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check(kind in ('episodios','tareas','productos','ideas')),
  title text not null check(length(trim(title)) between 1 and 180),
  payload jsonb not null default '{}'::jsonb check(jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists podcast_studio_entries_user_kind_idx on public.podcast_studio_entries(user_id,kind);
alter table public.podcast_studio_entries enable row level security;
revoke all on public.podcast_studio_entries from anon,authenticated;
grant select,insert,update,delete on public.podcast_studio_entries to authenticated;

drop policy if exists "podcast_studio_owner_read" on public.podcast_studio_entries;
create policy "podcast_studio_owner_read" on public.podcast_studio_entries
 for select to authenticated using (
   user_id = (select auth.uid())
   and exists (select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
 );
drop policy if exists "podcast_studio_owner_insert" on public.podcast_studio_entries;
create policy "podcast_studio_owner_insert" on public.podcast_studio_entries
 for insert to authenticated with check (
   user_id = (select auth.uid())
   and exists (select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
 );
drop policy if exists "podcast_studio_owner_update" on public.podcast_studio_entries;
create policy "podcast_studio_owner_update" on public.podcast_studio_entries
 for update to authenticated
 using (user_id=(select auth.uid()) and exists (select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid())))
 with check (user_id=(select auth.uid()) and exists (select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid())));
drop policy if exists "podcast_studio_owner_delete" on public.podcast_studio_entries;
create policy "podcast_studio_owner_delete" on public.podcast_studio_entries
 for delete to authenticated using (
 user_id=(select auth.uid()) and exists (select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()))
 );

-- Los siguientes registros reciben escrituras SOLAMENTE desde servicios verificados;
-- el navegador NO puede crearlos ni editar importes, suscripciones ni mensajes.
alter table public.podcast_studio_entries
  add column if not exists external_id text;
create unique index if not exists podcast_entries_local_import_uniq
  on public.podcast_studio_entries(user_id,kind,external_id);

-- Operaciones: ninguna escritura desde un navegador, solamente desde backend verificado.
create table if not exists public.podcast_sales (
 id uuid primary key default gen_random_uuid(),
 provider text not null,
 provider_payment_id text not null,
 product_code text,
 customer_email text,
 currency text not null default 'usd',
 amount_cents integer not null check(amount_cents >= 0),
 status text not null check(status in ('paid','refunded','partial_refund','pending','failed')),
 purchased_at timestamptz not null,
 recorded_at timestamptz not null default now(),
 unique(provider,provider_payment_id)
);
create table if not exists public.podcast_subscribers (
 id uuid primary key default gen_random_uuid(),
 email text not null check(position('@' in email) > 1),
 source text not null,
 consent_at timestamptz not null,
 consent_version text not null default 'episodios-v1',
 unsubscribed_at timestamptz,
 created_at timestamptz not null default now()
);
create unique index if not exists podcast_subscribers_email_unique on public.podcast_subscribers(lower(email));
create table if not exists public.podcast_support_messages (
 id uuid primary key default gen_random_uuid(),
 external_message_id text unique,
 sender_name text,
 sender_email text not null,
 subject text,
 body text not null,
 status text not null default 'abierto' check(status in ('abierto','en curso','resuelto')),
 created_at timestamptz not null default now()
);
create table if not exists public.podcast_delivery_events (
 id uuid primary key default gen_random_uuid(),
 provider_event_id text unique not null,
 delivery_type text not null,
 recipient_email text,
 status text not null,
 occurred_at timestamptz not null,
 created_at timestamptz not null default now()
);
create table if not exists public.podcast_automation_runs (
 id uuid primary key default gen_random_uuid(),
 provider_run_id text unique,
 flow_key text not null,
 outcome text not null,
 message text,
 created_at timestamptz not null default now()
);
create table if not exists public.podcast_integrations (
 provider text primary key check(provider in ('stripe','make','resend','gsc')),
 status text not null default 'pending' check(status in ('pending','active','error','paused')),
 last_sync_at timestamptz,
 updated_at timestamptz not null default now()
);
-- Las políticas de lectura de registros personales requieren rol OWNER verificado.
do $$
declare t text;
begin
 foreach t in array array[
  'podcast_sales','podcast_subscribers','podcast_support_messages',
  'podcast_delivery_events','podcast_automation_runs','podcast_integrations'
 ] loop
   execute format('alter table public.%I enable row level security',t);
   execute format('revoke all on public.%I from PUBLIC,anon,authenticated',t);
   execute format('grant select on public.%I to authenticated',t);
   execute format('drop policy if exists podcast_operator_read on public.%I',t);
   execute format('drop policy if exists podcast_sensitive_owner_read on public.%I',t);
   execute format('create policy podcast_sensitive_owner_read on public.%I for select to authenticated using (exists (select 1 from public.podcast_studio_admins a where a.user_id=(select auth.uid()) and a.role=''owner''))',t);
 end loop;
end $$;
commit;

-- ADMIN: invitar primero a la cuenta en Supabase Auth, copiar su UUID:
-- insert into public.podcast_studio_admins(user_id,role)
-- values ('UUID_DE_CUENTA_AUTORIZADA','owner')
-- on conflict (user_id) do update set role='owner';

-- Verificaciones: todas las tablas podcast_* deben tener rowsecurity=true.
-- select tablename,rowsecurity from pg_tables where schemaname='public' and tablename like 'podcast_%';
-- select tablename,policyname,cmd from pg_policies where schemaname='public' and tablename like 'podcast_%';
