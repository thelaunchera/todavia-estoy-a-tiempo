-- Periodic delivery is server-side, independent of Safari or the PWA being open.
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'content-lab-buyer-reminders-every-five-minutes',
  '*/5 * * * *',
  $job$
    select net.http_post(
      url:='https://fhrvuhikrybobidxpvnh.supabase.co/functions/v1/content-lab-alert-worker',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'x-content-lab-worker',
        (select decrypted_secret from vault.decrypted_secrets where name='content_lab_alert_worker_secret')
      ),
      body:='{}'::jsonb,
      timeout_milliseconds:=60000
    );
  $job$
);
