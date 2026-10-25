"use client";

import { useMemo, useState, useTransition } from "react";
import { addExercise } from "../actions";
import { rankByName } from "@/lib/search";

type Option = { id: number; name: string; category: string };

const CATEGORIES = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Calves", "Abs", "Cardio"];

export function ExercisePicker({ workoutId, options }: { workoutId: string; options: Option[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = useMemo(() => {
    const inCategory = category ? options.filter((o) => o.category === category) : options;
    return rankByName(inCategory, query).slice(0, 40);
  }, [options, query, category]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border-2 border-dashed border-zinc-300 px-4 py-4 font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
      >
        + Add exercise
      </button>
    );
  }

  function pick(id: number) {
    setError(null);
    startTransition(async () => {
      const result = await addExercise(workoutId, id);
      if (result.error) setError(result.error);
      else {
        setOpen(false);
        setQuery("");
      }
    });
  }

  return (
    <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Add exercise</h2>
        <button onClick={() => setOpen(false)} className="text-sm text-zinc-500">
          Cancel
        </button>
      </div>
      <input
        autoFocus
        type="search"
        placeholder="Search, e.g. bench press"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(category === c ? null : c)}
            aria-pressed={category === c}
            className={`rounded-full border px-3 py-1 text-sm ${
              category === c
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                : "border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {matches.length === 0 ? (
        <p className="mt-4 text-center text-zinc-500">
          No exercises match{query && <> &ldquo;{query}&rdquo;</>}
          {category && <> in {category}</>}. Try a shorter word or another category.
        </p>
      ) : (
        <ul className="mt-3 max-h-80 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-900">
          {matches.map((o) => (
            <li key={o.id}>
              <button
                disabled={pending}
                onClick={() => pick(o.id)}
                className="flex w-full items-center justify-between px-1 py-2 text-left disabled:opacity-50"
              >
                <span>{o.name}</span>
                <span className="text-xs text-zinc-500">{o.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
