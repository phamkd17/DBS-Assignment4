"use client";

import {
  card,
  chip,
  errorText,
  focusRing,
  input,
  label,
  primary,
  quiet,
  secondary,
} from "@/components/styles";
import { useMemo, useState, useTransition } from "react";
import { addExercise } from "../actions";
import { rankByName } from "@/lib/search";
import { ExerciseThumb, ImagePreview } from "@/components/ExerciseImage";

type Option = {
  id: number;
  name: string;
  category: string;
  image: string | null;
};

const CATEGORIES = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Calves",
  "Abs",
  "Cardio",
];

export function ExercisePicker({
  workoutId,
  options,
}: {
  workoutId: string;
  options: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Option | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = useMemo(() => {
    const inCategory = category
      ? options.filter((o) => o.category === category)
      : options;
    return rankByName(inCategory, query).slice(0, 40);
  }, [options, query, category]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`${secondary} w-full border-dashed`}
      >
        + Add exercise
      </button>
    );
  }

  function pick(id: number) {
    setError(null);
    startTransition(async () => {
      const result = await addExercise(workoutId, id);
      setPreview(null);
      if (result.error) setError(result.error);
      else {
        setOpen(false);
        setQuery("");
      }
    });
  }

  return (
    <section className={`${card} p-4`}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-ls-serif text-[26px] leading-tight">
          Add exercise
        </h2>
        <button onClick={() => setOpen(false)} className={quiet}>
          Cancel
        </button>
      </div>
      <input
        autoFocus
        type="search"
        placeholder="Search, e.g. bench press"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`${input} mt-3`}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(category === c ? null : c)}
            aria-pressed={category === c}
            className={chip}
          >
            {c}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className={`${errorText} mt-3`}>
          {error}
        </p>
      )}
      {matches.length === 0 ? (
        <p className="mt-4 text-center text-ls-muted">
          No exercises match{query && <> &ldquo;{query}&rdquo;</>}
          {category && <> in {category}</>}. Try a shorter word or another
          category.
        </p>
      ) : (
        <ul className="mt-4 max-h-96 divide-y divide-ls-border overflow-y-auto border-y border-ls-border">
          {matches.map((o) => (
            <li key={o.id} className="flex items-center gap-3 px-1 py-2">
              {/* The picture opens a bigger preview; the name adds the exercise. */}
              {o.image ? (
                <button
                  type="button"
                  onClick={() => setPreview(o)}
                  aria-label={`Show a bigger picture of ${o.name}`}
                  className="shrink-0"
                >
                  <ExerciseThumb
                    name={o.name}
                    category={o.category}
                    image={o.image}
                  />
                </button>
              ) : (
                <ExerciseThumb
                  name={o.name}
                  category={o.category}
                  image={null}
                />
              )}
              <button
                disabled={pending}
                onClick={() => pick(o.id)}
                className={`flex flex-1 cursor-pointer items-center justify-between gap-3 self-stretch text-left text-[15px] transition-colors hover:text-ls-accent disabled:opacity-50 ${focusRing}`}
              >
                <span>{o.name}</span>
                <span className={`${label} shrink-0`}>{o.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {preview?.image && (
        <ImagePreview
          {...preview}
          image={preview.image}
          onClose={() => setPreview(null)}
        >
          <button
            disabled={pending}
            onClick={() => pick(preview.id)}
            className={`${primary} flex-1`}
          >
            {pending ? "Adding…" : "Add to workout"}
          </button>
        </ImagePreview>
      )}
    </section>
  );
}
