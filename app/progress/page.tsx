import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AppHeader, SectionLabel, WgerCredit } from "@/components/AppHeader";
import { card, errorText, label, quiet } from "@/components/styles";
import { createSupabase } from "@/lib/supabase";
import { balanceNotes, type WeekSet } from "@/lib/volume";
import { addDays, resolveWeek, weekLabel } from "@/lib/week";
import { VolumeChart } from "./VolumeChart";
import { ExerciseList } from "./ExerciseList";
import { buildProgress, type ProgressSet } from "@/lib/progress";

export default function ProgressPage({ searchParams }: PageProps<"/progress">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
        <Suspense
          fallback={<p className="text-ls-muted">Counting your sets…</p>}
        >
          <Week searchParams={searchParams} />
        </Suspense>
        <section className="mt-4">
          <SectionLabel>Every exercise · heaviest set per session</SectionLabel>
          <Suspense
            fallback={<p className="text-ls-muted">Loading your exercises…</p>}
          >
            <AllExercises />
          </Suspense>
        </section>
      </main>
      <WgerCredit />
    </>
  );
}

async function Week({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await auth.protect();
  const { week } = await searchParams;
  const { start, end, isCurrent } = resolveWeek(week);

  const supabase = await createSupabase();
  // Counted by the workout's date, so a set logged late Sunday stays in Sunday's week.
  const { data, error } = await supabase
    .from("workout_sets")
    .select("category, muscles, workouts!inner(performed_on)")
    .gte("workouts.performed_on", start)
    .lte("workouts.performed_on", end);

  const sets: WeekSet[] = (data ?? []).map((s) => ({
    category: s.category,
    muscles: s.muscles,
  }));
  const notes = balanceNotes(sets);
  const total = sets.filter((s) => s.category !== "Cardio").length;

  return (
    <>
      <div className="border-b border-ls-ink pb-4">
        <nav
          className="flex items-center justify-between"
          aria-label="Choose week"
        >
          <Link href={`/progress?week=${addDays(start, -7)}`} className={quiet}>
            ← Previous
          </Link>
          <p className={label}>{weekLabel(start, end)}</p>
          {isCurrent ? (
            <span className="w-[4.5rem]" />
          ) : (
            <Link
              href={`/progress?week=${addDays(start, 7)}`}
              className={quiet}
            >
              Next →
            </Link>
          )}
        </nav>
        <h1 className="mt-3 font-ls-serif text-[44px] leading-[1.05]">
          {isCurrent ? "This week" : "That week"}
        </h1>
        <p className="mt-1 text-[15px] text-ls-muted">
          {total} {total === 1 ? "set" : "sets"} across all muscle groups
        </p>
      </div>

      {error ? (
        <p className={errorText}>
          Couldn&apos;t load this week&apos;s sets. Refresh to try again.
        </p>
      ) : total === 0 ? (
        <p className="border border-dashed border-ls-border p-6 text-center text-ls-muted">
          No sets logged {isCurrent ? "yet this week" : "that week"}.{" "}
          {isCurrent && (
            <Link href="/workouts" className="underline underline-offset-4">
              Start a workout
            </Link>
          )}
        </p>
      ) : (
        <>
          {notes.length > 0 && (
            <section>
              <SectionLabel>Balance check</SectionLabel>
              <ul className={`divide-y divide-ls-border ${card}`}>
                {notes.map((n) => (
                  <li
                    key={n.text}
                    className="flex gap-3 px-4 py-3 text-[15px] leading-relaxed"
                  >
                    {/* Symbol + words carry the meaning, never color alone */}
                    <span
                      aria-hidden
                      className={
                        n.tone === "warn" ? "text-ls-error" : "text-ls-muted"
                      }
                    >
                      {n.tone === "warn" ? "▲" : "○"}
                    </span>
                    <span>
                      <span className="sr-only">
                        {n.tone === "warn" ? "Imbalance: " : "Note: "}
                      </span>
                      {n.text}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <SectionLabel>Sets per muscle group</SectionLabel>
            <VolumeChart sets={sets} />
          </section>
        </>
      )}
    </>
  );
}

async function AllExercises() {
  await auth.protect();
  const supabase = await createSupabase();
  const { data, error } = await supabase
    .from("workout_sets")
    .select(
      "exercise_id, exercise_name, category, workout_id, weight_lb, reps, created_at, workouts!inner(performed_on)",
    )
    .limit(5000);
  if (error) {
    console.error("Loading exercise progress failed:", error);
    return (
      <p className={errorText}>
        Couldn&apos;t load your exercises. Refresh to try again.
      </p>
    );
  }
  const rows: ProgressSet[] = data.map((s) => ({
    ...s,
    performed_on: (s.workouts as unknown as { performed_on: string })
      .performed_on,
  }));
  return <ExerciseList exercises={buildProgress(rows)} />;
}
