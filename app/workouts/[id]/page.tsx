import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppHeader, WgerCredit } from "@/components/AppHeader";
import { card, label, quiet } from "@/components/styles";
import { createSupabase } from "@/lib/supabase";
import { getCatalog } from "@/lib/wger";
import type { LoggedSet, PlannedExercise } from "@/lib/types";
import { AddSetForm, DeleteSetButton } from "./SetControls";
import { ExercisePicker } from "./ExercisePicker";
import { DeleteEmptyWorkoutButton } from "../DeleteEmptyWorkoutButton";
import { ZoomableThumb } from "@/components/ExerciseImage";
import { RemoveExerciseButton, SaveAsTemplate } from "./WorkoutControls";

export default function WorkoutPage({ params }: PageProps<"/workouts/[id]">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 py-8">
        <Link href="/workouts" className={`${quiet} w-fit`}>
          ← All workouts
        </Link>
        <Suspense fallback={<p className="text-ls-muted">Loading workout…</p>}>
          <Workout params={params} />
        </Suspense>
      </main>
      <WgerCredit />
    </>
  );
}

const UUID = /^[0-9a-f-]{36}$/i;
const fmt = (s: { weight_lb: number | null; reps: number }) =>
  s.weight_lb === null
    ? `${s.reps} reps`
    : `${Number(s.weight_lb)} × ${s.reps}`;

