-- DRAFT. Not reviewed. Do not use with real users until the checks in docs/implementation.md 20.10 are done.
-- Run in the Supabase SQL editor of a new project. Phone sign-in is configured in the dashboard.

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stage text check (stage in ('pregnant', 'after_birth')),
  due_date date,
  delivery_date date,
  language text not null default 'hi' check (language in ('hi', 'en')),
  created_at timestamptz not null default now()
);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  phase text not null check (phase in ('pregnancy', 'postpartum')),
  answers jsonb not null default '{}'::jsonb,   -- question id -> yes | no | not_sure
  note text check (char_length(note) <= 1000),
  tier text check (tier in ('GREEN', 'AMBER', 'RED')),
  rules_version text,
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

alter table public.profiles enable row level security;
alter table public.checkins enable row level security;

create policy "own profile" on public.profiles
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own checkins" on public.checkins
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- No policy for the anon role: signed-out visitors can read and write nothing.

-- Lets a signed-in user delete her own account. Her checkins and profile go with it (on delete cascade).
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = public, auth as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
