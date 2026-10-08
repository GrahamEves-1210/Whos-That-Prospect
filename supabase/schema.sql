-- Who's That Prospect? Supabase schema.
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user. Username defaults to the email prefix.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique
    check (char_length(username) between 3 and 24 and username ~ '^[A-Za-z0-9_.-]+$'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are public" on public.profiles;
create policy "Profiles are public" on public.profiles
  for select using (true);

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Create the profile on sign-up. Username = email prefix, cleaned up,
-- with a short suffix if that name is already taken.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
begin
  base := regexp_replace(split_part(new.email, '@', 1), '[^A-Za-z0-9_.-]', '', 'g');
  if char_length(base) < 3 then
    base := base || 'fan';
  end if;
  base := left(base, 20);
  candidate := base;
  while exists (select 1 from public.profiles where lower(username) = lower(candidate)) loop
    candidate := base || floor(random() * 900 + 100)::int;
  end loop;
  insert into public.profiles (id, username) values (new.id, candidate);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Results: one finished daily game per user per puzzle.
-- ---------------------------------------------------------------------------
create table if not exists public.results (
  user_id uuid not null references public.profiles (id) on delete cascade,
  puzzle_number int not null check (puzzle_number > 0),
  won boolean not null,
  guesses int not null check (guesses between 1 and 6),
  time_ms int not null check (time_ms >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, puzzle_number)
);

alter table public.results enable row level security;

drop policy if exists "Results are public" on public.results;
create policy "Results are public" on public.results
  for select using (true);

drop policy if exists "Users insert their own results" on public.results;
create policy "Users insert their own results" on public.results
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Leaderboard: correct guesses and current streak (same as leaderboard_v2.sql)
-- ---------------------------------------------------------------------------

-- Today's puzzle number, matching the game: puzzle 1 = 2026-10-01, days roll over at midnight Eastern.
create or replace function public.current_puzzle_number()
returns int
language sql
stable
as $
  select ((now() at time zone 'America/New_York')::date - date '2026-10-01') + 1;
$;

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


-- ---------------------------------------------------------------------------
-- Data API access. Needed when "Automatically expose new tables" is off;
-- harmless when it's on. RLS policies above still decide which rows.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.results to anon, authenticated;
grant update (username) on public.profiles to authenticated;
grant insert on public.results to authenticated;

-- ---------------------------------------------------------------------------
-- Prospect requests (same as prospect_requests.sql)
-- ---------------------------------------------------------------------------

create table if not exists public.prospect_requests (
  id bigint generated always as identity primary key,
  prospect text not null check (char_length(prospect) between 2 and 80),
  note text check (note is null or char_length(note) <= 280),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.prospect_requests enable row level security;

drop policy if exists "Anyone can submit a request" on public.prospect_requests;
create policy "Anyone can submit a request" on public.prospect_requests
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

grant insert on public.prospect_requests to anon, authenticated;
