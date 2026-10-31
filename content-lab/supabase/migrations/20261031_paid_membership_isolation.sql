-- Content Lab paid accounts, independent of podcast content and products.
-- Only a trusted Stripe verification workflow can write membership rows.
-- Buyers see ONLY their own rows/files, never another buyer's data.

create table if not exists public.content_lab_memberships (
  id uuid primary key default gen_random_uuid(),
  buyer_email text not null unique,
  stripe_checkout_session_id text not null unique,
  stripe_payment_link_id text not null,
  stripe_price_id text not null,
  amount_cents integer not null check (amount_cents = 1000),
  currency text not null default 'usd' check (currency = 'usd'),
  status text not null default 'active' check (status in ('active','revoked','refunded')),
  purchased_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_lab_membership_email_normalized check (
    buyer_email = lower(btrim(buyer_email)) and length(buyer_email) between 5 and 254
  )
);
alter table public.content_lab_memberships enable row level security;
revoke all on public.content_lab_memberships from anon, authenticated;
grant select on public.content_lab_memberships to authenticated;
drop policy if exists "content lab buyer sees own purchase" on public.content_lab_memberships;
create policy "content lab buyer sees own purchase" on public.content_lab_memberships
  for select to authenticated
  using (buyer_email = lower((select auth.jwt()->>'email')));

-- The checkout event must be verified in Stripe by Make before a service_role
-- upsert. Customers have no direct INSERT/UPDATE/DELETE access.
-- Existing admin remains active; purchase alone never grants data access for
-- some OTHER account because every data row still checks owner_id=auth.uid().
do $$
declare tbl text;
begin
 foreach tbl in array array['brands','posts','assets','grids'] loop
  execute format('drop policy if exists %L on public.%I','lab authorized owner only','content_lab_'||tbl);
  execute format($pol$
    create policy "lab verified owner or paid buyer only" on public.%I
    for all to authenticated
    using (
      owner_id=(select auth.uid())
      and (
        exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
        or exists(select 1 from public.content_lab_memberships m
          where m.buyer_email=lower((select auth.jwt()->>'email'))
            and m.status='active')
      )
    )
    with check (
      owner_id=(select auth.uid())
      and (
        exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
        or exists(select 1 from public.content_lab_memberships m
          where m.buyer_email=lower((select auth.jwt()->>'email'))
            and m.status='active')
      )
    )
  $pol$,'content_lab_'||tbl);
 end loop;
end $$;

-- Every private image path starts with the authenticated owner's UUID.
drop policy if exists "lab private storage read" on storage.objects;
drop policy if exists "lab private storage create" on storage.objects;
drop policy if exists "lab private storage delete" on storage.objects;
create policy "lab private storage read" on storage.objects
 for select to authenticated using (
 bucket_id='content-lab-private'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and (
   exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
   or exists(select 1 from public.content_lab_memberships m
      where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
 )
);
create policy "lab private storage create" on storage.objects
 for insert to authenticated with check (
 bucket_id='content-lab-private'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and (
   exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
   or exists(select 1 from public.content_lab_memberships m
      where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
 )
);
create policy "lab private storage delete" on storage.objects
 for delete to authenticated using (
 bucket_id='content-lab-private'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and (
   exists(select 1 from public.content_lab_admins a where a.user_id=(select auth.uid()))
   or exists(select 1 from public.content_lab_memberships m
      where m.buyer_email=lower((select auth.jwt()->>'email')) and m.status='active')
 )
);
