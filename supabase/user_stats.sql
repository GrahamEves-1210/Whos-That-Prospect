-- Cross-device stats: one row per signed-in player holding their stats.
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.

create table if not exists public.user_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stats jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_stats enable row level security;

drop policy if exists "Players read their own stats" on public.user_stats;
create policy "Players read their own stats" on public.user_stats
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Players save their own stats" on public.user_stats;
create policy "Players save their own stats" on public.user_stats
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Players update their own stats" on public.user_stats;
create policy "Players update their own stats" on public.user_stats
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.user_stats to authenticated;
