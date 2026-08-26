create table if not exists public.event_templates (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  title text not null,
  type public.event_type not null default 'training',
  source_starts_at timestamptz not null,
  duration_minutes integer not null,
  location text,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint event_templates_duration_check check (duration_minutes between 1 and 1440),
  constraint event_templates_team_name_key unique (team_id, name)
);

create index if not exists idx_event_templates_team_id on public.event_templates(team_id);

drop trigger if exists event_templates_set_updated_at on public.event_templates;
create trigger event_templates_set_updated_at
before update on public.event_templates
for each row execute function public.set_updated_at();

alter table public.event_templates enable row level security;

drop policy if exists "event_templates_select_members" on public.event_templates;
create policy "event_templates_select_members"
on public.event_templates
for select
to authenticated
using (public.is_team_member(team_id));

drop policy if exists "event_templates_manage_managers" on public.event_templates;
create policy "event_templates_manage_managers"
on public.event_templates
for all
to authenticated
using (public.is_team_manager(team_id))
with check (public.is_team_manager(team_id));

