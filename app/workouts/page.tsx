import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AppHeader, SectionLabel, WgerCredit } from "@/components/AppHeader";
import { card, errorText, quiet } from "@/components/styles";
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
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-4 py-8">
        <section>
          <SectionLabel
            action={
              <Link href="/templates" className={quiet}>
                Edit templates
              </Link>
            }
          >
            01 · Start a workout
          </SectionLabel>
          <Suspense
            fallback={<p className="text-ls-muted">Loading your templates…</p>}
          >
            <TemplateButtons />
          </Suspense>
          <div className="mt-4">
            <StartWorkoutButton />
          </div>
        </section>
        <section>
          <SectionLabel>02 · History</SectionLabel>
          <Suspense
            fallback={<p className="text-ls-muted">Loading your workouts…</p>}
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
      <p className={errorText}>
        Couldn&apos;t load your templates. Refresh to try again.
      </p>
    );
  }
  if (!templates.length) {
    return (
      <p className="text-ls-muted">
        No templates yet. Save one from any workout with &ldquo;Save these
        exercises as a template&rdquo;.
      </p>
    );
  }
  return (
    <ul className={`divide-y divide-ls-border ${card}`}>
      {templates.map((t) => (
        <li key={t.id}>
          <StartFromTemplateButton
            templateId={t.id}
            name={t.name}
            exercises={(t.exercises as { name: string }[]).map((e) => e.name)}
          />
        </li>
      ))}
    </ul>
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
      <p className={errorText}>
        Couldn&apos;t load your workouts. Refresh to try again.
      </p>
    );
  if (!workouts.length) {
    return (
      <p className="border border-dashed border-ls-border p-6 text-center text-ls-muted">
        No workouts yet. Start one above and your history will show up here.
      </p>
    );
  }

  return (
    <ul className={`divide-y divide-ls-border ${card}`}>
      {workouts.map((w) => {
        const sets = (w.workout_sets as { count: number }[])[0]?.count ?? 0;
        return (
          <li
            key={w.id}
            className="flex items-center justify-between gap-2 pr-2"
          >
            <Link
              href={`/workouts/${w.id}`}
              className="flex flex-1 items-center justify-between px-4 py-3 transition-colors hover:bg-ls-ink/[0.04] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-ls-ink"
            >
              <span>
                <span className="font-ls-serif text-[22px] leading-tight">
                  {w.name}
                </span>
                <span className="block text-sm text-ls-muted">
                  {dateLabel(w.performed_on)}
                </span>
              </span>
              <span className="text-sm text-ls-muted tabular-nums">
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
