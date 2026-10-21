-- Plays: every finished daily game, signed in or not, for solve-rate and average-guess stats.
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Needs public.current_puzzle_number() from leaderboard_v2.sql (already run).

create table if not exists public.plays (
  id bigint generated always as identity primary key,
  -- Random id kept in the player's browser, so each device counts once per day. Not linked to a person.
  client_id uuid not null,
  user_id uuid references auth.users (id) on delete set null,
  puzzle_number int not null,
  prospect_id text not null check (char_length(prospect_id) between 1 and 80),
  won boolean not null,
  guesses int not null check (guesses between 1 and 5),
  time_ms int not null check (time_ms between 0 and 86400000),
  created_at timestamptz not null default now(),
  unique (client_id, puzzle_number)
);

alter table public.plays enable row level security;

-- Anyone can record a play, but only for today's or yesterday's puzzle (late finishers), and only as
-- themselves when signed in. Nobody can read, change or delete rows through the API.
drop policy if exists "Anyone records a finished daily game" on public.plays;
create policy "Anyone records a finished daily game" on public.plays
  for insert with check (
    puzzle_number between public.current_puzzle_number() - 1 and public.current_puzzle_number()
    and (user_id is null or user_id = auth.uid())
  );

grant insert on public.plays to anon, authenticated;

-- Per-day totals, one row per day AND prospect, readable by anyone (no individual rows exposed). A day can
-- have a second, small row when someone played it in a tab still running an older schedule.
create or replace function public.puzzle_stats(p_puzzle int default null)
returns table (
  puzzle_number int,
  prospect_id text,
  players bigint,
  solved bigint,
  solve_rate numeric,
  avg_guesses_when_solved numeric,
  g1 bigint, g2 bigint, g3 bigint, g4 bigint, g5 bigint,
  median_time_s numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    puzzle_number,
    prospect_id,
    count(*) as players,
    count(*) filter (where won) as solved,
    round(100.0 * count(*) filter (where won) / count(*), 1) as solve_rate,
    round(avg(guesses) filter (where won), 2) as avg_guesses_when_solved,
    count(*) filter (where won and guesses = 1) as g1,
    count(*) filter (where won and guesses = 2) as g2,
    count(*) filter (where won and guesses = 3) as g3,
    count(*) filter (where won and guesses = 4) as g4,
    count(*) filter (where won and guesses = 5) as g5,
    round((percentile_cont(0.5) within group (order by time_ms) / 1000.0)::numeric, 0) as median_time_s
  from public.plays
  where p_puzzle is null or puzzle_number = p_puzzle
  group by puzzle_number, prospect_id
  order by puzzle_number desc, count(*) desc;
$$;

grant execute on function public.puzzle_stats(int) to anon, authenticated;

-- To see your numbers any time (SQL Editor):
--   select * from public.puzzle_stats();
