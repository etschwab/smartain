-- SpielerPlus-style team organization modules for Smartrain.
-- Safe to run repeatedly after the base schema.

create table if not exists public.team_updates (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'message' check (kind in ('news', 'message')),
  title text,
  body text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (kind = 'message' or nullif(trim(title), '') is not null)
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  question text not null,
  description text,
  closes_at timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique(poll_id, user_id)
);

create table if not exists public.absences (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  reason text not null default 'other' check (reason in ('holiday', 'illness', 'injury', 'school', 'work', 'other')),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_on >= starts_on)
);

create table if not exists public.carpools (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  driver_id uuid not null references auth.users(id) on delete cascade,
  seats integer not null check (seats between 1 and 20),
  meeting_point text not null,
  departure_at timestamptz,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.carpool_riders (
  id uuid primary key default gen_random_uuid(),
  carpool_id uuid not null references public.carpools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique(carpool_id, user_id)
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  member_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('income', 'expense', 'fine', 'fee')),
  title text not null,
  note text,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'open' check (status in ('open', 'paid')),
  due_on date,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.event_lineup (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  position_label text,
  is_starter boolean not null default true,
  note text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(event_id, user_id)
);

create index if not exists idx_team_updates_team_created on public.team_updates(team_id, created_at desc);
create index if not exists idx_polls_team_created on public.polls(team_id, created_at desc);
create index if not exists idx_absences_team_dates on public.absences(team_id, starts_on, ends_on);
create index if not exists idx_carpools_team_event on public.carpools(team_id, event_id);
create index if not exists idx_ledger_entries_team_status on public.ledger_entries(team_id, status);
create index if not exists idx_event_lineup_event on public.event_lineup(event_id);

drop trigger if exists team_updates_set_updated_at on public.team_updates;
create trigger team_updates_set_updated_at before update on public.team_updates
for each row execute function public.set_updated_at();
drop trigger if exists polls_set_updated_at on public.polls;
create trigger polls_set_updated_at before update on public.polls
for each row execute function public.set_updated_at();
drop trigger if exists absences_set_updated_at on public.absences;
create trigger absences_set_updated_at before update on public.absences
for each row execute function public.set_updated_at();
drop trigger if exists carpools_set_updated_at on public.carpools;
create trigger carpools_set_updated_at before update on public.carpools
for each row execute function public.set_updated_at();
drop trigger if exists ledger_entries_set_updated_at on public.ledger_entries;
create trigger ledger_entries_set_updated_at before update on public.ledger_entries
for each row execute function public.set_updated_at();
drop trigger if exists event_lineup_set_updated_at on public.event_lineup;
create trigger event_lineup_set_updated_at before update on public.event_lineup
for each row execute function public.set_updated_at();

alter table public.team_updates enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.absences enable row level security;
alter table public.carpools enable row level security;
alter table public.carpool_riders enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.event_lineup enable row level security;

drop policy if exists "team_updates_select_members" on public.team_updates;
create policy "team_updates_select_members" on public.team_updates for select to authenticated
using (public.is_team_member(team_id));
drop policy if exists "team_updates_insert_members" on public.team_updates;
create policy "team_updates_insert_members" on public.team_updates for insert to authenticated
with check (auth.uid() = author_id and public.is_team_member(team_id) and (kind = 'message' or public.is_team_manager(team_id)));
drop policy if exists "team_updates_delete_author_or_manager" on public.team_updates;
create policy "team_updates_delete_author_or_manager" on public.team_updates for delete to authenticated
using (auth.uid() = author_id or public.is_team_manager(team_id));

drop policy if exists "polls_select_members" on public.polls;
create policy "polls_select_members" on public.polls for select to authenticated using (public.is_team_member(team_id));
drop policy if exists "polls_manage_managers" on public.polls;
create policy "polls_manage_managers" on public.polls for all to authenticated
using (public.is_team_manager(team_id)) with check (public.is_team_manager(team_id));
drop policy if exists "poll_options_select_members" on public.poll_options;
create policy "poll_options_select_members" on public.poll_options for select to authenticated
using (exists (select 1 from public.polls p where p.id = poll_id and public.is_team_member(p.team_id)));
drop policy if exists "poll_options_manage_managers" on public.poll_options;
create policy "poll_options_manage_managers" on public.poll_options for all to authenticated
using (exists (select 1 from public.polls p where p.id = poll_id and public.is_team_manager(p.team_id)))
with check (exists (select 1 from public.polls p where p.id = poll_id and public.is_team_manager(p.team_id)));
drop policy if exists "poll_votes_select_members" on public.poll_votes;
create policy "poll_votes_select_members" on public.poll_votes for select to authenticated
using (exists (select 1 from public.polls p where p.id = poll_id and public.is_team_member(p.team_id)));
drop policy if exists "poll_votes_insert_self" on public.poll_votes;
create policy "poll_votes_insert_self" on public.poll_votes for insert to authenticated
with check (auth.uid() = user_id and exists (select 1 from public.polls p where p.id = poll_id and public.is_team_member(p.team_id)));
drop policy if exists "poll_votes_update_self" on public.poll_votes;
create policy "poll_votes_update_self" on public.poll_votes for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "absences_select_members" on public.absences;
create policy "absences_select_members" on public.absences for select to authenticated using (public.is_team_member(team_id));
drop policy if exists "absences_insert_self_or_manager" on public.absences;
create policy "absences_insert_self_or_manager" on public.absences for insert to authenticated
with check (public.is_team_member(team_id) and (auth.uid() = user_id or public.is_team_manager(team_id)));
drop policy if exists "absences_delete_self_or_manager" on public.absences;
create policy "absences_delete_self_or_manager" on public.absences for delete to authenticated
using (auth.uid() = user_id or public.is_team_manager(team_id));

drop policy if exists "carpools_select_members" on public.carpools;
create policy "carpools_select_members" on public.carpools for select to authenticated using (public.is_team_member(team_id));
drop policy if exists "carpools_insert_driver" on public.carpools;
create policy "carpools_insert_driver" on public.carpools for insert to authenticated
with check (auth.uid() = driver_id and public.is_team_member(team_id));
drop policy if exists "carpools_delete_driver_or_manager" on public.carpools;
create policy "carpools_delete_driver_or_manager" on public.carpools for delete to authenticated
using (auth.uid() = driver_id or public.is_team_manager(team_id));
drop policy if exists "carpool_riders_select_members" on public.carpool_riders;
create policy "carpool_riders_select_members" on public.carpool_riders for select to authenticated
using (exists (select 1 from public.carpools c where c.id = carpool_id and public.is_team_member(c.team_id)));
drop policy if exists "carpool_riders_manage_self" on public.carpool_riders;
create policy "carpool_riders_manage_self" on public.carpool_riders for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id and exists (select 1 from public.carpools c where c.id = carpool_id and public.is_team_member(c.team_id)));

drop policy if exists "ledger_entries_select_members" on public.ledger_entries;
create policy "ledger_entries_select_members" on public.ledger_entries for select to authenticated using (public.is_team_member(team_id));
drop policy if exists "ledger_entries_manage_managers" on public.ledger_entries;
create policy "ledger_entries_manage_managers" on public.ledger_entries for all to authenticated
using (public.is_team_manager(team_id)) with check (public.is_team_manager(team_id));

drop policy if exists "event_lineup_select_members" on public.event_lineup;
create policy "event_lineup_select_members" on public.event_lineup for select to authenticated using (public.is_team_member(team_id));
drop policy if exists "event_lineup_manage_managers" on public.event_lineup;
create policy "event_lineup_manage_managers" on public.event_lineup for all to authenticated
using (public.is_team_manager(team_id)) with check (public.is_team_manager(team_id));
