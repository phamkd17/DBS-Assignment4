"use client";

import { useActionState, useState, useTransition } from "react";
import { addSet, deleteSet, type SetFormState } from "../actions";

export function AddSetForm(props: {
  workoutId: string;
  exerciseId: number;
  defaultWeight: number | null;
  defaultReps: number | null;
}) {
  const [state, formAction, pending] = useActionState<SetFormState, FormData>(addSet, {});
  // Controlled inputs keep the numbers after saving, since the next set is usually the same weight.
  const [weight, setWeight] = useState(props.defaultWeight === null ? "" : String(Number(props.defaultWeight)));
  const [reps, setReps] = useState(props.defaultReps === null ? "" : String(props.defaultReps));
  const input =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-lg dark:border-zinc-700 dark:bg-zinc-950";

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="workout_id" value={props.workoutId} />
      <input type="hidden" name="exercise_id" value={props.exerciseId} />
      <div className="flex items-end gap-2">
        <label className="flex-1 text-xs text-zinc-500">
          Weight (lb)
          <input
            name="weight_lb"
            inputMode="decimal"
            placeholder="Bodyweight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={input}
          />
        </label>
        <label className="w-24 text-xs text-zinc-500">
          Reps
          <input
            name="reps"
            inputMode="numeric"
            required
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className={input}
          />
        </label>
        <button
          disabled={pending}
          className="h-[46px] rounded-lg bg-zinc-900 px-4 font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900"
        >
          {pending ? "Saving…" : "+ Set"}
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

export function DeleteSetButton({ setId }: { setId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      aria-label="Delete set"
      disabled={pending}
      onClick={() => startTransition(() => deleteSet(setId))}
      className="px-2 text-zinc-400 hover:text-red-600 disabled:opacity-50"
    >
      ✕
    </button>
  );
}
