import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* <SignIn /> reads the URL at request time, so it can't be part of the prerendered shell. */}
      <Suspense>
        <SignIn />
      </Suspense>
    </div>
  );
}
