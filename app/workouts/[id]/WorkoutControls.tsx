"use client";

import {
  card,
  errorText,
  input,
  label,
  primary,
  quiet,
  secondary,
} from "@/components/styles";
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
        className={quiet}
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {error && (
        <span role="alert" className={`${errorText} text-xs`}>
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
          <p role="status" className="text-sm text-ls-success">
            Saved as template &ldquo;{state.savedName}&rdquo;.
          </p>
        )}
        <button onClick={() => setOpenedAt(Date.now())} className={quiet}>
          Save these exercises as a template
        </button>
      </div>
    );
  }
  return (
    <form action={formAction} className={`${card} p-4`}>
      <input type="hidden" name="workout_id" value={workoutId} />
      <label className={label}>
        Template name
        <input
          name="name"
          defaultValue={defaultName === "Workout" ? "" : defaultName}
          placeholder="e.g. Push Day B"
          required
          maxLength={80}
          autoFocus
          className={`${input} mt-1 normal-case tracking-normal`}
        />
      </label>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setOpenedAt(null)}
          className={`${secondary} flex-1`}
        >
          Cancel
        </button>
        <button disabled={pending} className={`${primary} flex-1`}>
          {pending ? "Saving…" : "Save template"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className={`${errorText} mt-2`}>
          {state.error}
        </p>
      )}
    </form>
  );
}
