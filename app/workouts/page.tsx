import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export default async function WorkoutsPage() {
  // proxy.ts already redirects signed-out visitors; this second check protects the page on its own.
  const { userId } = await auth.protect();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My workouts</h1>
        <UserButton />
      </header>
      <p className="text-zinc-600 dark:text-zinc-400">Signed in as {userId}. Your workouts will show up here.</p>
    </main>
  );
}
