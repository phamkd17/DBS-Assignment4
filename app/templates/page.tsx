import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AppHeader, WgerCredit } from "@/components/AppHeader";
import { createSupabase } from "@/lib/supabase";
import type { PlannedExercise } from "@/lib/types";
import { TemplateCard } from "./TemplateCard";

export default function TemplatesPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-6">
        <Link href="/workouts" className="text-sm text-zinc-500">
          ← Workouts
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Templates</h1>
          <p className="text-sm text-zinc-500">
            To make a new one, start a workout, add exercises, and choose
            &ldquo;Save these exercises as a template&rdquo;.
          </p>
        </div>
        <Suspense
          fallback={<p className="text-zinc-500">Loading your templates…</p>}
        >
          <TemplateList />
        </Suspense>
      </main>
      <WgerCredit />
    </>
  );
}

async function TemplateList() {
  await auth.protect();
  const supabase = await createSupabase();
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
      <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-zinc-700">
        You don&apos;t have any templates.
      </p>
    );
  }
  return templates.map((t) => (
    <TemplateCard
      key={t.id}
      id={t.id}
      name={t.name}
      exercises={t.exercises as PlannedExercise[]}
    />
  ));
}
