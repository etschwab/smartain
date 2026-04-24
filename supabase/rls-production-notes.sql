-- Beispiel für spätere sichere RLS-Idee:
-- Ein User darf Teamdaten nur sehen, wenn er Mitglied dieses Teams ist.
-- Diese Datei ist nur als Richtung gedacht, nicht direkt blind ausführen.

-- exists (
--   select 1 from public.team_members tm
--   where tm.team_id = teams.id and tm.user_id = auth.uid()
-- )
