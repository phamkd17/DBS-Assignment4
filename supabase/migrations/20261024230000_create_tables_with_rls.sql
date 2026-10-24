-- Lift Log: four tables, each row owned by one Clerk user, with row-level security on every table.
-- The signed-in user's Clerk ID is the "sub" claim in their Clerk session token: auth.jwt() ->> 'sub'.
-- Policies wrap it in (select ...) so Postgres evaluates it once per query instead of once per row.

-- 1. workouts: one gym session
create table public.workouts (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null default (auth.jwt() ->> 'sub'),
  name         text not null check (char_length(name) between 1 and 80),
  performed_on date not null default current_date,
  notes        text check (char_length(notes) <= 1000),
  created_at   timestamptz not null default now()
);
create index workouts_user_date_idx on public.workouts (user_id, performed_on desc);

-- 2. workout_sets: one row per set, with a snapshot of the wger exercise
create table public.workout_sets (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null default (auth.jwt() ->> 'sub'),
  workout_id    uuid not null references public.workouts (id) on delete cascade,
  exercise_id   integer not null,
  exercise_name text not null,
  category      text not null,
  muscles       text[] not null default '{}',
  weight_lb     numeric(6,1) check (weight_lb >= 0),
  reps          integer not null check (reps > 0 and reps <= 1000),
  created_at    timestamptz not null default now()
);
create index workout_sets_workout_idx on public.workout_sets (workout_id);
create index workout_sets_last_time_idx on public.workout_sets (user_id, exercise_id, created_at desc);
create index workout_sets_week_idx on public.workout_sets (user_id, created_at);

-- 3. templates: saved session plans
create table public.templates (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null default (auth.jwt() ->> 'sub'),
  name       text not null check (char_length(name) between 1 and 80),
  exercises  jsonb not null default '[]' check (jsonb_typeof(exercises) = 'array'),
  created_at timestamptz not null default now()
);
create index templates_user_idx on public.templates (user_id);

-- 4. user_settings: one row per user
create table public.user_settings (
  user_id        text primary key default (auth.jwt() ->> 'sub'),
  equipment_ids  integer[] not null default '{}',
  starters_added boolean not null default false
);

-- Row-level security: on for every table. With RLS on and no matching policy, a query returns nothing.
alter table public.workouts      enable row level security;
alter table public.workout_sets  enable row level security;
alter table public.templates     enable row level security;
alter table public.user_settings enable row level security;

-- Policies apply only to signed-in users ("authenticated"). Signed-out visitors ("anon") match no policy.

-- workouts
create policy "Users see their own workouts" on public.workouts
  for select to authenticated using ((select auth.jwt() ->> 'sub') = user_id);
create policy "Users add their own workouts" on public.workouts
  for insert to authenticated with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "Users edit their own workouts" on public.workouts
  for update to authenticated using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "Users delete their own workouts" on public.workouts
  for delete to authenticated using ((select auth.jwt() ->> 'sub') = user_id);

-- workout_sets: a set must be yours AND go into a workout that is yours
create policy "Users see their own sets" on public.workout_sets
  for select to authenticated using ((select auth.jwt() ->> 'sub') = user_id);
create policy "Users add sets to their own workouts" on public.workout_sets
  for insert to authenticated with check (
    (select auth.jwt() ->> 'sub') = user_id
    and exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = (select auth.jwt() ->> 'sub'))
  );
create policy "Users edit their own sets" on public.workout_sets
  for update to authenticated using ((select auth.jwt() ->> 'sub') = user_id)
  with check (
    (select auth.jwt() ->> 'sub') = user_id
    and exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = (select auth.jwt() ->> 'sub'))
  );
create policy "Users delete their own sets" on public.workout_sets
  for delete to authenticated using ((select auth.jwt() ->> 'sub') = user_id);

-- templates
create policy "Users see their own templates" on public.templates
  for select to authenticated using ((select auth.jwt() ->> 'sub') = user_id);
create policy "Users add their own templates" on public.templates
  for insert to authenticated with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "Users edit their own templates" on public.templates
  for update to authenticated using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "Users delete their own templates" on public.templates
  for delete to authenticated using ((select auth.jwt() ->> 'sub') = user_id);

-- user_settings
create policy "Users see their own settings" on public.user_settings
  for select to authenticated using ((select auth.jwt() ->> 'sub') = user_id);
create policy "Users add their own settings" on public.user_settings
  for insert to authenticated with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "Users edit their own settings" on public.user_settings
  for update to authenticated using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);
