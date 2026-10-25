"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEmptyWorkout } from "./actions";

export function DeleteEmptyWorkoutButton({ workoutId, redirectTo }: { workoutId: string; redirectTo?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <span className="flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await deleteEmptyWorkout(workoutId);
            if (result.error) setError(result.error);
            else if (redirectTo) router.push(redirectTo);
          })
        }
        className="rounded-lg px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
      >
        {pending ? "Deleting…" : "Delete empty workout"}
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
