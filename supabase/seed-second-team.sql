-- Example: add a second team with its own PIN.
-- Run in Supabase SQL Editor after multiteam.sql (or on a fresh schema.sql install).
--
-- Members enter the new PIN on the club login screen; all data is scoped to that team.

insert into public.teams (name, pin)
values ('Tuesday Night Group', '4321')
on conflict (pin) do nothing;

-- To list teams:
-- select id, name, pin, created_at from public.teams order by created_at;
