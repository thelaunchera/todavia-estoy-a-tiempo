-- Buyer sessions are valid for 24 hours from the original verified email OTP.
-- Refreshing the JWT or using the browser/PWA does not renew that session.
-- The existing active purchase stays active: this is authentication, not billing.
create or replace function public.content_lab_session_expires_at()
returns timestamptz language sql stable security definer
set search_path=''
as $$
 select s.created_at + interval '24 hours'
 from auth.sessions s
 where s.user_id=(select auth.uid())
   and s.id::text=(select auth.jwt()->>'session_id')
 limit 1
$$;
revoke all on function public.content_lab_session_expires_at() from public;
grant execute on function public.content_lab_session_expires_at() to authenticated;

alter policy "content lab buyer sees own purchase"
on public.content_lab_memberships
using (
 buyer_email=lower((select auth.jwt()->>'email'))
 and (select public.content_lab_session_expires_at())>now()
);
