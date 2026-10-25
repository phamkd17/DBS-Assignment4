// Per-exercise progress: the heaviest set in each session (most reps for bodyweight-only exercises).

export type ProgressSet = {
  exercise_id: number;
  exercise_name: string;
  category: string;
  workout_id: string;
  weight_lb: number | null;
  reps: number;
  performed_on: string;
  created_at: string;
};

export type Session = {
  date: string;
  workoutId: string;
  weight: number | null;
  reps: number;
  value: number;
  loggedAt: string; // first set's timestamp, to order two sessions on the same day
};

export type ExerciseProgress = {
  exerciseId: number;
  name: string;
  category: string;
  mode: "weight" | "reps"; // what `value` measures
  sessions: Session[]; // oldest first
};

export function buildProgress(rows: ProgressSet[]): ExerciseProgress[] {
  const byExercise = new Map<number, ProgressSet[]>();
  for (const r of rows)
    byExercise.set(r.exercise_id, [
      ...(byExercise.get(r.exercise_id) ?? []),
      r,
    ]);

  const result: ExerciseProgress[] = [];
  for (const [exerciseId, sets] of byExercise) {
    // Weighted if any set ever had a weight; then sessions with only bodyweight sets are skipped.
    const mode = sets.some((s) => s.weight_lb !== null && s.weight_lb > 0)
      ? "weight"
      : "reps";
    const byWorkout = new Map<string, ProgressSet[]>();
    for (const s of sets)
      byWorkout.set(s.workout_id, [...(byWorkout.get(s.workout_id) ?? []), s]);

    const sessions: Session[] = [];
    for (const [workoutId, ws] of byWorkout) {
      const candidates =
        mode === "weight"
          ? ws.filter((s) => s.weight_lb !== null && s.weight_lb > 0)
          : ws;
      if (!candidates.length) continue;
      // Heaviest weight wins; ties go to more reps. In reps mode, most reps wins.
      const best = candidates.reduce((a, b) =>
        mode === "weight"
          ? Number(b.weight_lb) > Number(a.weight_lb) ||
            (Number(b.weight_lb) === Number(a.weight_lb) && b.reps > a.reps)
            ? b
            : a
          : b.reps > a.reps
            ? b
            : a,
      );
      const weight = best.weight_lb === null ? null : Number(best.weight_lb);
      sessions.push({
        date: best.performed_on,
        workoutId,
        weight,
        reps: best.reps,
        value: mode === "weight" ? weight! : best.reps,
        loggedAt: ws.reduce(
          (t, s) => (s.created_at < t ? s.created_at : t),
          ws[0].created_at,
        ),
      });
    }
    if (!sessions.length) continue;
    sessions.sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.loggedAt.localeCompare(b.loggedAt),
    );
    result.push({
      exerciseId,
      name: sets[0].exercise_name,
      category: sets[0].category,
      mode,
      sessions,
    });
  }
  // Most recently trained first.
  return result.sort(
    (a, b) =>
      b.sessions.at(-1)!.date.localeCompare(a.sessions.at(-1)!.date) ||
      b.sessions.at(-1)!.loggedAt.localeCompare(a.sessions.at(-1)!.loggedAt),
  );
}

export const unit = (mode: ExerciseProgress["mode"]) =>
  mode === "weight" ? "lb" : "reps";

export const formatValue = (value: number, mode: ExerciseProgress["mode"]) =>
  `${Number.isInteger(value) ? value : value.toFixed(1)} ${unit(mode)}`;

export const formatSet = (s: Session) =>
  s.weight === null ? `${s.reps} reps` : `${s.weight} lb × ${s.reps}`;

export const shortDate = (ymd: string) =>
  new Date(`${ymd}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
