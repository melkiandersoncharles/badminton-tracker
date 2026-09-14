-- Run in Supabase SQL Editor if admin club delete fails on activity_log.

drop policy if exists "anon delete activity_log" on public.activity_log;
create policy "anon delete activity_log" on public.activity_log for delete to anon using (true);
