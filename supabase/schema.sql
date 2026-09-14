-- Badminton Tracker schema (multi-team)
-- Paste this into the Supabase SQL editor (SQL → New query).

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin text not null unique,
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;

drop policy if exists "anon read teams" on public.teams;
create policy "anon read teams" on public.teams for select to anon using (true);

drop policy if exists "anon write teams" on public.teams;
create policy "anon write teams" on public.teams for insert to anon with check (true);

drop policy if exists "anon delete teams" on public.teams;
create policy "anon delete teams" on public.teams for delete to anon using (true);

-- Default team (PIN matches VITE_GROUP_PIN default)
insert into public.teams (name, pin)
values ('Default Club', '2580')
on conflict (pin) do nothing;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id),
  name text not null,
  photo_url text,
  is_guest boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists players_team_id_idx on public.players (team_id);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id),
  played_on date not null default (current_date),
  court smallint not null check (court in (1, 2)),
  team_a_1 uuid not null references public.players(id),
  team_a_2 uuid not null references public.players(id),
  team_b_1 uuid not null references public.players(id),
  team_b_2 uuid not null references public.players(id),
  score_a integer not null check (score_a >= 0),
  score_b integer not null check (score_b >= 0),
  created_at timestamptz not null default now()
);

create index if not exists matches_played_on_idx on public.matches (played_on desc);
create index if not exists matches_court_idx on public.matches (court);
create index if not exists matches_team_id_idx on public.matches (team_id);

alter table public.players enable row level security;
alter table public.matches enable row level security;

drop policy if exists "anon read players" on public.players;
drop policy if exists "anon write players" on public.players;
drop policy if exists "anon update players" on public.players;
drop policy if exists "anon delete players" on public.players;
drop policy if exists "anon read matches" on public.matches;
drop policy if exists "anon write matches" on public.matches;
drop policy if exists "anon update matches" on public.matches;
drop policy if exists "anon delete matches" on public.matches;

create policy "anon read players" on public.players for select to anon using (true);
create policy "anon write players" on public.players for insert to anon with check (true);
create policy "anon update players" on public.players for update to anon using (true) with check (true);
create policy "anon delete players" on public.players for delete to anon using (true);

create policy "anon read matches" on public.matches for select to anon using (true);
create policy "anon write matches" on public.matches for insert to anon with check (true);
create policy "anon update matches" on public.matches for update to anon using (true) with check (true);
create policy "anon delete matches" on public.matches for delete to anon using (true);

insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "public read player photos" on storage.objects;
drop policy if exists "anon upload player photos" on storage.objects;
drop policy if exists "anon update player photos" on storage.objects;
drop policy if exists "anon delete player photos" on storage.objects;

create policy "public read player photos"
  on storage.objects for select
  using (bucket_id = 'player-photos');

create policy "anon upload player photos"
  on storage.objects for insert to anon
  with check (bucket_id = 'player-photos');

create policy "anon update player photos"
  on storage.objects for update to anon
  using (bucket_id = 'player-photos')
  with check (bucket_id = 'player-photos');

create policy "anon delete player photos"
  on storage.objects for delete to anon
  using (bucket_id = 'player-photos');

-- Shuttle boxes (6 shuttles each)
create table if not exists public.shuttle_boxes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id),
  holder_id uuid references public.players(id) on delete set null,
  used integer not null default 0 check (used >= 0 and used <= 6),
  opened_on date not null default (current_date),
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists shuttle_boxes_open_idx on public.shuttle_boxes (closed_at);
create index if not exists shuttle_boxes_team_id_idx on public.shuttle_boxes (team_id);

alter table public.shuttle_boxes enable row level security;

drop policy if exists "anon read shuttle_boxes" on public.shuttle_boxes;
drop policy if exists "anon write shuttle_boxes" on public.shuttle_boxes;
drop policy if exists "anon update shuttle_boxes" on public.shuttle_boxes;
drop policy if exists "anon delete shuttle_boxes" on public.shuttle_boxes;

create policy "anon read shuttle_boxes" on public.shuttle_boxes for select to anon using (true);
create policy "anon write shuttle_boxes" on public.shuttle_boxes for insert to anon with check (true);
create policy "anon update shuttle_boxes" on public.shuttle_boxes for update to anon using (true) with check (true);
create policy "anon delete shuttle_boxes" on public.shuttle_boxes for delete to anon using (true);

-- Activity log (who did what)
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id),
  actor_id uuid references public.players(id) on delete set null,
  action text not null,
  details text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_created_idx on public.activity_log (created_at desc);
create index if not exists activity_log_team_id_idx on public.activity_log (team_id);

alter table public.activity_log enable row level security;

drop policy if exists "anon read activity_log" on public.activity_log;
drop policy if exists "anon write activity_log" on public.activity_log;
drop policy if exists "anon delete activity_log" on public.activity_log;

create policy "anon read activity_log" on public.activity_log for select to anon using (true);
create policy "anon write activity_log" on public.activity_log for insert to anon with check (true);
create policy "anon delete activity_log" on public.activity_log for delete to anon using (true);
