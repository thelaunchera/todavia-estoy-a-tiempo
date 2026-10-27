-- Dedicated podcast project. No customer email or payment credentials are stored here.
create table public.podcast_personalized_deliveries (
  id uuid primary key default gen_random_uuid(),
  checkout_id text not null unique check (checkout_id ~ '^cs_[A-Za-z0-9_]{8,240}$'),
  product_id text not null check (product_id in ('prod_VU7tP0ceGvmmmW','prod_VU7udk2LVQczyY')),
  buyer_name text not null default '',
  download_token text not null unique default encode(extensions.gen_random_bytes(32),'hex'),
  created_at timestamptz not null default now()
);
alter table public.podcast_personalized_deliveries enable row level security;
revoke all on public.podcast_personalized_deliveries from public, anon, authenticated;
grant select, insert, update, delete on public.podcast_personalized_deliveries to service_role;

-- SECURITY INVOKER: only the existing trusted purchase automation can issue links.
create function public.podcast_prepare_personalized_delivery(
  p_checkout_id text, p_product_id text, p_name_b64 text default ''
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_name text;
  v_first text;
  v_row public.podcast_personalized_deliveries;
  v_url constant text := 'https://fhrvuhikrybobidxpvnh.supabase.co/functions/v1/podcast-personalized-pdf';
begin
  if length(coalesce(p_name_b64,'')) > 4096 then raise exception 'Name too long'; end if;
  v_name := convert_from(decode(coalesce(p_name_b64,''),'base64'),'UTF8');
  -- Quotes, markup delimiters and controls cannot enter the mapped JSON/HTML greeting.
  v_name := left(trim(regexp_replace(regexp_replace(v_name, '[[:cntrl:]<>"\\&]', '', 'g'), '\s+', ' ', 'g')),120);
  insert into public.podcast_personalized_deliveries(checkout_id,product_id,buyer_name)
    values(p_checkout_id,p_product_id,v_name) on conflict(checkout_id) do nothing;
  select * into strict v_row from public.podcast_personalized_deliveries where checkout_id=p_checkout_id;
  if v_row.product_id <> p_product_id then raise exception 'Product mismatch'; end if;
  v_first := split_part(v_row.buyer_name,' ',1);
  return jsonb_build_object(
    'main_url',v_url||'?token='||v_row.download_token||'&file=main',
    'bonus_url',v_url||'?token='||v_row.download_token||'&file=bonus',
    'greeting',case when v_first='' then 'Hola, 🤍' else 'Hola, '||v_first||'. 🤍' end
  );
end;
$$;
revoke all on function public.podcast_prepare_personalized_delivery(text,text,text) from public, anon, authenticated;
grant execute on function public.podcast_prepare_personalized_delivery(text,text,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('podcast-personalized','podcast-personalized',false,20971520,array['application/pdf'])
on conflict(id) do nothing;
