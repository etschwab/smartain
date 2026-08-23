alter table public.events add column if not exists opponent text;
alter table public.events add column if not exists score_for integer;
alter table public.events add column if not exists score_against integer;
alter table public.events add column if not exists report_summary text;

alter table public.events drop constraint if exists events_scores_check;
alter table public.events add constraint events_scores_check
check (
  (score_for is null and score_against is null)
  or (score_for >= 0 and score_against >= 0)
);
