import { clerk } from "@clerk/testing/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";

// Clerk test users (created with `clerk users create`). +clerk_test addresses never receive real email.
const USER_A = "liftlog-a+clerk_test@example.com";
const USER_B = "liftlog-b+clerk_test@example.com";

async function signedInPage(browser: Browser, emailAddress: string) {
  const page = await (await browser.newContext()).newPage();
  await page.goto("/"); // Clerk's helper needs a page that has loaded Clerk
  await clerk.signIn({ page, emailAddress });
  return page;
}

// Starts Push Day and logs one Bench Press set at `weight` lb. Returns the workout's path.
async function logBenchSet(page: Page, weight: number) {
  await page.goto("/workouts");
  await page.getByRole("button", { name: /Push Day/ }).click();
  await page.waitForURL(/\/workouts\/[0-9a-f-]{36}$/);

  const bench = page.locator("section", { has: page.getByRole("heading", { name: "Bench Press", exact: true }) });
  await bench.getByLabel("Weight (lb)").fill(String(weight));
  await bench.getByLabel("Reps").fill("5");
  await bench.getByRole("button", { name: "+ Set" }).click();
  await expect(bench.getByText(`${weight} lb`)).toBeVisible();

  return new URL(page.url()).pathname;
}

// A random weight like 137.5 that won't collide between the two users or earlier runs.
const randomWeight = (base: number) => base + Math.floor(Math.random() * 400) / 2 + 0.5;

test("two users can't see each other's workouts", async ({ browser }) => {
  const a = await signedInPage(browser, USER_A);
  const b = await signedInPage(browser, USER_B);

  const weightA = randomWeight(100); // 100.5 to 300
  const weightB = randomWeight(400); // 400.5 to 600
  const workoutA = await logBenchSet(a, weightA);
  const workoutB = await logBenchSet(b, weightB);

  // Each person's history lists their own workout and not the other's.
  await a.goto("/workouts");
  await expect(a.locator(`a[href="${workoutA}"]`)).toBeVisible();
  await expect(a.locator(`a[href="${workoutB}"]`)).toHaveCount(0);

  await b.goto("/workouts");
  await expect(b.locator(`a[href="${workoutB}"]`)).toBeVisible();
  await expect(b.locator(`a[href="${workoutA}"]`)).toHaveCount(0);

  // Even with the exact URL, B can't open A's workout or see A's set.
  await b.goto(workoutA);
  await expect(b.getByText("This page could not be found.")).toBeVisible();
  await expect(b.getByText(`${weightA} lb`)).toHaveCount(0);
});
