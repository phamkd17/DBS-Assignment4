import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <Link href="/workouts" className="text-lg font-semibold tracking-tight">
        Lift Log
      </Link>
      <UserButton />
    </header>
  );
}

export function WgerCredit() {
  return (
    <p className="px-4 py-6 text-center text-xs text-zinc-500">
      Exercise data from{" "}
      <a href="https://wger.de" className="underline">
        wger
      </a>
      , licensed CC-BY-SA.
    </p>
  );
}
