-- Run in Supabase SQL Editor if the app is already live.

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.players(id) on delete set null,
  action text not null,
  details text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_created_idx on public.activity_log (created_at desc);

alter table public.activity_log enable row level security;

drop policy if exists "anon read activity_log" on public.activity_log;
drop policy if exists "anon write activity_log" on public.activity_log;

create policy "anon read activity_log" on public.activity_log for select to anon using (true);
create policy "anon write activity_log" on public.activity_log for insert to anon with check (true);
