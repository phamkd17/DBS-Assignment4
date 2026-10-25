"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { startFromTemplate, startWorkout } from "./actions";

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SubmitButton({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={`${className} disabled:opacity-60`}>
      {pending ? "Starting…" : children}
    </button>
  );
}

// The browser adds its local date when the form is submitted, so the workout is filed under today in Chicago, not UTC.
function StartForm({
  action,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  className: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) =>
        ((
          e.currentTarget.elements.namedItem("performed_on") as HTMLInputElement
        ).value = localDate())
      }
    >
      <input type="hidden" name="performed_on" />
      <SubmitButton className={className}>{children}</SubmitButton>
    </form>
  );
}

export function StartWorkoutButton() {
  return (
    <StartForm
      action={startWorkout}
      className="w-full rounded-xl border-2 border-dashed border-zinc-300 px-5 py-3 font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
    >
      Start an empty workout
    </StartForm>
  );
}

export function StartFromTemplateButton({
  templateId,
  name,
  count,
}: {
  templateId: string;
  name: string;
  count: number;
}) {
  return (
    <StartForm
      action={startFromTemplate.bind(null, templateId)}
      className="w-full rounded-xl bg-zinc-900 px-4 py-4 text-left text-white dark:bg-white dark:text-zinc-900"
    >
      <span className="block text-lg font-semibold">{name}</span>
      <span className="text-sm opacity-70">
        {count} {count === 1 ? "exercise" : "exercises"}
      </span>
    </StartForm>
  );
}
