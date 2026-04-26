create extension if not exists "pgcrypto";

do $$
begin
  create type public.team_role as enum ('owner', 'coach', 'player', 'parent');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.member_status as enum ('active', 'pending', 'inactive');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.event_type as enum ('training', 'game', 'meeting', 'event');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.response_status as enum ('yes', 'no', 'maybe');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_status as enum ('open', 'done');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  jersey_number integer,
  position text,
  birthday date,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists jersey_number integer;
alter table public.profiles add column if not exists position text;
alter table public.profiles add column if not exists birthday date;
alter table public.profiles add column if not exists emergency_contact_name text;
alter table public.profiles add column if not exists emergency_contact_phone text;
alter table public.profiles add column if not exists updated_at timestamptz not null default timezone('utc', now());

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport text not null default 'Football',
  season text not null default to_char(current_date, 'YYYY'),
  logo_url text,
  theme_color text not null default '#115e59',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.teams add column if not exists sport text;
alter table public.teams add column if not exists season text;
alter table public.teams add column if not exists logo_url text;
alter table public.teams add column if not exists theme_color text;
alter table public.teams add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.teams add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.teams
set
  sport = coalesce(nullif(sport, ''), 'Football'),
  season = coalesce(nullif(season, ''), to_char(current_date, 'YYYY')),
  theme_color = coalesce(nullif(theme_color, ''), '#115e59')
where sport is null
   or season is null
   or theme_color is null;

alter table public.teams alter column sport set default 'Football';
alter table public.teams alter column sport set not null;
alter table public.teams alter column season set default to_char(current_date, 'YYYY');
alter table public.teams alter column season set not null;
alter table public.teams alter column theme_color set default '#115e59';
alter table public.teams alter column theme_color set not null;

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.team_role not null default 'player',
  status public.member_status not null default 'active',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(team_id, user_id)
);

