"use client";

import {
  card,
  danger,
  errorText,
  focusRing,
  input,
  label,
  primary,
  quiet,
} from "@/components/styles";
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
    <section className={`${card} p-4`}>
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
            className={`${input} min-w-0 flex-1`}
          />
          <button disabled={pending} className={`${primary} px-4`}>
            Save
          </button>
          <button
            type="button"
            onClick={() => (setEditing(false), setDraft(name))}
            className={`${quiet} px-1`}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-ls-serif text-[28px] leading-tight">{name}</h2>
          <button onClick={() => setEditing(true)} className={quiet}>
            Rename
          </button>
        </div>
      )}

      {exercises.length === 0 ? (
        <p className="mt-3 text-sm text-ls-muted">
          No exercises left in this template.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-ls-border border-y border-ls-border">
          {exercises.map((e) => (
            <li key={e.exercise_id} className="flex items-center gap-3 py-2">
              <ExerciseThumb
                name={e.name}
                category={e.category}
                image={e.image ?? null}
              />
              <span className="flex-1">
                {e.name}
                <span className={`${label} block`}>{e.category}</span>
              </span>
              <button
                disabled={pending}
                onClick={() =>
                  run(() => removeTemplateExercise(id, e.exercise_id))
                }
                aria-label={`Remove ${e.name} from ${name}`}
                className={`grid size-9 cursor-pointer place-items-center text-ls-muted transition-colors hover:bg-ls-ink/[0.06] hover:text-ls-error disabled:opacity-50 ${focusRing}`}
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
            <button onClick={() => setConfirmDelete(false)} className={quiet}>
              Keep it
            </button>
            <button
              disabled={pending}
              onClick={() => run(() => deleteTemplate(id))}
              className={`${danger} font-medium`}
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
          </span>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className={danger}>
            Delete template
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className={`${errorText} mt-2`}>
          {error}
        </p>
      )}
    </section>
  );
}
