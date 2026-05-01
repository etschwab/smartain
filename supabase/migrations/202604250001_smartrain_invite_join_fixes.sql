alter table public.team_invites add column if not exists token text;
update public.team_invites
set token = coalesce(token, code)
where token is null;

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
