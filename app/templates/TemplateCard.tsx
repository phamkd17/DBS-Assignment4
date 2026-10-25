"use client";

import { useState, useTransition } from "react";
import { ExerciseThumb } from "@/components/ExerciseImage";
import type { PlannedExercise } from "@/lib/types";
import {
  deleteTemplate,
  removeTemplateExercise,
  renameTemplate,
} from "./actions";

export function TemplateCard({
  id,
  name,
  exercises,
}: {
  id: string;
  name: string;
  exercises: PlannedExercise[];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<{ error?: string }>, after?: () => void) =>
    startTransition(async () => {
      const result = await action();
      setError(result.error ?? null);
      if (!result.error) after?.();
    });

  return (
    <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () => renameTemplate(id, draft),
              () => setEditing(false),
            );
          }}
          className="flex gap-2"
        >
          <input
            aria-label="Template name"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={80}
            autoFocus
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            disabled={pending}
            className="rounded-lg bg-zinc-900 px-3 font-semibold text-white dark:bg-white dark:text-zinc-900"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => (setEditing(false), setDraft(name))}
            className="px-2 text-sm text-zinc-500"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold">{name}</h2>
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-zinc-500 underline"
          >
            Rename
          </button>
        </div>
      )}

      {exercises.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          No exercises left in this template.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {exercises.map((e) => (
            <li key={e.exercise_id} className="flex items-center gap-3">
              <ExerciseThumb
                name={e.name}
                category={e.category}
                image={e.image ?? null}
              />
              <span className="flex-1">
                {e.name}
                <span className="block text-xs text-zinc-500">
                  {e.category}
                </span>
              </span>
              <button
                disabled={pending}
                onClick={() =>
                  run(() => removeTemplateExercise(id, e.exercise_id))
                }
                aria-label={`Remove ${e.name} from ${name}`}
                className="px-2 text-zinc-400 hover:text-red-600 disabled:opacity-50"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex justify-end">
        {confirmDelete ? (
          <span className="flex items-center gap-3 text-sm">
            Delete &ldquo;{name}&rdquo;?
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-zinc-500"
            >
              Keep it
            </button>
            <button
              disabled={pending}
              onClick={() => run(() => deleteTemplate(id))}
              className="font-semibold text-red-600 disabled:opacity-50"
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-600"
          >
            Delete template
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
