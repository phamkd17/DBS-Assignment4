import { Suspense } from "react";
import { errorText, quiet } from "@/components/styles";
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
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 py-8">
        <Link href="/workouts" className={`${quiet} w-fit`}>
          ← Workouts
        </Link>
        <div className="border-b border-ls-ink pb-4">
          <h1 className="font-ls-serif text-[44px] leading-[1.05]">
            Templates
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ls-muted">
            To make a new one, start a workout, add exercises, and choose
            &ldquo;Save these exercises as a template&rdquo;.
          </p>
        </div>
        <Suspense
          fallback={<p className="text-ls-muted">Loading your templates…</p>}
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
      <p className={errorText}>
        Couldn&apos;t load your templates. Refresh to try again.
      </p>
    );
  }
  if (!templates.length) {
    return (
      <p className="border border-dashed border-ls-border p-6 text-center text-ls-muted">
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
