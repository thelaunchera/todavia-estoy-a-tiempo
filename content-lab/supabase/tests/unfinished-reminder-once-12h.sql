-- Run after the 12-hour migration. Isolated fixtures always roll back; no worker
-- or provider is invoked, so this never sends email/push or leaves test accounts.
begin;
do $$
declare
 u uuid:=gen_random_uuid();
 early uuid:=gen_random_uuid();
 boundary uuid:=gen_random_uuid();
 overdue uuid:=gen_random_uuid();
 finished uuid:=gen_random_uuid();
 ready uuid:=gen_random_uuid();
 empty_post uuid:=gen_random_uuid();
 scheduled uuid:=gen_random_uuid();
 cancelled uuid:=gen_random_uuid();
 a uuid;
 claimed uuid[];
begin
 insert into auth.users(id,email) values(u,'lab-qa-'||u||'@example.invalid');
 insert into public.content_lab_admins(user_id) values(u);
 insert into public.content_lab_alert_settings(owner_id) values(u);
 insert into public.content_lab_posts(id,owner_id,payload,updated_at) values
  (early,u,'{"hook":"Not yet"}',now()-interval '11 hours 59 minutes'),
  (boundary,u,'{"hook":"Exactly twelve hours"}',now()-interval '12 hours'),
  (overdue,u,'{"hook":"Overdue"}',now()-interval '13 hours'),
  (finished,u,'{"hook":"Finished","isFinished":true}',now()-interval '13 hours'),
  (ready,u,'{"hook":"Ready","status":"Ready"}',now()-interval '13 hours'),
  (empty_post,u,'{}',now()-interval '13 hours'),
  (scheduled,u,jsonb_build_object('hook','Calendar','date',to_char(now()+interval '1 hour','YYYY-MM-DD'),
   'time',to_char(now()+interval '1 hour','HH24:MI'),'timeZone',current_setting('TimeZone')),now());
 perform public.content_lab_queue_due_alerts();
 if (select count(*) from public.content_lab_alerts where owner_id=u and kind='unfinished')<>2 then
  raise exception 'Only the 12h and 13h unfinished posts should be queued';
 end if;
 if (select count(*) from public.content_lab_alerts where owner_id=u and kind='scheduled')<>1 then
  raise exception 'Scheduled 2h reminder changed';
 end if;
 perform public.content_lab_queue_due_alerts();
 if (select count(*) from public.content_lab_alerts where owner_id=u and kind='unfinished')<>2 then
  raise exception 'Repeated queue generated another unfinished reminder';
 end if;
 -- A delivered post must never be re-queued after a new saved revision.
 update public.content_lab_alerts set delivery_state='email',delivered_at=now()
  where owner_id=u and source_id=boundary returning id into a;
 update public.content_lab_posts set updated_at=now()-interval '14 hours' where id=boundary;
 perform public.content_lab_queue_due_alerts();
 if (select count(*) from public.content_lab_alerts where owner_id=u and source_id=boundary)<>1 then
  raise exception 'Saving another revision generated a second reminder';
 end if;
 -- Both action and ownership rules are checked through the actual RPC.
 perform set_config('request.jwt.claim.sub',u::text,true);
 if public.content_lab_act_on_alert(a,'snooze') then
  raise exception 'Unfinished reminder can still be snoozed/re-sent';
 end if;
 if not public.content_lab_act_on_alert(a,'read') then raise exception 'Read action stopped working'; end if;
 select id into a from public.content_lab_alerts where owner_id=u and source_id=scheduled;
 if not public.content_lab_act_on_alert(a,'snooze') then raise exception 'Calendar snooze stopped working'; end if;
 -- An old 6-hour queued alert cannot bypass the new dispatch deadline.
 insert into public.content_lab_alerts(owner_id,event_key,kind,source_type,source_id)
  values(u,'qa:legacy-6h','unfinished','post',early);
 select array_agg(id) into claimed from public.content_lab_claim_alerts(50);
 if exists(select 1 from public.content_lab_alerts where owner_id=u and source_id=early and id=any(claimed)) then
  raise exception 'Claimed an unfinished post before 12 hours';
 end if;
 if not exists(select 1 from public.content_lab_alerts where owner_id=u and source_id=overdue and id=any(claimed)) then
  raise exception 'Due unfinished post was not claimable';
 end if;
 -- The uniqueness guard rejects two simultaneous active events for one post.
 begin
  insert into public.content_lab_alerts(owner_id,event_key,kind,source_type,source_id)
   values(u,'qa:duplicate','unfinished','post',overdue);
  raise exception 'Uniqueness guard did not prevent the duplicate';
 exception when unique_violation then null;
 end;
 -- A cancelled, never-delivered attempt permits a later genuinely due edit.
 insert into public.content_lab_posts(id,owner_id,payload,updated_at)
  values(cancelled,u,'{"hook":"New edit after cancellation"}',now()-interval '13 hours');
 insert into public.content_lab_alerts(owner_id,event_key,kind,source_type,source_id,delivery_state)
  values(u,'qa:cancelled','unfinished','post',cancelled,'cancelled');
 perform public.content_lab_queue_due_alerts();
 if (select count(*) from public.content_lab_alerts where owner_id=u and source_id=cancelled and delivery_state='pending')<>1 then
  raise exception 'Cancelled unsent attempt blocked a later eligible reminder';
 end if;
 -- Simulate the legacy snooze state on a delivered reminder: it stays blocked.
 update public.content_lab_alerts set delivery_state='pending',read_at=null,snoozed_until=null,retry_after=null
  where owner_id=u and source_id=boundary;
 select array_agg(id) into claimed from public.content_lab_claim_alerts(50);
 if exists(select 1 from public.content_lab_alerts where owner_id=u and source_id=boundary and id=any(claimed)) then
  raise exception 'A previously delivered reminder was claimed again';
 end if;
 if has_function_privilege('anon','public.content_lab_queue_due_alerts()','execute')
  or has_function_privilege('authenticated','public.content_lab_claim_alerts(integer)','execute') then
  raise exception 'Internal dispatch RPCs became client-accessible';
 end if;
end;$$;
rollback;
select 'PASS: 12h boundary, no repeat after edits/read, dispatch guard, unique event, calendar snooze and private RPCs; all fixtures rolled back' as result;