alter table public.team_members add column if not exists status public.member_status not null default 'active';
alter table public.team_members add column if not exists invited_by uuid references auth.users(id) on delete set null;
alter table public.team_members add column if not exists updated_at timestamptz not null default timezone('utc', now());
alter table public.team_members alter column role type public.team_role using role::public.team_role;

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  token text,
  team_name text not null,
  team_sport text not null,
  role public.team_role not null default 'player',
  is_active boolean not null default true,
  expires_at timestamptz,
  last_used_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null,
  type public.event_type not null default 'training',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.event_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.response_status not null,
  comment text,
  responded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(event_id, user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  description text,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  status public.task_status not null default 'open',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  action_path text,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_team_members_user_id on public.team_members(user_id);
create index if not exists idx_team_members_team_id on public.team_members(team_id);
create index if not exists idx_team_invites_code on public.team_invites(code);
create index if not exists idx_events_team_id_starts_at on public.events(team_id, starts_at);
create index if not exists idx_event_responses_event_id on public.event_responses(event_id);
create index if not exists idx_tasks_team_id_status on public.tasks(team_id, status);
create index if not exists idx_notifications_user_id_is_read on public.notifications(user_id, is_read);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

create or replace function public.is_team_member(target_team_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.team_members tm
    where tm.team_id = target_team_id
      and tm.user_id = target_user_id
      and tm.status = 'active'
  );
$$;

create or replace function public.team_role_for(target_team_id uuid, target_user_id uuid default auth.uid())
returns public.team_role
language sql
stable
security definer
set search_path = public
as $$
  select tm.role
  from public.team_members tm
  where tm.team_id = target_team_id
    and tm.user_id = target_user_id
    and tm.status = 'active'
  limit 1;
$$;

create or replace function public.is_team_manager(target_team_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.team_role_for(target_team_id, target_user_id) in ('owner', 'coach'), false);
$$;

create or replace function public.join_team_with_invite(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_record public.team_invites%rowtype;
  joined_team_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  select *
  into invite_record
  from public.team_invites
  where (code = invite_code or token = invite_code)
    and is_active = true
    and (expires_at is null or expires_at > timezone('utc', now()))
  order by created_at desc
  limit 1;

  if not found then
    raise exception 'invite_not_found';
  end if;

  insert into public.team_members (team_id, user_id, role, status, invited_by)
  values (invite_record.team_id, auth.uid(), invite_record.role, 'active', invite_record.created_by)
  on conflict (team_id, user_id) do update
    set status = 'active',
        role = excluded.role,
        invited_by = coalesce(public.team_members.invited_by, excluded.invited_by),
        updated_at = timezone('utc', now());

  update public.team_invites
  set last_used_at = timezone('utc', now())
  where id = invite_record.id;

  joined_team_id := invite_record.team_id;
  return joined_team_id;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

drop trigger if exists team_invites_set_updated_at on public.team_invites;
create trigger team_invites_set_updated_at
before update on public.team_invites
for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists event_responses_set_updated_at on public.event_responses;
create trigger event_responses_set_updated_at
before update on public.event_responses
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_invites enable row level security;
alter table public.events enable row level security;
alter table public.event_responses enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "users can read profiles" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;
drop policy if exists "authenticated can manage teams" on public.teams;
drop policy if exists "authenticated can manage team members" on public.team_members;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or exists (
    select 1
    from public.team_members viewer
    join public.team_members teammate
      on teammate.team_id = viewer.team_id
    where viewer.user_id = auth.uid()
      and viewer.status = 'active'
      and teammate.user_id = profiles.id
      and teammate.status = 'active'
  )
);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "teams_select_members" on public.teams;
create policy "teams_select_members"
on public.teams
for select
to authenticated
using (public.is_team_member(id));

drop policy if exists "teams_insert_authenticated" on public.teams;
create policy "teams_insert_authenticated"
on public.teams
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "teams_update_managers" on public.teams;
create policy "teams_update_managers"
on public.teams
for update
to authenticated
using (public.is_team_manager(id))
with check (public.is_team_manager(id));

drop policy if exists "teams_delete_owner" on public.teams;
create policy "teams_delete_owner"
on public.teams
for delete
to authenticated
using (public.team_role_for(id) = 'owner');

drop policy if exists "team_members_select_team" on public.team_members;
create policy "team_members_select_team"
on public.team_members
for select
to authenticated
using (public.is_team_member(team_id));

drop policy if exists "team_members_insert_manager_or_creator" on public.team_members;
create policy "team_members_insert_manager_or_creator"
on public.team_members
for insert
to authenticated
with check (
  public.is_team_manager(team_id)
  or (
    auth.uid() = user_id
    and exists (
      select 1
      from public.teams t
      where t.id = team_id
        and t.created_by = auth.uid()
    )
  )
);

drop policy if exists "team_members_insert_self_with_invite" on public.team_members;
create policy "team_members_insert_self_with_invite"
on public.team_members
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.team_invites ti
    where ti.team_id = team_members.team_id
      and ti.is_active = true
      and (ti.expires_at is null or ti.expires_at > timezone('utc', now()))
  )
);

drop policy if exists "team_members_update_self_with_invite" on public.team_members;
create policy "team_members_update_self_with_invite"
on public.team_members
for update
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.team_invites ti
    where ti.team_id = team_members.team_id
      and ti.is_active = true
      and (ti.expires_at is null or ti.expires_at > timezone('utc', now()))
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.team_invites ti
    where ti.team_id = team_members.team_id
      and ti.is_active = true
      and (ti.expires_at is null or ti.expires_at > timezone('utc', now()))
  )
);

drop policy if exists "team_members_update_manager" on public.team_members;
create policy "team_members_update_manager"
on public.team_members
for update
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));

drop policy if exists "team_members_delete_manager" on public.team_members;
create policy "team_members_delete_manager"
on public.team_members
for delete
to authenticated
using (public.is_team_manager(team_id));

drop policy if exists "team_invites_public_select_active" on public.team_invites;
create policy "team_invites_public_select_active"
on public.team_invites
for select
to anon, authenticated
using (
  (is_active and (expires_at is null or expires_at > timezone('utc', now())))
  or public.is_team_member(team_id)
);

drop policy if exists "team_invites_manage" on public.team_invites;
create policy "team_invites_manage"
on public.team_invites
for all
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));

drop policy if exists "events_select_members" on public.events;
create policy "events_select_members"
on public.events
for select
to authenticated
using (public.is_team_member(team_id));

drop policy if exists "events_manage_managers" on public.events;
create policy "events_manage_managers"
on public.events
for all
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));

