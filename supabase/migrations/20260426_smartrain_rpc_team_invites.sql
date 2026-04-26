alter table public.profiles add column if not exists name text;
update public.profiles
set name = coalesce(name, full_name)
where name is null;

alter table public.teams add column if not exists sport text;
alter table public.teams add column if not exists season text;
alter table public.teams add column if not exists logo_url text;
alter table public.teams add column if not exists theme_color text;
alter table public.teams add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.teams add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.teams add column if not exists color text;
alter table public.teams add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.teams
set
  sport = coalesce(nullif(sport, ''), 'Team'),
  season = coalesce(nullif(season, ''), to_char(current_date, 'YYYY')),
  theme_color = coalesce(nullif(theme_color, ''), coalesce(nullif(color, ''), '#115e59')),
  owner_id = coalesce(owner_id, created_by),
  color = coalesce(nullif(color, ''), coalesce(nullif(theme_color, ''), '#115e59'))
where sport is null
   or season is null
   or theme_color is null
   or owner_id is null
   or color is null;

alter table public.team_members add column if not exists status public.member_status not null default 'active';
alter table public.team_members add column if not exists invited_by uuid references auth.users(id) on delete set null;
alter table public.team_members add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.team_invites add column if not exists token text;
alter table public.team_invites add column if not exists is_active boolean not null default true;
alter table public.team_invites add column if not exists last_used_at timestamptz;
alter table public.team_invites add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.team_invites
set token = coalesce(token, code)
where token is null;

create unique index if not exists idx_team_invites_token on public.team_invites(token);

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
      and coalesce(tm.status, 'active') = 'active'
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
    and coalesce(tm.status, 'active') = 'active'
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

create or replace function public.create_team_with_owner(
  team_name text,
  team_sport text,
  team_season text,
  team_theme_color text default '#115e59',
  team_logo_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_team_id uuid;
  current_user_id uuid;
  owned_count integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  if nullif(trim(team_name), '') is null
     or nullif(trim(team_sport), '') is null
     or nullif(trim(team_season), '') is null then
    raise exception 'team_required_fields_missing';
  end if;

  select count(*)
  into owned_count
  from public.team_members tm
  where tm.user_id = current_user_id
    and tm.role = 'owner'
    and coalesce(tm.status, 'active') = 'active';

  if owned_count >= 3 then
    raise exception 'team_limit_reached';
  end if;

  insert into public.teams (
    name,
    sport,
    season,
    logo_url,
    theme_color,
    color,
    created_by,
    owner_id
  )
  values (
    trim(team_name),
    trim(team_sport),
    trim(team_season),
    nullif(trim(coalesce(team_logo_url, '')), ''),
    coalesce(nullif(trim(team_theme_color), ''), '#115e59'),
    coalesce(nullif(trim(team_theme_color), ''), '#115e59'),
    current_user_id,
    current_user_id
  )
  returning id into new_team_id;

  insert into public.team_members (team_id, user_id, role, status)
  values (new_team_id, current_user_id, 'owner', 'active')
  on conflict (team_id, user_id) do update
    set role = 'owner',
        status = 'active',
        updated_at = timezone('utc', now());

  return new_team_id;
end;
$$;

create or replace function public.create_team_invite(
  target_team_id uuid,
  invite_code text,
  invite_role text default 'player',
  invite_expires_at timestamptz default null
)
returns public.team_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  team_record public.teams%rowtype;
  invite_record public.team_invites%rowtype;
  normalized_role public.team_role;
  normalized_code text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  if not public.is_team_manager(target_team_id, current_user_id) then
    raise exception 'team_manager_required';
  end if;

  normalized_role := case invite_role
    when 'owner' then 'owner'::public.team_role
    when 'coach' then 'coach'::public.team_role
    when 'parent' then 'parent'::public.team_role
    else 'player'::public.team_role
  end;

  normalized_code := upper(nullif(trim(invite_code), ''));

  if normalized_code is null then
    normalized_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  end if;

  select *
  into team_record
  from public.teams
  where id = target_team_id;

  if not found then
    raise exception 'team_not_found';
  end if;

  insert into public.team_invites (
    team_id,
    code,
    token,
    team_name,
    team_sport,
    role,
    is_active,
    expires_at,
    created_by
  )
  values (
    target_team_id,
    normalized_code,
    normalized_code,
    team_record.name,
    coalesce(team_record.sport, team_record.season, 'Team'),
    normalized_role,
    true,
    invite_expires_at,
    current_user_id
  )
  returning * into invite_record;

  return invite_record;
end;
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
  normalized_code text;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  normalized_code := trim(invite_code);

  select *
  into invite_record
  from public.team_invites
  where (code = normalized_code or code = upper(normalized_code) or token = normalized_code or token = upper(normalized_code))
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

grant execute on function public.create_team_with_owner(text, text, text, text, text) to authenticated;
grant execute on function public.create_team_invite(uuid, text, text, timestamptz) to authenticated;
grant execute on function public.join_team_with_invite(text) to authenticated;

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
with check (public.is_team_manager(team_id) or auth.uid() = user_id);

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
