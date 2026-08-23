alter table public.events add column if not exists response_deadline timestamptz;
alter table public.events add column if not exists max_participants integer;
alter table public.events add column if not exists is_cancelled boolean not null default false;

alter table public.events drop constraint if exists events_max_participants_check;
alter table public.events add constraint events_max_participants_check
check (max_participants is null or max_participants between 1 and 500);
