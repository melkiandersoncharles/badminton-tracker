-- Run this in Supabase SQL Editor if the app is already live.
-- Creates shuttle box tracking (6 shuttles per box + who holds it).

create table if not exists public.shuttle_boxes (
  id uuid primary key default gen_random_uuid(),
  holder_id uuid references public.players(id) on delete set null,
  used integer not null default 0 check (used >= 0 and used <= 6),
  opened_on date not null default (current_date),
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists shuttle_boxes_open_idx on public.shuttle_boxes (closed_at);

alter table public.shuttle_boxes enable row level security;

drop policy if exists "anon read shuttle_boxes" on public.shuttle_boxes;
drop policy if exists "anon write shuttle_boxes" on public.shuttle_boxes;
drop policy if exists "anon update shuttle_boxes" on public.shuttle_boxes;
drop policy if exists "anon delete shuttle_boxes" on public.shuttle_boxes;

create policy "anon read shuttle_boxes" on public.shuttle_boxes for select to anon using (true);
create policy "anon write shuttle_boxes" on public.shuttle_boxes for insert to anon with check (true);
create policy "anon update shuttle_boxes" on public.shuttle_boxes for update to anon using (true) with check (true);
create policy "anon delete shuttle_boxes" on public.shuttle_boxes for delete to anon using (true);
