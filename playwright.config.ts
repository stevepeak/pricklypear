import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Desktop browsers - covers most desktop users
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Mobile - covers most mobile users (iPhone is a good representative)
    // Webkit tests disabled due to Bus error: 10 crashes on macOS
    // {
    //   name: 'iPhone 13',
    //   use: { ...devices['iPhone 13'] },
    // },
    // Tablet - covers tablet users
    // {
    //   name: 'iPad (gen 7)',
    //   use: { ...devices['iPad (gen 7)'] },
    // },
  ],
  webServer: [
    {
      command: 'bun run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    ...(process.env.CI
      ? []
      : [
          {
            command: 'supabase functions serve --env-file ./supabase/.env 2>&1',
            url: 'http://localhost:54321/functions/v1/health',
            reuseExistingServer: !process.env.CI,
            timeout: 120000,
          },
        ]),
  ],
});
