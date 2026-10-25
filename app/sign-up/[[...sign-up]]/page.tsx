import { Suspense } from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="font-ls-serif text-[40px] leading-none">
        Lift Log
      </Link>
      {/* <SignUp /> reads the URL at request time, so it can't be part of the prerendered shell. */}
      <Suspense>
        <SignUp />
      </Suspense>
    </div>
  );
}
