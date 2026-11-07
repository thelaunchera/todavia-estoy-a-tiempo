-- Applied to production on 2026-11-07.
-- The signed-in buyer needs this helper for their 24-hour OTP window.
-- Anonymous visitors must not be able to call its SECURITY DEFINER RPC.
REVOKE EXECUTE ON FUNCTION public.content_lab_session_expires_at() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.content_lab_session_expires_at() TO authenticated;
