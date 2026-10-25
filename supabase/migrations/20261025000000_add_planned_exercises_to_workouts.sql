-- The exercises a workout is planned to have, so cards show before any set is logged.
-- Same shape as templates.exercises: [{exercise_id, name, category, muscles}, ...]
alter table public.workouts
  add column exercises jsonb not null default '[]' check (jsonb_typeof(exercises) = 'array');