drop policy if exists "event_responses_select_members" on public.event_responses;
create policy "event_responses_select_members"
on public.event_responses
for select
to authenticated
using (
  exists (
    select 1
    from public.events e
    where e.id = event_id
      and public.is_team_member(e.team_id)
  )
);

drop policy if exists "event_responses_upsert_self" on public.event_responses;
create policy "event_responses_upsert_self"
on public.event_responses
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.events e
    where e.id = event_id
      and public.is_team_member(e.team_id)
  )
);

drop policy if exists "event_responses_update_self" on public.event_responses;
create policy "event_responses_update_self"
on public.event_responses
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tasks_select_members" on public.tasks;
create policy "tasks_select_members"
on public.tasks
for select
to authenticated
using (public.is_team_member(team_id));

drop policy if exists "tasks_insert_managers" on public.tasks;
create policy "tasks_insert_managers"
on public.tasks
for insert
to authenticated
with check (public.is_team_manager(team_id));

drop policy if exists "tasks_update_manager_or_assignee" on public.tasks;
create policy "tasks_update_manager_or_assignee"
on public.tasks
for update
to authenticated
using (public.is_team_manager(team_id) or assigned_to = auth.uid())
with check (public.is_team_manager(team_id) or assigned_to = auth.uid());

drop policy if exists "tasks_delete_managers" on public.tasks;
create policy "tasks_delete_managers"
on public.tasks
for delete
to authenticated
using (public.is_team_manager(team_id));

drop policy if exists "notifications_select_owner" on public.notifications;
create policy "notifications_select_owner"
on public.notifications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "notifications_insert_self_or_manager" on public.notifications;
create policy "notifications_insert_self_or_manager"
on public.notifications
for insert
to authenticated
with check (
  auth.uid() = user_id
  or (
    team_id is not null
    and public.is_team_manager(team_id)
  )
);

drop policy if exists "notifications_update_owner" on public.notifications;
create policy "notifications_update_owner"
on public.notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

alter table public.profiles add column if not exists name text;
update public.profiles
set name = coalesce(name, full_name)
where name is null;

alter table public.teams add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.teams add column if not exists color text;
update public.teams
set
  owner_id = coalesce(owner_id, created_by),
  color = coalesce(color, theme_color)
where owner_id is null
   or color is null;

alter table public.team_invites add column if not exists token text;
update public.team_invites
set token = coalesce(token, code)
where token is null;
create unique index if not exists idx_team_invites_token on public.team_invites(token);

create or replace function public.sync_team_invite_token()
returns trigger
language plpgsql
as $$
begin
  new.token = coalesce(new.token, new.code);
  return new;
end;
$$;

drop trigger if exists team_invites_sync_token on public.team_invites;
create trigger team_invites_sync_token
before insert or update on public.team_invites
for each row execute function public.sync_team_invite_token();

create or replace view public.invites
with (security_invoker = true)
as
select
  id,
  team_id,
  token,
  created_by,
  expires_at,
  created_at
from public.team_invites;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1));

  insert into public.profiles (id, email, full_name, name)
  values (new.id, new.email, display_name, display_name)
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        name = coalesce(public.profiles.name, excluded.name);

  return new;
end;
$$;

create or replace function public.is_team_owner(target_team_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.team_role_for(target_team_id, target_user_id) = 'owner', false);
$$;

drop policy if exists "teams_update_managers" on public.teams;
drop policy if exists "teams_update_owner" on public.teams;
create policy "teams_update_owner"
on public.teams
for update
to authenticated
using (public.is_team_owner(id))
with check (public.is_team_owner(id));

drop policy if exists "teams_delete_owner" on public.teams;
create policy "teams_delete_owner"
on public.teams
for delete
to authenticated
using (public.is_team_owner(id));

drop policy if exists "team_members_update_manager" on public.team_members;
drop policy if exists "team_members_update_owner" on public.team_members;
create policy "team_members_update_owner"
on public.team_members
for update
to authenticated
using (public.is_team_owner(team_id))
with check (public.is_team_owner(team_id));

drop policy if exists "team_members_delete_manager" on public.team_members;
drop policy if exists "team_members_delete_owner" on public.team_members;
create policy "team_members_delete_owner"
on public.team_members
for delete
to authenticated
using (public.is_team_owner(team_id));
