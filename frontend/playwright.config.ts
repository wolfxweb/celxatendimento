import { defineConfig, devices } from '@playwright/test';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const appPort = new URL(appUrl).port || '3000';
const projects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: appUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects,

  webServer: {
    command: `npm run dev -- --hostname 0.0.0.0 --port ${appPort}`,
    url: appUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
