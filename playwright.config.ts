import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

// Loads .env.local into this test process only, so Clerk's helpers can use the keys.
loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /global\.setup\.ts/ },
    { name: "e2e", testMatch: /\.spec\.ts/, dependencies: ["setup"] },
  ],
  // Reuses `npm run dev` if it's already running; otherwise starts it.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
