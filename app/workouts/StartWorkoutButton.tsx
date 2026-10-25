"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { label, secondary } from "@/components/styles";
import { startFromTemplate, startWorkout } from "./actions";

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SubmitButton({
  children,
  className,
}: {
  children: (pending: boolean) => ReactNode;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={className}>
      {children(pending)}
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
  children: (pending: boolean) => ReactNode;
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
    <StartForm action={startWorkout} className={`${secondary} w-full`}>
      {(pending) => (pending ? "Starting…" : "Start an empty workout")}
    </StartForm>
  );
}

export function StartFromTemplateButton({
  templateId,
  name,
  exercises,
}: {
  templateId: string;
  name: string;
  exercises: string[];
}) {
  return (
    <StartForm
      action={startFromTemplate.bind(null, templateId)}
      className="group flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-ls-ink/[0.04] active:bg-ls-ink/[0.08] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-ls-ink"
    >
      {(pending) => (
        <>
          <span className="min-w-0">
            <span className="block font-ls-serif text-[26px] leading-tight">
              {name}
            </span>
            <span className="block truncate text-sm text-ls-muted">
              {exercises.join(" · ") || "No exercises"}
            </span>
          </span>
          <span
            className={`${label} shrink-0 text-ls-accent group-hover:underline`}
          >
            {pending ? "Starting…" : "Start →"}
          </span>
        </>
      )}
    </StartForm>
  );
}