async function Workout({ params }: { params: Promise<{ id: string }> }) {
  await auth.protect();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createSupabase();
  // Row-level security means someone else's workout ID simply isn't found here.
  const { data: workout } = await supabase
    .from("workouts")
    .select("id, name, performed_on, exercises")
    .eq("id", id)
    .maybeSingle();
  if (!workout) notFound();

  const planned = await withImages(workout.exercises as PlannedExercise[]);
  const exerciseIds = planned.map((e) => e.exercise_id);

  const [{ data: sets }, { data: history }] = await Promise.all([
    supabase
      .from("workout_sets")
      .select("id, exercise_id, weight_lb, reps, created_at")
      .eq("workout_id", id)
      .order("created_at"),
    exerciseIds.length
      ? supabase
          .from("workout_sets")
          .select(
            "exercise_id, workout_id, weight_lb, reps, created_at, workouts!inner(performed_on)",
          )
          .in("exercise_id", exerciseIds)
          .neq("workout_id", id)
          .lte("workouts.performed_on", workout.performed_on)
          .order("created_at", { ascending: false })
          .limit(300)
      : Promise.resolve({ data: [] }),
  ]);

  // "Last time" = every set from the most recent other workout that included this exercise.
  const lastTime = new Map<
    number,
    { date: string; sets: { weight_lb: number | null; reps: number }[] }
  >();
  const lastWorkoutFor = new Map<number, string>();
  for (const s of history ?? []) {
    const wid = lastWorkoutFor.get(s.exercise_id) ?? s.workout_id;
    if (wid !== s.workout_id) continue;
    lastWorkoutFor.set(s.exercise_id, wid);
    const entry = lastTime.get(s.exercise_id) ?? {
      date: (s.workouts as unknown as { performed_on: string }).performed_on,
      sets: [],
    };
    entry.sets.unshift({ weight_lb: s.weight_lb, reps: s.reps });
    lastTime.set(s.exercise_id, entry);
  }

  const setsByExercise = new Map<number, LoggedSet[]>();
  for (const s of (sets ?? []) as LoggedSet[]) {
    setsByExercise.set(s.exercise_id, [
      ...(setsByExercise.get(s.exercise_id) ?? []),
      s,
    ]);
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-ls-ink pb-4">
        <div>
          <p className={label}>
            {new Date(`${workout.performed_on}T12:00:00`).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                month: "long",
                day: "numeric",
              },
            )}
          </p>
          <h1 className="mt-2 font-ls-serif text-[44px] leading-[1.05]">
            {workout.name}
          </h1>
        </div>
        {!sets?.length && (
          <DeleteEmptyWorkoutButton
            workoutId={workout.id}
            redirectTo="/workouts"
            text="Delete empty workout"
          />
        )}
      </div>

      {planned.length === 0 && (
        <p className="border border-dashed border-ls-border p-6 text-center text-ls-muted">
          No exercises yet. Add your first one below.
        </p>
      )}

      {planned.map((exercise, index) => {
        const done = setsByExercise.get(exercise.exercise_id) ?? [];
        const last = lastTime.get(exercise.exercise_id);
        const prefill = done.at(-1) ?? last?.sets.at(-1);
        return (
          <section key={exercise.exercise_id} className={`${card} p-4`}>
            <div className="flex items-start gap-3">
              <ZoomableThumb
                name={exercise.name}
                category={exercise.category}
                image={exercise.image ?? null}
              />
              <div className="min-w-0 flex-1">
                <p className={label}>
                  {String(index + 1).padStart(2, "0")} · {exercise.category}
                </p>
                <h2 className="mt-1 font-ls-serif text-[26px] leading-tight">
                  {exercise.name}
                </h2>
                <p className="mt-1 text-sm text-ls-muted">
                  {last ? (
                    <>
                      Last time,{" "}
                      {new Date(`${last.date}T12:00:00`).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}
                      :{" "}
                      <span className="text-ls-ink tabular-nums">
                        {last.sets.map(fmt).join(", ")}
                      </span>
                    </>
                  ) : (
                    "First time logging this exercise"
                  )}
                </p>
              </div>
            </div>
            {done.length === 0 && (
              <div className="mt-1 flex justify-end">
                <RemoveExerciseButton
                  workoutId={workout.id}
                  exerciseId={exercise.exercise_id}
                />
              </div>
            )}

            {done.length > 0 && (
              <ol className="mt-4 divide-y divide-ls-border border-y border-ls-border">
                {done.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="flex items-baseline gap-4 tabular-nums">
                      <span className="w-6 font-ls-serif text-xl text-ls-muted">
                        {i + 1}
                      </span>
                      <span className="text-[17px] font-medium">
                        {s.weight_lb === null
                          ? "Bodyweight"
                          : `${Number(s.weight_lb)} lb`}
                      </span>
                      <span className="text-[17px] text-ls-muted">
                        × {s.reps}
                      </span>
                    </span>
                    <DeleteSetButton setId={s.id} />
                  </li>
                ))}
              </ol>
            )}

            <AddSetForm
              workoutId={workout.id}
              exerciseId={exercise.exercise_id}
              defaultWeight={prefill?.weight_lb ?? null}
              defaultReps={prefill?.reps ?? null}
            />
          </section>
        );
      })}

      <Suspense
        fallback={<p className="text-ls-muted">Loading exercise library…</p>}
      >
        <ExerciseLibrary workoutId={workout.id} alreadyAdded={exerciseIds} />
      </Suspense>

      {planned.length > 0 && (
        <SaveAsTemplate workoutId={workout.id} defaultName={workout.name} />
      )}
    </>
  );
}

async function ExerciseLibrary({
  workoutId,
  alreadyAdded,
}: {
  workoutId: string;
  alreadyAdded: number[];
}) {
  let catalog;
  try {
    catalog = await getCatalog();
  } catch {
    return (
      <p
        role="status"
        className="border border-ls-error bg-ls-surface p-4 text-[15px] leading-relaxed text-ls-error"
      >
        The exercise library (wger) is unavailable right now, so you can&apos;t
        add new exercises. You can still log sets for the exercises above.
        Refresh in a minute to try again.
      </p>
    );
  }
  const options = catalog
    .filter((e) => !alreadyAdded.includes(e.id))
    .map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      image: e.image,
    }));
  return <ExercisePicker workoutId={workoutId} options={options} />;
}

// Exercises added before pictures were stored have no `image` field; fill those in from the cached catalog.
// If wger is unavailable, the cards simply show placeholders.
async function withImages(planned: PlannedExercise[]) {
  if (planned.every((e) => e.image !== undefined)) return planned;
  try {
    const catalog = await getCatalog();
    return planned.map((e) =>
      e.image !== undefined
        ? e
        : {
            ...e,
            image: catalog.find((c) => c.id === e.exercise_id)?.image ?? null,
          },
    );
  } catch {
    return planned;
  }
}
