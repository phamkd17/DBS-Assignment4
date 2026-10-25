"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { danger, errorText } from "@/components/styles";
import { deleteEmptyWorkout } from "./actions";

export function DeleteEmptyWorkoutButton({
  workoutId,
  redirectTo,
  text = "Delete",
}: {
  workoutId: string;
  redirectTo?: string;
  text?: string;
}) {
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
        className={`${danger} whitespace-nowrap px-2`}
      >
        {pending ? "Deleting…" : text}
      </button>
      {error && (
        <span role="alert" className={`${errorText} text-xs`}>
          {error}
        </span>
      )}
    </span>
  );
}
