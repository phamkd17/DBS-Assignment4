"use client";

import { useActionState, useState, useTransition } from "react";
import {
  removeExercise,
  saveAsTemplate,
  type SaveTemplateState,
} from "../actions";

export function RemoveExerciseButton({
  workoutId,
  exerciseId,
}: {
  workoutId: string;
  exerciseId: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await removeExercise(workoutId, exerciseId);
            setError(result.error ?? null);
          })
        }
        className="text-sm text-zinc-500 hover:text-red-600 disabled:opacity-50"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}

export function SaveAsTemplate({
  workoutId,
  defaultName,
}: {
  workoutId: string;
  defaultName: string;
}) {
  // openedAt lets a successful save close the form without an effect: the form is open
  // until a save newer than the moment it was opened comes back.
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState<
    SaveTemplateState,
    FormData
  >(saveAsTemplate, {});
  const open =
    openedAt !== null && !(state.savedAt && state.savedAt > openedAt);

  if (!open) {
    return (
      <div className="flex flex-col items-center gap-1">
        {state.savedName && (
          <p className="text-sm text-green-700 dark:text-green-400">
            Saved as template &ldquo;{state.savedName}&rdquo;.
          </p>
        )}
        <button
          onClick={() => setOpenedAt(Date.now())}
          className="text-sm text-zinc-500 underline"
        >
          Save these exercises as a template
        </button>
      </div>
    );
  }
  return (
    <form
      action={formAction}
      className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <input type="hidden" name="workout_id" value={workoutId} />
      <label className="text-sm text-zinc-500">
        Template name
        <input
          name="name"
          defaultValue={defaultName === "Workout" ? "" : defaultName}
          placeholder="e.g. Push Day B"
          required
          maxLength={80}
          autoFocus
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setOpenedAt(null)}
          className="flex-1 rounded-lg border border-zinc-300 py-2 dark:border-zinc-700"
        >
          Cancel
        </button>
        <button
          disabled={pending}
          className="flex-1 rounded-lg bg-zinc-900 py-2 font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900"
        >
          {pending ? "Saving…" : "Save template"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
