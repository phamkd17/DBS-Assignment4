-- Restore row-level security after the Step 7 demo: each signed-in user reads only their own rows.
drop policy "Users see their own workouts" on public.workouts;
create policy "Users see their own workouts" on public.workouts
  for select to authenticated using ((select auth.jwt() ->> 'sub') = user_id);

drop policy "Users see their own sets" on public.workout_sets;
create policy "Users see their own sets" on public.workout_sets
  for select to authenticated using ((select auth.jwt() ->> 'sub') = user_id);
