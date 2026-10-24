import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* <SignUp /> reads the URL at request time, so it can't be part of the prerendered shell. */}
      <Suspense>
        <SignUp />
      </Suspense>
    </div>
  );
}
