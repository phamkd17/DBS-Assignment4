import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AppHeader, WgerCredit } from "@/components/AppHeader";
import { createSupabase } from "@/lib/supabase";
import {
  StartFromTemplateButton,
  StartWorkoutButton,
} from "./StartWorkoutButton";
import { ensureStarterTemplates } from "@/lib/templates";
import { DeleteEmptyWorkoutButton } from "./DeleteEmptyWorkoutButton";

export default function WorkoutsPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-6">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Start a workout
            </h2>
            <Link href="/templates" className="text-sm text-zinc-500 underline">
              Manage templates
            </Link>
          </div>
          <Suspense
            fallback={<p className="text-zinc-500">Loading your templates…</p>}
          >
            <TemplateButtons />
          </Suspense>
          <div className="mt-3">
            <StartWorkoutButton />
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            History
          </h2>
          <Suspense
            fallback={<p className="text-zinc-500">Loading your workouts…</p>}
          >
            <WorkoutHistory />
          </Suspense>
        </section>
      </main>
      <WgerCredit />
    </>
  );
}

const dateLabel = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

async function TemplateButtons() {
  await auth.protect();
  const supabase = await createSupabase();
  await ensureStarterTemplates(supabase);
  const { data: templates, error } = await supabase
    .from("templates")
    .select("id, name, exercises")
    .order("created_at");

  if (error) {
    console.error("Loading templates failed:", error);
    return (
      <p className="text-red-600">
        Couldn&apos;t load your templates. Refresh to try again.
      </p>
    );
  }
  if (!templates.length) {
    return (
      <p className="text-zinc-500">
        No templates. Save one from any workout with &ldquo;Save as
        template&rdquo;.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {templates.map((t) => (
        <StartFromTemplateButton
          key={t.id}
          templateId={t.id}
          name={t.name}
          count={(t.exercises as unknown[]).length}
        />
      ))}
    </div>
  );
}

async function WorkoutHistory() {
  await auth.protect();
  const supabase = await createSupabase();
  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("id, name, performed_on, workout_sets(count)")
    .order("performed_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) console.error("Loading workouts failed:", error);
  if (error)
    return (
      <p className="text-red-600">
        Couldn&apos;t load your workouts. Refresh to try again.
      </p>
    );
  if (!workouts.length) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-zinc-700">
        No workouts yet. Start one above and your history will show up here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {workouts.map((w) => {
        const sets = (w.workout_sets as { count: number }[])[0]?.count ?? 0;
        return (
          <li
            key={w.id}
            className="flex items-center justify-between gap-2 pr-2"
          >
            <Link
              href={`/workouts/${w.id}`}
              className="flex flex-1 items-center justify-between px-4 py-3"
            >
              <span>
                <span className="font-medium">{w.name}</span>
                <span className="block text-sm text-zinc-500">
                  {dateLabel(w.performed_on)}
                </span>
              </span>
              <span className="text-sm text-zinc-500">
                {sets === 0
                  ? "Empty"
                  : `${sets} ${sets === 1 ? "set" : "sets"}`}
              </span>
            </Link>
            {sets === 0 && <DeleteEmptyWorkoutButton workoutId={w.id} />}
          </li>
        );
      })}
    </ul>
  );
}
