import { defineConfig, devices } from '@playwright/test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = dirname(fileURLToPath(import.meta.url));
const backendDir = resolve(frontendDir, '../backend');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: backendDir,
      url: 'http://localhost:8180/healthz',
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        DEMO_MODE: 'true',
        PORT: '8180',
        CORS_ORIGIN: 'http://localhost:5174',
        NODE_ENV: 'test',
      },
    },
    {
      command: 'npm run dev -- --host localhost --port 5174 --strictPort',
      cwd: frontendDir,
      url: 'http://localhost:5174',
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        VITE_API_BASE_URL: 'http://localhost:8180',
      },
    },
  ],
});
