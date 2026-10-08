-- Leaderboard v2: one all-time board with correct guesses and current streak.
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- (schema.sql already includes this for fresh projects.)

-- Today's puzzle number, matching the game: puzzle 1 = 2026-10-01, days roll over at midnight Eastern.
create or replace function public.current_puzzle_number()
returns int
language sql
stable
as $$
  select ((now() at time zone 'America/New_York')::date - date '2026-10-01') + 1;
$$;

drop view if exists public.leaderboard;
create view public.leaderboard
with (security_invoker = true) as
with wins as (
  -- Consecutive winning puzzles share the same (puzzle_number - row_number) group
  select user_id, puzzle_number,
         puzzle_number - row_number() over (partition by user_id order by puzzle_number) as grp
  from public.results
  where won
),
runs as (
  select user_id, grp, max(puzzle_number) as last_win, count(*) as len
  from wins
  group by user_id, grp
),
latest_run as (
  select distinct on (user_id) user_id, last_win, len
  from runs
  order by user_id, last_win desc
),
last_played as (
  select user_id, max(puzzle_number) as last_puzzle
  from public.results
  group by user_id
)
select
  p.username,
  count(*) filter (where r.won) as correct_guesses,
  -- A streak only counts if its last win is today or yesterday (a missed day resets it)
  -- and nothing was lost after it.
  coalesce(max(
    case
      when lr.last_win >= public.current_puzzle_number() - 1 and lr.last_win = lp.last_puzzle then lr.len
      else 0
    end
  ), 0) as current_streak
from public.profiles p
join public.results r on r.user_id = p.id
left join latest_run lr on lr.user_id = p.id
left join last_played lp on lp.user_id = p.id
group by p.username;

grant execute on function public.current_puzzle_number() to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;
