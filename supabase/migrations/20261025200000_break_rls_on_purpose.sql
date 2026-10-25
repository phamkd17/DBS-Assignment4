-- BROKEN ON PURPOSE (Assignment 4, Step 7): let any signed-in user read every workout and set,
-- to watch the Playwright test fail. Reverted by the next migration.
drop policy "Users see their own workouts" on public.workouts;
create policy "Users see their own workouts" on public.workouts
  for select to authenticated using (true);

drop policy "Users see their own sets" on public.workout_sets;
create policy "Users see their own sets" on public.workout_sets
  for select to authenticated using (true);
