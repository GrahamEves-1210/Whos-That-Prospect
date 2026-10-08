-- Prospect requests from the footer form.
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Read them in Table Editor > prospect_requests. Players can submit but can't read the list.

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
