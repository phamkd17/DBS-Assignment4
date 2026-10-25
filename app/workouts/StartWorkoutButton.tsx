"use client";

import { useFormStatus } from "react-dom";
import { startWorkout } from "./actions";

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full rounded-xl bg-zinc-900 px-5 py-4 text-lg font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900"
    >
      {pending ? "Starting…" : "Start a workout"}
    </button>
  );
}

export function StartWorkoutButton() {
  return (
    <form action={startWorkout} onSubmit={(e) => (e.currentTarget.elements.namedItem("performed_on") as HTMLInputElement).value = localDate()}>
      <input type="hidden" name="performed_on" />
      <SubmitButton />
    </form>
  );
}
