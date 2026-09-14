-- =============================================================================
-- PRE-MULTITEAM BACKUP — run in Supabase SQL Editor BEFORE multiteam.sql
-- =============================================================================
-- Creates snapshot tables of current club data. Safe to re-run (drops + recreates).

drop table if exists public.backup_players;
create table public.backup_players as
  select * from public.players;

drop table if exists public.backup_matches;
create table public.backup_matches as
  select * from public.matches;

drop table if exists public.backup_shuttle_boxes;
create table public.backup_shuttle_boxes as
  select * from public.shuttle_boxes;

-- activity_log may not exist on older installs
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'activity_log'
  ) then
    execute 'drop table if exists public.backup_activity_log';
    execute 'create table public.backup_activity_log as select * from public.activity_log';
  end if;
end $$;
