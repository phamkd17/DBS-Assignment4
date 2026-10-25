import { Suspense } from "react";
import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Lift Log</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Log your sets, see what you lifted last time, and check that every
        muscle group gets its share each week. No ads.
      </p>

      {/* <Show> reads the session at request time, so it sits inside Suspense (Cache Components). */}
      <Suspense>
        <Show when="signed-out">
          <div className="flex gap-3">
            <SignUpButton>
              <button className="rounded-lg bg-zinc-900 px-5 py-3 font-medium text-white dark:bg-white dark:text-zinc-900">
                Create account
              </button>
            </SignUpButton>
            <SignInButton>
              <button className="rounded-lg border border-zinc-300 px-5 py-3 font-medium dark:border-zinc-700">
                Sign in
              </button>
            </SignInButton>
          </div>
        </Show>

        <Show when="signed-in">
          <Link
            href="/workouts"
            className="w-fit rounded-lg bg-zinc-900 px-5 py-3 font-medium text-white dark:bg-white dark:text-zinc-900"
          >
            Go to my workouts
          </Link>
        </Show>
      </Suspense>
    </main>
  );
}
