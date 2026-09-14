-- Allow admin UI (anon client) to create and delete teams.
-- Run in Supabase SQL Editor if teams table already exists with read-only policy.

drop policy if exists "anon write teams" on public.teams;
create policy "anon write teams" on public.teams for insert to anon with check (true);

drop policy if exists "anon delete teams" on public.teams;
create policy "anon delete teams" on public.teams for delete to anon using (true);
