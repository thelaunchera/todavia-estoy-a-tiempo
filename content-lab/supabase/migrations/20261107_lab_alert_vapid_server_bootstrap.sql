-- Server-side VAPID bootstrap: generated within the Edge runtime, stored encrypted in Vault.
-- No browser or authenticated buyer may invoke this function.
create or replace function public.content_lab_store_vapid_keys(p_public text,p_private text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
 if length(p_public)<>87 or length(p_private)<>43 or p_public!~'^[A-Za-z0-9_-]+$'
  or p_private!~'^[A-Za-z0-9_-]+$' then return false; end if;
 if exists(select 1 from vault.decrypted_secrets where name='content_lab_vapid_public')
   or exists(select 1 from vault.decrypted_secrets where name='content_lab_vapid_private') then return false; end if;
 perform vault.create_secret(p_public,'content_lab_vapid_public','Content Lab public VAPID P-256 key');
 perform vault.create_secret(p_private,'content_lab_vapid_private','Private Web Push signing key; never exposed');
 return true;
end;$$;
revoke all on function public.content_lab_store_vapid_keys(text,text) from public,anon,authenticated;
grant execute on function public.content_lab_store_vapid_keys(text,text) to service_role;
-- Safe UUID conversion even if a buyer used an odd brand identifier in an old draft.
create or replace function public.content_lab_alert_brand_uuid(p_text text)
returns uuid language plpgsql immutable security invoker set search_path='' as $$
begin return p_text::uuid; exception when others then return null; end;$$;
revoke all on function public.content_lab_alert_brand_uuid(text) from public,anon;
grant execute on function public.content_lab_alert_brand_uuid(text) to service_role;
