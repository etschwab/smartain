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

drop policy if exists "team_invites_manage" on public.team_invites;
create policy "team_invites_manage"
on public.team_invites
for all
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));
