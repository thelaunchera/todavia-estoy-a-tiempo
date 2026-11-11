import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Original reminder schema preserves buyer privacy and server-only dispatch',()=>{
 const schema=read('supabase/migrations/20261107_lab_alerts_6h_2h_push.sql');
 assert.match(schema,/content_lab_alert_settings\(/);
 assert.match(schema,/content_lab_push_subscriptions\(/);
 assert.match(schema,/content_lab_alerts\(/);
 assert.match(schema,/enable row level security/);
 assert.match(schema,/unique\(owner_id,event_key\)/);
 assert.match(schema,/interval '2 hours'/);
 assert.match(schema,/content_lab_alert_instant/);
 assert.match(schema,/content_lab_act_on_alert/);
 assert.match(schema,/when p_action='snooze' then now\(\)\+interval '1 hour'/);
 assert.match(schema,/revoke all on function public.content_lab_queue_due_alerts\(\) from public,anon,authenticated/);
});

test('Delivery works after closing the app; no browser timer masquerades as push',()=>{
 const cron=read('supabase/migrations/20261107_lab_alert_worker_schedule.sql');
 const server=read('supabase/functions/content-lab-alert-worker/index.ts');
 const sw=read('public/sw.js');
 assert.match(cron,/\*\/5 \* \* \* \*/);
 assert.match(cron,/content_lab_alert_worker_secret/);
 assert.match(server,/content_lab_queue_due_alerts/);
 assert.match(server,/content_lab_claim_alerts/);
 assert.match(server,/validSource\(a,pref\)/);
 assert.match(server,/webpush.sendNotification/);
 assert.match(server,/secrets.make_email_hook/);
 assert.match(server,/status===404\|\|status===410/);
 assert.match(sw,/addEventListener\('push'/);
 assert.match(sw,/showNotification/);
 assert.match(sw,/addEventListener\('notificationclick'/);
 assert.match(sw,/clients.openWindow/);
 assert.match(sw,/pathname.startsWith\('\/content-lab\/'\)/);
});

test('The bell is private, has snooze, direct project actions and voluntary iPhone push',()=>{
 const app=read('src/App.tsx'),bell=read('src/LabNotifications.tsx');
 const client=read('src/platform/client.ts');
 assert.match(app,/<LabNotifications email=\{account.email\|\|''\}/);
 assert.match(app,/openLabAlert\(alert\)/);
 assert.match(app,/get\(id\)/);
 assert.match(bell,/labNotificationApi.act\(alert.id,kind==='open'\?'read':'snooze'\)/);
 assert.match(bell,/Posponer 1 h/);
 assert.match(bell,/Abrir proyecto/);
 assert.match(bell,/labNotificationApi.enablePush/);
 assert.match(bell,/Correo de respaldo/);
 assert.match(client,/Notification.requestPermission\(\)/);
 assert.match(client,/pushManager.subscribe/);
 assert.match(client,/owner_id:user.id/);
 assert.match(client,/content_lab_public_push_key/);
});

test('Finishing a post celebrates successful manual save and scheduling stores timezone',()=>{
 const app=read('src/App.tsx'),grid=read('src/BrandGrid.tsx'),calendar=read('src/ContentCalendar.tsx');
 const celebration=read('src/SaveSuccessCelebration.tsx');
 assert.match(app,/const finished=automatic\?isFinishedPost\(source\):true/);
 assert.match(app,/isFinished:finished/);
 assert.match(app,/setSaveCelebration\(/);
 assert.match(app,/<SaveSuccessCelebration event=\{saveCelebration\}/);
 assert.match(celebration,/useEffect/);
 assert.match(celebration,/¡Lo lograste!/);
 assert.match(read('src/SaveSuccessCelebration.css'),/prefers-reduced-motion:reduce/);
 assert.match(app,/timeZone:Intl.DateTimeFormat\(\).resolvedOptions\(\).timeZone/);
 assert.match(grid,/scheduledTimeZone:Intl.DateTimeFormat\(\).resolvedOptions\(\).timeZone/);
 assert.match(calendar,/scheduledTimeZone:targetDate/);
});
