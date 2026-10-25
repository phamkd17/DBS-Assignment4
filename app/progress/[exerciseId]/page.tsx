import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppHeader, SectionLabel, WgerCredit } from "@/components/AppHeader";
import { card, errorText, label, quiet } from "@/components/styles";
import { createSupabase } from "@/lib/supabase";
import {
  buildProgress,
  formatSet,
  formatValue,
  shortDate,
  type ProgressSet,
} from "@/lib/progress";
import { TrendChart } from "./TrendChart";

export default function ExerciseProgressPage({
  params,
}: PageProps<"/progress/[exerciseId]">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
        <Link href="/progress" className={`${quiet} w-fit`}>
          ← Progress
        </Link>
        <Suspense
          fallback={<p className="text-ls-muted">Loading your history…</p>}
        >
          <ExerciseProgressView params={params} />
        </Suspense>
      </main>
      <WgerCredit />
    </>
  );
}

async function ExerciseProgressView({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  await auth.protect();
  const exerciseId = Number((await params).exerciseId);
  if (!Number.isInteger(exerciseId) || exerciseId <= 0) notFound();

  const supabase = await createSupabase();
  const { data, error } = await supabase
    .from("workout_sets")
    .select(
      "exercise_id, exercise_name, category, workout_id, weight_lb, reps, created_at, workouts!inner(performed_on)",
    )
    .eq("exercise_id", exerciseId);
  if (error) {
    console.error("Loading exercise history failed:", error);
    return (
      <p className={errorText}>
        Couldn&apos;t load this exercise. Refresh to try again.
      </p>
    );
  }
  const rows: ProgressSet[] = data.map((s) => ({
    ...s,
    performed_on: (s.workouts as unknown as { performed_on: string })
      .performed_on,
  }));
  const [progress] = buildProgress(rows);
  if (!progress) notFound(); // never logged by this user (or not theirs: RLS returns nothing)

  const best = progress.sessions.reduce((a, b) => (b.value > a.value ? b : a));
  const latest = progress.sessions.at(-1)!;

  return (
    <>
      <div className="border-b border-ls-ink pb-4">
        <p className={label}>{progress.category}</p>
        <h1 className="mt-2 font-ls-serif text-[44px] leading-[1.05]">
          {progress.name}
        </h1>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className={label}>Best ever</dt>
          {/* Hero figure: sans, proportional digits */}
          <dd className="mt-1 text-[44px] leading-none font-medium">
            {formatValue(best.value, progress.mode)}
          </dd>
          <dd className="mt-1 text-sm text-ls-muted">
            {formatSet(best)} · {shortDate(best.date)}
          </dd>
        </div>
        <div>
          <dt className={label}>Last time</dt>
          <dd className="mt-1 text-[28px] leading-none font-medium">
            {formatValue(latest.value, progress.mode)}
          </dd>
          <dd className="mt-1 text-sm text-ls-muted">
            {formatSet(latest)} · {shortDate(latest.date)}
          </dd>
        </div>
      </dl>

      <section>
        <SectionLabel>
          Heaviest set per session · {progress.sessions.length}{" "}
          {progress.sessions.length === 1 ? "session" : "sessions"}
        </SectionLabel>
        {progress.sessions.length === 1 ? (
          <p className="text-ls-muted">
            Log this exercise again to start a trend line.
          </p>
        ) : (
          <TrendChart progress={progress} />
        )}
      </section>

      <section>
        <SectionLabel>Every session</SectionLabel>
        <table className={`w-full text-left text-[15px] ${card}`}>
          <thead>
            <tr className="border-b border-ls-border">
              <th scope="col" className={`${label} px-4 py-2 font-medium`}>
                Date
              </th>
              <th
                scope="col"
                className={`${label} px-4 py-2 text-right font-medium`}
              >
                Heaviest set
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ls-border tabular-nums">
            {[...progress.sessions].reverse().map((s) => (
              <tr key={s.workoutId}>
                <td className="px-4 py-2">
                  <Link
                    href={`/workouts/${s.workoutId}`}
                    className="underline decoration-ls-rule underline-offset-4 hover:decoration-ls-ink"
                  >
                    {shortDate(s.date)}
                  </Link>
                </td>
                <td className="px-4 py-2 text-right">
                  {formatSet(s)}
                  {s.workoutId === best.workoutId && (
                    <span className={`${label} ml-2 text-ls-ink`}>Best</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
