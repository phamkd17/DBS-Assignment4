import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

// Gets a Clerk testing token (using CLERK_SECRET_KEY from the environment) so Clerk's
// bot protection lets the test browser sign in.
setup("clerk testing token", async () => {
  await clerkSetup({ publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY });
});
