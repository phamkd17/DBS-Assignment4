"use client";

import {
  errorText,
  focusRing,
  input,
  label,
  primary,
} from "@/components/styles";
import { useActionState, useState, useTransition } from "react";
import { addSet, deleteSet, type SetFormState } from "../actions";

export function AddSetForm(props: {
  workoutId: string;
  exerciseId: number;
  defaultWeight: number | null;
  defaultReps: number | null;
}) {
  const [state, formAction, pending] = useActionState<SetFormState, FormData>(
    addSet,
    {},
  );
  // Controlled inputs keep the numbers after saving, since the next set is usually the same weight.
  const [weight, setWeight] = useState(
    props.defaultWeight === null ? "" : String(Number(props.defaultWeight)),
  );
  const [reps, setReps] = useState(
    props.defaultReps === null ? "" : String(props.defaultReps),
  );

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="workout_id" value={props.workoutId} />
      <input type="hidden" name="exercise_id" value={props.exerciseId} />
      <div className="flex items-end gap-2">
        <label className={`${label} flex-1`}>
          Weight (lb)
          <input
            name="weight_lb"
            inputMode="decimal"
            placeholder="Bodyweight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={`${input} mt-1 text-lg normal-case tracking-normal tabular-nums`}
          />
        </label>
        <label className={`${label} w-24`}>
          Reps
          <input
            name="reps"
            inputMode="numeric"
            required
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className={`${input} mt-1 text-lg normal-case tracking-normal tabular-nums`}
          />
        </label>
        <button disabled={pending} className={`${primary} px-5`}>
          {pending ? "Saving…" : "+ Set"}
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

export function DeleteSetButton({ setId }: { setId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      aria-label="Delete set"
      disabled={pending}
      onClick={() => startTransition(() => deleteSet(setId))}
      className={`grid size-9 cursor-pointer place-items-center text-ls-muted transition-colors hover:bg-ls-ink/[0.06] hover:text-ls-error disabled:opacity-50 ${focusRing}`}
    >
      ✕
    </button>
  );
}
