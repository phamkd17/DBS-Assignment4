import { Suspense } from "react";
import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { label, primary, secondary } from "@/components/styles";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
      <p className={label}>No ads · Pounds · Every muscle group</p>
      <h1 className="mt-4 font-ls-serif text-[64px] leading-[1.05]">Lift Log</h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-ls-muted">
        Log your sets, see what you lifted last time, and check that every muscle group gets its share each week.
      </p>

      <ol className="mt-10 divide-y divide-ls-border border-y border-ls-border">
        {[
          ["Log", "Start from a template and log weight × reps, set by set."],
          ["Remember", "Each exercise shows what you lifted last time."],
          ["Balance", "See your sets per muscle group for the week."],
        ].map(([head, rest], i) => (
          <li key={head} className="flex gap-4 py-3">
            <span className="w-5 font-ls-serif text-2xl leading-none text-ls-muted">{i + 1}</span>
            <p className="text-[15px] leading-relaxed">
              <span className="font-medium">{head}.</span> {rest}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        {/* <Show> reads the session at request time, so it sits inside Suspense (Cache Components). */}
        <Suspense>
          <Show when="signed-out">
            <div className="flex flex-wrap gap-3">
              <SignUpButton>
                <button className={primary}>Create account</button>
              </SignUpButton>
              <SignInButton>
                <button className={secondary}>Sign in</button>
              </SignInButton>
            </div>
          </Show>
          <Show when="signed-in">
            <Link href="/workouts" className={primary}>
              Go to my workouts
            </Link>
          </Show>
        </Suspense>
      </div>
    </main>
  );
}
