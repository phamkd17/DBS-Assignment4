"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { addExercise } from "../actions";
import { rankByName } from "@/lib/search";

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
      setPreview(null);
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
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-zinc-500"
        >
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
          {category && <> in {category}</>}. Try a shorter word or another
          category.
        </p>
      ) : (
        <ul className="mt-3 max-h-80 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-900">
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
                className="flex flex-1 items-center justify-between gap-3 text-left disabled:opacity-50"
              >
                <span>{o.name}</span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {o.category}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {preview && (
        <ImagePreview
          option={preview}
          pending={pending}
          onAdd={() => pick(preview.id)}
          onClose={() => setPreview(null)}
        />
      )}
    </section>
  );
}

// About a third of wger exercises have a picture. The rest get a same-sized placeholder so names stay aligned.
function ExerciseThumb({
  name,
  category,
  image,
}: {
  name: string;
  category: string;
  image: string | null;
}) {
  const box =
    "size-12 shrink-0 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800";
  if (!image) {
    return (
      <span
        aria-hidden
        className={`${box} flex items-center justify-center text-lg font-semibold text-zinc-400 dark:bg-zinc-900`}
      >
        {category[0]}
      </span>
    );
  }
  // Plain <img>: wger's images are already small, and lazy loading only fetches the rows you scroll to.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt={name}
      loading="lazy"
      decoding="async"
      className={`${box} object-contain p-0.5`}
    />
  );
}

// A native <dialog> gives us focus trapping, Esc to close, and a dimmed backdrop for free.
function ImagePreview({
  option,
  pending,
  onAdd,
  onClose,
}: {
  option: Option;
  pending: boolean;
  onAdd: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={option.name}
      className="m-auto w-[min(92vw,28rem)] rounded-2xl bg-white p-0 text-zinc-900 backdrop:bg-black/60 dark:bg-zinc-950 dark:text-zinc-100"
    >
      <div className="flex flex-col gap-4 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={option.image!}
          alt={option.name}
          className="max-h-[60vh] w-full rounded-xl bg-white object-contain"
        />
        <div>
          <h3 className="text-lg font-semibold">{option.name}</h3>
          <p className="text-sm text-zinc-500">{option.category}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium dark:border-zinc-700"
          >
            Back
          </button>
          <button
            disabled={pending}
            onClick={onAdd}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-3 font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900"
          >
            {pending ? "Adding…" : "Add to workout"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
