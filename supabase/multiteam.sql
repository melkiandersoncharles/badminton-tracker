-- =============================================================================
-- MULTI-TEAM MIGRATION
-- =============================================================================
-- PREREQUISITE: Run supabase/backup/pre-multiteam-backup.sql first on live DBs.
-- New installs: use supabase/schema.sql instead (includes teams + team_id).

-- Teams (one PIN per team)
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin text not null unique,
  created_at timestamptz not null default now()
);

-- Default team for existing club data (PIN matches VITE_GROUP_PIN default)
insert into public.teams (name, pin)
values ('Default Club', '2580')
on conflict (pin) do nothing;

alter table public.teams enable row level security;

drop policy if exists "anon read teams" on public.teams;
create policy "anon read teams" on public.teams for select to anon using (true);

drop policy if exists "anon write teams" on public.teams;
create policy "anon write teams" on public.teams for insert to anon with check (true);

drop policy if exists "anon delete teams" on public.teams;
create policy "anon delete teams" on public.teams for delete to anon using (true);

-- Players
alter table public.players add column if not exists team_id uuid references public.teams(id);
update public.players
set team_id = (select id from public.teams where pin = '2580' limit 1)
where team_id is null;
alter table public.players alter column team_id set not null;
create index if not exists players_team_id_idx on public.players (team_id);

-- Matches
alter table public.matches add column if not exists team_id uuid references public.teams(id);
update public.matches
set team_id = (select id from public.teams where pin = '2580' limit 1)
where team_id is null;
alter table public.matches alter column team_id set not null;
create index if not exists matches_team_id_idx on public.matches (team_id);

-- Shuttle boxes
alter table public.shuttle_boxes add column if not exists team_id uuid references public.teams(id);
update public.shuttle_boxes
set team_id = (select id from public.teams where pin = '2580' limit 1)
where team_id is null;
alter table public.shuttle_boxes alter column team_id set not null;
create index if not exists shuttle_boxes_team_id_idx on public.shuttle_boxes (team_id);

-- Activity log (if present)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'activity_log'
  ) then
    execute 'alter table public.activity_log add column if not exists team_id uuid references public.teams(id)';
    execute $q$
      update public.activity_log
      set team_id = (select id from public.teams where pin = '2580' limit 1)
      where team_id is null
    $q$;
    execute 'alter table public.activity_log alter column team_id set not null';
    execute 'create index if not exists activity_log_team_id_idx on public.activity_log (team_id)';
  end if;
end $$;
