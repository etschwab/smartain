create extension if not exists "uuid-ossp";

create table if not exists public.clubs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'player',
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid references public.clubs(id) on delete cascade,
  name text not null,
  age_group text,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete set null,
  first_name text not null,
  last_name text not null,
  position text,
  number integer,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'player',
  created_at timestamptz not null default now(),
  unique(team_id, user_id)
);

create table if not exists public.trainings (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams(id) on delete cascade,
  opponent text not null,
  starts_at timestamptz not null,
  location text,
  home_away text not null default 'home',
  own_score integer,
  opponent_score integer,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references public.players(id) on delete cascade,
  training_id uuid references public.trainings(id) on delete cascade,
  status text not null default 'unknown',
  note text,
  created_at timestamptz not null default now(),
  unique(player_id, training_id)
);

alter table public.clubs enable row level security;
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.team_members enable row level security;
alter table public.trainings enable row level security;
alter table public.matches enable row level security;
alter table public.attendance enable row level security;

-- MVP Policies: authenticated users can read/write during development.
-- Vor Produktion solltest du diese Policies pro Club/Team einschränken.
create policy "authenticated can read clubs" on public.clubs for select to authenticated using (true);
create policy "authenticated can insert clubs" on public.clubs for insert to authenticated with check (true);

create policy "users can read profiles" on public.profiles for select to authenticated using (true);
create policy "users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create policy "authenticated can manage teams" on public.teams for all to authenticated using (true) with check (true);
create policy "authenticated can manage players" on public.players for all to authenticated using (true) with check (true);
create policy "authenticated can manage team members" on public.team_members for all to authenticated using (true) with check (true);
create policy "authenticated can manage trainings" on public.trainings for all to authenticated using (true) with check (true);
create policy "authenticated can manage matches" on public.matches for all to authenticated using (true) with check (true);
create policy "authenticated can manage attendance" on public.attendance for all to authenticated using (true) with check (true);
