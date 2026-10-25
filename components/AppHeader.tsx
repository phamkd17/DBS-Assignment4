import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { focusRing, label } from "./styles";

export function AppHeader() {
  return (
    <header className="border-b border-ls-ink bg-ls-bg">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
        <Link
          href="/workouts"
          className={`font-ls-serif text-[26px] leading-none ${focusRing}`}
        >
          Lift Log
        </Link>
        <nav className="flex items-center gap-5">
          <Link
            href="/workouts"
            className={`${label} hover:text-ls-ink ${focusRing}`}
          >
            Workouts
          </Link>
          <Link
            href="/templates"
            className={`${label} hover:text-ls-ink ${focusRing}`}
          >
            Templates
          </Link>
          <UserButton />
        </nav>
      </div>
    </header>
  );
}

export function WgerCredit() {
  return (
    <p className="px-4 py-8 text-center text-xs text-ls-muted">
      Exercise data and pictures from{" "}
      <a
        href="https://wger.de"
        className="underline decoration-ls-rule underline-offset-4 hover:decoration-ls-ink"
      >
        wger
      </a>
      , licensed CC-BY-SA.
    </p>
  );
}

// A small uppercase label with a hairline under it: the Line & Stone section heading.
export function SectionLabel({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between border-b border-ls-border pb-2">
      <h2 className={label}>{children}</h2>
      {action}
    </div>
  );
}
