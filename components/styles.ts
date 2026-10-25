// Line & Stone component styles, carried over from Assignment 2 (components/line-and-stone/styles.ts).
// Only the live classes are kept; the per-state variants there were for the design-system showcase.

// Tailwind v4: outline-none would cancel focus-visible:outline-2, so focus rings pair with outline-solid.
export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ls-ink";

export const label =
  "font-ls-sans text-[11px] font-medium uppercase tracking-[0.22em] text-ls-muted";

const buttonBase = `inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap px-6 font-ls-sans text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-150 select-none cursor-pointer ${focusRing}`;

// Aegean: the one primary action on a screen.
export const primary = `${buttonBase} bg-ls-accent text-ls-surface hover:bg-ls-accent-hover active:translate-y-px active:bg-ls-accent-pressed disabled:cursor-not-allowed disabled:bg-ls-disabled disabled:text-ls-muted`;

export const secondary = `${buttonBase} border border-ls-ink text-ls-ink hover:bg-ls-ink/[0.06] active:translate-y-px active:bg-ls-ink/[0.12] disabled:cursor-not-allowed disabled:border-ls-border disabled:bg-ls-disabled/60 disabled:text-ls-muted`;

// Small text-only actions (Remove, Rename, Cancel).
export const quiet = `cursor-pointer font-ls-sans text-[13px] text-ls-muted underline decoration-ls-rule underline-offset-4 transition-colors hover:text-ls-ink hover:decoration-ls-ink disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const danger = `cursor-pointer font-ls-sans text-[13px] text-ls-error underline decoration-ls-error/40 underline-offset-4 transition-colors hover:decoration-ls-error disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const chip = `inline-flex min-h-9 items-center gap-1.5 border px-3.5 font-ls-sans text-[13px] transition-colors duration-150 select-none cursor-pointer ${focusRing} border-ls-ink bg-ls-surface text-ls-ink hover:bg-[color-mix(in_srgb,var(--color-ls-ink)_6%,var(--color-ls-surface))] active:bg-[color-mix(in_srgb,var(--color-ls-ink)_12%,var(--color-ls-surface))] aria-pressed:bg-ls-ink aria-pressed:text-ls-surface aria-pressed:hover:bg-ls-ink`;

export const input =
  "h-11 w-full border border-ls-ink bg-ls-surface px-3 font-ls-sans text-[15px] text-ls-ink placeholder:text-ls-muted transition-colors duration-150 hover:bg-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ls-ink disabled:cursor-not-allowed disabled:border-ls-border disabled:bg-ls-disabled disabled:text-ls-muted aria-invalid:border-ls-error";

export const link = `font-ls-sans text-[15px] text-ls-ink underline decoration-ls-rule underline-offset-4 transition-colors hover:decoration-ls-ink active:text-ls-muted ${focusRing}`;

// Cards: Plaster surface with a Stone hairline. No radius, no shadow.
export const card = "border border-ls-border bg-ls-surface";

export const errorText = "font-ls-sans text-sm text-ls-error";
