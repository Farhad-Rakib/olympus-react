import { defineConfig, devices } from '@playwright/test';

// Browser E2E tests. The API must already be running (see e2e/README.md);
// the frontend dev server is started here and pointed at that API.
const API_URL = process.env.E2E_API_URL ?? 'http://localhost:5091/api/v1';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@responsive/ },
  ],
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    env: { VITE_API_BASE_URL: API_URL },
  },
});
