import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const PORT = process.env.PORT || 3000;

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/test-results',
  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? 'yarn build && yarn start' : 'yarn dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 150 * 1000,
    env: {
      NEXTAUTH_URL: `http://localhost:${PORT}`,
      NEXTAUTH_SECRET: 'cats',
      NEXT_PUBLIC_API_URL: 'https://marxan23.northeurope.cloudapp.azure.com',
    },
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost:${PORT}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
    {
      name: 'Mozilla Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
